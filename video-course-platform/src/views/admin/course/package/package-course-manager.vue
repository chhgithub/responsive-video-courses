<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CoursePackage, PackageCourse } from '@/utils/course-package-storage';

interface Props {
  package: CoursePackage;
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const loading = ref(false);
const courses = ref<PackageCourse[]>([]);

// 初始化课程数据
function initCourses() {
  courses.value = JSON.parse(JSON.stringify(props.package.courses || []));
}

// 切换必修/选修
function handleToggleRequired(course: PackageCourse) {
  course.isRequired = !course.isRequired;
}

// 上移课程
function handleMoveUp(index: number) {
  if (index > 0) {
    const temp = courses.value[index - 1];
    courses.value[index - 1] = courses.value[index];
    courses.value[index] = temp;
    // 更新排序号
    courses.value[index - 1].sortOrder = index;
    courses.value[index].sortOrder = index + 1;
  }
}

// 下移课程
function handleMoveDown(index: number) {
  if (index < courses.value.length - 1) {
    const temp = courses.value[index + 1];
    courses.value[index + 1] = courses.value[index];
    courses.value[index] = temp;
    // 更新排序号
    courses.value[index + 1].sortOrder = index + 1;
    courses.value[index].sortOrder = index;
  }
}

// 移除课程
function handleRemoveCourse(courseId: number) {
  ElMessageBox.confirm('确认移除该课程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      courses.value = courses.value.filter((c) => c.courseId !== courseId);
      // 重新排序
      courses.value.forEach((c, index) => {
        c.sortOrder = index + 1;
      });
      ElMessage.success('移除成功');
    })
    .catch(() => {});
}

// 保存
async function handleSave() {
  loading.value = true;
  try {
    // TODO: 调用API保存课程列表
    await new Promise((resolve) => setTimeout(resolve, 500));

    ElMessage.success('保存成功');
    emit('success');
    dialogVisible.value = false;
  } finally {
    loading.value = false;
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      initCourses();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="套餐课程管理"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="course-manager">
      <div class="manager-header">
        <div class="header-info">
          <div class="package-name">{{ package.packageName }}</div>
          <div class="course-count">包含 {{ courses.length }} 门课程</div>
        </div>
      </div>

      <div v-loading="loading" class="courses-list">
        <div
          v-for="(course, index) in courses"
          :key="course.courseId"
          class="course-item"
        >
          <el-image :src="course.courseCover" fit="cover" class="course-cover" lazy />

          <div class="course-info">
            <div class="course-name">{{ course.courseName }}</div>
            <div class="course-meta">
              <span>讲师：{{ course.teacherName }}</span>
              <span>原价：¥{{ course.originalPrice }}</span>
            </div>
            <!-- <el-tag :type="course.isRequired ? 'primary' : 'info'" size="small">
              {{ course.isRequired ? '必修' : '选修' }}
            </el-tag> -->
          </div>

          <div class="course-actions">
            <!-- <el-button
              link
              type="primary"
              size="small"
              @click="handleToggleRequired(course)"
            >
              {{ course.isRequired ? '设为选修' : '设为必修' }}
            </el-button> -->
            <el-button
              link
              type="primary"
              size="small"
              :disabled="index === 0"
              @click="handleMoveUp(index)"
            >
              上移
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              :disabled="index === courses.length - 1"
              @click="handleMoveDown(index)"
            >
              下移
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleRemoveCourse(course.courseId)"
            >
              移除
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="courses.length === 0 && !loading" class="empty-state">
          <el-empty description="暂未添加课程">
            <el-button type="primary">去添加课程</el-button>
          </el-empty>
        </div>
      </div>

      <div class="manager-footer">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          必修课程必须学完才能获得证书，选修课程可根据个人兴趣选择学习。
          套餐整体进度根据必修课程计算。
        </el-alert>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

.course-manager {
  .manager-header {
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-lighter;

    .header-info {
      display: flex;
      align-items: baseline;
      gap: $spacing-base;

      .package-name {
        font-size: $font-size-large;
        font-weight: 600;
        color: $text-color-primary;
      }

      .course-count {
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }

  .courses-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .course-item {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    padding: $spacing-base;
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-base;
    transition: $transition-base;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      box-shadow: $box-shadow-base;
    }
  }

  .course-cover {
    width: 80px;
    height: 60px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .course-info {
    flex: 1;

    .course-name {
      font-size: $font-size-medium;
      font-weight: 500;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    .course-meta {
      display: flex;
      gap: $spacing-large;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .course-actions {
    display: flex;
    gap: $spacing-small;
    flex-shrink: 0;
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }

  .manager-footer {
    margin-top: $spacing-large;
  }
}
</style>
