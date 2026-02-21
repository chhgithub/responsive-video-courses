<script setup lang="ts">
import { ref } from 'vue';

// 假数据 - 教育培训中心介绍
const educationCenter = ref({
  name: '教育培训中心',
  established: '2012年',
  slogan: '专业培训 · 成就未来',
  description: `
    教育培训中心成立于2012年，是一家专注于职业技能培训和继续教育的专业机构。
    我们以"专业培训，成就未来"为宗旨，为学员提供高质量、实用的培训课程。

    中心拥有完善的教学设施和经验丰富的师资队伍，已累计培训学员超过10万人次，
    就业率达到95%以上，赢得了学员和社会的广泛好评。
  `,
  courses: [
    {
      category: 'IT技术',
      icon: '💻',
      courses: [
        'Python全栈开发',
        'Java企业级应用',
        '前端开发工程师',
        '人工智能与机器学习',
        '大数据分析',
      ],
    },
    {
      category: '数字营销',
      icon: '📱',
      courses: [
        '新媒体运营',
        '电商运营',
        'SEO/SEM优化',
        '内容营销',
        '品牌策划',
      ],
    },
    {
      category: '设计创意',
      icon: '🎨',
      courses: [
        'UI/UX设计',
        '平面设计',
        '视频剪辑',
        '动画制作',
        '产品设计',
      ],
    },
    {
      category: '商业管理',
      icon: '📊',
      courses: [
        '项目管理',
        '数据分析',
        '人力资源',
        '财务管理',
        '企业战略',
      ],
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
  teachers: [
    {
      name: '张老师',
      title: '首席技术官',
      expertise: '15年互联网开发经验',
      courses: 'Python、Java、全栈开发',
    },
    {
      name: '李老师',
      title: '资深设计师',
      expertise: '12年设计经验',
      courses: 'UI/UX、平面设计',
    },
    {
      name: '王老师',
      title: '营销专家',
      expertise: '10年数字营销经验',
      courses: '新媒体、电商运营',
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
  <div class="about-page p-6">
    <!-- 页面标题 -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-gray-900">{{ educationCenter.name }}</h1>
      <p class="mt-2 text-gray-600">成立于 {{ educationCenter.established }}</p>
      <p class="mt-3 text-xl text-blue-600 font-semibold">
        {{ educationCenter.slogan }}
      </p>
    </div>

    <!-- 中心介绍 -->
    <a-card class="mb-6" :bordered="false">
      <template #title>
        <span class="text-lg font-semibold">中心介绍</span>
      </template>
      <div class="text-gray-700 leading-relaxed whitespace-pre-line">
        {{ educationCenter.description }}
      </div>
    </a-card>

    <!-- 课程体系 -->
    <a-card class="mb-6" title="课程体系" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="category in educationCenter.courses"
          :key="category.category"
          :xs="24"
          :sm="12"
          :lg="6"
        >
          <a-card class="h-full course-card" hoverable>
            <div class="text-center mb-3">
              <span class="text-4xl">{{ category.icon }}</span>
              <h3 class="text-lg font-semibold mt-2">{{ category.category }}</h3>
            </div>
            <a-divider class="my-2" />
            <ul class="text-sm text-gray-600">
              <li
                v-for="course in category.courses"
                :key="course"
                class="mb-1"
              >
                {{ course }}
              </li>
            </ul>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 教学特色 -->
    <a-card class="mb-6" title="教学特色" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="feature in educationCenter.features"
          :key="feature.title"
          :xs="24"
          :sm="12"
          :lg="6"
        >
          <div class="feature-item text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-4xl mb-2">{{ feature.icon }}</div>
            <h3 class="font-semibold mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-gray-600">{{ feature.description }}</p>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 师资团队 -->
    <a-card class="mb-6" title="师资团队" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="teacher in educationCenter.teachers"
          :key="teacher.name"
          :xs="24"
          :sm="8"
        >
          <a-card class="teacher-card" hoverable>
            <div class="text-center">
              <a-avatar :size="64" class="mb-3" style="background-color: #1890ff">
                <template #icon>
                  <span class="text-2xl">👨‍🏫</span>
                </template>
              </a-avatar>
              <h3 class="text-lg font-semibold">{{ teacher.name }}</h3>
              <p class="text-blue-600 text-sm mb-2">{{ teacher.title }}</p>
              <p class="text-gray-600 text-sm mb-1">{{ teacher.expertise }}</p>
              <a-tag color="blue">{{ teacher.courses }}</a-tag>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 数据统计 -->
    <a-card title="中心数据" :bordered="false">
      <a-row :gutter="16" class="text-center">
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="培训学员"
            :value="educationCenter.stats.students"
            suffix="+"
          >
            <template #prefix>
              <span class="text-2xl">👨‍🎓</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="开设课程"
            :value="educationCenter.stats.courses"
            suffix="+"
          >
            <template #prefix>
              <span class="text-2xl">📚</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="师资团队"
            :value="educationCenter.stats.teachers"
            suffix="+"
          >
            <template #prefix>
              <span class="text-2xl">👨‍🏫</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="学员满意度"
            :value="educationCenter.stats.satisfaction"
            suffix="%"
          >
            <template #prefix>
              <span class="text-2xl">⭐</span>
            </template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
}

.course-card,
.teacher-card {
  transition: transform 0.3s ease;
}

.course-card:hover,
.teacher-card:hover {
  transform: translateY(-4px);
}

.feature-item {
  transition: all 0.3s ease;
}

.feature-item:hover {
  background-color: #e6f7ff;
  transform: scale(1.05);
}
</style>
