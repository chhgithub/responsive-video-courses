<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface Course {
  courseId: number;
  courseName: string;
  categoryName: string;
  teacherName: string;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  viewCount: number;
  enrollCount: number;
  status: 'draft' | 'published' | 'offline';
  courseCover?: string;
  createTime: string;
}

const loading = ref(false);
const courses = ref<Course[]>([]);
const selectedIds = ref<number[]>([]);

// 搜索表单
const searchForm = ref({
  courseName: '',
  categoryId: undefined as number | undefined,
  teacherId: undefined as number | undefined,
  status: undefined as string | undefined,
});

// 分页
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
});

// 分类选项
const categoryOptions = ref<any[]>([]);
// 讲师选项
const teacherOptions = ref<any[]>([]);

// 课程抽屉
const showDrawer = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const currentCourseId = ref<number>();

// 章节管理弹窗
const showChapterManager = ref(false);
const currentCourseForChapter = ref<Course>();

// 生成 Mock 课程数据
function generateMockCourses(): Course[] {
  const categories = ['前端开发', '后端开发', '人工智能', '数据分析', '产品设计'];
  const teachers = ['张老师', '李老师', '王老师', '赵老师', '刘老师', '陈老师'];
  const statuses: Array<'draft' | 'published' | 'offline'> = ['draft', 'published', 'offline'];

  return Array.from({ length: 20 }, (_, i) => ({
    courseId: i + 1,
    courseName: `课程 ${i + 1} - ${categories[i % categories.length]}实战教程`,
    categoryName: categories[i % categories.length],
    teacherName: teachers[i % teachers.length],
    price: Math.random() > 0.3 ? Math.floor(Math.random() * 500) + 99 : 0,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 800) + 199 : undefined,
    isFree: Math.random() > 0.7,
    viewCount: Math.floor(Math.random() * 10000),
    enrollCount: Math.floor(Math.random() * 5000),
    status: statuses[i % statuses.length],
    courseCover: `https://picsum.photos/seed/course${i + 1}/300/200`,
    createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
}

async function loadCourses() {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300));
    const allCourses = generateMockCourses();

    // 筛选
    let filtered = allCourses;
    if (searchForm.value.courseName) {
      filtered = filtered.filter(c => c.courseName.includes(searchForm.value.courseName));
    }
    if (searchForm.value.status) {
      filtered = filtered.filter(c => c.status === searchForm.value.status);
    }

    pagination.value.total = filtered.length;

    // 分页
    const start = (pagination.value.page - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    courses.value = filtered.slice(start, end);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.value.page = 1;
  loadCourses();
}

function handleReset() {
  searchForm.value = {
    courseName: '',
    categoryId: undefined,
    teacherId: undefined,
    status: undefined,
  };
  pagination.value.page = 1;
  loadCourses();
}

function handleAdd() {
  drawerMode.value = 'add';
  currentCourseId.value = undefined;
  showDrawer.value = true;
}

function handleEdit(row: Course) {
  drawerMode.value = 'edit';
  currentCourseId.value = row.courseId;
  showDrawer.value = true;
}

function handleDelete(row: Course) {
  ElMessageBox.confirm(
    `确认删除课程"${row.courseName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('删除成功');
      loadCourses();
    })
    .catch(() => {});
}

function handleSelectionChange(selection: Course[]) {
  selectedIds.value = selection.map(c => c.courseId);
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
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadCourses();
    })
    .catch(() => {});
}

function handleManageChapter(row: Course) {
  currentCourseForChapter.value = row;
  showChapterManager.value = true;
}

function handleDrawerSuccess() {
  showDrawer.value = false;
  loadCourses();
}

function handlePageChange(page: number) {
  pagination.value.page = page;
  loadCourses();
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  loadCourses();
}

onMounted(() => {
  // 生成选项数据
  categoryOptions.value = [
    { categoryId: 1, categoryName: '前端开发' },
    { categoryId: 2, categoryName: '后端开发' },
    { categoryId: 3, categoryName: '人工智能' },
    { categoryId: 4, categoryName: '数据分析' },
    { categoryId: 5, categoryName: '产品设计' },
  ];
  teacherOptions.value = [
    { teacherId: 1, teacherName: '张老师' },
    { teacherId: 2, teacherName: '李老师' },
    { teacherId: 3, teacherName: '王老师' },
    { teacherId: 4, teacherName: '赵老师' },
    { teacherId: 5, teacherName: '刘老师' },
    { teacherId: 6, teacherName: '陈老师' },
  ];

  loadCourses();
});
</script>

<template>
  <div class="course-management">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.courseName"
            placeholder="请输入课程名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="课程分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.categoryId"
              :label="cat.categoryName"
              :value="cat.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="讲师">
          <el-select
            v-model="searchForm.teacherId"
            placeholder="请选择讲师"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.teacherId"
              :label="teacher.teacherName"
              :value="teacher.teacherId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="上架" value="published" />
            <el-option label="下架" value="draft" />
            <el-option label="已下架" value="offline" />
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
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleMultiDelete">
        批量删除
      </el-button>
      <el-button type="primary" @click="handleAdd">新增课程</el-button>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="courses"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="courseId" label="ID" width="80" />
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.courseCover"
              :src="row.courseCover"
              fit="cover"
              style="width: 60px; height: 40px; border-radius: 4px"
              :preview-src-list="[row.courseCover]"
              preview-teleported
            />
            <span v-else class="text-gray-400">暂无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="teacherName" label="讲师" width="120" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.isFree" type="success">免费</el-tag>
            <template v-else>
              <span class="text-red-500 font-bold">¥{{ row.price || 0 }}</span>
              <span
                v-if="row.originalPrice && row.originalPrice > row.price"
                class="ml-1 text-xs text-gray-400 line-through"
              >
                ¥{{ row.originalPrice }}
              </span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="观看次数" width="100" />
        <el-table-column prop="enrollCount" label="报名人数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '上架' : row.status === 'draft' ? '下架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleManageChapter(row)">章节管理</el-button>
            <el-popconfirm
              title="确认删除该课程吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 课程抽屉 -->
    <course-drawer
      v-model="showDrawer"
      :mode="drawerMode"
      :course-id="currentCourseId"
      @success="handleDrawerSuccess"
    />

    <!-- 章节管理弹窗 -->
    <el-dialog
      v-model="showChapterManager"
      title="章节管理"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentCourseForChapter">
        <p>课程：{{ currentCourseForChapter.courseName }}</p>
        <el-empty description="章节管理功能待实现" />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.course-management {
  padding: $spacing-large;
}

.search-card,
.toolbar-card,
.table-card {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}

.toolbar-card {
  display: flex;
  gap: $spacing-base;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-large;
}
</style>
