<script lang="ts" setup>
import type { Course } from '#/api/course/model';

import { onMounted, ref } from 'vue';

import { courseList } from '#/api/course';
import CourseCard from '#/views/portal/components/CourseCard.vue';

const myCourses = ref<Course[]>([]);
const loading = ref(false);

// 模拟添加进度数据到课程
async function loadMyCourses() {
  loading.value = true;
  try {
    const data = await courseList({ pageSize: 20 });
    myCourses.value = data.rows.map((course) => ({
      ...course,
      progress: Math.floor(Math.random() * 101), // 随机进度
    }));
  } finally {
    loading.value = false;
  }
}

function goToCourse(course: Course) {
  // 跳转到学习页面
  console.log('学习课程:', course.courseName);
}

onMounted(() => {
  loadMyCourses();
});
</script>

<template>
  <div class="p-6">
    <a-spin :spinning="loading">
      <div
        v-if="myCourses.length > 0"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <CourseCard
          v-for="course in myCourses"
          :key="course.courseId"
          :course="course"
          :show-progress="true"
          @click="goToCourse(course)"
        />
      </div>
      <a-empty v-else description="暂无已购课程" class="py-16">
        <a-button type="primary" @click="$router.push('/portal/courses')">
          去选课
        </a-button>
      </a-empty>
    </a-spin>
  </div>
</template>
