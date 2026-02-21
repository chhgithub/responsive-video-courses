<script setup lang="ts">
import { ref } from 'vue';

// 假数据 - 数字创新中心介绍
const digitalCenter = ref({
  name: '数字创新中心',
  established: '2015年',
  slogan: '数字化转型 · 创新驱动未来',
  description:
    '数字创新中心成立于2015年，是集技术研发、成果转化、人才培养于一体的综合性创新平台。中心以"数字化转型、创新驱动未来"为核心理念，致力于推动传统产业的数字化升级。',
  services: [
    {
      title: '数字化解决方案',
      description: '为企业提供全方位的数字化转型咨询服务',
      icon: '💼',
    },
    {
      title: '智能产品开发',
      description: '基于AI技术的智能化产品研发',
      icon: '🤖',
    },
    {
      title: '数据分析服务',
      description: '大数据采集、处理、分析和可视化',
      icon: '📈',
    },
    {
      title: '技术培训',
      description: '前沿技术培训与人才培养',
      icon: '🎓',
    },
  ],
  techStack: [
    { name: '人工智能', level: 95, color: 'bg-blue-500' },
    { name: '大数据', level: 90, color: 'bg-green-500' },
    { name: '云计算', level: 88, color: 'bg-purple-500' },
    { name: '物联网', level: 85, color: 'bg-orange-500' },
  ],
  stats: {
    projects: 200,
    clients: 100,
    patents: 50,
  },
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-purple-600 to-pink-600 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">{{ digitalCenter.name }}</h1>
        <p class="text-xl text-purple-100">{{ digitalCenter.slogan }}</p>
      </div>
    </section>

    <!-- 介绍 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="mb-6 text-3xl font-bold text-gray-900">中心介绍</h2>
          <p class="text-lg leading-relaxed text-gray-600">
            {{ digitalCenter.description }}
          </p>
          <p class="mt-4 text-gray-500">成立于 {{ digitalCenter.established }}</p>
        </div>
      </div>
    </section>

    <!-- 核心服务 -->
    <section class="bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">核心服务</h2>
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="service in digitalCenter.services"
            :key="service.title"
            class="rounded-lg bg-white p-6 text-center shadow-md transition-transform hover:scale-105"
          >
            <div class="mb-4 text-5xl">{{ service.icon }}</div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              {{ service.title }}
            </h3>
            <p class="text-gray-600">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术实力 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">技术实力</h2>
        <div class="mx-auto max-w-4xl">
          <div class="space-y-6">
            <div v-for="tech in digitalCenter.techStack" :key="tech.name">
              <div class="mb-2 flex justify-between">
                <span class="font-medium text-gray-900">{{ tech.name }}</span>
                <span class="text-gray-600">{{ tech.level }}%</span>
              </div>
              <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full transition-all duration-1000"
                  :class="tech.color"
                  :style="{ width: `${tech.level}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="bg-gray-900 py-16 text-white">
      <div class="container mx-auto px-4">
        <div class="grid gap-8 md:grid-cols-3">
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ digitalCenter.stats.projects }}+
            </div>
            <div class="text-gray-300">完成项目</div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ digitalCenter.stats.clients }}+
            </div>
            <div class="text-gray-300">服务客户</div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ digitalCenter.stats.patents }}+
            </div>
            <div class="text-gray-300">技术专利</div>
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
