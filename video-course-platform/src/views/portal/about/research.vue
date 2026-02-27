<script setup lang="ts">
import { ref } from 'vue';

const instituteInfo = ref({
  title: '关于研究院',
  heroImage: 'https://picsum.photos/seed/research/1200/400',
  content: `
    <h2>研究院简介</h2>
    <p>创新教育研究院成立于2010年，是一家专注于教育创新研究与实践的专业机构。</p>
    <p>我们汇聚了国内外顶尖的教育专家、学者和实践者，共同探索教育改革的路径与方向。</p>

    <h2>研究使命</h2>
    <p>致力于推动教育理论与实践的创新融合，为21世纪人才培养提供科学指导。</p>
    <p>关注教育技术、课程设计、评价体系等多个研究领域。</p>

    <h2>研究成果</h2>
    <ul>
      <li>发表学术论文100余篇</li>
      <li>承担国家级课题20余项</li>
      <li>出版专著10余部</li>
      <li>获得专利30余项</li>
    </ul>

    <h2>合作伙伴</h2>
    <p>与国内外知名高校、研究机构建立深度合作关系。</p>
  `,
});
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1>{{ instituteInfo.title }}</h1>
        <p>探索教育创新，引领未来教育发展方向</p>
      </div>
    </div>

    <!-- 内容区域 -->
    <el-card class="content-card" shadow="never">
      <div class="content" v-html="instituteInfo.content"></div>
    </el-card>

    <!-- 核心理念 -->
    <el-card class="features-card" shadow="never">
      <h2>核心理念</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="6" v-for="item in 4" :key="item">
          <div class="feature-item">
            <div class="feature-icon">💡</div>
            <h3>创新驱动</h3>
            <p>以创新思维引领教育改革</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 研究团队 -->
    <el-card class="team-card" shadow="never">
      <h2>研究团队</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" v-for="i in 6" :key="i">
          <div class="team-member">
            <el-avatar :size="80" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=research${i}`" />
            <h4>研究员{{ i }}</h4>
            <p>教育技术专家</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.about-page {
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

.content-card {
  margin-bottom: $spacing-extra-large;

  .content {
    h2 {
      font-size: 24px;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
      margin-top: $spacing-large;
      &:first-child {
        margin-top: 0;
      }
    }

    p {
      font-size: $font-size-base;
      line-height: 1.8;
      color: $text-color-regular;
      margin-bottom: $spacing-base;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul {
      li {
        padding: $spacing-small 0;
        font-size: $font-size-base;
        color: $text-color-regular;
        line-height: 1.8;
      }
    }
  }
}

.features-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .feature-item {
    text-align: center;
    padding: $spacing-large;

    .feature-icon {
      font-size: 48px;
      margin-bottom: $spacing-base;
    }

    h3 {
      font-size: $font-size-large;
      margin-bottom: $spacing-small;
      color: $text-color-primary;
    }

    p {
      font-size: $font-size-base;
      color: $text-color-secondary;
    }
  }
}

.team-card {
  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .team-member {
    text-align: center;
    padding: $spacing-large;
    background: #f9fafc;
    border-radius: $border-radius-large;

    h4 {
      font-size: $font-size-medium;
      margin: $spacing-small 0;
      color: $text-color-primary;
    }

    p {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin: 0;
    }
  }
}
</style>
