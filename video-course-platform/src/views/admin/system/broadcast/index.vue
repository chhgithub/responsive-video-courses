<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores';
import {
  getAllBroadcastRecords,
  broadcastByTag,
  broadcastByCourseStudents,
  broadcastByOrganizationMembers,
  broadcastToAll,
  getEstimatedRecipientCount,
  type BroadcastRecord,
  type BroadcastTargetType,
  type MessageType,
} from '@/utils/broadcast-storage';
import { getAllTags } from '@/utils/user-tag-storage';
import { getAllCourses } from '@/utils/course-storage';
import { getAllOrganizations } from '@/utils/general-education-storage';
import type { UserTag } from '@/utils/user-tag-storage';
import type { Course } from '@/utils/course-storage';

// Define Organization type locally to avoid import issues
interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'family' | 'school';
  contactPerson?: string;
  contactPhone?: string;
  description?: string;
  createTime: string;
}

const authStore = useAuthStore();

// 页面加载状态
const loading = ref(false);
const sending = ref(false);

// 发送对话框
const sendDialogVisible = ref(false);

// 群发记录列表
const broadcastRecords = ref<BroadcastRecord[]>([]);

// 群发表单
const broadcastForm = ref({
  targetType: 'all' as BroadcastTargetType,
  targetIds: [] as string[],
  messageType: 'announcement' as MessageType,
  title: '',
  content: '',
  actionUrl: '',
  priority: 'normal' as 'low' | 'normal' | 'high',
});

// 表单验证
const formRules = {
  title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
};

// 消息类型选项
const messageTypeOptions = [
  { label: '系统通知', value: 'system' },
  { label: '课程相关', value: 'course' },
  { label: '公告', value: 'announcement' },
];

// 优先级选项
const priorityOptions = [
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '低', value: 'low' },
];

// 标签列表
const tags = ref<UserTag[]>([]);

// 课程列表
const courses = ref<Course[]>([]);

// 单位列表
const organizations = ref<Organization[]>([]);

// 预计接收人数
const estimatedCount = computed(() => {
  const targetType = broadcastForm.value.targetType;
  const targetIds = broadcastForm.value.targetIds || [];

  if (targetType === 'all') {
    return getEstimatedRecipientCount('all', []);
  }
  if (Array.isArray(targetIds) && targetIds.length > 0) {
    return getEstimatedRecipientCount(targetType, targetIds);
  }
  return 0;
});

// 打开发送对话框
function openSendDialog() {
  broadcastForm.value = {
    targetType: 'all',
    targetIds: [],
    messageType: 'announcement',
    title: '',
    content: '',
    actionUrl: '',
    priority: 'normal',
  };
  sendDialogVisible.value = true;
}

// 关闭发送对话框
function closeSendDialog() {
  sendDialogVisible.value = false;
  broadcastForm.value = {
    targetType: 'all',
    targetIds: [],
    messageType: 'announcement',
    title: '',
    content: '',
    actionUrl: '',
    priority: 'normal',
  };
}

// 发送消息
async function handleSend() {
  if (!broadcastForm.value.title.trim()) {
    ElMessage.warning('请输入消息标题');
    return;
  }
  if (!broadcastForm.value.content.trim()) {
    ElMessage.warning('请输入消息内容');
    return;
  }

  if (broadcastForm.value.targetType !== 'all' && broadcastForm.value.targetIds.length === 0) {
    ElMessage.warning('请选择目标');
    return;
  }

  sending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 600));

    const senderId = authStore.userInfo?.userId || 'admin';
    const senderName = authStore.userInfo?.nickname || '管理员';

    switch (broadcastForm.value.targetType) {
      case 'all':
        await broadcastToAll(
          broadcastForm.value.messageType,
          broadcastForm.value.title,
          broadcastForm.value.content,
          senderId,
          senderName,
          broadcastForm.value.actionUrl || undefined,
          broadcastForm.value.priority
        );
        break;
      case 'tag':
        const tagId = broadcastForm.value.targetIds[0];
        const tag = tags.value.find(t => t.tagId === tagId);
        await broadcastByTag(
          tagId,
          tag?.tagName || '未知标签',
          broadcastForm.value.messageType,
          broadcastForm.value.title,
          broadcastForm.value.content,
          senderId,
          senderName,
          broadcastForm.value.actionUrl || undefined,
          broadcastForm.value.priority
        );
        break;
      case 'course':
        const courseId = parseInt(broadcastForm.value.targetIds[0]);
        const course = courses.value.find(c => c.courseId === courseId);
        await broadcastByCourseStudents(
          courseId,
          course?.courseName || '未知课程',
          broadcastForm.value.messageType,
          broadcastForm.value.title,
          broadcastForm.value.content,
          senderId,
          senderName,
          broadcastForm.value.actionUrl || undefined,
          broadcastForm.value.priority
        );
        break;
      case 'organization':
        const orgId = broadcastForm.value.targetIds[0];
        const org = organizations.value.find(o => o.id === orgId);
        await broadcastByOrganizationMembers(
          orgId,
          org?.name || '未知单位',
          broadcastForm.value.messageType,
          broadcastForm.value.title,
          broadcastForm.value.content,
          senderId,
          senderName,
          broadcastForm.value.actionUrl || undefined,
          broadcastForm.value.priority
        );
        break;
    }

    ElMessage.success('消息发送成功');
    closeSendDialog();
    loadBroadcastRecords();
  } catch (error) {
    console.error('发送失败:', error);
    ElMessage.error('发送失败');
  } finally {
    sending.value = false;
  }
}

// 加载群发记录
async function loadBroadcastRecords() {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    broadcastRecords.value = getAllBroadcastRecords();
  } finally {
    loading.value = false;
  }
}

// 获取状态标签类型
function getStatusType(status: BroadcastRecord['status']) {
  const typeMap: Record<BroadcastRecord['status'], string> = {
    pending: 'info',
    sending: 'warning',
    completed: 'success',
    failed: 'danger',
  };
  return typeMap[status];
}

// 获取状态文本
function getStatusText(status: BroadcastRecord['status']) {
  const textMap: Record<BroadcastRecord['status'], string> = {
    pending: '待发送',
    sending: '发送中',
    completed: '已完成',
    failed: '发送失败',
  };
  return textMap[status];
}

// 获取消息类型文本
function getMessageTypeText(type: MessageType) {
  const textMap: Record<MessageType, string> = {
    system: '系统通知',
    consultation: '咨询回复',
    course: '课程相关',
    order: '订单相关',
    announcement: '公告',
  };
  return textMap[type];
}

// 格式化时间
function formatTime(time: string): string {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

onMounted(() => {
  // 初始化标签列表
  tags.value = getAllTags();
  // 初始化课程列表
  courses.value = getAllCourses();
  // 初始化单位列表
  organizations.value = getAllOrganizations();
  // 加载群发记录
  loadBroadcastRecords();
});
</script>

<template>
  <div class="broadcast-management">
    <el-card>
      <template #header>
        <div class="header">
          <h2>群发消息</h2>
          <el-button type="primary" @click="openSendDialog">
            发送消息
          </el-button>
        </div>
      </template>

      <!-- 群发记录列表 -->
      <el-table v-loading="loading" :data="broadcastRecords" stripe>
        <el-table-column prop="sendTime" label="发送时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.sendTime) }}
          </template>
        </el-table-column>
        <el-table-column label="目标" width="200">
          <template #default="{ row }">
            {{ row.targetName }}
          </template>
        </el-table-column>
        <el-table-column label="消息类型" width="120">
          <template #default="{ row }">
            {{ getMessageTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">
            {{ row.title }}
          </template>
        </el-table-column>
        <el-table-column label="发送人" width="120">
          <template #default="{ row }">
            {{ row.senderName }}
          </template>
        </el-table-column>
        <el-table-column label="发送统计" width="150">
          <template #default="{ row }">
            <div class="statistics">
              <span class="total">目标：{{ row.totalCount }}人</span>
              <span v-if="row.status !== 'pending'" class="success" style="color: #67c23a">成功：{{ row.successCount }}人</span>
              <span v-if="row.failCount > 0" class="fail" style="color: #f56c6c">失败：{{ row.failCount }}人</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="完成时间" width="180">
          <template #default="{ row }">
            {{ row.completedTime ? formatTime(row.completedTime) : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="broadcastRecords.length === 0 && !loading" description="暂无群发记录" />
    </el-card>

    <!-- 发送消息对话框 -->
    <el-dialog
      v-model="sendDialogVisible"
      title="群发消息"
      width="700px"
      @close="closeSendDialog"
    >
      <el-form :model="broadcastForm" label-width="100px">
        <el-form-item label="目标类型">
          <el-select v-model="broadcastForm.targetType" style="width: 100%" @change="() => broadcastForm.targetIds = []">
            <el-option label="全部用户" value="all" />
            <el-option label="按标签" value="tag" />
            <el-option label="按课程学员" value="course" />
            <el-option label="按单位成员" value="organization" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="broadcastForm.targetType === 'tag'" label="选择标签">
          <el-select
            v-model="broadcastForm.targetIds"
            style="width: 100%"
            placeholder="请选择标签"
          >
            <el-option
              v-for="tag in tags"
              :key="tag.tagId"
              :label="`${tag.tagName} (${tag.userCount}人)`"
              :value="tag.tagId"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="broadcastForm.targetType === 'course'" label="选择课程">
          <el-select
            v-model="broadcastForm.targetIds"
            style="width: 100%"
            placeholder="请选择课程"
          >
            <el-option
              v-for="course in courses"
              :key="course.courseId"
              :label="`${course.courseName} (${course.enrollCount}人)`"
              :value="course.courseId.toString()"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="broadcastForm.targetType === 'organization'" label="选择单位">
          <el-select
            v-model="broadcastForm.targetIds"
            style="width: 100%"
            placeholder="请选择单位"
          >
            <el-option
              v-for="org in organizations"
              :key="org.id"
              :label="`${org.name} (${org.type === 'family' ? '家庭教育' : '校园教育'})`"
              :value="org.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="broadcastForm.targetType !== 'all' && broadcastForm.targetIds.length > 0" label="预计接收">
          <span class="estimate-count">{{ estimatedCount }} 人</span>
        </el-form-item>

        <el-form-item v-if="broadcastForm.targetType === 'all'" label="预计接收">
          <span class="estimate-count">{{ estimatedCount }} 人</span>
        </el-form-item>

        <el-form-item label="消息类型">
          <el-select v-model="broadcastForm.messageType" style="width: 100%">
            <el-option
              v-for="option in messageTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="broadcastForm.priority" style="width: 100%">
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="消息标题" required>
          <el-input
            v-model="broadcastForm.title"
            placeholder="请输入消息标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="消息内容" required>
          <el-input
            v-model="broadcastForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="操作链接">
          <el-input
            v-model="broadcastForm.actionUrl"
            placeholder="请输入操作链接（可选）"
          />
        </el-form-item>

        <el-alert
          v-if="broadcastForm.targetType === 'all'"
          title="全员群发"
          type="warning"
          :closable="false"
          style="margin-bottom: 10px"
        >
          您即将向所有用户发送消息，请谨慎操作。
        </el-alert>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeSendDialog">取消</el-button>
          <el-button type="primary" :loading="sending" @click="handleSend">
            {{ sending ? '发送中...' : '发送' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.broadcast-management {
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

  .statistics {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: $font-size-small;

    .total {
      color: $text-color-regular;
    }
  }

  .estimate-count {
    font-size: $font-size-large;
    font-weight: 500;
    color: $--el-color-primary;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-base;
  }
}
</style>
