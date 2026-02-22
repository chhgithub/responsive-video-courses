<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
	getAllCourses,
	getMicroCourses,
	getResearchPrograms,
	getTrainingPlans,
	getTagsByType,
	getCategories,
	type Course,
	type MicroCourse,
	type ResearchProgram,
	type TrainingPlan,
} from '#/mock/course-center';

const route = useRoute();
const router = useRouter();

// 筛选条件
const searchKeyword = ref('');
const selectedAge = ref('全部');
const selectedCategory = ref('全部');
const selectedPayment = ref('全部');

// 当前Tab
const activeTab = ref('all');

// Tab配置
const tabs = [
	{ key: 'all', label: '全部课程' },
	{ key: 'micro', label: '微课程' },
	{ key: 'public', label: '公益课程' },
	{ key: 'paid', label: '付费课程' },
	{ key: 'research', label: '科研赋能' },
	{ key: 'training', label: '集训计划' },
];

// 数据列表
const courses = ref<Course[]>([]);
const microCourses = ref<MicroCourse[]>([]);
const researchPrograms = ref<ResearchProgram[]>([]);
const trainingPlans = ref<TrainingPlan[]>([]);

// 标签选项
const ageTags = computed(() => ['全部', '3-6岁', '7-12岁', '13-18岁', '成人']);
const categoryTags = computed(() => ['全部', '编程', '美术', '音乐', '数学', '人工智能']);
const paymentTags = computed(() => ['全部', '免费', '付费']);

// 加载课程数据
function loadCourses() {
	// 根据筛选条件过滤课程
	courses.value = getAllCourses({
		keyword: searchKeyword.value,
		category: selectedCategory.value,
		ageRange: selectedAge.value,
		payment: selectedPayment.value,
	});

	// 加载其他类型数据
	microCourses.value = getMicroCourses();
	researchPrograms.value = getResearchPrograms();
	trainingPlans.value = getTrainingPlans();
}

// Tab切换
function handleTabChange(tab: string) {
	activeTab.value = tab;
}

// 筛选条件变化
function handleFilterChange() {
	loadCourses();
}

// 执行搜索
function handleSearch() {
	loadCourses();
}

// 回车搜索
function handleSearchKeydown(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		handleSearch();
	}
}

// 跳转到课程详情
function goToCourseDetail(courseId: string) {
	router.push(`/portal/course-detail/${courseId}`);
}

// 从路由查询参数中获取搜索关键字
if (route.query.keyword) {
	searchKeyword.value = route.query.keyword as string;
}

// 监听路由参数变化
watch(
	() => route.query.keyword,
	(newKeyword) => {
		searchKeyword.value = (newKeyword as string) || '';
		handleSearch();
	},
);

onMounted(() => {
	loadCourses();
});
</script>

<template>
  <div class="student-course-center min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">课程中心</h1>
        <p class="mt-2 text-gray-600">精选优质课程，助力您快速成长</p>
      </div>

      <!-- 搜索框 -->
      <div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div class="relative">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索课程标题、讲师..."
            class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            @keydown="handleSearchKeydown"
          />
          <!-- 搜索图标 -->
          <svg
            class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <!-- 搜索按钮 -->
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            @click="handleSearch"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- 标签筛选 -->
      <div class="mb-6 space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <!-- 年龄标签 -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-700">年龄：</span>
          <button
            v-for="tag in ageTags"
            :key="tag"
            class="rounded-full px-4 py-1.5 text-sm transition-colors"
            :class="
              selectedAge === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="selectedAge = tag; handleFilterChange()"
          >
            {{ tag }}
          </button>
        </div>

        <!-- 分类标签 -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-700">分类：</span>
          <button
            v-for="tag in categoryTags"
            :key="tag"
            class="rounded-full px-4 py-1.5 text-sm transition-colors"
            :class="
              selectedCategory === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="selectedCategory = tag; handleFilterChange()"
          >
            {{ tag }}
          </button>
        </div>

        <!-- 付费标签 -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-700">付费：</span>
          <button
            v-for="tag in paymentTags"
            :key="tag"
            class="rounded-full px-4 py-1.5 text-sm transition-colors"
            :class="
              selectedPayment === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="selectedPayment = tag; handleFilterChange()"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 课程类型Tab -->
      <div class="mb-6 overflow-x-auto rounded-lg bg-white p-4 shadow-sm">
        <div class="flex min-w-max gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="rounded-lg px-6 py-2.5 font-medium transition-colors"
            :class="
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="handleTabChange(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 全部课程 / 微课程 / 公益课程 / 付费课程 -->
      <div v-if="['all', 'micro', 'public', 'paid'].includes(activeTab)">
        <div
          v-if="courses.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <!-- 课程卡片 -->
          <div
            v-for="course in courses"
            :key="course.id"
            class="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
            @click="goToCourseDetail(course.id)"
          >
            <div class="relative">
              <img
                :src="course.coverImage"
                :alt="course.title"
                class="h-48 w-full object-cover"
              />
              <div
                v-if="course.trialLessonId"
                class="absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white"
              >
                试听
              </div>
              <div
                v-if="course.isFree"
                class="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white"
              >
                免费
              </div>
            </div>
            <div class="p-4">
              <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-800">
                {{ course.title }}
              </h3>
              <div class="mb-3 flex items-center gap-2 text-sm text-gray-500">
                <span>{{ course.teacher.name }}</span>
                <span>·</span>
                <span>{{ course.category }}</span>
              </div>
              <div class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in course.tags.slice(0, 3)"
                  :key="tag"
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="mb-3 flex items-center text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  ⭐ {{ course.rating }}
                </span>
                <span class="mx-2">·</span>
                <span>{{ course.studentCount }}人学习</span>
              </div>
              <div class="flex items-center justify-between" @click.stop>
                <div class="text-xl font-bold text-red-500">
                  <span v-if="course.isFree">免费</span>
                  <span v-else>¥{{ (course.price / 100).toFixed(0) }}</span>
                </div>
                <button
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  @click.stop="goToCourseDetail(course.id)"
                >
                  {{ course.isFree ? '开始学习' : '查看详情' }}
                </button>
              </div>
            </div>
          </div>
        </div>
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
            />
          </svg>
          <p class="mt-4 text-gray-500">暂无课程数据</p>
        </div>
      </div>

      <!-- 科研赋能 -->
      <div v-if="activeTab === 'research'">
        <div
          v-if="researchPrograms.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="program in researchPrograms"
            :key="program.id"
            class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="relative">
              <img
                :src="program.coverImage"
                :alt="program.title"
                class="h-48 w-full object-cover"
              />
              <div
                class="absolute left-3 top-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white"
              >
                🔬 {{ program.category }}
              </div>
            </div>
            <div class="p-4">
              <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-800">
                {{ program.title }}
              </h3>
              <p class="mb-3 line-clamp-2 text-sm text-gray-600">
                {{ program.description }}
              </p>
              <div class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in program.tags"
                  :key="tag"
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="mb-3 text-sm text-gray-500">
                <p>📋 报名要求：{{ program.requirements }}</p>
                <p>👥 已报名：{{ program.enrolledCount }}/{{ program.capacity }}</p>
                <p>📅 截止日期：{{ program.enrollmentDeadline }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  class="flex-1 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  在线咨询
                </button>
                <button
                  class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  立即报名
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-16 text-center">
          <p class="text-gray-500">暂无科研项目</p>
        </div>
      </div>

      <!-- 集训计划 -->
      <div v-if="activeTab === 'training'">
        <div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div class="flex flex-wrap gap-3">
            <button
              class="rounded-lg px-6 py-2 font-medium transition-colors"
              :class="
                selectedAge === 'K12' || selectedAge === '成人'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              "
              @click="selectedAge = 'K12'; handleFilterChange()"
            >
              K12集训计划
            </button>
            <button
              class="rounded-lg px-6 py-2 font-medium transition-colors"
              :class="
                selectedAge === '成人'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              "
              @click="selectedAge = '成人'; handleFilterChange()"
            >
              成人集训计划
            </button>
          </div>
        </div>

        <div
          v-if="trainingPlans.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="plan in trainingPlans"
            :key="plan.id"
            class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="relative">
              <img
                :src="plan.coverImage"
                :alt="plan.title"
                class="h-48 w-full object-cover"
              />
              <div
                class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white"
                :class="plan.type === 'K12' ? 'bg-blue-500' : 'bg-purple-500'"
              >
                {{ plan.type === 'K12' ? 'K12' : '成人' }}
              </div>
            </div>
            <div class="p-4">
              <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-800">
                {{ plan.title }}
              </h3>
              <p class="mb-3 line-clamp-2 text-sm text-gray-600">
                {{ plan.description }}
              </p>
              <div class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in plan.tags"
                  :key="tag"
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="mb-3 text-sm text-gray-500">
                <p>📍 {{ plan.location }}</p>
                <p>📅 {{ plan.startDate }} - {{ plan.endDate }}</p>
                <p>👥 已报名：{{ plan.enrolledCount }}/{{ plan.capacity }}</p>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-xl font-bold text-red-500">
                  ¥{{ (plan.price / 100).toFixed(0) }}
                </div>
                <button
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  :disabled="plan.enrolledCount >= plan.capacity"
                  :class="plan.enrolledCount >= plan.capacity ? 'bg-gray-400 cursor-not-allowed' : ''"
                >
                  {{ plan.enrolledCount >= plan.capacity ? '名额已满' : '立即报名' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-16 text-center">
          <p class="text-gray-500">暂无集训计划</p>
        </div>
      </div>
    </div>
  </div>
</template>
