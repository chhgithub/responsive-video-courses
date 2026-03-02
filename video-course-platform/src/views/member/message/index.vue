<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores';
import {
  getUserMessages,
  getUnreadMessageCount,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteMessage,
  clearAllMessages,
  type UserMessage,
  type MessageType,
} from '@/utils/message-storage';

const authStore = useAuthStore();

const loading = ref(false);
const activeTab = ref<'all' | 'unread' | 'consultation' | 'system'>('all');
const messages = ref<UserMessage[]>([]);

// 获取当前用户
const currentUser = computed(() => authStore.userInfo?.userId);

// 统计消息数量
const totalCount = computed(() => getUserMessages(currentUser.value || '').length);
const unreadCount = computed(() => getUnreadMessageCount(currentUser.value || ''));
const consultationUnread = computed(() => {
  const msgs = getUserMessages(currentUser.value || '', 'consultation');
  return msgs.filter(m => m.status === 'unread').length;
});
const systemUnread = computed(() => {
  const msgs = getUserMessages(currentUser.value || '', 'system');
  return msgs.filter(m => m.status === 'unread').length;
});

// 加载消息
async function loadMessages() {
  if (!currentUser.value) return;

  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    let type: MessageType | undefined;
    if (activeTab.value === 'consultation') {
      type = 'consultation';
    } else if (activeTab.value === 'system') {
      type = 'system';
    }

    messages.value = getUserMessages(currentUser.value, type);
  } finally {
    loading.value = false;
  }
}

// 处理消息点击
async function handleMessageClick(message: UserMessage) {
  // 标记为已读
  markMessageAsRead(message.messageId);

  // 使用 nextTick 确保 localStorage 写入完成后再重新加载
  await nextTick();

  // 重新加载消息列表以确保状态同步
  loadMessages();

  // 如果有操作链接，可以跳转
  if (message.actionUrl) {
    console.log('跳转到:', message.actionUrl);
    // 这里可以实现路由跳转
  }
}

// 标记所有已读
function markAllRead() {
  ElMessageBox.confirm(
    '确定将所有未读消息标记为已读吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      markAllMessagesAsRead(currentUser.value || '');
      loadMessages();
    })
    .catch(() => {});
}

// 清空所有消息
function handleClearAll() {
  ElMessageBox.confirm(
    '确定清空所有消息吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      clearAllMessages(currentUser.value || '');
      loadMessages();
    })
    .catch(() => {});
}

// 格式化时间
function formatTime(time: string): string {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 1小时内显示"刚刚"
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return mins < 1 ? '刚刚' : `${mins}分钟前`;
  }

  // 24小时内显示"X小时前"
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 7天内显示"X天前"
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }

  // 超过7天显示具体日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  if (year === now.getFullYear()) {
    return `${month}-${day} ${hour}:${minute}`;
  }
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

// 获取消息类型对应的图标
function getMessageIcon(type: MessageType) {
  const iconMap: Record<MessageType, string> = {
    system: 'Bell',
    consultation: 'ChatDotRound',
    course: 'Reading',
    order: 'ShoppingCart',
    announcement: 'Promotion',
  };
  return iconMap[type] || 'Message';
}

// 获取消息类型对应的颜色
function getMessageIconColor(type: MessageType) {
  const colorMap: Record<MessageType, string> = {
    system: '#409eff',
    consultation: '#67c23a',
    course: '#e6a23c',
    order: '#f56c6c',
    announcement: '#f39c12',
  };
  return colorMap[type] || '#909399';
}

onMounted(() => {
  loadMessages();
});
</script>

<template>
  <div class="message-center">
    <el-card>
      <template #header>
        <div class="header">
          <h2>消息中心</h2>
          <el-button
            v-if="unreadCount > 0"
            link
            type="primary"
            @click="markAllRead"
          >
            全部标为已读
          </el-button>
        </div>
      </template>

      <!-- 消息类型筛选 -->
      <el-tabs v-model="activeTab" @tab-change="loadMessages">
        <el-tab-pane label="全部" name="all">
          <template #label>
            全部
            <el-badge v-if="totalCount > 0" :value="totalCount" :max="99" type="info" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="未读" name="unread">
          <template #label>
            未读
            <el-badge v-if="unreadCount > 0" :value="unreadCount" :max="99" type="danger" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="咨询回复" name="consultation">
          <template #label>
            咨询回复
            <el-badge v-if="consultationUnread > 0" :value="consultationUnread" :max="99" type="success" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="系统通知" name="system">
          <template #label>
            系统通知
            <el-badge v-if="systemUnread > 0" :value="systemUnread" :max="99" type="warning" class="tab-badge" />
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 消息列表 -->
      <div v-loading="loading" class="message-list">
        <div
          v-for="message in messages"
          :key="message.messageId"
          class="message-item"
          :class="{
            unread: message.status === 'unread',
            high: message.priority === 'high'
          }"
          @click="handleMessageClick(message)"
        >
          <div class="message-icon">
            <el-icon :size="24" :color="getMessageIconColor(message.type)">
              <component :is="getMessageIcon(message.type)" />
            </el-icon>
          </div>

          <div class="message-main">
            <div class="message-header">
              <span class="message-title">{{ message.title }}</span>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-body">
              {{ message.content }}
            </div>
          </div>

          <!-- 未读标记 -->
          <div v-if="message.status === 'unread'" class="unread-dot"></div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="messages.length === 0 && !loading" description="暂无消息" />
      </div>

      <!-- 删除按钮 -->
      <div class="message-actions">
        <el-button
          link
          type="danger"
          @click="handleClearAll"
        >
          清空所有消息
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.message-center {
  padding: $spacing-large;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: $font-size-extra-large;
      font-weight: 500;
    }
  }

  .tab-badge {
    margin-left: $spacing-small;
    vertical-align: middle;
  }

  .message-list {
    min-height: 400px;
  }

  .message-item {
    display: flex;
    gap: $spacing-base;
    padding: $spacing-base;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-base;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;

    &:hover {
      border-color: $--el-color-primary;
      background: #f0f7ff;
    }

    &.unread {
      background: #f8fbff;
      border-left: 3px solid $--el-color-primary;
    }

    &.high {
      border-color: #f56c6c;
    }

    .message-icon {
      flex-shrink: 0;
    }

    .message-main {
      flex: 1;
      min-width: 0;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: $spacing-small;
    }

    .message-title {
      font-weight: 500;
      color: $text-color-primary;
    }

    .message-time {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }

    .message-body {
      color: $text-color-regular;
      line-height: 1.6;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .unread-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #f56c6c;
    border-radius: 50%;
  }

  .message-actions {
    text-align: center;
    padding: $spacing-base 0;
  }
}
</style>
