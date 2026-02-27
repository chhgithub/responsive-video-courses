<script setup lang="ts">
import { ref, watch } from 'vue';
import WangEditor from '@/components/WangEditor.vue';
import { adminFacultyApi } from '@/api/admin/introduction';
import type { FacultyConsultation, FacultyConsultationConfig } from '@/types/introduction';

interface Props {
  config: FacultyConsultationConfig | null;
  consultations: FacultyConsultation[];
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const configDialogVisible = ref(false);
const configFormRef = ref();
const configForm = ref<FacultyConsultationConfig>({
  isOpen: true,
  description: '',
});

const replyDialogVisible = ref(false);
const replyFormRef = ref();
const currentConsultation = ref<FacultyConsultation | null>(null);
const replyContent = ref('');

const detailDialogVisible = ref(false);
const viewConsultation = ref<FacultyConsultation | null>(null);

// 监听配置变化
watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      configForm.value = { ...newConfig };
    }
  },
  { immediate: true }
);

// 打开配置对话框
function openConfigDialog() {
  if (props.config) {
    configForm.value = { ...props.config };
  }
  configDialogVisible.value = true;
}

// 保存配置
async function handleSaveConfig() {
  try {
    await adminFacultyApi.updateConsultationConfig(configForm.value);
    configDialogVisible.value = false;
    emit('refresh');
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

// 打开回复对话框
function openReplyDialog(consultation: FacultyConsultation) {
  currentConsultation.value = consultation;
  replyContent.value = '';
  replyDialogVisible.value = true;
}

// 回复咨询
async function handleReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }

  if (!currentConsultation.value) return;

  try {
    await adminFacultyApi.replyConsultation(currentConsultation.value.id, replyContent.value);
    replyDialogVisible.value = false;
    emit('refresh');
  } catch (error) {
    console.error('回复失败:', error);
  }
}

// 查看详情
function viewDetail(consultation: FacultyConsultation) {
  viewConsultation.value = consultation;
  detailDialogVisible.value = true;
}

// 删除咨询
async function handleDelete(consultation: FacultyConsultation) {
  try {
    await adminFacultyApi.removeConsultation(consultation.id);
    emit('refresh');
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 状态标签类型
function getStatusType(status: string) {
  return status === 'resolved' ? 'success' : 'warning';
}

// 状态文本
function getStatusText(status: string) {
  return status === 'resolved' ? '已回复' : '待回复';
}
</script>

<template>
  <div class="faculty-consultation">
    <!-- 配置卡片 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>咨询表单配置</span>
          <el-button type="primary" size="small" @click="openConfigDialog">
            编辑配置
          </el-button>
        </div>
      </template>
      <div class="config-info">
        <div class="config-item">
          <span class="label">是否开放咨询：</span>
          <el-tag :type="config?.isOpen ? 'success' : 'info'" size="small">
            {{ config?.isOpen ? '是' : '否' }}
          </el-tag>
        </div>
        <div class="config-item">
          <span class="label">咨询说明：</span>
          <div class="content" v-html="config?.description || '-'"></div>
        </div>
      </div>
    </el-card>

    <!-- 咨询记录列表 -->
    <el-card class="list-card" shadow="never">
      <template #header>
        <span>咨询记录（共 {{ consultations.length }} 条）</span>
      </template>

      <el-table :data="consultations" stripe>
        <el-table-column prop="consultantName" label="咨询人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="topic" label="咨询主题" width="200" show-overflow-tooltip />
        <el-table-column prop="message" label="咨询内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="consultTime" label="咨询时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              size="small"
              @click="openReplyDialog(row)"
            >
              回复
            </el-button>
            <el-popconfirm
              v-if="row.status === 'resolved'"
              title="确定要删除该记录吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 配置对话框 -->
    <el-dialog v-model="configDialogVisible" title="编辑咨询配置" width="600px">
      <el-form ref="configFormRef" :model="configForm" label-width="120px">
        <el-form-item label="是否开放咨询">
          <el-switch v-model="configForm.isOpen" />
          <span class="field-tip">{{ configForm.isOpen ? '开放' : '关闭' }}</span>
        </el-form-item>

        <el-form-item label="咨询说明">
          <WangEditor
            v-model="configForm.description"
            placeholder="请输入咨询说明"
            :height="300"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复咨询" width="600px">
      <div v-if="currentConsultation" class="consultation-detail">
        <el-descriptions :column="1" border class="detail-info">
          <el-descriptions-item label="咨询人">{{ currentConsultation.consultantName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentConsultation.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentConsultation.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询主题">{{ currentConsultation.topic }}</el-descriptions-item>
          <el-descriptions-item label="咨询内容">
            {{ currentConsultation.message }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider>回复内容</el-divider>

      <el-form ref="replyFormRef" :model="{ replyContent }" label-width="0">
        <el-form-item>
          <WangEditor
            v-model="replyContent"
            placeholder="请输入回复内容"
            :height="300"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReply">发送回复</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="咨询详情" width="700px">
      <el-descriptions v-if="viewConsultation" :column="1" border>
        <el-descriptions-item label="咨询人">{{ viewConsultation.consultantName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewConsultation.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewConsultation.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="咨询主题">{{ viewConsultation.topic }}</el-descriptions-item>
        <el-descriptions-item label="咨询内容">
          {{ viewConsultation.message }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewConsultation.status)">
            {{ getStatusText(viewConsultation.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="咨询时间">{{ viewConsultation.consultTime }}</el-descriptions-item>
        <el-descriptions-item v-if="viewConsultation.status === 'resolved'" label="回复内容">
          {{ viewConsultation.reply }}
        </el-descriptions-item>
        <el-descriptions-item v-if="viewConsultation.replyTime" label="回复时间">
          {{ viewConsultation.replyTime }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="viewConsultation?.status === 'pending'"
          type="success"
          @click="openReplyDialog(viewConsultation); detailDialogVisible = false;"
        >
          回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.faculty-consultation {
  padding: $spacing-large;

  .config-card {
    margin-bottom: $spacing-large;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .config-info {
      .config-item {
        display: flex;
        margin-bottom: $spacing-base;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 500;
          color: $text-color-primary;
          width: 120px;
          flex-shrink: 0;
        }

        .content {
          flex: 1;
          color: $text-color-regular;
          line-height: 1.6;
        }
      }
    }
  }

  .list-card {
    /* 样式与申请列表相同 */
  }

  .consultation-detail {
    .detail-info {
      margin-bottom: $spacing-large;
    }
  }

  .field-tip {
    margin-left: $spacing-small;
    color: $text-color-secondary;
    font-size: $font-size-small;
  }
}
</style>
