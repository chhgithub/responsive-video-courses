<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getActiveActivities, type Activity } from '#/utils/news-storage';

defineOptions({ name: 'PortalActivity' });

const router = useRouter();

// 活动列表
const activityList = ref<Activity[]>([]);

// 加载数据
onMounted(() => {
	activityList.value = getActiveActivities().sort(
		(a, b) => a.orderNum - b.orderNum
	);
});

// 返回首页
function goHome() {
	router.push('/portal');
}
</script>

<template>
	<div class="activity-page min-h-screen bg-gray-50 pb-12">
		<!-- 导航栏 -->
		<div class="bg-white shadow-sm">
			<div class="container mx-auto px-4">
				<div class="flex h-14 items-center gap-4 text-sm">
					<a class="text-gray-600 hover:text-blue-600 cursor-pointer" @click="goHome">
						首页
					</a>
					<span class="text-gray-400">/</span>
					<span class="font-medium text-gray-900">活动日历</span>
				</div>
			</div>
		</div>

		<div class="container mx-auto px-4 py-8">
			<!-- 页面标题 -->
			<div class="mb-8 text-center">
				<h1 class="text-3xl font-bold text-gray-900">活动日历</h1>
				<p class="mt-2 text-gray-600">精彩活动，不容错过</p>
			</div>

			<!-- 活动列表 -->
			<div v-if="activityList.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div
					v-for="activity in activityList"
					:key="activity.id"
					class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
				>
					<!-- 封面图 -->
					<img
						v-if="activity.coverImage"
						:src="activity.coverImage"
						alt="活动封面"
						class="h-48 w-full object-cover"
					/>
					<div class="p-6">
						<!-- 时间标签 -->
						<div class="mb-3 flex items-center gap-2">
							<div class="rounded bg-blue-50 px-3 py-1">
								<span class="text-xs font-medium text-blue-600">
									{{ activity.startDate }}
								</span>
							</div>
							<span v-if="activity.startDate !== activity.endDate" class="text-xs text-gray-400">
								至 {{ activity.endDate }}
							</span>
						</div>

						<!-- 活动标题 -->
						<h3 class="mb-2 text-lg font-bold text-gray-900">
							{{ activity.title }}
						</h3>

						<!-- 活动地点 -->
						<div class="mb-3 flex items-center gap-2 text-sm text-gray-600">
							<svg
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span>{{ activity.location }}</span>
						</div>

						<!-- 活动描述 -->
						<p class="mb-4 line-clamp-2 text-sm text-gray-600">
							{{ activity.description }}
						</p>

						<!-- 查看详情按钮 -->
						<a-button type="primary" block size="small">
							了解详情
						</a-button>
					</div>
				</div>
			</div>

			<!-- 空状态 -->
			<a-empty
				v-else
				description="暂无活动"
				class="mt-16"
			/>
		</div>
	</div>
</template>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
