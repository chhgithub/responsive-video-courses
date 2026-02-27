<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  getAllPackages,
  deletePackage,
  updatePackageStatus,
  copyPackage,
  type CoursePackage,
} from '@/utils/course-package-storage';
import PackageDrawer from './package-drawer.vue';
import PackageCourseManager from './package-course-manager.vue';
import PackageReview from './components/PackageReview.vue';
import PackageStudent from './components/PackageStudent.vue';

const loading = ref(false);
const packages = ref<CoursePackage[]>([]);
const selectedIds = ref<number[]>([]);

// 搜索表单
const searchForm = ref({
  packageName: '',
  status: undefined as string | undefined,
});

// 分页
const pagination = ref({
  page: 1,
  pageSize: 9,
  total: 0,
});

// 套餐抽屉
const showPackageDrawer = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const currentPackageId = ref<number>();

// 课程管理弹窗
const showCourseManager = ref(false);
const currentPackageForCourse = ref<CoursePackage>();

// 评价列表弹窗
const showReviewList = ref(false);
const currentPackageForReview = ref<CoursePackage>();

// 学员列表弹窗
const showStudentList = ref(false);
const currentPackageForStudent = ref<CoursePackage>();

async function loadPackages() {
  loading.value = true;
  try {
    const allPackages = getAllPackages();

    // 筛选
    let filtered = allPackages;
    if (searchForm.value.packageName) {
      filtered = filtered.filter((p) => p.packageName.includes(searchForm.value.packageName));
    }
    if (searchForm.value.status) {
      filtered = filtered.filter((p) => p.status === searchForm.value.status);
    }

    // 按排序号排序
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    pagination.value.total = filtered.length;

    // 分页
    const start = (pagination.value.page - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    packages.value = filtered.slice(start, end);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.value.page = 1;
  loadPackages();
}

function handleReset() {
  searchForm.value = {
    packageName: '',
    status: undefined,
  };
  pagination.value.page = 1;
  loadPackages();
}

function handleAdd() {
  drawerMode.value = 'add';
  currentPackageId.value = undefined;
  showPackageDrawer.value = true;
}

function handleEdit(row: CoursePackage) {
  drawerMode.value = 'edit';
  currentPackageId.value = row.packageId;
  showPackageDrawer.value = true;
}

function handleDelete(row: CoursePackage) {
  ElMessageBox.confirm(`确认删除套餐"${row.packageName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deletePackage(row.packageId);
      ElMessage.success('删除成功');
      loadPackages();
    })
    .catch(() => {});
}

function handleSelectionChange(selection: CoursePackage[]) {
  selectedIds.value = selection.map((p) => p.packageId);
}

function handleMultiDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的记录');
    return;
  }
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedIds.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      selectedIds.value.forEach((id) => {
        deletePackage(id);
      });
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadPackages();
    })
    .catch(() => {});
}

function handleManageCourses(row: CoursePackage) {
  currentPackageForCourse.value = row;
  showCourseManager.value = true;
}

function handleViewReview(row: CoursePackage) {
  currentPackageForReview.value = row;
  showReviewList.value = true;
}

function handleViewStudent(row: CoursePackage) {
  currentPackageForStudent.value = row;
  showStudentList.value = true;
}

function handleMoreCommand(command: string, row: CoursePackage) {
  switch (command) {
    case 'publish':
      updatePackageStatus(row.packageId, 'published');
      ElMessage.success('套餐已上架');
      loadPackages();
      break;
    case 'offline':
      updatePackageStatus(row.packageId, 'offline');
      ElMessage.success('套餐已下架');
      loadPackages();
      break;
    case 'copy':
      copyPackage(row.packageId);
      ElMessage.success('套餐复制成功');
      loadPackages();
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

function handleDrawerSuccess() {
  showPackageDrawer.value = false;
  loadPackages();
}

// 处理单选
function handleSelectChange(id: number, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id);
    }
  } else {
    selectedIds.value = selectedIds.value.filter(item => item !== id);
  }
}

// 全选/反选
function handleToggleSelectAll() {
  if (selectedIds.value.length === packages.value.length) {
    // 当前全选，执行反选
    selectedIds.value = [];
  } else {
    // 执行全选
    selectedIds.value = packages.value.map(pkg => pkg.packageId);
  }
}

function handleCourseManagerSuccess() {
  showCourseManager.value = false;
  loadPackages();
}

function handlePageChange(page: number) {
  pagination.value.page = page;
  loadPackages();
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  loadPackages();
}

// 获取状态标签
function getStatusLabel(status: string): string {
  const labels = {
    draft: '草稿',
    published: '上架',
    offline: '下架',
  };
  return labels[status] || status;
}

// 获取状态颜色
function getStatusColor(status: string): string {
  const colors = {
    draft: 'info',
    published: 'success',
    offline: 'warning',
  };
  return colors[status] || 'default';
}

// 格式化价格
function formatPrice(price: number): string {
  return `¥${price}`;
}

onMounted(() => {
  loadPackages();
});
</script>

<template>
  <div class="package-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>课程套餐管理</h2>
      <p class="subtitle">将多个课程组合成套餐，提供更优惠的价格</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="套餐名称">
          <el-input
            v-model="searchForm.packageName"
            placeholder="请输入套餐名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="上架" value="published" />
            <el-option label="下架" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar-left">
        <el-button
          v-if="selectedIds.length > 0"
          link
          type="primary"
          @click="handleToggleSelectAll"
        >
          {{ selectedIds.length === packages.length ? '反选' : '全选' }}
        </el-button>
        <span v-if="selectedIds.length > 0" class="selected-count">
          已选 {{ selectedIds.length }} 项
        </span>
      </div>
      <div class="toolbar-right">
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleMultiDelete"
        >
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">新建套餐</el-button>
      </div>
    </el-card>

    <!-- 套餐列表 -->
    <el-card v-loading="loading" class="packages-card" shadow="never">
      <div v-if="packages.length > 0" class="packages-grid">
        <div
          v-for="pkg in packages"
          :key="pkg.packageId"
          class="package-card"
          :class="{ selected: selectedIds.includes(pkg.packageId) }"
        >
          <!-- 左上角选择框 -->
          <div class="card-checkbox">
            <el-checkbox
              :model-value="selectedIds.includes(pkg.packageId)"
              @change="handleSelectChange(pkg.packageId, $event)"
            />
          </div>

          <!-- 封面 -->
          <div class="package-cover">
            <el-image
              :src="pkg.packageCover"
              fit="cover"
              class="cover-image"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><VideoPlay /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="package-badge">
              {{ pkg.courses.length }}门课程
            </div>
          </div>

          <!-- 套餐信息 -->
          <div class="package-info">
            <div class="package-header">
              <el-tag :type="getStatusColor(pkg.status)" size="small">
                {{ getStatusLabel(pkg.status) }}
              </el-tag>
              <span class="package-rating" v-if="pkg.rating > 0">
                ⭐{{ pkg.rating }}
              </span>
            </div>

            <h3 class="package-title" :title="pkg.packageName">
              {{ pkg.packageName }}
            </h3>

            <p class="package-desc">{{ pkg.packageDesc }}</p>

            <!-- 包含的课程 -->
            <div class="package-courses">
              <div
                v-for="course in pkg.courses.slice(0, 3)"
                :key="course.courseId"
                class="course-item"
              >
                <el-icon><Check /></el-icon>
                <span class="course-name">{{ course.courseName }}</span>
                <span v-if="!course.isRequired" class="course-tag">(选修)</span>
              </div>
              <div v-if="pkg.courses.length > 3" class="more-courses">
                等{{ pkg.courses.length }}门课程
              </div>
            </div>

            <!-- 价格信息 -->
            <div class="package-price">
              <div class="price-current">{{ formatPrice(pkg.price) }}</div>
              <div class="price-original">
                <span class="original-price">{{ formatPrice(pkg.originalPrice) }}</span>
                <span class="price-discount">{{ pkg.discount }}% OFF</span>
              </div>
              <div class="price-save">节省 {{ formatPrice(pkg.originalPrice - pkg.price) }}</div>
            </div>

            <!-- 统计信息 -->
            <div class="package-stats">
              <span class="stat-item">
                <el-icon><User /></el-icon>
                {{ pkg.enrollCount }}人
              </span>
              <span class="stat-item" v-if="pkg.reviewCount > 0">
                <el-icon><ChatDotRound /></el-icon>
                {{ pkg.reviewCount }}条评价
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="package-actions">
              <el-button link type="primary" size="small" @click="handleEdit(pkg)">
                编辑
              </el-button>
              <el-button link type="primary" size="small" @click="handleManageCourses(pkg)">
                课程
              </el-button>
              <el-button link type="primary" size="small" @click="handleViewReview(pkg)">
                评价
              </el-button>
              <el-button link type="primary" size="small" @click="handleViewStudent(pkg)">
                学员
              </el-button>
              <el-dropdown @command="(cmd) => handleMoreCommand(cmd, pkg)">
                <el-button link type="primary" size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="pkg.status !== 'published'" command="publish">
                      上架
                    </el-dropdown-item>
                    <el-dropdown-item v-if="pkg.status === 'published'" command="offline">
                      下架
                    </el-dropdown-item>
                    <el-dropdown-item command="copy">复制套餐</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无套餐数据">
          <el-button type="primary" @click="handleAdd">创建第一个套餐</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[9, 18, 27, 36]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 套餐编辑抽屉 -->
    <PackageDrawer
      v-if="showPackageDrawer"
      v-model="showPackageDrawer"
      :mode="drawerMode"
      :package-id="currentPackageId"
      @success="handleDrawerSuccess"
    />

    <!-- 课程管理弹窗 -->
    <PackageCourseManager
      v-if="currentPackageForCourse"
      v-model:visible="showCourseManager"
      :package="currentPackageForCourse"
      @success="handleCourseManagerSuccess"
    />

    <!-- 评价列表弹窗 -->
    <PackageReview
      v-if="currentPackageForReview"
      v-model:visible="showReviewList"
      :package-id="currentPackageForReview.packageId"
      :package-name="currentPackageForReview.packageName"
    />

    <!-- 学员列表弹窗 -->
    <PackageStudent
      v-if="currentPackageForStudent"
      v-model:visible="showStudentList"
      :package-id="currentPackageForStudent.packageId"
      :package-name="currentPackageForStudent.packageName"
    />
  </div>
</template>

<style scoped lang="scss">

.package-management {
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

.search-card,
.toolbar-card,
.packages-card {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: $spacing-base;

    .selected-count {
      color: $text-color-secondary;
      font-size: $font-size-small;
    }
  }

  .toolbar-right {
    display: flex;
    gap: $spacing-base;
  }
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-large;
}

.package-card {
  background: #fff;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: $transition-base;
  position: relative;

  &:hover {
    box-shadow: $box-shadow-card;
    border-color: $border-color-light;
  }

  &.selected {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .card-checkbox {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
  }
}

.package-cover {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f5f7fa;

  .cover-image {
    width: 100%;
    height: 100%;
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: $background-color-base;
    color: $text-color-placeholder;
    font-size: 48px;
  }

  .package-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 12px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: $font-size-extra-small;
    border-radius: $border-radius-small;
  }
}

.package-info {
  padding: $spacing-base;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-small;
}

.package-rating {
  font-size: $font-size-small;
  color: #f59e0b;
}

.package-title {
  font-size: $font-size-medium;
  font-weight: 600;
  color: $text-color-primary;
  margin: 0 0 $spacing-small 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-desc {
  font-size: $font-size-small;
  color: $text-color-secondary;
  margin: 0 0 $spacing-base 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.package-courses {
  padding: $spacing-small 0;
  margin-bottom: $spacing-base;
  border-top: 1px solid $border-color-lighter;
  border-bottom: 1px solid $border-color-lighter;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-extra-small;
  color: $text-color-secondary;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  .el-icon {
    color: #67c23a;
    font-size: 12px;
  }

  .course-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .course-tag {
    color: #409eff;
  }
}

.more-courses {
  font-size: $font-size-extra-small;
  color: $text-color-secondary;
  text-align: center;
  margin-top: 4px;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: $spacing-small;
  margin-bottom: $spacing-base;

  .price-current {
    font-size: 24px;
    font-weight: bold;
    color: #f56c6c;
  }

  .price-original {
    display: flex;
    align-items: center;
    gap: $spacing-small;

    .original-price {
      font-size: $font-size-small;
      color: $text-color-placeholder;
      text-decoration: line-through;
    }

    .price-discount {
      padding: 2px 8px;
      background: #f56c6c;
      color: #fff;
      font-size: $font-size-extra-small;
      border-radius: $border-radius-small;
    }
  }

  .price-save {
    margin-left: auto;
    font-size: $font-size-extra-small;
    color: #67c23a;
  }
}

.package-stats {
  display: flex;
  gap: $spacing-large;
  margin-bottom: $spacing-base;
  padding-bottom: $spacing-base;
  border-bottom: 1px solid $border-color-lighter;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}

.package-actions {
  display: flex;
  gap: $spacing-small;
  flex-wrap: wrap;
}

.empty-state {
  padding: $spacing-extra-extra-large 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-large;
}
</style>
