<script lang="ts" setup>
import { ref } from 'vue';

// Mock 数据
const centerInfo = ref({
  title: '关于教育培训中心',
  content: '<p>教育培训中心成立于2012年，是一家专注于职业技能培训和继续教育的专业机构。</p><p>我们以"专业培训，成就未来"为宗旨，为学员提供高质量、实用的培训课程。</p>',
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-green-600 to-teal-600 py-20">
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
