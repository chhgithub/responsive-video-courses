<script lang="ts" setup>
import { onMounted, ref } from 'vue';

// 学习记录数据
interface LearningRecord {
	courseId: string;
	courseTitle: string;
	courseCover: string;
	lessonId: string;
	lessonTitle: string;
	progress: number;
	watchedDuration: number;
	totalDuration: number;
	lastStudyAt: string;
	completedAt?: string;
}

const records = ref<LearningRecord[]>([]);
const loading = ref(false);

// 加载学习记录
function loadLearningRecords() {
	loading.value = true;
	setTimeout(() => {
		// 模拟数据
		records.value = [
			{
				courseId: 'c1',
				courseTitle: 'Python零基础入门课程',
				courseCover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
				lessonId: 'l1',
				lessonTitle: '1.1 Python安装与配置',
				progress: 100,
				watchedDuration: 930,
				totalDuration: 930,
				lastStudyAt: '2小时前',
				completedAt: '2025-02-20 14:30:00',
			},
			{
				courseId: 'c1',
				courseTitle: 'Python零基础入门课程',
				courseCover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
				lessonId: 'l2',
				lessonTitle: '1.2 IDE选择与使用',
				progress: 45,
				watchedDuration: 344,
				totalDuration: 765,
				lastStudyAt: '昨天',
			},
			{
				courseId: 'c2',
				courseTitle: '少儿创意绘画',
				courseCover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
				lessonId: 'l3',
				lessonTitle: '第1课：认识画笔和颜料',
				progress: 20,
				watchedDuration: 180,
				totalDuration: 900,
				lastStudyAt: '3天前',
			},
		];
		loading.value = false;
	}, 300);
}

// 格式化时长
function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0) {
		return `${hours}小时${minutes}分钟`;
	}
	return `${minutes}分钟`;
}

// 继续学习
function continueLearning(record: LearningRecord) {
	window.location.href = `/portal/learn/${record.courseId}?lessonId=${record.lessonId}`;
}

onMounted(() => {
	loadLearningRecords();
});
</script>

<template>
  <div class="member-history min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">学习记录</h1>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
      </div>

      <!-- 学习记录列表 -->
      <div v-else class="space-y-4">
        <div
          v-for="(record, index) in records"
          :key="record.lessonId"
          class="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <!-- 课程封面 -->
            <img
              :src="record.courseCover"
              :alt="record.courseTitle"
              class="h-20 w-32 rounded object-cover"
            />

            <!-- 学习信息 -->
            <div class="flex-1">
              <div class="mb-2">
                <p class="font-medium text-gray-800">{{ record.courseTitle }}</p>
                <p class="text-sm text-gray-500">{{ record.lessonTitle }}</p>
              </div>

              <!-- 进度条 -->
              <div class="mb-2">
                <div class="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>学习进度</span>
                  <span>{{ record.progress }}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500"
                    :style="{ width: record.progress + '%' }"
                  ></div>
                </div>
              </div>

              <!-- 学习时长和时间 -->
              <div class="flex items-center gap-6 text-xs text-gray-500">
                <span>
                  已学：{{ formatDuration(record.watchedDuration) }} /
                  {{ formatDuration(record.totalDuration) }}
                </span>
                <span>{{ record.lastStudyAt }}</span>
                <span v-if="record.completedAt" class="text-green-600">
                  ✓ {{ record.completedAt }} 完成
                </span>
              </div>
            </div>

            <!-- 继续学习按钮 -->
            <div class="ml-4">
              <button
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                @click="continueLearning(record)"
              >
                {{ record.progress === 100 ? '复习' : '继续学习' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="records.length === 0"
          class="py-16 text-center"
        >
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p class="mt-4 text-gray-500">暂无学习记录</p>
        </div>
      </div>
    </div>
  </div>
</template>
