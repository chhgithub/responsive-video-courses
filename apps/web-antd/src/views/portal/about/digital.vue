<script lang="ts" setup>
import { ref } from 'vue';

// Mock 数据
const centerInfo = ref({
  title: '关于数字创新中心',
  content: '<p>数字创新中心成立于2015年，是集技术研发、成果转化、人才培养于一体的综合性创新平台。</p><p>中心以"数字化转型、创新驱动未来"为核心理念，致力于推动传统产业的数字化升级。</p>',
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-purple-600 to-pink-600 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">
          {{ centerInfo.title }}
        </h1>
      </div>
    </section>

    <!-- 介绍 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <div
            class="text-lg leading-relaxed text-gray-600 whitespace-pre-line"
            v-html="centerInfo.content"
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
