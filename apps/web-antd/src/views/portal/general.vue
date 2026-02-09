<script lang="ts" setup>
import { ref } from 'vue';

// 模拟通识课程数据
const generalCourses = ref([
  {
    id: 1,
    title: '沟通技巧与职场礼仪',
    category: '职场技能',
    image: 'https://picsum.photos/seed/general1/400/250',
    students: 3500,
    duration: '8 课时',
    description: '提升职场沟通能力和职业素养',
  },
  {
    id: 2,
    title: '时间管理与效率提升',
    category: '个人成长',
    image: 'https://picsum.photos/seed/general2/400/250',
    students: 2800,
    duration: '6 课时',
    description: '学会高效管理时间，提升工作效率',
  },
  {
    id: 3,
    title: '公文写作与商务沟通',
    category: '办公技能',
    image: 'https://picsum.photos/seed/general3/400/250',
    students: 2200,
    duration: '10 课时',
    description: '掌握商务写作规范和沟通技巧',
  },
  {
    id: 4,
    title: '心理健康与压力管理',
    category: '健康生活',
    image: 'https://picsum.photos/seed/general4/400/250',
    students: 4100,
    duration: '8 课时',
    description: '学习心理健康知识，有效管理工作压力',
  },
  {
    id: 5,
    title: '创新思维与问题解决',
    category: '思维能力',
    image: 'https://picsum.photos/seed/general5/400/250',
    students: 3000,
    duration: '12 课时',
    description: '培养创新思维，提升问题解决能力',
  },
  {
    id: 6,
    title: '团队协作与领导力',
    category: '管理能力',
    image: 'https://picsum.photos/seed/general6/400/250',
    students: 2600,
    duration: '10 课时',
    description: '提升团队协作能力和领导力',
  },
]);

// 分类
const categories = [
  '全部',
  '职场技能',
  '个人成长',
  '办公技能',
  '健康生活',
  '思维能力',
  '管理能力',
];
const activeCategory = ref('全部');

const filteredCourses = ref(generalCourses.value);

function filterByCategory(category: string) {
  activeCategory.value = category;
  filteredCourses.value =
    category === '全部'
      ? generalCourses.value
      : generalCourses.value.filter((c) => c.category === category);
}
</script>

<template>
  <div class="general-page">
    <!-- Banner -->
    <section
      class="banner-section bg-gradient-to-r from-blue-500 to-purple-600 py-16"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">通识教育</h1>
        <p class="text-xl text-gray-100">拓宽知识面，提升综合素养</p>
      </div>
    </section>

    <!-- 分类筛选 -->
    <section class="category-section border-b bg-white py-6">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap gap-2 overflow-x-auto">
          <button
            v-for="category in categories"
            :key="category"
            class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            :class="[
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
            @click="filterByCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </section>

    <!-- 课程列表 -->
    <section class="courses-section py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-card overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
          >
            <img
              :src="course.image"
              :alt="course.title"
              class="h-48 w-full object-cover"
            />
            <div class="p-4">
              <div class="mb-2">
                <span
                  class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {{ course.category }}
                </span>
              </div>
              <h3 class="mb-2 text-lg font-bold text-gray-800">
                {{ course.title }}
              </h3>
              <p class="mb-4 text-sm text-gray-600">{{ course.description }}</p>
              <div
                class="mb-4 flex items-center justify-between text-sm text-gray-500"
              >
                <span>👥 {{ course.students }} 人学过</span>
                <span>⏱ {{ course.duration }}</span>
              </div>
              <button
                class="w-full rounded bg-blue-500 py-2 text-white transition-colors hover:bg-blue-600"
              >
                开始学习
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 通识教育介绍 -->
    <section class="intro-section bg-blue-50 py-12">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="mb-6 text-2xl font-bold text-gray-800">
            什么是通识教育？
          </h2>
          <p class="leading-relaxed text-gray-600">
            通识教育旨在培养学生的综合素质，拓宽知识面，提升跨学科能力。
            我们的通识课程涵盖职场技能、个人成长、思维能力等多个方面，
            帮助学员全面发展，成为更好的自己。
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.general-page {
  min-height: calc(100vh - 64px - 300px);
}

.course-card {
  transition: transform 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
}

.category-section {
  position: sticky;
  top: 64px;
  z-index: 40;
}
</style>
