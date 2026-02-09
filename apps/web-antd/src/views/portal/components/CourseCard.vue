<script lang="ts" setup>
import type { Course } from '#/api/course/model';

import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  course: Course;
  showPrice?: boolean;
  showProgress?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPrice: true,
  showProgress: false,
});

const router = useRouter();

const priceDisplay = computed(() => {
  if (props.course.isFree || props.course.price === 0) {
    return { text: '免费', color: 'text-green-600' };
  }
  return { text: `¥${props.course.price}`, color: 'text-red-600' };
});

function handleCardClick() {
  router.push(`/portal/course/${props.course.courseId}`);
}
</script>

<template>
  <div
    class="course-card group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    @click="handleCardClick"
  >
    <!-- 课程封面 -->
    <div class="relative overflow-hidden">
      <img
        :src="course.courseCover"
        class="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
        :alt="course.courseName"
      />
      <div class="absolute right-2 top-2 flex gap-1">
        <span
          v-if="course.isFree"
          class="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white"
        >
          免费
        </span>
        <span
          v-else-if="course.price && course.price > 0"
          class="rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white"
        >
          付费
        </span>
      </div>
    </div>

    <!-- 课程信息 -->
    <div class="p-4">
      <h3
        class="line-clamp-2 min-h-[48px] font-semibold text-gray-800 group-hover:text-blue-600"
      >
        {{ course.courseName }}
      </h3>
      <p class="mt-2 line-clamp-2 min-h-[40px] text-sm text-gray-500">
        {{ course.courseIntro }}
      </p>

      <!-- 课程元信息 -->
      <div class="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fill-rule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ course.viewCount }}
        </span>
        <span class="flex items-center gap-1">
          <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
            />
          </svg>
          {{ course.enrollCount }}
        </span>
        <span>{{ course.categoryName || '未分类' }}</span>
      </div>

      <!-- 价格显示 -->
      <div
        v-if="showPrice"
        class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3"
      >
        <span class="text-xl font-bold" :class="[priceDisplay.color]">
          {{ priceDisplay.text }}
        </span>
        <span
          v-if="course.originalPrice && course.originalPrice > course.price"
          class="text-sm text-gray-400 line-through"
        >
          ¥{{ course.originalPrice }}
        </span>
      </div>

      <!-- 学习进度 -->
      <div v-if="showProgress && course.progress !== undefined" class="mt-3">
        <div class="mb-1 flex justify-between text-xs text-gray-500">
          <span>学习进度</span>
          <span>{{ course.progress }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            class="h-full transition-all duration-300"
            :class="course.progress === 100 ? 'bg-green-500' : 'bg-blue-500'"
            :style="{ width: `${course.progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
