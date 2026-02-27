<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllNews, deleteNews, toggleNewsStatus, type News } from '@/utils/news-storage';
import NewsDrawer from './components/NewsDrawer.vue';

// 数据列表
const newsList = ref<News[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 抽屉相关
const drawerVisible = ref(false);
const editingId = ref<string | undefined>();

// 加载数据
function loadData() {
  loading.value = true;
  try {
    newsList.value = getAllNews();
    newsList.value.sort((a, b) => a.orderNum - b.orderNum);
  } finally {
    loading.value = false;
  }
}

// 表格选择变化
function handleSelectionChange(selection: News[]) {
  selectedIds.value = selection.map((item) => item.id);
}

// 新增
function handleAdd() {
  editingId.value = undefined;
  drawerVisible.value = true;
}

// 编辑
function handleEdit(row: News) {
  editingId.value = row.id;
  drawerVisible.value = true;
}

// 删除
function handleDelete(row: News) {
  ElMessageBox.confirm(`确认删除资讯"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteNews(row.id);
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
      selectedIds.value.forEach((id) => {
        deleteNews(id);
      });
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

// 切换状态
function handleToggleStatus(row: News) {
  toggleNewsStatus(row.id);
  ElMessage.success(`已${row.isActive ? '禁用' : '启用'}`);
  loadData();
}

// 抽屉提交成功
function handleDrawerSubmit() {
  drawerVisible.value = false;
  loadData();
}

// 抽屉关闭
function handleDrawerClose() {
  drawerVisible.value = false;
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="news-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>资讯公告</h2>
      <p class="subtitle">管理新闻公告信息</p>
    </div>

    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增资讯
        </el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="newsList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.isActive ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑抽屉 -->
    <NewsDrawer
      v-if="drawerVisible"
      :id="editingId"
      :visible="drawerVisible"
      @submit="handleDrawerSubmit"
      @close="handleDrawerClose"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.news-management {
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
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}
</style>
