<script setup lang="ts">
import { ref } from 'vue';

// 假数据 - 教育培训中心介绍
const educationCenter = ref({
  name: '教育培训中心',
  established: '2012年',
  slogan: '专业培训 · 成就未来',
  description:
    '教育培训中心成立于2012年，是一家专注于职业技能培训和继续教育的专业机构。我们以"专业培训，成就未来"为宗旨，为学员提供高质量、实用的培训课程。',
  courses: [
    {
      category: 'IT技术',
      icon: '💻',
      count: 15,
    },
    {
      category: '数字营销',
      icon: '📱',
      count: 12,
    },
    {
      category: '设计创意',
      icon: '🎨',
      count: 10,
    },
    {
      category: '商业管理',
      icon: '📊',
      count: 13,
    },
  ],
  features: [
    {
      title: '实战教学',
      description: '以实际项目为导向，注重动手能力培养',
      icon: '🎯',
    },
    {
      title: '专家授课',
      description: '行业专家亲自授课，分享实战经验',
      icon: '👨‍🏫',
    },
    {
      title: '小班教学',
      description: '小班制教学，保证教学质量',
      icon: '👥',
    },
    {
      title: '就业保障',
      description: '提供就业指导和推荐服务',
      icon: '💼',
    },
  ],
  stats: {
    students: 100000,
    courses: 50,
    teachers: 30,
    satisfaction: 96,
  },
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-green-600 to-teal-600 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">{{ educationCenter.name }}</h1>
        <p class="text-xl text-green-100">{{ educationCenter.slogan }}</p>
      </div>
    </section>

    <!-- 介绍 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="mb-6 text-3xl font-bold text-gray-900">中心介绍</h2>
          <p class="text-lg leading-relaxed text-gray-600">
            {{ educationCenter.description }}
          </p>
          <p class="mt-4 text-gray-500">成立于 {{ educationCenter.established }}</p>
        </div>
      </div>
    </section>

    <!-- 课程体系 -->
    <section class="bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">课程体系</h2>
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="course in educationCenter.courses"
            :key="course.category"
            class="rounded-lg bg-white p-6 text-center shadow-md transition-transform hover:scale-105"
          >
            <div class="mb-4 text-5xl">{{ course.icon }}</div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              {{ course.category }}
            </h3>
            <p class="text-sm text-gray-500">{{ course.count }} 门课程</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 教学特色 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">教学特色</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in educationCenter.features"
            :key="feature.title"
            class="rounded-lg bg-green-50 p-6 text-center transition-all hover:bg-green-100"
          >
            <div class="mb-3 text-4xl">{{ feature.icon }}</div>
            <h3 class="mb-2 font-semibold text-gray-900">{{ feature.title }}</h3>
            <p class="text-sm text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="bg-green-700 py-16 text-white">
      <div class="container mx-auto px-4">
        <div class="grid gap-8 md:grid-cols-4">
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ educationCenter.stats.students.toLocaleString() }}+
            </div>
            <div class="text-green-100">培训学员</div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ educationCenter.stats.courses }}+
            </div>
            <div class="text-green-100">开设课程</div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ educationCenter.stats.teachers }}+
            </div>
            <div class="text-green-100">师资团队</div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-5xl font-bold">
              {{ educationCenter.stats.satisfaction }}%
            </div>
            <div class="text-green-100">学员满意度</div>
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
