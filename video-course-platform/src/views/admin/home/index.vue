<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { getBanners, deleteBanner, toggleStatus, type Banner } from '@/utils/banner-storage';
import BannerDrawer from './components/BannerDrawer.vue';

// Banner列表数据
const banners = ref<Banner[]>([]);
const loading = ref(false);

// 表格选中项
const selectedIds = ref<string[]>([]);

// 抽屉相关
const drawerVisible = ref(false);
const editingId = ref<string | undefined>();

// 加载数据
function loadBanners() {
  loading.value = true;
  try {
    banners.value = getBanners();
    // 按排序号排序
    banners.value.sort((a, b) => a.orderNum - b.orderNum);
  } finally {
    loading.value = false;
  }
}

// 表格选择变化
function handleSelectionChange(selection: Banner[]) {
  selectedIds.value = selection.map((item) => item.id);
}

// 新增Banner
function handleAdd() {
  editingId.value = undefined;
  drawerVisible.value = true;
}

// 编辑Banner
function handleEdit(row: Banner) {
  editingId.value = row.id;
  drawerVisible.value = true;
}

// 删除Banner
function handleDelete(row: Banner) {
  ElMessageBox.confirm(`确认删除 Banner "${row.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteBanner(row.id);
      ElMessage.success('删除成功');
      loadBanners();
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
        deleteBanner(id);
      });
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadBanners();
    })
    .catch(() => {});
}

// 切换状态
function handleToggleStatus(row: Banner) {
  toggleStatus(row.id);
  ElMessage.success(`已${row.status === '1' ? '禁用' : '启用'}`);
  loadBanners();
}

// 抽屉提交成功
function handleDrawerSubmit() {
  drawerVisible.value = false;
  loadBanners();
}

// 抽屉关闭
function handleDrawerClose() {
  drawerVisible.value = false;
}

onMounted(() => {
  loadBanners();
});
</script>

<template>
  <div class="banner-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>Banner 配置</h2>
      <p class="subtitle">管理首页轮播图</p>
    </div>

    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增 Banner
        </el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="banners"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNum" label="排序" width="80" sortable />
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl"
              :preview-src-list="[row.imageUrl]"
              fit="cover"
              style="width: 160px; height: 90px; border-radius: 4px"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === '1' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === '1' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑抽屉 -->
    <BannerDrawer
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

.banner-management {
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
