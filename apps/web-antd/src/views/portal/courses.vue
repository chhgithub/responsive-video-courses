<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import type { Course } from '#/api/course/model';

import { courseList } from '#/api/course';
import CourseCard from './components/CourseCard.vue';

// 课程类型
const courseTypes = [
  { label: '全部', value: 'all' },
  { label: '微课程', value: 'micro' },
  { label: '公益课程', value: 'public' },
  { label: '付费课程', value: 'paid' },
  { label: '科研赋能', value: 'research' },
  { label: 'K12集训', value: 'k12' },
  { label: '成人集训', value: 'adult' },
];

const activeType = ref('all');
const courses = ref<Course[]>([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 0,
});

// 加载课程列表
async function loadCourses() {
  loading.value = true;
  try {
    const data = await courseList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    courses.value = data.rows;
    pagination.value.total = data.total;
  } finally {
    loading.value = false;
  }
}

// 类型切换
function handleTypeChange(type: string) {
  activeType.value = type;
  pagination.value.current = 1;
  loadCourses();
}

// 分页切换
function handlePageChange(page: number) {
  pagination.value.current = page;
  loadCourses();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  loadCourses();
});
</script>

<template>
  <div class="courses-page py-8 px-4 min-h-screen bg-gray-50">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">课程中心</h1>
        <p class="text-gray-600 mt-2">精选优质课程，助力您快速成长</p>
      </div>

      <!-- 课程类型导航 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-x-auto">
        <div class="flex gap-2 min-w-max">
          <a-button
            v-for="type in courseTypes"
            :key="type.value"
            :type="activeType === type.value ? 'primary' : 'default'"
            size="large"
            @click="handleTypeChange(type.value)"
          >
            {{ type.label }}
          </a-button>
        </div>
      </div>

      <!-- 课程列表 -->
      <a-spin :spinning="loading">
        <div v-if="courses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CourseCard
            v-for="course in courses"
            :key="course.courseId"
            :course="course"
          />
        </div>
        <a-empty v-else description="暂无课程数据" class="py-16" />
      </a-spin>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="mt-8 flex justify-center">
        <a-pagination
          v-model:current="pagination.current"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          :show-total="(total) => `共 ${total} 门课程`"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
