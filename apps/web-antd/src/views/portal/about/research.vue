<script lang="ts" setup>
import { ref } from 'vue';

// Mock 数据
const instituteInfo = ref({
  title: '关于研究院',
  content: '<p>创新教育研究院成立于2010年，是一家专注于教育创新研究与实践的专业机构。</p><p>我们汇聚了国内外顶尖的教育专家、学者和实践者，共同探索教育改革的路径与方向。</p>',
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-blue-600 to-purple-600 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">
          {{ instituteInfo.title }}
        </h1>
      </div>
    </section>

    <!-- 介绍 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <div
            class="text-lg leading-relaxed text-gray-600 whitespace-pre-line"
            v-html="instituteInfo.content"
          ></div>
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
