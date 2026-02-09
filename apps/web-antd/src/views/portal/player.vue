<script lang="ts" setup>
import type { Course, CourseChapter } from '#/api/course/model';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const course = ref<Course | null>(null);
const chapters = ref<CourseChapter[]>([]);
const currentChapter = ref<CourseChapter | null>(null);
const currentTime = ref(0);
const duration = ref(0);
const isPlaying = ref(false);
const videoRef = ref<HTMLVideoElement>();

// 试看限制
const isTrialMode = computed(() => {
  return (
    currentChapter.value &&
    !currentChapter.value.isFree &&
    course.value &&
    (course.value as any).isTrial
  );
});

const trialDuration = computed(() => {
  return (course.value as any)?.trialDuration || 300; // 默认5分钟
});

// 监听播放时间
watch(currentTime, (time) => {
  if (isTrialMode.value && time >= trialDuration.value) {
    videoRef.value?.pause();
    isPlaying.value = false;
    alert('试看结束，请购买课程后继续观看');
    router.push(`/portal/course/${route.params.courseId}`);
  }
});

// 视频事件
function handleTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
  }
}

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
}

function handlePlay() {
  isPlaying.value = true;
}

function handlePause() {
  isPlaying.value = false;
}

function togglePlay() {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause();
    } else {
      videoRef.value.play();
    }
  }
}

// 切换章节
function switchChapter(chapter: CourseChapter) {
  currentChapter.value = chapter;
  currentTime.value = 0;
  // 自动播放
  setTimeout(() => {
    videoRef.value?.play();
  }, 100);
}

// 格式化时长
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 返回课程详情
function backToCourse() {
  router.push(`/portal/course/${route.params.courseId}`);
}

onMounted(() => {
  const courseId = Number(route.params.courseId);
  const chapterId = Number(route.params.chapterId);

  // 模拟加载课程数据
  course.value = {
    courseId,
    courseName: 'Vue3 从入门到精通',
    courseCover: 'https://picsum.photos/seed/vue/200/120',
    isFree: false,
    isTrial: true,
    trialDuration: 300,
  } as Course;

  // 模拟章节列表
  chapters.value = [
    {
      chapterId: 1,
      chapterName: 'Vue3简介与环境搭建',
      duration: 600,
      isFree: true,
      sortOrder: 1,
    },
    {
      chapterId: 2,
      chapterName: 'Composition API基础',
      duration: 1200,
      isFree: false,
      sortOrder: 2,
    },
    {
      chapterId: 3,
      chapterName: '响应式原理深入',
      duration: 1800,
      isFree: false,
      sortOrder: 3,
    },
    {
      chapterId: 4,
      chapterName: '组件通信方式',
      duration: 1500,
      isFree: false,
      sortOrder: 4,
    },
    {
      chapterId: 5,
      chapterName: '状态管理Pinia',
      duration: 2100,
      isFree: false,
      sortOrder: 5,
    },
  ] as CourseChapter[];

  currentChapter.value =
    chapters.value.find((c) => c.chapterId === chapterId) || chapters.value[0];
});
</script>

<template>
  <div class="video-player-page min-h-screen bg-gray-900">
    <div class="container mx-auto px-4 py-6">
      <!-- 返回按钮 -->
      <a-button type="text" class="mb-4 text-white" @click="backToCourse">
        <span class="icon">←</span> 返回课程详情
      </a-button>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <!-- 视频播放区 -->
        <div class="lg:col-span-3">
          <div class="relative overflow-hidden rounded-lg bg-black">
            <!-- 视频元素 -->
            <video
              ref="videoRef"
              class="aspect-video w-full bg-black"
              controls
              @timeupdate="handleTimeUpdate"
              @loadedmetadata="handleLoadedMetadata"
              @play="handlePlay"
              @pause="handlePause"
            >
              <source
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                type="video/mp4"
              />
              您的浏览器不支持视频播放
            </video>

            <!-- 试看提示 -->
            <div
              v-if="isTrialMode"
              class="absolute left-4 top-4 rounded bg-orange-500 px-3 py-1 text-sm text-white"
            >
              试看模式：剩余 {{ formatTime(trialDuration - currentTime) }}
            </div>
          </div>

          <!-- 课程信息 -->
          <div class="mt-4 text-white">
            <h1 class="text-xl font-bold">{{ currentChapter?.chapterName }}</h1>
            <p class="mt-2 text-gray-400">{{ course?.courseName }}</p>
          </div>
        </div>

        <!-- 章节列表 -->
        <div class="lg:col-span-1">
          <div class="rounded-lg bg-gray-800 p-4">
            <h3 class="mb-4 font-bold text-white">课程目录</h3>
            <div class="max-h-[600px] space-y-2 overflow-y-auto">
              <div
                v-for="chapter in chapters"
                :key="chapter.chapterId"
                class="cursor-pointer rounded p-3 transition-colors"
                :class="[
                  currentChapter?.chapterId === chapter.chapterId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                ]"
                @click="switchChapter(chapter)"
              >
                <div class="flex items-start gap-2">
                  <span class="w-5 shrink-0 text-sm text-gray-400">{{
                    chapter.sortOrder
                  }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="line-clamp-2 text-sm font-medium">
                      {{ chapter.chapterName }}
                    </div>
                    <div class="mt-1 text-xs text-gray-400">
                      {{ formatTime(chapter.duration) }}
                    </div>
                  </div>
                  <a-tag v-if="chapter.isFree" color="green" size="small">
                    免费
                  </a-tag>
                  <a-tag v-else-if="!chapter.isFree" color="red" size="small">
                    <span class="icon">🔒</span>
                  </a-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon {
  font-style: normal;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.ant-btn-text) {
  color: white !important;
}

:deep(.ant-btn-text:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
