<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Consultation, Reply } from '@/utils/consultation-storage';
import { getConsultationById, addReply, updateConsultationStatus } from '@/utils/consultation-storage';

interface Props {
  id?: string;
  visible: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'markProcessed', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const consultation = ref<Consultation | null>(null);
const replyList = ref<Reply[]>([]);

// 回复表单
const replyForm = ref({
  replyType: 'online' as 'online' | 'phone' | 'email',
  content: '',
});

// 回复loading
const submitLoading = ref(false);

// 监听id变化
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      consultation.value = getConsultationById(newId) || null;
      if (consultation.value?.replies) {
        replyList.value = [...consultation.value.replies].reverse();
      } else {
        replyList.value = [];
      }
    } else {
      consultation.value = null;
      replyList.value = [];
    }
  },
  { immediate: true },
);

// 获取状态标签类型
function getStatusType(status: Consultation['status']) {
  switch (status) {
    case 'replied':
      return 'success';
    case 'closed':
      return 'info';
    case 'pending':
    default:
      return 'warning';
  }
}

// 获取状态文本
function getStatusText(status: Consultation['status']) {
  switch (status) {
    case 'replied':
      return '已回复';
    case 'closed':
      return '已关闭';
    case 'pending':
    default:
      return '待处理';
  }
}

// 获取回复方式标签
function getReplyTypeTag(replyType: Reply['replyType']) {
  switch (replyType) {
    case 'online':
      return { text: '在线回复', type: 'primary' };
    case 'phone':
      return { text: '电话回复', type: 'success' };
    case 'email':
      return { text: '邮件回复', type: 'warning' };
  }
}

// 提交回复
async function handleSubmitReply() {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }

  if (!consultation.value) return;

  submitLoading.value = true;
  try {
    addReply(
      consultation.value.id,
      replyForm.value.replyType,
      replyForm.value.content
    );

    ElMessage.success('回复成功');

    // 重新加载回复列表
    const updated = getConsultationById(consultation.value.id);
    if (updated?.replies) {
      replyList.value = [...updated.replies].reverse();
    }

    // 清空表单
    replyForm.value.content = '';

    // 通知父组件刷新
    emit('refresh');
  } catch (error) {
    ElMessage.error('回复失败');
  } finally {
    submitLoading.value = false;
  }
}

// 标记为已回复
function handleMarkReplied() {
  if (consultation.value) {
    updateConsultationStatus(consultation.value.id, 'replied');
    ElMessage.success('已标记为已回复');
    emit('refresh');
  }
}

// 标记为已关闭
function handleMarkClosed() {
  if (consultation.value) {
    updateConsultationStatus(consultation.value.id, 'closed');
    ElMessage.success('已关闭咨询');
    emit('close');
  }
}

// 关闭抽屉
function handleClose() {
  emit('close');
}

// 删除
function handleDelete() {
  if (consultation.value) {
    emit('delete', consultation.value.id);
  }
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="咨询详情"
    size="650px"
    @close="handleClose"
  >
    <div v-if="consultation" class="detail-content">
      <!-- 基本信息 -->
      <el-descriptions :column="2" border class="info-section">
        <el-descriptions-item label="姓名">
          {{ consultation.name }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ consultation.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="电子邮箱" :span="2">
          {{ consultation.email }}
        </el-descriptions-item>
        <el-descriptions-item label="咨询主题" :span="2">
          {{ consultation.subject || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ consultation.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusType(consultation.status)">
            {{ getStatusText(consultation.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="consultation.repliedAt" label="回复时间" :span="2">
          {{ consultation.repliedAt }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 咨询内容 -->
      <div class="message-section">
        <h3>💬 咨询内容</h3>
        <div class="message-content">
          {{ consultation.message }}
        </div>
      </div>

      <!-- 回复记录 -->
      <div class="reply-section">
        <h3>📝 回复记录</h3>
        <div v-if="replyList.length > 0" class="reply-list">
          <div
            v-for="reply in replyList"
            :key="reply.id"
            class="reply-item"
          >
            <div class="reply-header">
              <el-tag :type="getReplyTypeTag(reply.replyType).type" size="small">
                {{ getReplyTypeTag(reply.replyType).text }}
              </el-tag>
              <span class="replyer">{{ reply.responder }}</span>
              <span class="reply-time">{{ reply.createdAt }}</span>
            </div>
            <div class="reply-content">
              {{ reply.content }}
            </div>
          </div>
        </div>
        <div v-else class="no-reply">
          暂无回复记录
        </div>
      </div>

      <!-- 快速回复 -->
      <div class="quick-reply-section">
        <h3>✍️ 快速回复</h3>
        <el-radio-group v-model="replyForm.replyType" size="small">
          <el-radio-button label="online">在线回复</el-radio-button>
          <el-radio-button label="phone">电话回复</el-radio-button>
          <el-radio-button label="email">邮件回复</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="replyForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容..."
          maxlength="500"
          show-word-limit
          class="reply-input"
        />
        <div class="reply-actions">
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmitReply"
          >
            提交回复
          </el-button>
        </div>
      </div>

      <!-- 操作提示 -->
      <div class="tips-section">
        <div class="tips-title">💡 温馨提示</div>
        <ul class="tips-list">
          <li>此为用户在前台提交的咨询留言</li>
          <li>可选择不同的回复方式记录处理结果</li>
          <li>回复后请及时更新咨询状态</li>
        </ul>
      </div>
    </div>
    <div v-else class="no-data">
      暂无数据
    </div>

    <template #footer v-if="consultation">
      <div class="drawer-footer">
        <el-button
          v-if="consultation.status === 'pending'"
          type="success"
          @click="handleMarkReplied"
        >
          标记已回复
        </el-button>
        <el-button
          v-if="consultation.status !== 'closed'"
          @click="handleMarkClosed"
        >
          标记已关闭
        </el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.detail-content {
  .info-section {
    margin-bottom: $spacing-large;
  }

  .message-section {
    margin-bottom: $spacing-large;

    h3 {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }

    .message-content {
      padding: $spacing-base;
      background: $background-color-base;
      border-radius: $border-radius-base;
      line-height: 1.8;
      color: $text-color-primary;
      min-height: 80px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .reply-section {
    margin-bottom: $spacing-large;

    h3 {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }

    .reply-list {
      max-height: 300px;
      overflow-y: auto;

      .reply-item {
        padding: $spacing-base;
        background: #f5f7fa;
        border-radius: $border-radius-base;
        margin-bottom: $spacing-base;

        &:last-child {
          margin-bottom: 0;
        }

        .reply-header {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          margin-bottom: $spacing-small;

          .replyer {
            font-weight: 500;
            color: $text-color-primary;
          }

          .reply-time {
            margin-left: auto;
            font-size: $font-size-small;
            color: $text-color-secondary;
          }
        }

        .reply-content {
          padding-left: $spacing-large;
          line-height: 1.6;
          color: $text-color-primary;
          white-space: pre-wrap;
        }
      }
    }

    .no-reply {
      padding: 40px 0;
      text-align: center;
      color: $text-color-placeholder;
      font-size: $font-size-base;
    }
  }

  .quick-reply-section {
    margin-bottom: $spacing-large;
    padding: $spacing-base;
    background: #f0f9ff;
    border-radius: $border-radius-base;

    h3 {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }

    .reply-input {
      margin-top: $spacing-base;
    }

    .reply-actions {
      margin-top: $spacing-base;
      display: flex;
      justify-content: flex-end;
    }
  }

  .tips-section {
    padding: $spacing-base;
    background: #ecf5ff;
    border-radius: $border-radius-base;
    color: #409eff;

    .tips-title {
      font-weight: 600;
      margin-bottom: $spacing-small;
    }

    .tips-list {
      margin: 0;
      padding-left: 20px;

      li {
        margin: 4px 0;
        font-size: $font-size-base;
      }
    }
  }
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: $text-color-placeholder;
  font-size: $font-size-base;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
