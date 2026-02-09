<script lang="ts" setup>
import type { Course } from '#/api/course/model';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { courseList } from '#/api/course';

import CourseCard from './components/CourseCard.vue';

const route = useRoute();

// 课程类型
const courseTypes = [
  { label: '全部', value: 'all' },
  { label: '微课程', value: 'micro' },
  { label: '公益课程', value: 'public' },
  { label: '付费课程', value: 'paid' },
  { label: '科研赋能', value: 'research' },
  { label: 'K12集训', value: 'k12' },
  { label: '成人集训', value: 'adult' },
];

const activeType = ref('all');
const searchKeyword = ref('');

const courses = ref<Course[]>([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 0,
});

// 从路由查询参数中获取搜索关键字
if (route.query.keyword) {
  searchKeyword.value = route.query.keyword as string;
}

// 加载课程列表
async function loadCourses() {
  loading.value = true;
  try {
    const data = await courseList({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: searchKeyword.value || undefined,
    });
    courses.value = data.rows;
    pagination.value.total = data.total;
  } finally {
    loading.value = false;
  }
}

// 类型切换
function handleTypeChange(type: string) {
  activeType.value = type;
  pagination.value.current = 1;
  loadCourses();
}

// 执行搜索
function handleSearch() {
  pagination.value.current = 1;
  loadCourses();
}

// 回车搜索
function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchKeyword.value = (newKeyword as string) || '';
    pagination.value.current = 1;
    loadCourses();
  },
);

// 分页切换
function handlePageChange(page: number) {
  pagination.value.current = page;
  loadCourses();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 计算总页数
const totalPages = computed(() =>
  Math.ceil(pagination.value.total / pagination.value.pageSize),
);

onMounted(() => {
  loadCourses();
});
</script>

<template>
  <div class="courses-page min-h-screen bg-gray-50 px-4 py-8">
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
            placeholder="搜索课程名称、简介..."
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

      <!-- 课程类型导航 -->
      <div class="mb-6 overflow-x-auto rounded-lg bg-white p-4 shadow-sm">
        <div class="flex min-w-max gap-2">
          <button
            v-for="type in courseTypes"
            :key="type.value"
            class="rounded-lg px-4 py-2 font-medium transition-colors"
            :class="
              activeType === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="handleTypeChange(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
        <p class="mt-4 text-gray-500">加载中...</p>
      </div>

      <!-- 课程列表 -->
      <div v-else>
        <div
          v-if="courses.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <CourseCard
            v-for="course in courses"
            :key="course.courseId"
            :course="course"
          />
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

      <!-- 分页 -->
      <div
        v-if="pagination.total > 0"
        class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      >
        <p class="text-sm text-gray-600">
          共
          <span class="font-semibold text-gray-800">{{
            pagination.total
          }}</span>
          门课程
        </p>
        <div class="flex items-center gap-2">
          <!-- 上一页 -->
          <button
            :disabled="pagination.current === 1"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handlePageChange(pagination.current - 1)"
          >
            上一页
          </button>

          <!-- 页码 -->
          <div class="flex gap-1">
            <button
              v-for="page in Math.min(totalPages, 5)"
              :key="page"
              class="min-w-[40px] rounded-lg px-3 py-2 text-sm transition-colors"
              :class="
                pagination.current === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              "
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
          </div>

          <!-- 下一页 -->
          <button
            :disabled="pagination.current === totalPages"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handlePageChange(pagination.current + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
