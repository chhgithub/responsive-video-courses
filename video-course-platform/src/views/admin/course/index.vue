<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getAllCourses, initCourseData, deleteCourse, updateCourseStatus, copyCourse, type Course } from '@/utils/course-storage';
import CourseDrawer from './course-drawer.vue';
import ChapterManager from './chapter-manager.vue';
import ReviewList from './review-list.vue';
import StudentList from './student-list.vue';

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
const showCourseDrawer = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const currentCourseId = ref<number>();

// 章节管理弹窗
const showChapterManager = ref(false);
const currentCourseForChapter = ref<Course>();

// 评价列表弹窗
const showReviewList = ref(false);
const currentCourseForReview = ref<Course>();

// 学员列表弹窗
const showStudentList = ref(false);
const currentCourseForStudent = ref<Course>();

// 生成 Mock 课程数据
function generateMockCourses(): Course[] {
  return getAllCourses();
}

async function loadCourses() {
  loading.value = true;
  try {
    const allCourses = generateMockCourses();

    // 筛选
    let filtered = allCourses;
    if (searchForm.value.courseName) {
      filtered = filtered.filter((c) => c.courseName.includes(searchForm.value.courseName));
    }
    if (searchForm.value.status) {
      filtered = filtered.filter((c) => c.status === searchForm.value.status);
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
  showCourseDrawer.value = true;
}

function handleEdit(row: Course) {
  drawerMode.value = 'edit';
  currentCourseId.value = row.courseId;
  showCourseDrawer.value = true;
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
      deleteCourse(row.courseId);
      ElMessage.success('删除成功');
      loadCourses();
    })
    .catch(() => {});
}

function handleSelectionChange(selection: Course[]) {
  selectedIds.value = selection.map((c) => c.courseId);
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
        deleteCourse(id);
      });
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

function handleCopyLink(row: Course) {
  const link = `${window.location.origin}/portal/courses/${row.courseId}`;
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('课程链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制');
  });
}

function handleViewStudent(row: Course) {
  currentCourseForStudent.value = row;
  showStudentList.value = true;
}

function handleMoreCommand(command: string, row: Course) {
  switch (command) {
    case 'publish':
      updateCourseStatus(row.courseId, 'published');
      ElMessage.success('课程已上架');
      loadCourses();
      break;
    case 'offline':
      updateCourseStatus(row.courseId, 'draft');
      ElMessage.success('课程已下架');
      loadCourses();
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
}

function handleDrawerSuccess() {
  showCourseDrawer.value = false;
  loadCourses();
}

function handleChapterSuccess() {
  showChapterManager.value = false;
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
  // 初始化课程数据
  initCourseData();

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
            <el-option label="未上架" value="draft" />
            <el-option label="已上架" value="published" />
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
        <el-table-column label="讲师" width="150">
          <template #default="{ row }">
            {{ row.teacherNames?.length ? row.teacherNames.join('、') : '-' }}
          </template>
        </el-table-column>
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
        <el-table-column prop="enrollCount" label="报名人数" width="100" />
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <span v-if="row.rating > 0">⭐{{ row.rating }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已上架' : '未上架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleManageChapter(row)">章节</el-button>
            <el-button link type="primary" size="small" @click="handleCopyLink(row)">复制链接</el-button>
            <el-button link type="primary" size="small" @click="handleViewStudent(row)">学员</el-button>
            <el-dropdown @command="(cmd) => handleMoreCommand(cmd, row)">
              <el-button link type="primary" size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status !== 'published'" command="publish">
                    上架
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'published'" command="offline">
                    下架
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 课程编辑抽屉 -->
    <CourseDrawer
      v-model="showCourseDrawer"
      :mode="drawerMode"
      :course-id="currentCourseId"
      @success="handleDrawerSuccess"
    />

    <!-- 章节管理弹窗 -->
    <ChapterManager
      v-if="currentCourseForChapter"
      v-model:visible="showChapterManager"
      :course="currentCourseForChapter"
      @success="handleChapterSuccess"
    />

    <!-- 课程评价弹窗 -->
    <ReviewList
      v-if="currentCourseForReview"
      v-model:visible="showReviewList"
      :course-id="currentCourseForReview.courseId"
      :course-name="currentCourseForReview.courseName"
    />

    <!-- 学员列表弹窗 -->
    <StudentList
      v-if="currentCourseForStudent"
      v-model:visible="showStudentList"
      :course-id="currentCourseForStudent.courseId"
      :course-name="currentCourseForStudent.courseName"
    />
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
