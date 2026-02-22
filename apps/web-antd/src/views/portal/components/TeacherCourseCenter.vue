<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

import {
	getTeacherCourses,
	type Course,
} from '#/mock/course-center';

// 当前Tab
const activeTab = ref('manage');

// Tab配置
const tabs = [
	{ key: 'manage', label: '课程管理', icon: '📚' },
	{ key: 'packages', label: '课程整合', icon: '📦' },
	{ key: 'videos', label: '视频库', icon: '🎬' },
	{ key: 'micro', label: '微课程', icon: '⚡' },
	{ key: 'public', label: '公益课程', icon: '🎁' },
	{ key: 'paid', label: '付费课程', icon: '💰' },
	{ key: 'research', label: '科研赋能', icon: '🔬' },
	{ key: 'training', label: '集训计划', icon: '🎯' },
	{ key: 'stats', label: '数据统计', icon: '📊' },
];

// 统计数据
const stats = ref({
	courseCount: 0,
	studentCount: 0,
	totalIncome: 0,
	packageCount: 0,
	microCourseCount: 0,
	publicCourseCount: 0,
	researchCount: 0,
	trainingCount: 0,
});

// 模拟数据加载
function loadData() {
	// 这里应该从API获取讲师的实际数据
	// 暂时使用模拟数据
	stats.value = {
		courseCount: 12,
		studentCount: 1234,
		totalIncome: 123450,
		packageCount: 3,
		microCourseCount: 8,
		publicCourseCount: 5,
		researchCount: 2,
		trainingCount: 4,
	};
}

// Tab切换
function handleTabChange(tab: string) {
	activeTab.value = tab;
}

onMounted(() => {
	loadData();
});
</script>

<template>
  <div class="teacher-course-center min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">课程中心 - 讲师工作台</h1>
        <p class="mt-2 text-gray-600">管理您的课程内容，查看学习数据</p>
      </div>

      <!-- 二级导航 -->
      <div class="mb-6 overflow-x-auto rounded-lg bg-white p-4 shadow-sm">
        <div class="flex min-w-max gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors"
            :class="
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="handleTabChange(tab.key)"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- 数据概览卡片 -->
      <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="mb-2 text-3xl font-bold text-blue-600">
            {{ stats.courseCount }}
          </div>
          <div class="text-sm text-gray-500">课程总数</div>
        </div>
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="mb-2 text-3xl font-bold text-green-600">
            {{ stats.studentCount }}
          </div>
          <div class="text-sm text-gray-500">学员总数</div>
        </div>
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="mb-2 text-3xl font-bold text-red-500">
            ¥{{ (stats.totalIncome / 100).toFixed(0) }}
          </div>
          <div class="text-sm text-gray-500">总收入</div>
        </div>
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="mb-2 text-3xl font-bold text-purple-600">
            {{ stats.packageCount }}
          </div>
          <div class="text-sm text-gray-500">课程套餐</div>
        </div>
      </div>

      <!-- 课程管理 -->
      <div v-if="activeTab === 'manage'" class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">📚 课程管理</h2>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + 新建课程
          </button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="搜索课程..."
            class="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <select
            class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option>全部状态</option>
            <option>已上架</option>
            <option>已下架</option>
            <option>草稿</option>
          </select>
          <select
            class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option>全部分类</option>
            <option>编程</option>
            <option>美术</option>
            <option>音乐</option>
          </select>
        </div>

        <!-- 课程表格 -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 text-left text-sm text-gray-500">
                <th class="pb-3 pl-4 font-medium">课程名称</th>
                <th class="pb-3 font-medium">分类</th>
                <th class="pb-3 font-medium">价格</th>
                <th class="pb-3 font-medium">学员数</th>
                <th class="pb-3 font-medium">状态</th>
                <th class="pb-3 pr-4 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-4 pl-4">
                  <div class="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100"
                      alt=""
                      class="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <div class="font-medium text-gray-800">Python零基础入门课程</div>
                      <div class="text-xs text-gray-500">共5章25课时</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 text-gray-600">编程</td>
                <td class="py-4 text-gray-600">¥199</td>
                <td class="py-4 text-gray-600">1,234</td>
                <td class="py-4">
                  <span
                    class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                  >
                    已上架
                  </span>
                </td>
                <td class="py-4 pr-4 text-right">
                  <button class="text-blue-600 hover:underline">编辑</button>
                  <button class="ml-3 text-red-600 hover:underline">删除</button>
                </td>
              </tr>
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-4 pl-4">
                  <div class="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100"
                      alt=""
                      class="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <div class="font-medium text-gray-800">少儿创意绘画</div>
                      <div class="text-xs text-gray-500">共3章12课时</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 text-gray-600">美术</td>
                <td class="py-4 text-gray-600">免费</td>
                <td class="py-4 text-gray-600">456</td>
                <td class="py-4">
                  <span
                    class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                  >
                    已上架
                  </span>
                </td>
                <td class="py-4 pr-4 text-right">
                  <button class="text-blue-600 hover:underline">编辑</button>
                  <button class="ml-3 text-red-600 hover:underline">删除</button>
                </td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="py-4 pl-4">
                  <div class="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1552422535-c45813c61732?w=100"
                      alt=""
                      class="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <div class="font-medium text-gray-800">钢琴基础教程</div>
                      <div class="text-xs text-gray-500">共4章18课时</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 text-gray-600">音乐</td>
                <td class="py-4 text-gray-600">¥299</td>
                <td class="py-4 text-gray-600">789</td>
                <td class="py-4">
                  <span
                    class="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                  >
                    已下架
                  </span>
                </td>
                <td class="py-4 pr-4 text-right">
                  <button class="text-blue-600 hover:underline">编辑</button>
                  <button class="ml-3 text-red-600 hover:underline">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 课程整合 -->
      <div v-else-if="activeTab === 'packages'" class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">📦 课程整合</h2>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + 新建套餐
          </button>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- 套餐卡片示例 -->
          <div class="rounded-lg border border-gray-200 p-4">
            <img
              src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400"
              alt=""
              class="mb-3 h-40 w-full rounded object-cover"
            />
            <h3 class="mb-2 font-semibold text-gray-800">Python全栈开发套餐</h3>
            <p class="mb-3 text-sm text-gray-600">从入门到精通，包含Python基础、Web开发、数据分析三门课程</p>
            <div class="mb-3 text-sm text-gray-500">
              <p>包含课程：3门</p>
              <p>原价：¥897</p>
              <p class="text-lg font-bold text-red-500">套餐价：¥499</p>
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              >
                编辑
              </button>
              <button
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                查看数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频库 -->
      <div v-else-if="activeTab === 'videos'" class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">🎬 视频库</h2>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + 上传视频
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <!-- 视频卡片示例 -->
          <div class="group cursor-pointer">
            <div class="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300"
                alt=""
                class="h-32 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-30">
                <div class="hidden h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-90 group-hover:flex">
                  <span class="text-2xl text-blue-600">▶</span>
                </div>
              </div>
              <div class="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                15:30
              </div>
            </div>
            <div class="mt-2">
              <p class="truncate text-sm font-medium text-gray-800">Python安装与配置</p>
              <p class="text-xs text-gray-500">上传于 2025-02-10</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 微课程 / 公益课程 / 付费课程 / 科研赋能 / 集训计划 / 数据统计 -->
      <div v-else class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ tabs.find((t) => t.key === activeTab)?.icon }}
            {{ tabs.find((t) => t.key === activeTab)?.label }}
          </h2>
          <button
            v-if="activeTab !== 'stats'"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + 新建{{ tabs.find((t) => t.key === activeTab)?.label }}
          </button>
        </div>

        <div class="py-16 text-center text-gray-500">
          <svg
            class="mx-auto mb-4 h-24 w-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p>此功能正在开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>
