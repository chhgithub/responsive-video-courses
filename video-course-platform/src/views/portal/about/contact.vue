<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { publicAboutUsApi } from '@/api/public/introduction';
import { initAboutUsData } from '@/utils/about-us-init';
import type { AboutUsInfo } from '@/types/introduction';

const loading = ref(false);
const contactData = ref<AboutUsInfo | null>(null);

onMounted(async () => {
  initAboutUsData();
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await publicAboutUsApi.getContact();
    console.log('获取到的联系我们数据:', data);
    if (data && data.isPublished) {
      contactData.value = data;
    } else {
      contactData.value = null;
    }
  } catch (error) {
    console.error('加载失败:', error);
    contactData.value = null;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-loading="loading" class="about-page">
    <!-- 未发布提示 -->
    <el-empty v-if="!contactData && !loading" description="暂无内容">
      <el-button type="primary" @click="$router.push('/portal')">返回首页</el-button>
    </el-empty>

    <!-- 内容区域 -->
    <template v-else-if="contactData">
      <!-- Hero Section -->
      <section
        class="hero-section"
        :style="{ backgroundImage: contactData.coverImage ? `url(${contactData.coverImage})` : '' }"
      >
        <div class="hero-overlay">
          <div class="container">
            <div class="hero-content">
              <h1 class="hero-title">{{ contactData.title }}</h1>
              <p class="hero-subtitle">随时为您服务，期待与您合作</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 内容区域 -->
      <section class="content-section">
        <div class="container">
          <div class="content-wrapper">
            <!-- 联系方式信息卡片 -->
            <el-card v-if="contactData.contactInfo" class="contact-info-card" shadow="hover">
              <div class="contact-grid">
                <div v-if="contactData.contactInfo.phone" class="contact-item">
                  <div class="contact-icon">
                    <el-icon><Phone /></el-icon>
                  </div>
                  <div class="contact-details">
                    <p class="contact-label">咨询电话</p>
                    <p class="contact-value">{{ contactData.contactInfo.phone }}</p>
                  </div>
                </div>

                <div v-if="contactData.contactInfo.email" class="contact-item">
                  <div class="contact-icon">
                    <el-icon><Message /></el-icon>
                  </div>
                  <div class="contact-details">
                    <p class="contact-label">电子邮箱</p>
                    <p class="contact-value">{{ contactData.contactInfo.email }}</p>
                  </div>
                </div>

                <div v-if="contactData.contactInfo.address" class="contact-item full-width">
                  <div class="contact-icon">
                    <el-icon><Location /></el-icon>
                  </div>
                  <div class="contact-details">
                    <p class="contact-label">地址</p>
                    <p class="contact-value">{{ contactData.contactInfo.address }}</p>
                  </div>
                </div>

                <div v-if="contactData.contactInfo.workingHours" class="contact-item full-width">
                  <div class="contact-icon">
                    <el-icon><Clock /></el-icon>
                  </div>
                  <div class="contact-details">
                    <p class="contact-label">工作时间</p>
                    <p class="contact-value">{{ contactData.contactInfo.workingHours }}</p>
                  </div>
                </div>

                <div v-if="contactData.contactInfo.wechatAccount" class="contact-item">
                  <div class="contact-icon">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="contact-details">
                    <p class="contact-label">微信公众号</p>
                    <p class="contact-value">{{ contactData.contactInfo.wechatAccount }}</p>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 内容卡片 -->
            <el-card class="content-card" shadow="hover">
              <article class="content" v-html="contactData.content"></article>
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

// Contact Info Card
.contact-info-card {
  margin-bottom: $spacing-extra-large;

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-large;

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: $spacing-base;
      padding: $spacing-large;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: $border-radius-base;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $box-shadow-card;
      }

      &.full-width {
        grid-column: 1 / -1;
      }

      .contact-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $primary-color;
        border-radius: 50%;
        color: #fff;

        .el-icon {
          font-size: 24px;
        }
      }

      .contact-details {
        flex: 1;

        .contact-label {
          font-size: $font-size-small;
          color: $text-color-secondary;
          margin-bottom: $spacing-small / 2;
        }

        .contact-value {
          font-size: $font-size-base;
          font-weight: 600;
          color: $text-color-primary;
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  }
}

// Content Card
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

    :deep(p) {
      font-size: $font-size-base;
      line-height: 1.8;
      color: $text-color-regular;
      margin-bottom: $spacing-base;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
