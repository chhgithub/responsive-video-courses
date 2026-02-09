<script lang="ts" setup>
import type { Course, CourseChapter } from '#/api/course/model';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const course = ref<Course | null>(null);
const chapters = ref<CourseChapter[]>([]);
const loading = ref(false);
const activeChapter = ref<CourseChapter | null>(null);

// 模拟用户权限状态
const userPermission = computed(() => {
  if (!course.value) return 'unknown';
  if (course.value.isFree) return 'free';
  // 模拟：随机返回已购买状态
  return Math.random() > 0.5 ? 'owned' : 'locked';
});

// 加载课程详情
async function loadCourseDetail() {
  loading.value = true;
  try {
    const courseId = Number(route.params.id);
    // 使用模拟数据
    course.value = {
      courseId,
      courseName: 'Vue3 从入门到精通',
      courseCover: 'https://picsum.photos/seed/vue/800/400',
      courseIntro:
        '本课程全面讲解Vue3的核心概念和实战技巧，包括Composition API、响应式原理、组件通信、状态管理等核心内容。通过实际项目案例，帮助学员快速掌握Vue3开发技能。',
      categoryId: 1,
      categoryName: '前端开发',
      teacherId: 1,
      teacherName: '张老师',
      price: 199,
      originalPrice: 299,
      isFree: false,
      status: 'published',
      sortOrder: 1,
      viewCount: 1250,
      enrollCount: 86,
      createTime: '2025-01-15 10:00:00',
      // 扩展字段
      isTrial: true,
      trialDuration: 300, // 5分钟试看
      validDays: 365, // 1年有效期
      difficulty: 'intermediate',
      totalDuration: 7200, // 总时长2小时
      tags: ['Vue3', '前端', '实战'],
    } as Course;

    // 加载章节列表
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
  } finally {
    loading.value = false;
  }
}

// 开始学习
function goToLearn() {
  if (chapters.value.length > 0) {
    router.push(
      `/portal/player/${course.value?.courseId}/${chapters.value[0].chapterId}`,
    );
  }
}

// 试看
function goToTrial() {
  const freeChapter = chapters.value.find((c) => c.isFree);
  if (freeChapter) {
    router.push(
      `/portal/player/${course.value?.courseId}/${freeChapter.chapterId}`,
    );
  }
}

// 购买课程
function purchaseCourse() {
  router.push(`/payment/checkout/${course.value?.courseId}`);
}

// 播放章节
function playChapter(chapter: CourseChapter) {
  if (chapter.isFree || userPermission.value === 'owned') {
    router.push(
      `/portal/player/${course.value?.courseId}/${chapter.chapterId}`,
    );
  } else {
    purchaseCourse();
  }
}

// 格式化时长
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
}

onMounted(() => {
  loadCourseDetail();
});
</script>

<template>
  <div class="course-detail-page min-h-screen bg-gray-50">
    <a-spin :spinning="loading">
      <div v-if="course" class="container mx-auto px-4 py-8">
        <!-- 课程信息 -->
        <div class="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
          <div class="grid grid-cols-1 gap-0 lg:grid-cols-3">
            <!-- 封面 -->
            <div class="lg:col-span-1">
              <img
                :src="course.courseCover"
                class="h-64 w-full object-cover lg:h-full"
              />
            </div>
            <!-- 信息 -->
            <div class="p-6 lg:col-span-2">
              <h1 class="mb-4 text-2xl font-bold text-gray-800 lg:text-3xl">
                {{ course.courseName }}
              </h1>

              <div
                class="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600"
              >
                <span class="flex items-center gap-1">
                  <span class="icon">👁</span> {{ course.viewCount }} 次观看
                </span>
                <span class="flex items-center gap-1">
                  <span class="icon">👥</span> {{ course.enrollCount }} 人已学
                </span>
                <span class="flex items-center gap-1">
                  <span class="icon">👨‍🏫</span> {{ course.teacherName }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="icon">📁</span> {{ course.categoryName }}
                </span>
              </div>

              <p class="mb-6 text-gray-600">{{ course.courseIntro }}</p>

              <!-- 标签 -->
              <div class="mb-6 flex flex-wrap gap-2">
                <a-tag
                  v-for="tag in (course as any).tags"
                  :key="tag"
                  color="blue"
                >
                  {{ tag }}
                </a-tag>
                <a-tag v-if="(course as any).difficulty" color="purple">
                  {{
                    (course as any).difficulty === 'beginner'
                      ? '初级'
                      : (course as any).difficulty === 'intermediate'
                        ? '中级'
                        : '高级'
                  }}
                </a-tag>
                <a-tag v-if="(course as any).validDays" color="green">
                  有效期 {{ (course as any).validDays }} 天
                </a-tag>
              </div>

              <!-- 价格和操作 -->
              <div class="flex items-center gap-4">
                <div class="text-3xl font-bold text-red-500">
                  {{
                    course.isFree || course.price === 0
                      ? '免费'
                      : `¥${course.price}`
                  }}
                </div>
                <div
                  v-if="
                    course.originalPrice && course.originalPrice > course.price
                  "
                  class="text-xl text-gray-400 line-through"
                >
                  ¥{{ course.originalPrice }}
                </div>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <template v-if="userPermission === 'owned' || course.isFree">
                  <a-button type="primary" size="large" @click="goToLearn">
                    开始学习
                  </a-button>
                </template>
                <template v-else-if="(course as any).isTrial">
                  <a-button size="large" @click="goToTrial">
                    免费试看
                  </a-button>
                  <a-button type="primary" size="large" @click="purchaseCourse">
                    购买课程 ¥{{ course.price }}
                  </a-button>
                </template>
                <template v-else>
                  <a-button type="primary" size="large" @click="purchaseCourse">
                    购买课程 ¥{{ course.price }}
                  </a-button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 课程目录 -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-bold text-gray-800">课程目录</h2>
          <div class="space-y-3">
            <div
              v-for="chapter in chapters"
              :key="chapter.chapterId"
              class="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
              @click="playChapter(chapter)"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="w-6 text-gray-400">{{ chapter.sortOrder }}.</span>
                  <span class="font-medium text-gray-800">{{
                    chapter.chapterName
                  }}</span>
                  <a-tag v-if="chapter.isFree" color="green" size="small">
                    免费
                  </a-tag>
                  <a-tag
                    v-else-if="!chapter.isFree && userPermission !== 'owned'"
                    color="red"
                    size="small"
                  >
                    <span class="icon">🔒</span> 锁定
                  </a-tag>
                </div>
                <div class="ml-8 mt-1 text-sm text-gray-400">
                  时长: {{ formatDuration(chapter.duration) }}
                </div>
              </div>
              <a-button
                :type="
                  chapter.isFree || userPermission === 'owned'
                    ? 'primary'
                    : 'default'
                "
                :disabled="!chapter.isFree && userPermission !== 'owned'"
                size="small"
              >
                {{
                  chapter.isFree || userPermission === 'owned' ? '播放' : '锁定'
                }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.icon {
  font-style: normal;
}
</style>
