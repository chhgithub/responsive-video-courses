<script setup lang="ts">
const educationInfo = ref({
  title: '关于教育培训中心',
  heroImage: 'https://picsum.photos/seed/education/1200/400',
  mission: '培养具有国际视野和创新能力的复合型人才',
  programs: [
    { name: '职业技能培训', icon: '💼', desc: '提升职场竞争力' },
    { name: '素质教育课程', icon: '🎨', desc: '全面发展综合素质' },
    { name: '国际交流项目', icon: '🌍', desc: '拓展国际视野' },
    { name: '创新创业教育', icon: '🚀', desc: '培养创新思维' },
  ],
  stats: [
    { label: '培训学员', value: '10万+' },
    { label: '合作企业', value: '500+' },
    { label: '认证讲师', value: '200+' },
    { label: '就业率', value: '95%' },
  ],
});
</script>

<template>
  <div class="education-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1>{{ educationInfo.title }}</h1>
        <p>{{ educationInfo.mission }}</p>
      </div>
    </div>

    <!-- 培训项目 -->
    <el-card class="programs-card" shadow="never">
      <h2>培训项目</h2>
      <el-row :gutter="24">
        <el-col :xs="12" :sm="12" :md="6" v-for="(program, index) in educationInfo.programs" :key="index">
          <div class="program-item">
            <div class="program-icon">{{ program.icon }}</div>
            <h3>{{ program.name }}</h3>
            <p>{{ program.desc }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 培训流程 -->
    <el-card class="process-card" shadow="never">
      <h2>培训流程</h2>
      <el-steps :active="1" process-status="success" align-center>
        <el-step title="需求调研" description="了解企业和个人培训需求" />
        <el-step title="方案设计" description="制定个性化培训方案" />
        <el-step title="培训实施" description="专业讲师团队授课" />
        <el-step title="效果评估" description="培训效果跟踪与反馈" />
      </el-steps>
    </el-card>

    <!-- 成果数据 -->
    <el-card class="stats-card" shadow="never">
      <h2>培训成果</h2>
      <el-row :gutter="24" class="stats-grid">
        <el-col :xs="12" :sm="6" v-for="stat in educationInfo.stats" :key="stat.label">
          <div class="stat-box">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 合作伙伴 -->
    <el-card class="partners-card" shadow="never">
      <h2>合作伙伴</h2>
      <p class="intro-text">我们与众多知名企业和教育机构建立了深度合作关系</p>
      <div class="partners-logos">
        <div v-for="i in 8" :key="i" class="partner-logo">
          <el-tag size="large" effect="plain">合作伙伴 {{ i }}</el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.education-page {
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

.programs-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .program-item {
    text-align: center;
    padding: $spacing-extra-large;
    background: #f9fafc;
    border-radius: $border-radius-large;

    .program-icon {
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
      margin: 0;
    }
  }
}

.process-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-extra-large;
    text-align: center;
  }
}

.stats-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .stats-grid {
    .stat-box {
      text-align: center;
      padding: $spacing-extra-large;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: $border-radius-large;
      color: #fff;

      .stat-label {
        font-size: $font-size-base;
        opacity: 0.9;
        margin-bottom: $spacing-small;
      }

      .stat-value {
        font-size: 36px;
        font-weight: 600;
      }
    }
  }
}

.partners-card {
  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .intro-text {
    text-align: center;
    font-size: $font-size-large;
    color: $text-color-secondary;
    margin-bottom: $spacing-extra-large;
  }

  .partners-logos {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-large;
    justify-content: center;

    .partner-logo {
      flex: 1;
      min-width: 150px;
      text-align: center;
    }
  }
}
</style>
