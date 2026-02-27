<script setup lang="ts">
import { ref, watch } from 'vue';
import WangEditor from '@/components/WangEditor.vue';
import { adminFacultyApi } from '@/api/admin/introduction';
import type { FacultyApplication, FacultyApplicationConfig } from '@/types/introduction';

interface Props {
  config: FacultyApplicationConfig | null;
  applications: FacultyApplication[];
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const configDialogVisible = ref(false);
const configFormRef = ref();
const configForm = ref<FacultyApplicationConfig>({
  isOpen: true,
  description: '',
  requirements: '',
  materials: '',
});

const detailDialogVisible = ref(false);
const currentApplication = ref<FacultyApplication | null>(null);

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
    await adminFacultyApi.updateApplicationConfig(configForm.value);
    configDialogVisible.value = false;
    emit('refresh');
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

// 查看详情
function viewDetail(application: FacultyApplication) {
  currentApplication.value = application;
  detailDialogVisible.value = true;
}

// 批准申请
async function handleApprove(application: FacultyApplication) {
  try {
    await adminFacultyApi.approveApplication(application.id, 'admin');
    emit('refresh');
  } catch (error) {
    console.error('批准失败:', error);
  }
}

// 拒绝申请
async function handleReject(application: FacultyApplication) {
  try {
    const reason = prompt('请输入拒绝理由：');
    if (reason) {
      await adminFacultyApi.rejectApplication(application.id, 'admin', reason);
      emit('refresh');
    }
  } catch (error) {
    console.error('拒绝失败:', error);
  }
}

// 删除申请
async function handleDelete(application: FacultyApplication) {
  try {
    await adminFacultyApi.removeApplication(application.id);
    emit('refresh');
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 状态标签类型
function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
}

// 状态文本
function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  };
  return map[status] || status;
}
</script>

<template>
  <div class="faculty-application">
    <!-- 配置卡片 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>申请表单配置</span>
          <el-button type="primary" size="small" @click="openConfigDialog">
            编辑配置
          </el-button>
        </div>
      </template>
      <div class="config-info">
        <div class="config-item">
          <span class="label">是否开放申请：</span>
          <el-tag :type="config?.isOpen ? 'success' : 'info'" size="small">
            {{ config?.isOpen ? '是' : '否' }}
          </el-tag>
        </div>
        <div class="config-item">
          <span class="label">申请说明：</span>
          <div class="content" v-html="config?.description || '-'"></div>
        </div>
      </div>
    </el-card>

    <!-- 申请记录列表 -->
    <el-card class="list-card" shadow="never">
      <template #header>
        <span>申请记录（共 {{ applications.length }} 条）</span>
      </template>

      <el-table :data="applications" stripe>
        <el-table-column prop="applicantName" label="申请人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="currentTitle" label="当前职称" width="120" />
        <el-table-column label="专业领域" width="200">
          <template #default="{ row }">
            <el-tag v-for="spec in row.specialties" :key="spec" size="small" class="tag">
              {{ spec }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" />
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
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-popconfirm
              v-if="row.status !== 'pending'"
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
    <el-dialog v-model="configDialogVisible" title="编辑申请配置" width="600px">
      <el-form ref="configFormRef" :model="configForm" label-width="120px">
        <el-form-item label="是否开放申请">
          <el-switch v-model="configForm.isOpen" />
          <span class="field-tip">{{ configForm.isOpen ? '开放' : '关闭' }}</span>
        </el-form-item>

        <el-form-item label="申请说明">
          <WangEditor
            v-model="configForm.description"
            placeholder="请输入申请说明"
            :height="250"
          />
        </el-form-item>

        <el-form-item label="申请条件">
          <WangEditor
            v-model="configForm.requirements"
            placeholder="请输入申请条件"
            :height="200"
          />
        </el-form-item>

        <el-form-item label="所需材料">
          <WangEditor
            v-model="configForm.materials"
            placeholder="请输入所需材料"
            :height="200"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="申请详情" width="700px">
      <el-descriptions v-if="currentApplication" :column="2" border>
        <el-descriptions-item label="申请人">{{ currentApplication.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentApplication.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentApplication.email }}</el-descriptions-item>
        <el-descriptions-item label="当前职称">{{ currentApplication.currentTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属机构" :span="2">{{ currentApplication.institution || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业领域" :span="2">
          <el-tag v-for="spec in currentApplication.specialties" :key="spec" size="small" class="tag">
            {{ spec }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="成就描述" :span="2">
          {{ currentApplication.achievements || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentApplication.status)">
            {{ getStatusText(currentApplication.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentApplication.applyTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentApplication.status !== 'pending'" label="审核人">
          {{ currentApplication.reviewer || '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentApplication.status === 'rejected'" label="拒绝理由" :span="2">
          {{ currentApplication.rejectReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentApplication?.status === 'pending'"
          type="success"
          @click="handleApprove(currentApplication); detailDialogVisible = false;"
        >
          通过
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.faculty-application {
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
    .tag {
      margin-right: $spacing-small;
      margin-bottom: $spacing-small;
    }
  }

  .field-tip {
    margin-left: $spacing-small;
    color: $text-color-secondary;
    font-size: $font-size-small;
  }
}
</style>
