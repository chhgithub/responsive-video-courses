<script setup lang="ts">
const centerInfo = ref({
  title: '数字创新中心',
  heroImage: 'https://picsum.photos/seed/digital/1200/400',
  description: '数字创新中心致力于数字技术在教育领域的应用研究，探索教育数字化转型的新路径。',
  features: ['智慧教育平台', '在线学习系统', '教育大数据', '人工智能辅助'],
});
</script>

<template>
  <div class="digital-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1>{{ centerInfo.title }}</h1>
        <p>数字技术赋能教育，创新引领未来</p>
      </div>
    </div>

    <!-- 介绍 -->
    <el-card class="intro-card" shadow="never">
      <p class="description">{{ centerInfo.description }}</p>
    </el-card>

    <!-- 核心功能 -->
    <el-card class="features-card" shadow="never">
      <h2>核心功能</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="6" v-for="(feature, index) in centerInfo.features" :key="index">
          <div class="feature-box">
            <div class="feature-number">{{ index + 1 }}</div>
            <h3>{{ feature }}</h3>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 技术架构 -->
    <el-card class="tech-card" shadow="never">
      <h2>技术架构</h2>
      <el-timeline>
        <el-timeline-item timestamp="2020" color="#409eff">
          <h3>平台建设</h3>
          <p>搭建在线教育平台，实现教学资源数字化</p>
        </el-timeline-item>
        <el-timeline-item timestamp="2022" color="#67c23a">
          <h3>数据分析</h3>
          <p>引入大数据分析技术，优化学习体验</p>
        </el-timeline-item>
        <el-timeline-item timestamp="2024" color="#e6a23c">
          <h3>AI 赋能</h3>
          <p>应用人工智能技术，实现个性化学习</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 成果展示 -->
    <el-card class="achievements-card" shadow="never">
      <h2>成果展示</h2>
      <el-row :gutter="24" class="stats-row">
        <el-col :xs="12" :sm="6" v-for="stat in [
          { label: '服务用户', value: '50万+' },
          { label: '合作学校', value: '100+' },
          { label: '课程资源', value: '1万+' },
          { label: '专利成果', value: '20+' },
        ]" :key="stat.label">
          <div class="stat-item">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.digital-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: $spacing-extra-extra-large 0;
  text-align: center;
  margin-bottom: $spacing-extra-large;

  h1 {
    font-size: 48px;
    margin-bottom: $spacing-base;
  }

  p {
    font-size: $font-size-large;
    opacity: 0.9;
  }
}

.intro-card {
  margin-bottom: $spacing-extra-large;

  .description {
    font-size: $font-size-large;
    line-height: 1.8;
    color: $text-color-regular;
    text-align: center;
    padding: $spacing-extra-large 0;
  }
}

.features-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .feature-box {
    text-align: center;
    padding: $spacing-extra-large;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: $border-radius-large;
    color: #fff;

    .feature-number {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: $spacing-base;
      opacity: 0.3;
    }

    h3 {
      font-size: $font-size-large;
      margin: 0;
    }
  }
}

.tech-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-extra-large;
    text-align: center;
  }
}

.achievements-card {
  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .stats-row {
    .stat-item {
      text-align: center;
      padding: $spacing-extra-large 0;

      .stat-value {
        font-size: 36px;
        font-weight: 600;
        color: $--el-color-primary;
        margin-bottom: $spacing-small;
      }

      .stat-label {
        font-size: $font-size-base;
        color: $text-color-secondary;
      }
    }
  }
}
</style>
