<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'processed';
  submitTime: string;
}

// 数据列表
const consultationList = ref<Consultation[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 详情抽屉
const detailVisible = ref(false);
const currentDetail = ref<Consultation | null>(null);

// 从localStorage加载数据
function loadData() {
  loading.value = true;
  try {
    const data = localStorage.getItem('portal_consultations');
    if (data) {
      consultationList.value = JSON.parse(data);
    } else {
      // Mock数据
      consultationList.value = [
        {
          id: '1',
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          message: '请问课程如何购买？',
          status: 'pending',
          submitTime: '2024-01-15 10:30',
        },
        {
          id: '2',
          name: '李四',
          email: 'lisi@example.com',
          phone: '13900139000',
          message: '希望能够了解更多关于Python课程的信息',
          status: 'processed',
          submitTime: '2024-01-14 14:20',
        },
      ];
      localStorage.setItem('portal_consultations', JSON.stringify(consultationList.value));
    }
    // 按时间倒序
    consultationList.value.sort((a, b) => {
      return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
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
  currentDetail.value = row;
  detailVisible.value = true;
}

// 标记为已处理
function handleMarkProcessed(row: Consultation) {
  row.status = 'processed';
  localStorage.setItem('portal_consultations', JSON.stringify(consultationList.value));
  ElMessage.success('已标记为已处理');
  loadData();
}

// 批量标记为已处理
function handleBatchMarkProcessed() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要处理的记录');
    return;
  }

  consultationList.value.forEach((item) => {
    if (selectedIds.value.includes(item.id)) {
      item.status = 'processed';
    }
  });

  localStorage.setItem('portal_consultations', JSON.stringify(consultationList.value));
  ElMessage.success(`已标记 ${selectedIds.value.length} 条记录为已处理`);
  selectedIds.value = [];
  loadData();
}

// 删除
function handleDelete(row: Consultation) {
  ElMessageBox.confirm(`确认删除咨询记录"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = consultationList.value.findIndex((c) => c.id === row.id);
      if (index !== -1) {
        consultationList.value.splice(index, 1);
        localStorage.setItem('portal_consultations', JSON.stringify(consultationList.value));
      }
      ElMessage.success('删除成功');
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
      consultationList.value = consultationList.value.filter(
        (c) => !selectedIds.value.includes(c.id)
      );
      localStorage.setItem('portal_consultations', JSON.stringify(consultationList.value));
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

// 关闭详情抽屉
function handleCloseDetail() {
  detailVisible.value = false;
  currentDetail.value = null;
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
            @click="handleBatchMarkProcessed"
          >
            批量标记已处理
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
        <el-table-column prop="message" label="咨询内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="submitTime" label="提交时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'processed' ? 'success' : 'warning'">
              {{ row.status === 'processed' ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              @click="handleMarkProcessed(row)"
            >
              标记已处理
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      title="咨询详情"
      size="600px"
      @close="handleCloseDetail"
    >
      <div v-if="currentDetail" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">
            {{ currentDetail.name }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentDetail.email }}
          </el-descriptions-item>
          <el-descriptions-item label="电话">
            {{ currentDetail.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ currentDetail.submitTime }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === 'processed' ? 'success' : 'warning'">
              {{ currentDetail.status === 'processed' ? '已处理' : '待处理' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 咨询内容 -->
        <div class="message-section">
          <h3>咨询内容</h3>
          <div class="message-content">
            {{ currentDetail.message }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button
            v-if="currentDetail.status === 'pending'"
            type="success"
            @click="handleMarkProcessed(currentDetail)"
          >
            标记为已处理
          </el-button>
          <el-button type="danger" @click="handleDelete(currentDetail)">删除</el-button>
        </div>
      </div>
    </el-drawer>
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

.detail-content {
  .message-section {
    margin-top: $spacing-extra-large;

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
      min-height: 100px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .detail-actions {
    margin-top: $spacing-extra-large;
    display: flex;
    gap: $spacing-base;
  }
}
</style>
