<script setup lang="ts">
import { ref } from 'vue';

// 假数据 - 研究院介绍
const instituteInfo = ref({
  name: '创新教育研究院',
  established: '2010年',
  mission: '致力于推动教育创新，培养未来人才',
  description: `创新教育研究院成立于2010年，是一家专注于教育创新研究与实践的专业机构。
我们汇聚了国内外顶尖的教育专家、学者和实践者，共同探索教育改革的路径与方向。`,
  researchAreas: [
    {
      title: '教育技术研究',
      description: '探索人工智能、大数据等新技术在教育领域的应用',
      icon: '🔬',
    },
    {
      title: '课程体系研究',
      description: '构建符合21世纪人才培养需求的课程体系',
      icon: '📚',
    },
    {
      title: '教学模式创新',
      description: '探索线上线下融合、项目式学习等新型教学模式',
      icon: '💡',
    },
    {
      title: '教育评价研究',
      description: '建立科学、全面的教育评价体系',
      icon: '📊',
    },
  ],
  stats: {
    total: 150,
    experts: 30,
    phd: 80,
  },
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-blue-600 to-purple-600 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">{{ instituteInfo.name }}</h1>
        <p class="text-xl text-blue-100">{{ instituteInfo.mission }}</p>
      </div>
    </section>

    <!-- 介绍 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="mb-6 text-3xl font-bold text-gray-900">关于研究院</h2>
          <p class="text-lg leading-relaxed text-gray-600 whitespace-pre-line">
            {{ instituteInfo.description }}
          </p>
          <p class="mt-4 text-gray-500">成立于 {{ instituteInfo.established }}</p>
        </div>
      </div>
    </section>

    <!-- 研究领域 -->
    <section class="bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">研究领域</h2>
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="area in instituteInfo.researchAreas"
            :key="area.title"
            class="rounded-lg bg-white p-6 text-center shadow-md transition-transform hover:scale-105"
          >
            <div class="mb-4 text-5xl">{{ area.icon }}</div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              {{ area.title }}
            </h3>
            <p class="text-gray-600">{{ area.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 团队数据 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">我们的团队</h2>
        <div class="mx-auto max-w-4xl">
          <div class="grid gap-8 md:grid-cols-3">
            <div class="text-center">
              <div class="mb-2 text-5xl font-bold text-blue-600">
                {{ instituteInfo.stats.total }}
              </div>
              <div class="text-gray-600">团队成员</div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-5xl font-bold text-purple-600">
                {{ instituteInfo.stats.experts }}
              </div>
              <div class="text-gray-600">专家顾问</div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-5xl font-bold text-green-600">
                {{ instituteInfo.stats.phd }}
              </div>
              <div class="text-gray-600">博士学历</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
}
</style>
