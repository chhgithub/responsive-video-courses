<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getActiveNews, type News } from '#/utils/news-storage';

defineOptions({ name: 'PortalNews' });

const router = useRouter();

// 资讯列表
const newsList = ref<News[]>([]);

// 当前选中的分类
const selectedCategory = ref<'全部' | '通知' | '公告' | '新闻'>('全部');

// 分类选项
const categories = ['全部', '通知', '公告', '新闻'] as const;

// 过滤后的资讯列表
const filteredNews = computed(() => {
	if (selectedCategory.value === '全部') {
		return newsList.value;
	}
	return newsList.value.filter(
		(item) => item.category === selectedCategory.value
	);
});

// 分类颜色映射
const categoryColors: Record<string, string> = {
	通知: 'blue',
	公告: 'orange',
	新闻: 'green',
};

// 加载数据
onMounted(() => {
	newsList.value = getActiveNews().sort((a, b) => b.orderNum - a.orderNum);
});

// 查看详情
function viewDetail(id: string) {
	router.push(`/portal/news/detail/${id}`);
}

// 返回首页
function goHome() {
	router.push('/portal');
}
</script>

<template>
	<div class="news-page min-h-screen bg-gray-50 pb-12">
		<!-- 导航栏 -->
		<div class="bg-white shadow-sm">
			<div class="container mx-auto px-4">
				<div class="flex h-14 items-center gap-4 text-sm">
					<a class="text-gray-600 hover:text-blue-600 cursor-pointer" @click="goHome">
						首页
					</a>
					<span class="text-gray-400">/</span>
					<span class="font-medium text-gray-900">资讯公告</span>
				</div>
			</div>
		</div>

		<div class="container mx-auto px-4 py-8">
			<!-- 分类筛选 -->
			<div class="mb-6 flex flex-wrap gap-2">
				<a-button
					v-for="category in categories"
					:key="category"
					:type="selectedCategory === category ? 'primary' : 'default'"
					@click="selectedCategory = category"
				>
					{{ category }}
				</a-button>
			</div>

			<!-- 资讯列表 -->
			<div v-if="filteredNews.length > 0" class="space-y-4">
				<div
					v-for="news in filteredNews"
					:key="news.id"
					class="overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex gap-6">
						<!-- 封面图 -->
						<img
							v-if="news.coverImage"
							:src="news.coverImage"
							alt="封面"
							class="h-32 w-48 rounded-lg object-cover"
						/>
						<div class="flex-1">
							<div class="mb-3 flex items-center gap-2">
								<a-tag :color="categoryColors[news.category]">
									{{ news.category }}
								</a-tag>
								<span class="text-xs text-gray-400">
									{{ news.publishTime }}
								</span>
							</div>
							<h3
								class="mb-2 text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
								@click="viewDetail(news.id)"
							>
								{{ news.title }}
							</h3>
							<p class="line-clamp-2 text-sm text-gray-600">
								{{ news.content }}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- 空状态 -->
			<a-empty
				v-else
				description="暂无资讯"
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
