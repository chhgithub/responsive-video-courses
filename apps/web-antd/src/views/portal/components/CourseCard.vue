<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import type { Course } from '#/api/course/model';

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
    return { text: '免费', color: 'text-green-500' };
  }
  return { text: `¥${props.course.price}`, color: 'text-red-500' };
});

function handleCardClick() {
  router.push(`/portal/course/${props.course.courseId}`);
}
</script>

<template>
  <a-card
    :body-style="{ padding: '16px' }"
    class="course-card hover:shadow-lg transition-all duration-300 cursor-pointer"
    hoverable
    @click="handleCardClick"
  >
    <!-- 课程封面 -->
    <div class="relative mb-3">
      <img
        :src="course.courseCover"
        class="w-full h-40 object-cover rounded"
        :alt="course.courseName"
      />
      <a-tag
        v-if="course.isFree"
        color="green"
        class="absolute top-2 right-2"
      >
        免费
      </a-tag>
      <a-tag
        v-else-if="course.price && course.price > 0"
        color="orange"
        class="absolute top-2 right-2"
      >
        付费
      </a-tag>
    </div>

    <!-- 课程信息 -->
    <h3 class="font-semibold text-gray-800 line-clamp-2 min-h-[48px]">
      {{ course.courseName }}
    </h3>
    <p class="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
      {{ course.courseIntro }}
    </p>

    <!-- 课程元信息 -->
    <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
      <span>
        <span class="icon">👁</span> {{ course.viewCount }}
      </span>
      <span>
        <span class="icon">👥</span> {{ course.enrollCount }}
      </span>
      <span>{{ course.categoryName || '未分类' }}</span>
    </div>

    <!-- 价格显示 -->
    <div v-if="showPrice" class="mt-3 flex items-center justify-between">
      <span :class="['font-bold text-xl', priceDisplay.color]">
        {{ priceDisplay.text }}
      </span>
      <span
        v-if="course.originalPrice && course.originalPrice > course.price"
        class="text-gray-400 line-through text-sm"
      >
        ¥{{ course.originalPrice }}
      </span>
    </div>

    <!-- 学习进度 -->
    <div v-if="showProgress && course.progress !== undefined" class="mt-3">
      <a-progress
        :percent="course.progress"
        size="small"
        :stroke-color="course.progress === 100 ? '#52c41a' : undefined"
      />
    </div>
  </a-card>
</template>

<style scoped>
.course-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.icon {
  margin-right: 2px;
}
</style>
