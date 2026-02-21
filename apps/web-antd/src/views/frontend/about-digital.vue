<script setup lang="ts">
import { ref } from 'vue';

// 假数据 - 数字创新中心介绍
const digitalCenter = ref({
  name: '数字创新中心',
  established: '2015年',
  slogan: '数字化转型 · 创新驱动未来',
  description: `
    数字创新中心成立于2015年，是集技术研发、成果转化、人才培养于一体的综合性创新平台。
    中心以"数字化转型、创新驱动未来"为核心理念，致力于推动传统产业的数字化升级。

    我们拥有一支经验丰富的技术团队，在人工智能、大数据、云计算、物联网等前沿技术领域
    拥有深厚的技术积累和丰富的实践经验。
  `,
  services: [
    {
      title: '数字化解决方案',
      description: '为企业提供全方位的数字化转型咨询服务',
      icon: '💼',
      features: ['业务流程梳理', '系统架构设计', '技术选型建议'],
    },
    {
      title: '智能产品开发',
      description: '基于AI技术的智能化产品研发',
      icon: '🤖',
      features: ['智能算法设计', '产品原型开发', '系统集成部署'],
    },
    {
      title: '数据分析服务',
      description: '大数据采集、处理、分析和可视化',
      icon: '📈',
      features: ['数据采集平台', '分析模型构建', '可视化展示'],
    },
    {
      title: '技术培训',
      description: '前沿技术培训与人才培养',
      icon: '🎓',
      features: ['企业内训', '技术沙龙', '在线课程'],
    },
  ],
  techStack: [
    { name: '人工智能', level: 95, color: '#1890ff' },
    { name: '大数据', level: 90, color: '#52c41a' },
    { name: '云计算', level: 88, color: '#722ed1' },
    { name: '物联网', level: 85, color: '#fa8c16' },
    { name: '区块链', level: 80, color: '#eb2f96' },
  ],
  projects: [
    {
      name: '智慧城市管理系统',
      client: '某市政府',
      year: '2023',
      status: '已交付',
      description: '基于物联网和大数据技术的城市综合管理平台',
    },
    {
      name: '智能制造平台',
      client: '某制造企业',
      year: '2023',
      status: '实施中',
      description: '传统制造业数字化转型解决方案',
    },
    {
      name: '智能客服系统',
      client: '某金融机构',
      year: '2022',
      status: '已交付',
      description: '基于NLP技术的智能客户服务系统',
    },
  ],
  stats: {
    projects: 200,
    clients: 100,
    patents: 50,
    satisfaction: 98,
  },
});
</script>

<template>
  <div class="about-page p-6">
    <!-- 页面标题 -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-gray-900">{{ digitalCenter.name }}</h1>
      <p class="mt-2 text-gray-600">成立于 {{ digitalCenter.established }}</p>
      <p class="mt-3 text-xl text-blue-600 font-semibold">
        {{ digitalCenter.slogan }}
      </p>
    </div>

    <!-- 中心介绍 -->
    <a-card class="mb-6" :bordered="false">
      <template #title>
        <span class="text-lg font-semibold">中心介绍</span>
      </template>
      <div class="text-gray-700 leading-relaxed whitespace-pre-line">
        {{ digitalCenter.description }}
      </div>
    </a-card>

    <!-- 核心服务 -->
    <a-card class="mb-6" title="核心服务" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="service in digitalCenter.services"
          :key="service.title"
          :xs="24"
          :sm="12"
          :lg="6"
        >
          <a-card class="h-full service-card" hoverable>
            <div class="text-center">
              <div class="text-4xl mb-3">{{ service.icon }}</div>
              <h3 class="text-lg font-semibold mb-2">{{ service.title }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ service.description }}</p>
              <a-divider class="my-2" />
              <ul class="text-left text-sm text-gray-500">
                <li v-for="feature in service.features" :key="feature">
                  • {{ feature }}
                </li>
              </ul>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 技术栈 -->
    <a-card class="mb-6" title="技术实力" :bordered="false">
      <a-row :gutter="16">
        <a-col
          v-for="tech in digitalCenter.techStack"
          :key="tech.name"
          :xs="24"
          :sm="12"
          :lg="12"
          class="mb-4"
        >
          <div class="tech-item">
            <div class="flex justify-between mb-2">
              <span class="font-medium">{{ tech.name }}</span>
              <span class="text-gray-500">{{ tech.level }}%</span>
            </div>
            <a-progress
              :percent="tech.level"
              :stroke-color="tech.color"
              :show-info="false"
            />
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 成功案例 -->
    <a-card class="mb-6" title="成功案例" :bordered="false">
      <a-list :data-source="digitalCenter.projects" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <span class="font-semibold">{{ item.name }}</span>
              </template>
              <template #description>
                <div class="text-gray-600">
                  <p>客户：{{ item.client }}</p>
                  <p>年份：{{ item.year }}</p>
                  <p>{{ item.description }}</p>
                </div>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-tag :color="item.status === '已交付' ? 'green' : 'blue'">
                {{ item.status }}
              </a-tag>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 数据统计 -->
    <a-card title="中心数据" :bordered="false">
      <a-row :gutter="16" class="text-center">
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="完成项目"
            :value="digitalCenter.stats.projects"
            suffix="+"
          >
            <template #prefix>
              <span class="text-2xl">📦</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="服务客户"
            :value="digitalCenter.stats.clients"
            suffix="+"
          >
            <template #prefix>
              <span class="text-2xl">🏢</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="技术专利"
            :value="digitalCenter.stats.patents"
            suffix="+"
          >
            <template #prefix>
              <span class="text-2xl">📜</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-statistic
            title="客户满意度"
            :value="digitalCenter.stats.satisfaction"
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

.service-card {
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-4px);
}

.tech-item {
  padding: 8px 0;
}
</style>
