<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getAllConsultations,
  updateConsultationStatus,
  deleteConsultation,
  batchDeleteConsultations,
  type Consultation,
} from '@/utils/consultation-storage';
import DetailDrawer from './components/DetailDrawer.vue';

// 数据列表
const consultationList = ref<Consultation[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 详情抽屉
const drawerVisible = ref(false);
const currentId = ref<string>();

// 从localStorage加载数据
function loadData() {
  loading.value = true;
  try {
    consultationList.value = getAllConsultations();
    // 按时间倒序
    consultationList.value.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } finally {
    loading.value = false;
  }
}

// 表格选择变化
function handleSelectionChange(selection: Consultation[]) {
  selectedIds.value = selection.map((item) => item.id);
}

// 查看详情
function handleViewDetail(row: Consultation) {
  currentId.value = row.id;
  drawerVisible.value = true;
}

// 标记为已回复
function handleMarkReplied(id: string) {
  updateConsultationStatus(id, 'replied');
  ElMessage.success('已标记为已回复');
  drawerVisible.value = false;
  loadData();
}

// 批量标记为已回复
function handleBatchMarkReplied() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要处理的记录');
    return;
  }

  selectedIds.value.forEach((id) => {
    updateConsultationStatus(id, 'replied');
  });

  ElMessage.success(`已标记 ${selectedIds.value.length} 条记录为已回复`);
  selectedIds.value = [];
  loadData();
}

// 删除
function handleDelete(id: string) {
  const item = consultationList.value.find((c) => c.id === id);
  if (!item) return;

  ElMessageBox.confirm(`确认删除咨询记录"${item.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteConsultation(id);
      ElMessage.success('删除成功');
      drawerVisible.value = false;
      loadData();
    })
    .catch(() => {});
}

// 批量删除
function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的记录');
    return;
  }

  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      batchDeleteConsultations(selectedIds.value);
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

// 关闭详情抽屉
function handleDrawerClose() {
  drawerVisible.value = false;
  currentId.value = undefined;
}

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

// 刷新数据（由DetailDrawer的回复触发）
function handleRefresh() {
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="consultation-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>在线咨询</h2>
      <p class="subtitle">查看和管理用户咨询记录</p>
    </div>

    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button
            type="success"
            :disabled="selectedIds.length === 0"
            @click="handleBatchMarkReplied"
          >
            批量标记已回复
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-tag type="info">共 {{ consultationList.length }} 条记录</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="consultationList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="subject" label="咨询主题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="message" label="咨询内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="提交时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              @click="handleMarkReplied(row.id)"
            >
              标记已回复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-if="drawerVisible"
      :id="currentId"
      :visible="drawerVisible"
      @close="handleDrawerClose"
      @mark-process="handleMarkReplied"
      @delete="handleDelete"
      @refresh="handleRefresh"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.consultation-management {
  padding: $spacing-large;
}

.page-header {
  margin-bottom: $spacing-large;

  h2 {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .subtitle {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

.toolbar-card {
  margin-bottom: $spacing-large;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .toolbar-left {
    display: flex;
    gap: $spacing-base;
  }
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}
</style>
