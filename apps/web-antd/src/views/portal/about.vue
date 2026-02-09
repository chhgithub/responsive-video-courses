<script lang="ts" setup>
import { ref } from 'vue';

// 平台数据
const platformInfo = ref({
  title: '视频课程平台',
  description: '专业的在线视频课程学习平台，提供高质量的职业教育课程',
  features: [
    {
      icon: '📚',
      title: '海量课程',
      description: '涵盖IT、设计、营销等多个领域的专业课程',
    },
    {
      icon: '🎓',
      title: '专业师资',
      description: '行业专家倾心打造，实战经验丰富',
    },
    {
      icon: '💻',
      title: '随时学习',
      description: '支持多端学习，随时随地想学就学',
    },
    {
      icon: '🏆',
      title: '权威认证',
      description: '完成课程获得认证证书，助力职业发展',
    },
  ],
  stats: [
    { label: '注册学员', value: '10,000+' },
    { label: '精品课程', value: '500+' },
    { label: '专业讲师', value: '100+' },
    { label: '满意率', value: '98%' },
  ],
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Banner -->
    <section class="hero-section">
      <div class="container mx-auto px-4 py-16 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">关于我们</h1>
        <p class="text-xl text-gray-100">
          {{ platformInfo.description }}
        </p>
      </div>
    </section>

    <!-- 平台特色 -->
    <section class="features-section py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-800">
          平台特色
        </h2>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in platformInfo.features"
            :key="feature.title"
            class="feature-card rounded-lg p-6 text-center shadow-md transition-shadow hover:shadow-lg"
          >
            <div class="mb-4 text-5xl">{{ feature.icon }}</div>
            <h3 class="mb-2 text-xl font-bold text-gray-800">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section bg-blue-50 py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div
            v-for="stat in platformInfo.stats"
            :key="stat.label"
            class="text-center"
          >
            <div class="text-4xl font-bold text-blue-600">
              {{ stat.value }}
            </div>
            <div class="text-gray-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 平台简介 -->
    <section class="intro-section py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-3xl">
          <h2 class="mb-8 text-center text-3xl font-bold text-gray-800">
            平台简介
          </h2>
          <div class="prose prose-lg mx-auto">
            <p class="leading-relaxed text-gray-600">
              {{
                platformInfo.title
              }}致力于为学习者提供优质的在线学习体验。我们汇集了行业顶尖的专家讲师，
              精心设计每一门课程，确保课程内容的实用性和前瞻性。
            </p>
            <p class="leading-relaxed text-gray-600">
              平台采用先进的教学理念，结合视频教学、在线练习、互动讨论等多种学习方式，
              帮助学员快速掌握专业技能。无论你是职场新人还是资深从业者，
              都能在这里找到适合自己的课程。
            </p>
            <p class="leading-relaxed text-gray-600">
              我们已服务超过 10,000 名学员，覆盖 IT
              技术、设计创意、数字营销、职场技能等多个领域。
              未来，我们将继续拓展课程领域，为更多学习者提供优质的教育资源。
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 64px - 300px);
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-card {
  background: white;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
}
</style>
