<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import {
	mockCourses,
	getCurrentUserRole,
	type Course,
	type Chapter,
	type Lesson,
} from '#/mock/course-center';

const route = useRoute();
const router = useRouter();

// 当前用户角色
const userRole = ref(getCurrentUserRole());

// 课程ID
const courseId = route.params.id as string;

// 课程数据
const course = ref<Course | null>(null);
const loading = ref(true);

// 交互状态
const isPurchased = ref(false);
const isFavorite = ref(false);
const learningProgress = ref(0);

// Tab
const activeTab = ref('intro');

// ========== 交互状态管理 ==========

// 获取当前登录用户
function getCurrentUser() {
	try {
		const state = localStorage.getItem('portal_login_state');
		if (!state) return null;
		const loginState = JSON.parse(state);
		return loginState.user;
	} catch {
		return null;
	}
}

// 检查购买状态
function checkPurchaseStatus(id: string): boolean {
	const user = getCurrentUser();
	if (!user) return false;

	const ordersKey = 'orders';
	const ordersData = localStorage.getItem(ordersKey);
	if (!ordersData) return false;

	const orders = JSON.parse(ordersData);
	return orders.some(
		(o: any) => o.userId === user.id && o.courseId === id && o.status === 'paid'
	);
}

// 检查收藏状态
function checkFavoriteStatus(id: string): boolean {
	const user = getCurrentUser();
	if (!user) return false;

	const favoritesKey = 'course_favorites';
	const favoritesData = localStorage.getItem(favoritesKey);
	if (!favoritesData) return false;

	const favorites = JSON.parse(favoritesData);
	return favorites.some(
		(f: any) => f.userId === user.id && f.courseId === id
	);
}

// 获取学习进度
function getProgressInfo(id: string): { progress: number; lastStudyAt: string } {
	const user = getCurrentUser();
	if (!user) return { progress: 0, lastStudyAt: '-' };

	const learningKey = 'learning_records';
	const recordsData = localStorage.getItem(learningKey);
	if (!recordsData) return { progress: 0, lastStudyAt: '-' };

	const records = JSON.parse(recordsData);
	const courseRecords = records.filter(
		(r: any) => r.userId === user.id && r.courseId === id
	);

	if (courseRecords.length === 0) return { progress: 0, lastStudyAt: '-' };

	const totalProgress = courseRecords.reduce((sum: number, r: any) => sum + r.progress, 0);
	const progress = Math.round(totalProgress / courseRecords.length);
	const lastStudyAt = courseRecords.sort((a: any, b: any) => b.lastStudyAt.localeCompare(a.lastStudyAt))[0]?.lastStudyAt || '-';

	return { progress, lastStudyAt };
}

// 获取课程详情
function loadCourseDetail() {
	loading.value = true;
	// 模拟API调用
	setTimeout(() => {
		const found = mockCourses.find((c) => c.id === courseId);
		if (found) {
			course.value = found;
			// 检查交互状态
			checkStatus();
		}
		loading.value = false;
	}, 300);
}

// 检查课程状态
function checkStatus() {
	if (!course.value) return;

	// 检查购买状态
	isPurchased.value = checkPurchaseStatus(courseId);

	// 检查收藏状态
	isFavorite.value = checkFavoriteStatus(courseId);

	// 获取学习进度
	if (isPurchased.value) {
		const progressInfo = getProgressInfo(courseId);
		learningProgress.value = progressInfo.progress;
	}
}

// 计算总课时数
const totalLessons = computed(() => {
	if (!course.value) return 0;
	return course.value.chapters.reduce(
		(sum, chapter) => sum + chapter.lessons.length,
		0,
	);
});

// 计算总时长
const totalDuration = computed(() => {
	if (!course.value) return 0;
	return course.value.chapters.reduce((sum, chapter) => {
		return (
			sum +
			chapter.lessons.reduce(
				(lessonSum, lesson) => lessonSum + (lesson.videoDuration || 0),
				0,
			)
		);
	}, 0);
});

// 格式化时长
function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0) {
		return `${hours}小时${minutes}分钟`;
	}
	return `${minutes}分钟`;
}

// ========== 交互函数 ==========

// 免费试听
function onTrialClick(lesson: Lesson) {
	router.push(`/portal/learn/${courseId}?lessonId=${lesson.id}`);
}

// 购买课程
function onPurchaseClick() {
	const user = getCurrentUser();

	if (!user) {
		// 保存返回URL
		localStorage.setItem('returnUrl', `/portal/course-detail/${courseId}`);
		message.warning('请先登录');
		router.push('/portal/login');
		return;
	}

	// 跳转到结算页
	router.push(`/portal/checkout/${courseId}`);
}

// 开始学习
function onLearnClick() {
	router.push(`/portal/learn/${courseId}`);
}

// 切换收藏
function onFavoriteClick() {
	const user = getCurrentUser();
	if (!user) {
		message.warning('请先登录');
		return;
	}

	const favoritesKey = 'course_favorites';
	const favoritesData = localStorage.getItem(favoritesKey);
	const favorites = favoritesData ? JSON.parse(favoritesData) : [];

	const index = favorites.findIndex(
		(f: any) => f.userId === user.id && f.courseId === courseId
	);

	if (index >= 0) {
		// 取消收藏
		favorites.splice(index, 1);
		isFavorite.value = false;
		message.success('已取消收藏');
	} else {
		// 添加收藏
		favorites.push({
			userId: user.id,
			courseId: courseId,
			createdAt: new Date().toLocaleString('zh-CN'),
		});
		isFavorite.value = true;
		message.success('收藏成功');
	}

	localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

// 用户权限
const userPermission = computed(() => {
	if (!course.value) return 'unknown';
	if (course.value.isFree) return 'free';
	if (isPurchased.value) return 'owned';
	return 'locked';
});

// 进入编辑模式
function handleEdit() {
	router.push(`/portal/teacher/courses/edit/${courseId}`);
}

// 返回课程列表
function handleBack() {
	router.push('/portal/courses');
}

// 播放课时
function playLesson(lesson: Lesson) {
	if (lesson.isTrial || lesson.isFree || userPermission.value === 'owned') {
		router.push(`/portal/learn/${courseId}?lessonId=${lesson.id}`);
	} else {
		onPurchaseClick();
	}
}

onMounted(() => {
	loadCourseDetail();
});
</script>

<template>
  <div v-if="loading" class="flex min-h-screen items-center justify-center">
    <div
      class="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
    ></div>
  </div>

  <div v-else-if="!course" class="min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <div class="rounded-lg bg-white p-12 text-center shadow-sm">
        <p class="text-gray-500">课程不存在或已下架</p>
        <button
          class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          @click="handleBack"
        >
          返回课程列表
        </button>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 面包屑 -->
      <div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <button class="hover:text-blue-600" @click="handleBack">课程中心</button>
        <span>/</span>
        <span class="text-gray-800">{{ course.title }}</span>
        <!-- 讲师编辑按钮 -->
        <template v-if="userRole === 'teacher'">
          <span class="ml-auto flex items-center gap-2">
            <button
              class="rounded-lg border border-blue-600 px-4 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
              @click="handleEdit"
            >
              编辑课程
            </button>
            <button
              class="rounded-lg border border-green-600 px-4 py-1.5 text-sm text-green-600 hover:bg-green-50"
              @click="router.push(`/portal/teacher/courses/chapters/${courseId}`)"
            >
              管理章节
            </button>
            <button
              class="rounded-lg border border-purple-600 px-4 py-1.5 text-sm text-purple-600 hover:bg-purple-50"
              @click="router.push(`/portal/teacher/students?courseId=${courseId}`)"
            >
              查看学员
            </button>
          </span>
        </template>
      </div>

      <!-- 课程基本信息 -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-6 lg:flex-row">
          <!-- 封面 -->
          <div class="lg:w-1/3">
            <img
              :src="course.coverImage"
              :alt="course.title"
              class="aspect-video w-full rounded-lg object-cover"
            />
          </div>

          <!-- 课程信息 -->
          <div class="flex-1">
            <h1 class="mb-3 text-2xl font-bold text-gray-800">
              {{ course.title }}
            </h1>

            <!-- 评分和学员数 -->
            <div class="mb-4 flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1">
                <span class="text-yellow-500">⭐⭐⭐⭐⭐</span>
                <span class="font-medium text-gray-800">{{ course.rating }}</span>
                <span class="text-gray-500">({{ course.reviewCount }}条评价)</span>
              </div>
              <div class="text-gray-500">
                <span class="text-blue-600">{{ course.studentCount }}</span>
                人学习
              </div>
            </div>

            <!-- 标签 -->
            <div class="mb-4 flex flex-wrap gap-2">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 课程属性 -->
            <div class="mb-6 space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">讲师：</span>
                <span>{{ course.teacher.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">分类：</span>
                <span>{{ course.category }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">课时数：</span>
                <span>{{ totalLessons }}课时</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">有效期：</span>
                <span>{{
                  course.validType === 'permanent' ? '永久有效' : `${course.validDays}天`
                }}</span>
              </div>
              <div
                v-if="course.trialLessonId"
                class="flex items-center gap-2"
              >
                <span class="font-medium text-gray-700">试听：</span>
                <span class="text-green-600">✓ 含试听课</span>
              </div>
            </div>

            <!-- 价格和操作 -->
            <div class="flex items-center justify-between border-t border-gray-200 pt-6">
              <div>
                <div v-if="course.isFree" class="text-2xl font-bold text-green-600">
                  免费
                </div>
                <div v-else>
                  <span class="text-3xl font-bold text-red-500">
                    ¥{{ (course.price / 100).toFixed(0) }}
                  </span>
                  <span
                    v-if="course.originalPrice"
                    class="ml-2 text-lg text-gray-400 line-through"
                  >
                    ¥{{ (course.originalPrice / 100).toFixed(0) }}
                  </span>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  class="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {{ isFavorite ? '已收藏' : '加入收藏' }}
                </button>
                <button
                  v-if="course.isFree || isPurchased"
                  class="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
                  @click="onLearnClick"
                >
                  {{ isPurchased && learningProgress > 0 ? '继续学习' : '开始学习' }}
                </button>
                <button
                  v-else-if="course.trialLessonId"
                  class="rounded-lg border border-blue-600 px-6 py-2.5 text-blue-600 transition-colors hover:bg-blue-50"
                  @click="onTrialClick(course.chapters[0]?.lessons[0])"
                >
                  免费试听
                </button>
                <button
                  v-if="!course.isFree && !isPurchased"
                  class="rounded-lg bg-red-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                  @click="onPurchaseClick"
                >
                  立即购买
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab切换 -->
      <div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div class="flex gap-6">
          <button
            class="pb-2 text-sm font-medium transition-colors"
            :class="
              activeTab === 'intro'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            "
            @click="activeTab = 'intro'"
          >
            📖 课程介绍
          </button>
          <button
            class="pb-2 text-sm font-medium transition-colors"
            :class="
              activeTab === 'catalog'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            "
            @click="activeTab = 'catalog'"
          >
            📚 课程目录
          </button>
          <button
            class="pb-2 text-sm font-medium transition-colors"
            :class="
              activeTab === 'reviews'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            "
            @click="activeTab = 'reviews'"
          >
            💬 学员评价 ({{ course.reviewCount }})
          </button>
        </div>
      </div>

      <!-- 课程介绍 -->
      <div v-if="activeTab === 'intro'" class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">课程介绍</h2>
        <div class="prose max-w-none text-gray-600">
          <p>{{ course.description }}</p>
        </div>
      </div>

      <!-- 课程目录 -->
      <div v-if="activeTab === 'catalog'" class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">
          课程目录 (共{{ course.chapters.length }}章 {{ totalLessons }}课时)
        </h2>

        <div class="space-y-4">
          <div
            v-for="chapter in course.chapters"
            :key="chapter.id"
            class="rounded-lg border border-gray-200"
          >
            <!-- 章节标题 -->
            <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 class="font-medium text-gray-800">
                {{ chapter.title }}
              </h3>
              <p v-if="chapter.description" class="mt-1 text-sm text-gray-500">
                {{ chapter.description }}
              </p>
            </div>

            <!-- 课时列表 -->
            <div class="divide-y divide-gray-100">
              <div
                v-for="lesson in chapter.lessons"
                :key="lesson.id"
                class="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
                @click="playLesson(lesson)"
              >
                <div class="flex items-center gap-3">
                  <!-- 课时类型图标 -->
                  <span class="text-lg">
                    {{
                      lesson.type === 'video'
                        ? '🎬'
                        : lesson.type === 'audio'
                          ? '🎵'
                          : lesson.type === 'document'
                            ? '📄'
                            : '📝'
                    }}
                  </span>
                  <div>
                    <p class="font-medium text-gray-800">{{ lesson.title }}</p>
                    <p class="text-xs text-gray-500">
                      <span v-if="lesson.videoDuration">
                        {{ formatDuration(lesson.videoDuration) }}
                      </span>
                      <span v-if="lesson.isTrial" class="ml-2 text-green-600">
                        🔊 试听
                      </span>
                      <span v-if="lesson.isFree" class="ml-2 text-green-600">
                        免费
                      </span>
                    </p>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div>
                  <button
                    v-if="lesson.isTrial || lesson.isFree || userPermission === 'owned'"
                    class="rounded-lg border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    {{ lesson.isTrial ? '试听' : '播放' }}
                  </button>
                  <button
                    v-else
                    class="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600"
                  >
                    🔒
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学员评价 -->
      <div v-if="activeTab === 'reviews'" class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">学员评价</h2>

        <div class="space-y-6">
          <!-- 评价统计 -->
          <div class="flex items-center gap-8 rounded-lg bg-gray-50 p-6">
            <div class="text-center">
              <div class="text-4xl font-bold text-gray-800">{{ course.rating }}</div>
              <div class="text-yellow-500">⭐⭐⭐⭐⭐</div>
              <div class="text-sm text-gray-500">{{ course.reviewCount }}条评价</div>
            </div>
            <div class="flex-1">
              <!-- 评价分布 -->
              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">5星</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500" style="width: 80%"></div>
                  </div>
                  <span class="text-sm text-gray-600">80%</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">4星</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500" style="width: 15%"></div>
                  </div>
                  <span class="text-sm text-gray-600">15%</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">3星</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500" style="width: 4%"></div>
                  </div>
                  <span class="text-sm text-gray-600">4%</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">2星</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500" style="width: 1%"></div>
                  </div>
                  <span class="text-sm text-gray-600">1%</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">1星</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500" style="width: 0%"></div>
                  </div>
                  <span class="text-sm text-gray-600">0%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 评价列表 -->
          <div class="space-y-4">
            <div class="border-b border-gray-100 pb-4">
              <div class="mb-2 flex items-center gap-3">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
                  alt=""
                  class="h-10 w-10 rounded-full"
                />
                <div>
                  <p class="font-medium text-gray-800">张**</p>
                  <p class="text-xs text-gray-500">2025-02-20</p>
                </div>
                <div class="ml-auto text-yellow-500">⭐⭐⭐⭐⭐</div>
              </div>
              <p class="text-gray-600">课程讲得很好，零基础也能听懂！老师讲解很细致，内容很实用。</p>
            </div>

            <div class="border-b border-gray-100 pb-4">
              <div class="mb-2 flex items-center gap-3">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2"
                  alt=""
                  class="h-10 w-10 rounded-full"
                />
                <div>
                  <p class="font-medium text-gray-800">李**</p>
                  <p class="text-xs text-gray-500">2025-02-18</p>
                </div>
                <div class="ml-auto text-yellow-500">⭐⭐⭐⭐</div>
              </div>
              <p class="text-gray-600">内容很实用，就是有些地方讲得快了点，需要反复看几遍才能理解。</p>
            </div>

            <div class="pb-4">
              <div class="mb-2 flex items-center gap-3">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user3"
                  alt=""
                  class="h-10 w-10 rounded-full"
                />
                <div>
                  <p class="font-medium text-gray-800">王**</p>
                  <p class="text-xs text-gray-500">2025-02-15</p>
                </div>
                <div class="ml-auto text-yellow-500">⭐⭐⭐⭐⭐</div>
              </div>
              <p class="text-gray-600">非常棒的入门课程！老师讲得通俗易懂，配套练习也很有帮助，强烈推荐给初学者。</p>
            </div>
          </div>

          <!-- 查看更多 -->
          <button class="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
            查看更多评价
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
