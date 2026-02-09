<script lang="ts" setup>
import type { Course } from '#/api/course/model';

import { onMounted, ref } from 'vue';

import { courseList } from '#/api/course';

import CourseCard from './components/CourseCard.vue';

const courses = ref<Course[]>([]);
const loading = ref(false);

async function loadCourses() {
  loading.value = true;
  try {
    const data = await courseList({ pageSize: 20 });
    // 筛选免费课程
    courses.value = data.rows.filter((c) => c.isFree);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCourses();
});
</script>

<template>
  <div class="page-container min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">公益课程</h1>
        <p class="mt-2 text-gray-600">免费优质课程，助力全民学习</p>
      </div>

      <a-spin :spinning="loading">
        <div
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <CourseCard
            v-for="course in courses"
            :key="course.courseId"
            :course="course"
          />
        </div>
        <a-empty
          v-if="!loading && courses.length === 0"
          description="暂无公益课程"
          class="py-16"
        />
      </a-spin>
    </div>
  </div>
</template>
