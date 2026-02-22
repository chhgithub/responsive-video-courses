<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
	mockCourses,
	type Course,
} from '#/mock/course-center';

// 收藏的课程
const favoriteCourses = ref<Course[]>([]);
const loading = ref(false);

// 加载收藏列表
function loadFavorites() {
	loading.value = true;
	setTimeout(() => {
		// 模拟数据：假设收藏了2个课程
		favoriteCourses.value = mockCourses.slice(0, 2);
		loading.value = false;
	}, 300);
}

// 取消收藏
function removeFavorite(courseId: string) {
	if (confirm('确定取消收藏吗？')) {
		favoriteCourses.value = favoriteCourses.value.filter((c) => c.id !== courseId);
	}
}

onMounted(() => {
	loadFavorites();
});
</script>

<template>
  <div class="member-favorites min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">我的收藏</h1>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
      </div>

      <!-- 收藏列表 -->
      <div v-else>
        <div
          v-if="favoriteCourses.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="course in favoriteCourses"
            :key="course.id"
            class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <!-- 封面 -->
            <div class="relative">
              <img
                :src="course.coverImage"
                :alt="course.title"
                class="h-48 w-full object-cover"
              />
              <button
                class="absolute right-3 top-3 rounded-full bg-white bg-opacity-90 p-2 text-red-500 hover:bg-opacity-100"
                @click="removeFavorite(course.id)"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </button>
            </div>

            <!-- 课程信息 -->
            <div class="p-4">
              <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-800">
                {{ course.title }}
              </h3>
              <div class="mb-3 flex items-center gap-2 text-sm text-gray-500">
                <span>{{ course.teacher.name }}</span>
                <span>·</span>
                <span>{{ course.category }}</span>
              </div>

              <div class="mb-3 flex items-center text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  ⭐ {{ course.rating }}
                </span>
                <span class="mx-2">·</span>
                <span>{{ course.studentCount }}人学习</span>
              </div>

              <div class="flex items-center justify-between">
                <div class="text-xl font-bold text-red-500">
                  <span v-if="course.isFree">免费</span>
                  <span v-else>¥{{ (course.price / 100).toFixed(0) }}</span>
                </div>
                <button
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onclick="window.location.href='/portal/course-detail/{{ course.id }}'"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="py-16 text-center">
          <svg
            class="mx-auto h-24 w-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p class="mt-4 text-gray-500">还没有收藏的课程</p>
          <button
            class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            onclick="window.location.href='/portal/courses'"
          >
            去逛逛课程
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
