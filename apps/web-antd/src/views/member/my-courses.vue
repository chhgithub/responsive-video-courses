<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import {
	mockCourses,
	type Course,
} from '#/mock/course-center';

defineOptions({ name: 'MemberMyCourses' });

// Tab
const activeTab = ref('learning');

// 我的课程列表
const myCourses = ref<Course[]>([]);
const loading = ref(false);

// 加载我的课程
function loadMyCourses() {
	loading.value = true;
	// 模拟API调用
	setTimeout(() => {
		// 假设用户已购买了前3个课程
		myCourses.value = mockCourses.slice(0, 3);
		loading.value = false;
	}, 300);
}

// 继续学习
function continueLearning(course: Course) {
	// 找到第一个课时
	if (course.chapters.length > 0 && course.chapters[0].lessons.length > 0) {
		const lesson = course.chapters[0].lessons[0];
		window.location.href = `/portal/learn/${course.id}?lessonId=${lesson.id}`;
	}
}

// 计算学习进度（模拟）
function getCourseProgress(course: Course): number {
	// 随机生成进度
	const progressMap: Record<string, number> = {
		c1: 80,
		c2: 45,
		c3: 20,
	};
	return progressMap[course.id] || 0;
}

onMounted(() => {
	loadMyCourses();
});
</script>

<template>
  <div class="member-courses min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">我的课程</h1>
      </div>

      <!-- Tab切换 -->
      <div class="mb-6 rounded-lg bg-white p-2 shadow-sm">
        <div class="flex gap-2">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === 'learning'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            "
            @click="activeTab = 'learning'"
          >
            学习中
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            "
            @click="activeTab = 'completed'"
          >
            已完成
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === 'expired'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            "
            @click="activeTab = 'expired'"
          >
            已过期
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
      </div>

      <!-- 课程列表 -->
      <div v-else>
        <div
          v-if="myCourses.length > 0"
          class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="course in myCourses"
            :key="course.id"
            class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <!-- 封面 -->
            <div class="relative">
              <img
                :src="course.coverImage"
                :alt="course.title"
                class="h-40 w-full object-cover"
              />
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p class="text-sm font-medium text-white">
                  {{ getCourseProgress(course) }}% 已完成
                </p>
              </div>
              <!-- 进度条 -->
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                <div
                  class="h-full bg-blue-500 transition-all"
                  :style="{ width: getCourseProgress(course) + '%' }"
                ></div>
              </div>
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

              <!-- 学习信息 -->
              <div class="mb-4 space-y-2 text-sm text-gray-600">
                <div class="flex items-center justify-between">
                  <span>已学课时</span>
                  <span>
                    {{
                      Math.ceil(
                        (getCourseProgress(course) / 100) *
                          (course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) || 1),
                      )
                    }}
                    /
                    {{
                      course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
                    }}
                    课时
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>上次学习</span>
                  <span>2小时前</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <button
                class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="continueLearning(course)"
              >
                继续学习
              </button>
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.977 5.754 19.5 7.5 19.5S10.832 19.977 13 19.5m0-13V6.253"
            />
          </svg>
          <p class="mt-4 text-gray-500">还没有课程</p>
          <button
            class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            onclick="window.location.href='/portal/courses'"
          >
            去看看课程
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
