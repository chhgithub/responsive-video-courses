<script lang="ts" setup>
import { ref } from 'vue';

// 模拟认证数据
const certifications = ref([
  {
    id: 1,
    title: 'Web 前端开发工程师认证',
    issuer: '平台认证',
    description: '掌握 HTML、CSS、JavaScript 等前端技术',
    requirement: '完成前端开发相关课程并通过考试',
  },
  {
    id: 2,
    title: 'Python 数据分析师认证',
    issuer: '平台认证',
    description: '熟练使用 Python 进行数据分析',
    requirement: '完成 Python 数据分析课程并提交项目',
  },
  {
    id: 3,
    title: 'UI/UX 设计师认证',
    issuer: '行业认证',
    description: '掌握用户界面和用户体验设计',
    requirement: '完成设计系列课程并提交作品集',
  },
]);

// 搜索关键词
const searchKeyword = ref('');
</script>

<template>
  <div class="cert-page">
    <!-- Banner -->
    <section
      class="banner-section bg-gradient-to-r from-blue-500 to-purple-600 py-16"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">认证中心</h1>
        <p class="text-xl text-gray-100">查看您的认证证书，展示专业能力</p>
      </div>
    </section>

    <!-- 证书查询 -->
    <section class="search-section bg-white py-8">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-2xl">
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="输入证书编号或姓名查询"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-700 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
            >
              <svg
                class="h-5 w-5"
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
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 证书列表 -->
    <section class="cert-list-section px-4 py-12">
      <div class="container mx-auto">
        <h2 class="mb-8 text-2xl font-bold text-gray-800">可认证证书</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="cert in certifications"
            :key="cert.id"
            class="cert-card overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="cert-header border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-800">
                  {{ cert.title }}
                </h3>
                <span
                  class="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {{ cert.issuer }}
                </span>
              </div>
            </div>
            <div class="p-4">
              <p class="mb-4 text-gray-600">{{ cert.description }}</p>
              <div class="mb-4 text-sm text-gray-500">
                <strong>认证要求：</strong>{{ cert.requirement }}
              </div>
              <button
                class="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 认证流程 -->
    <section class="process-section bg-gray-50 px-4 py-12">
      <div class="container mx-auto">
        <h2 class="mb-8 text-center text-2xl font-bold text-gray-800">
          认证流程
        </h2>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div class="text-center">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
            >
              1
            </div>
            <h3 class="mb-2 text-lg font-bold text-gray-800">学习课程</h3>
            <p class="text-sm text-gray-600">完成相关课程学习</p>
          </div>
          <div class="text-center">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
            >
              2
            </div>
            <h3 class="mb-2 text-lg font-bold text-gray-800">参加考试</h3>
            <p class="text-sm text-gray-600">通过在线认证考试</p>
          </div>
          <div class="text-center">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
            >
              3
            </div>
            <h3 class="mb-2 text-lg font-bold text-gray-800">获得证书</h3>
            <p class="text-sm text-gray-600">领取电子/纸质证书</p>
          </div>
          <div class="text-center">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
            >
              4
            </div>
            <h3 class="mb-2 text-lg font-bold text-gray-800">展示能力</h3>
            <p class="text-sm text-gray-600">提升职场竞争力</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cert-page {
  min-height: calc(100vh - 64px - 300px);
}

.cert-card {
  transition: transform 0.2s;
}

.cert-card:hover {
  transform: translateY(-2px);
}
</style>
