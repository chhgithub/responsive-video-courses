<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { getNews, type News } from '#/utils/news-storage';

defineOptions({ name: 'PortalNewsDetail' });

const router = useRouter();
const route = useRoute();

const news = ref<News | null>(null);

// 分类颜色映射
const categoryColors: Record<string, string> = {
	通知: 'blue',
	公告: 'orange',
	新闻: 'green',
};

// 加载数据
onMounted(() => {
	const id = route.params.id as string;
	const allNews = getNews();
	const found = allNews.find((item) => item.id === id);
	if (found) {
		news.value = found;
	}
});

// 返回列表
function goBack() {
	router.push('/portal/news');
}

// 返回首页
function goHome() {
	router.push('/portal');
}
</script>

<template>
	<div v-if="news" class="news-detail min-h-screen bg-gray-50 pb-12">
		<!-- 导航栏 -->
		<div class="bg-white shadow-sm">
			<div class="container mx-auto px-4">
				<div class="flex h-14 items-center gap-4 text-sm">
					<a class="text-gray-600 hover:text-blue-600 cursor-pointer" @click="goHome">
						首页
					</a>
					<span class="text-gray-400">/</span>
					<a class="text-gray-600 hover:text-blue-600 cursor-pointer" @click="goBack">
						资讯公告
					</a>
					<span class="text-gray-400">/</span>
					<span class="font-medium text-gray-900">详情</span>
				</div>
			</div>
		</div>

		<div class="container mx-auto px-4 py-8">
			<div class="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-sm">
				<!-- 标题区域 -->
				<div class="mb-6 border-b pb-6">
					<div class="mb-4 flex items-center gap-2">
						<a-tag :color="categoryColors[news.category]">
							{{ news.category }}
						</a-tag>
						<span class="text-sm text-gray-400">
							发布时间：{{ news.publishTime }}
						</span>
					</div>
					<h1 class="text-3xl font-bold text-gray-900">
						{{ news.title }}
					</h1>
				</div>

				<!-- 封面图 -->
				<div v-if="news.coverImage" class="mb-6">
					<img
						:src="news.coverImage"
						alt="封面"
						class="w-full rounded-lg object-cover"
					/>
				</div>

				<!-- 内容区域 -->
				<div class="prose max-w-none">
					<p class="whitespace-pre-wrap text-gray-700 leading-relaxed">
						{{ news.content }}
					</p>
				</div>
			</div>
		</div>
	</div>
	<a-empty v-else description="资讯不存在" class="min-h-screen pt-32" />
</template>

<style scoped>
.prose {
	line-height: 1.8;
}
</style>
