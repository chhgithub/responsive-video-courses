<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { publicAboutUsApi } from '@/api/public/introduction';
import { initAboutUsData } from '@/utils/about-us-init';
import type { AboutUsInfo } from '@/types/introduction';

const loading = ref(false);
const educationInfo = ref<AboutUsInfo | null>(null);

onMounted(async () => {
  initAboutUsData();
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await publicAboutUsApi.getEducation();
    console.log('获取到的教育培训中心数据:', data);
    if (data && data.isPublished) {
      educationInfo.value = data;
    } else {
      educationInfo.value = null;
    }
  } catch (error) {
    console.error('加载失败:', error);
    educationInfo.value = null;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-loading="loading" class="about-page">
    <!-- 未发布提示 -->
    <el-empty v-if="!educationInfo && !loading" description="暂无内容">
      <el-button type="primary" @click="$router.push('/portal')">返回首页</el-button>
    </el-empty>

    <!-- 内容区域 -->
    <template v-else-if="educationInfo">
      <!-- Hero Section -->
      <section
        class="hero-section"
        :style="{ backgroundImage: educationInfo.coverImage ? `url(${educationInfo.coverImage})` : '' }"
      >
        <div class="hero-overlay">
          <div class="container">
            <div class="hero-content">
              <h1 class="hero-title">{{ educationInfo.title }}</h1>
              <p class="hero-subtitle">培养专业人才，成就卓越未来</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 内容区域 -->
      <section class="content-section">
        <div class="container">
          <div class="content-wrapper">
            <!-- 内容卡片 -->
            <el-card class="content-card" shadow="hover">
              <article class="content" v-html="educationInfo.content"></article>
            </el-card>
          </div>
        </div>
      </section>
    </template>
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

// Hero Section
.hero-section {
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #667eea;
  margin-bottom: $spacing-extra-large;

  .hero-overlay {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
    padding: $spacing-extra-extra-large 0;

    .hero-content {
      text-align: center;
      color: #fff;
      animation: fadeInUp 0.8s ease-out;

      .hero-title {
        font-size: 48px;
        font-weight: bold;
        margin: 0 0 $spacing-base 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

        @media (max-width: 768px) {
          font-size: 32px;
        }
      }

      .hero-subtitle {
        font-size: $font-size-large;
        opacity: 0.95;
        margin: 0;

        @media (max-width: 768px) {
          font-size: $font-size-base;
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Content Section
.content-section {
  padding-bottom: $spacing-extra-extra-large;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.content-card {
  margin-bottom: $spacing-extra-large;
  border-radius: $border-radius-large;

  .content {
    :deep(h2) {
      font-size: 32px;
      color: $text-color-primary;
      margin-top: $spacing-extra-large;
      margin-bottom: $spacing-large;
      padding-bottom: $spacing-base;
      border-bottom: 3px solid $primary-color;

      &:first-child {
        margin-top: 0;
      }

      @media (max-width: 768px) {
        font-size: 24px;
      }
    }

    :deep(h3) {
      font-size: 24px;
      color: $text-color-primary;
      margin-top: $spacing-large;
      margin-bottom: $spacing-base;

      @media (max-width: 768px) {
        font-size: 20px;
      }
    }

    :deep(p) {
      font-size: $font-size-base;
      line-height: 1.8;
      color: $text-color-regular;
      margin-bottom: $spacing-base;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(ul) {
      list-style: none;
      padding-left: 0;
      margin-bottom: $spacing-base;

      li {
        position: relative;
        padding: $spacing-small 0 $spacing-small $spacing-large + $spacing-small;
        margin-bottom: $spacing-small;
        line-height: 1.8;
        color: $text-color-regular;

        &::before {
          content: '•';
          position: absolute;
          left: 0;
          color: $primary-color;
          font-size: 20px;
          font-weight: bold;
        }
      }
    }

    :deep(strong) {
      color: $text-color-primary;
      font-weight: 600;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: $border-radius-base;
      margin: $spacing-large 0;
      box-shadow: $box-shadow-card;
    }
  }
}
</style>
