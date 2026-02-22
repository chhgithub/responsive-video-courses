<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

// 统计数据
interface Statistics {
	totalCourses: number;
	totalStudents: number;
	totalIncome: number;
	totalPackages: number;
	courseStats: {
		published: number;
		draft: number;
		offline: number;
	};
	studentGrowth: {
		date: string;
		count: number;
	}[];
	incomeData: {
		month: string;
		amount: number;
	}[];
}

const statistics = ref<Statistics>({
	totalCourses: 12,
	totalStudents: 1234,
	totalIncome: 123450,
	totalPackages: 3,
	courseStats: {
		published: 8,
		draft: 2,
		offline: 2,
	},
	studentGrowth: [
		{ date: '2025-01', count: 800 },
		{ date: '2025-02', count: 1234 },
	],
	incomeData: [
		{ month: '2025-01', amount: 45600 },
		{ month: '2025-02', amount: 77850 },
	],
});

// Tab
const activeTab = ref('overview');

// 加载统计数据
function loadStatistics() {
	// 模拟API调用
	console.log('Loading statistics...');
}

// 计算总收入增长率
const incomeGrowth = computed(() => {
	if (statistics.value.incomeData.length < 2) return 0;
	const lastMonth = statistics.value.incomeData[statistics.value.incomeData.length - 1].amount;
	const prevMonth = statistics.value.incomeData[statistics.value.incomeData.length - 2].amount;
	return ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);
});

onMounted(() => {
	loadStatistics();
});
</script>

<template>
  <div class="statistics-page min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">数据统计</h1>
        <p class="mt-1 text-gray-600">查看您的课程数据和收入统计</p>
      </div>

      <!-- Tab切换 -->
      <div class="mb-6 rounded-lg bg-white p-2 shadow-sm">
        <div class="flex gap-2">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="activeTab = 'overview'"
          >
            📊 数据概览
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="activeTab = 'students'"
          >
            👥 学员管理
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'income' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="activeTab = 'income'"
          >
            💰 收入统计
          </button>
        </div>
      </div>

      <!-- 数据概览 -->
      <div v-if="activeTab === 'overview'">
        <!-- 核心指标卡片 -->
        <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <div class="mb-2 text-3xl font-bold text-blue-600">{{ statistics.totalCourses }}</div>
            <div class="text-sm text-gray-500">课程总数</div>
            <div class="mt-3 flex items-center gap-2 text-xs">
              <span class="px-2 py-1 rounded bg-green-100 text-green-700">已上架 {{ statistics.courseStats.published }}</span>
              <span class="px-2 py-1 rounded bg-gray-100 text-gray-600">草稿 {{ statistics.courseStats.draft }}</span>
            </div>
          </div>
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <div class="mb-2 text-3xl font-bold text-green-600">{{ statistics.totalStudents }}</div>
            <div class="texttext-sm text-gray-500">学员总数</div>
            <div class="mt-3 text-xs text-green-600">
              ↑ {{ statistics.studentGrowth[1].count - statistics.studentGrowth[0].count }} 本月新增
            </div>
          </div>
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <div class="mb-2 text-3xl font-bold text-red-500">¥{{ (statistics.totalIncome / 100).toFixed(0) }}</div>
            <div class="text-sm text-gray-500">总收入</div>
            <div class="mt-3 text-xs text-green-600">
              ↑ {{ incomeGrowth }}% 环比增长
            </div>
          </div>
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <div class="mb-2 text-3xl font-bold text-purple-600">{{ statistics.totalPackages }}</div>
            <div class="text-sm text-gray-500">课程套餐</div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- 学员增长趋势 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">学员增长趋势</h3>
            <div class="h-64 flex items-end justify-around gap-4 border-b border-l border-r px-4">
              <div class="flex flex-col items-center">
                <div class="h-48 w-16 rounded-t-lg bg-blue-500" style="height: 60%"></div>
                <span class="mt-2 text-xs text-gray-500">{{ statistics.studentGrowth[0].date }}</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="h-48 w-16 rounded-t-lg bg-blue-500" style="height: 100%"></div>
                <span class="mt-2 text-xs text-gray-500">{{ statistics.studentGrowth[1].date }}</span>
              </div>
            </div>
          </div>

          <!-- 收入趋势 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">收入趋势</h3>
            <div class="h-64 flex items-end justify-around gap-4 border-b border-l border-r px-4">
              <div class="flex flex-col items-center">
                <div class="h-48 w-16 rounded-t-lg bg-green-500" style="height: 60%"></div>
                <span class="mt-2 text-xs text-gray-500">¥{{ (statistics.incomeData[0].amount / 100).toFixed(0) }}</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="h-48 w-16 rounded-t-lg bg-green-500" style="height: 100%"></div>
                <span class="mt-2 text-xs text-gray-500">¥{{ (statistics.incomeData[1].amount / 100).toFixed(0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 课程列表 -->
        <div class="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 class="mb-4 text-lg font-semibold text-gray-800">课程数据排行</h3>
          <table class="w-full">
            <thead class="border-b border-gray-200">
              <tr class="text-left text-sm text-gray-500">
                <th class="pb-3 font-medium">课程名称</th>
                <th class="pb-3 font-medium">学员数</th>
                <th class="pb-3 font-medium">收入</th>
                <th class="pb-3 font-medium">好评率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr class="text-sm">
                <td class="py-3 text-gray-800">Python零基础入门课程</td>
                <td class="py-3 text-gray-600">1,234</td>
                <td class="py-3 text-gray-600">¥24,576</td>
                <td class="py-3 text-green-600">98%</td>
              </tr>
              <tr class="text-sm">
                <td class="py-3 text-gray-800">钢琴基础教程</td>
                <td class="py-3 text-gray-600">789</td>
                <td class="py-3 text-gray-600">¥23,611</td>
                <td class="py-3 text-green-600">95%</td>
              </tr>
              <tr class="text-sm">
                <td class="py-3 text-gray-800">少儿创意绘画</td>
                <td class="py-3 text-gray-600">456</td>
                <td class="py-3 text-gray-600">¥0</td>
                <td class="py-3 text-green-600">99%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 学员管理 -->
      <div v-if="activeTab === 'students'">
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">学员列表</h3>
            <div class="flex items-center gap-2">
              <input
                type="text"
                placeholder="搜索学员..."
                class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <table class="w-full">
            <thead class="border-b border-gray-200">
              <tr class="text-left text-sm text-gray-500">
                <th class="pb-3 font-medium">学员</th>
                <th class="pb-3 font-medium">已购课程</th>
                <th class="pb-3 font-medium">学习进度</th>
                <th class="pb-3 font-medium">最后学习</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr class="text-sm">
                <td class="py-3 text-gray-800">
                  <div class="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=student1"
                      alt=""
                      class="h-8 w-8 rounded-full"
                    />
                    <span>张同学</span>
                  </div>
                </td>
                <td class="py-3 text-gray-600">3门</td>
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500" style="width: 75%"></div>
                    </div>
                    <span class="text-xs text-gray-500">75%</span>
                  </div>
                </td>
                <td class="py-3 text-gray-500">2小时前</td>
              </tr>
              <tr class="text-sm">
                <td class="py-3 text-gray-800">
                  <div class="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=student2"
                      alt=""
                      class="h-8 w-8 rounded-full"
                    />
                    <span>李同学</span>
                  </div>
                </td>
                <td class="py-3 text-gray-600">2门</td>
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500" style="width: 45%"></div>
                    </div>
                    <span class="text-xs text-gray-500">45%</span>
                  </div>
                </td>
                <td class="py-3 text-gray-500">昨天</td>
              </tr>
              <tr class="text-sm">
                <td class="py-3 text-gray-800">
                  <div class="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=student3"
                      alt=""
                      class="h-8 w-8 rounded-full"
                    />
                    <span>王同学</span>
                  </div>
                </td>
                <td class="py-3 text-gray-600">1门</td>
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500" style="width: 100%"></div>
                    </div>
                    <span class="text-xs text-gray-500">100%</span>
                  </div>
                </td>
                <td class="py-3 text-gray-500">3天前</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 收入统计 -->
      <div v-if="activeTab === 'income'">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- 收入概览 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">收入概览</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">今日收入</span>
                <span class="text-xl font-bold text-green-600">+¥2580</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">本周收入</span>
                <span class="text-xl font-bold text-green-600">+¥15,680</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">本月收入</span>
                <span class="text-xl font-bold text-green-600">+¥77,850</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">总收入</span>
                <span class="text-2xl font-bold text-gray-800">¥1,234.5</span>
              </div>
            </div>
          </div>

          <!-- 收入来源 -->
          <div class="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
            <h3 class="mb-4 text-lg font-semibold text-gray-800">收入来源</h3>
            <div class="space-y-4">
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-gray-700">Python零基础入门课程</span>
                  <span class="font-medium text-gray-800">¥24,576</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-gray-700">钢琴基础教程</span>
                  <span class="font-medium text-gray-800">¥23,611</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: 68%"></div>
                </div>
              </div>
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-gray-700">课程套餐</span>
                  <span class="font-medium text-gray-800">¥59,970</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: 45%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
