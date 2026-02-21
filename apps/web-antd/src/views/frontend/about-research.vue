<script setup lang="ts">
import { ref } from 'vue';

// 假数据 - 研究院介绍
const instituteInfo = ref({
  name: '创新教育研究院',
  established: '2010年',
  mission: '致力于推动教育创新，培养未来人才',
  description: `
    创新教育研究院成立于2010年，是一家专注于教育创新研究与实践的专业机构。
    我们汇聚了国内外顶尖的教育专家、学者和实践者，共同探索教育改革的路径与方向。

    研究院以"推动教育创新，培养未来人才"为使命，致力于将先进的教育理念与实践相结合，
    为教育改革提供理论支持和实践指导。
  `,
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
  achievements: [
    {
      year: '2023',
      title: '获得国家级教育科研成果奖',
      description: '《数字化教学创新模式研究》获得一等奖',
    },
    {
      year: '2022',
      title: '完成100所智慧校园建设',
      description: '为全国100所学校提供智慧教育解决方案',
    },
    {
      year: '2021',
      title: '出版教育创新专著5部',
      description: '在教育核心期刊发表学术论文50余篇',
    },
  ],
  team: {
    total: 150,
    experts: 30,
    phd: 80,
    description: '拥有一支由教育专家、学者和资深教师组成的专业团队',
  },
});
</script>

<template>
  <div class="about-page p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">{{ instituteInfo.name }}</h1>
      <p class="mt-2 text-gray-600">成立于 {{ instituteInfo.established }}</p>
    </div>

    <!-- 使命宣言 -->
    <a-card class="mb-6" :bordered="false">
      <template #title>
        <span class="text-lg font-semibold">我们的使命</span>
      </template>
      <p class="text-xl text-center text-blue-600 py-4">
        {{ instituteInfo.mission }}
      </p>
      <div class="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
        {{ instituteInfo.description }}
      </div>
    </a-card>

    <!-- 研究领域 -->
    <a-card class="mb-6" title="研究领域" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="area in instituteInfo.researchAreas"
          :key="area.title"
          :xs="24"
          :sm="12"
          :lg="6"
        >
          <a-card class="h-full research-card" hoverable>
            <div class="text-center">
              <div class="text-4xl mb-3">{{ area.icon }}</div>
              <h3 class="text-lg font-semibold mb-2">{{ area.title }}</h3>
              <p class="text-gray-600 text-sm">{{ area.description }}</p>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 主要成就 -->
    <a-card class="mb-6" title="主要成就" :bordered="false">
      <a-timeline>
        <a-timeline-item
          v-for="achievement in instituteInfo.achievements"
          :key="achievement.year"
        >
          <template #dot>
            <span class="text-blue-600 font-bold">{{ achievement.year }}</span>
          </template>
          <div class="pl-4">
            <h4 class="font-semibold text-gray-900">{{ achievement.title }}</h4>
            <p class="text-gray-600 mt-1">{{ achievement.description }}</p>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <!-- 团队介绍 -->
    <a-card title="我们的团队" :bordered="false">
      <a-row :gutter="16" class="text-center">
        <a-col :span="8">
          <a-statistic
            title="团队成员"
            :value="instituteInfo.team.total"
            suffix="人"
          >
            <template #prefix>
              <span class="text-2xl">👥</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="8">
          <a-statistic
            title="专家顾问"
            :value="instituteInfo.team.experts"
            suffix="人"
          >
            <template #prefix>
              <span class="text-2xl">🎓</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="8">
          <a-statistic
            title="博士学历"
            :value="instituteInfo.team.phd"
            suffix="人"
          >
            <template #prefix>
              <span class="text-2xl">📜</span>
            </template>
          </a-statistic>
        </a-col>
      </a-row>
      <p class="mt-4 text-center text-gray-600">
        {{ instituteInfo.team.description }}
      </p>
    </a-card>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
}

.research-card {
  transition: transform 0.3s ease;
}

.research-card:hover {
  transform: translateY(-4px);
}
</style>
