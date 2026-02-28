<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getPublishedIntros } from '@/utils/general-education-storage';
import { GeneralCategory, GeneralContentType } from '@/types/general-education.d';

const loading = ref(false);
const activeTab = ref<'family' | 'school'>('family');

const familyIntro = ref<any>(null);
const schoolIntro = ref<any>(null);

// 计算当前显示的内容
const currentIntro = computed(() => {
  return activeTab.value === 'family' ? familyIntro.value : schoolIntro.value;
});

// 计算当前主题配置
const currentTheme = computed(() => {
  return activeTab.value === 'family'
    ? {
        primaryColor: '#ff6b6b',
        secondaryColor: '#ffa502',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%)',
        bgColor: '#fff5f5',
        icon: 'House',
      }
    : {
        primaryColor: '#4ecdc4',
        secondaryColor: '#44a08d',
        gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        bgColor: '#f0fffe',
        icon: 'School',
      };
});

// 切换Tab
function switchTab(tab: 'family' | 'school') {
  activeTab.value = tab;
}

// 加载已发布的介绍内容
async function loadIntros() {
  loading.value = true;
  try {
    const published = getPublishedIntros();

    const family = published
      .filter(i => i.category === GeneralCategory.FAMILY && i.type === GeneralContentType.INTRO)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const school = published
      .filter(i => i.category === GeneralCategory.SCHOOL && i.type === GeneralContentType.INTRO)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // 取第一条
    familyIntro.value = family.length > 0 ? family[0] : null;
    schoolIntro.value = school.length > 0 ? school[0] : null;
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadIntros();
});
</script>

<template>
  <div class="general-education-intro">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-circle circle-1"></div>
        <div class="hero-circle circle-2"></div>
        <div class="hero-circle circle-3"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <el-icon><Reading /></el-icon>
            通识教育
          </div>
          <h1 class="hero-title">拓宽视野，提升综合素养</h1>
          <p class="hero-subtitle">
            家庭教育与校园教育相结合，为孩子成长提供全方位支持
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">2</div>
              <div class="stat-label">教育板块</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">100%</div>
              <div class="stat-label">专业内容</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">∞</div>
              <div class="stat-label">成长可能</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 介绍内容 -->
    <section class="intro-section">
      <div class="container">
        <!-- 自定义卡片式Tab -->
        <div class="custom-tabs">
          <div
            class="tab-card"
            :class="{ active: activeTab === 'family' }"
            @click="switchTab('family')"
          >
            <div class="tab-card-icon family-icon">
              <el-icon><House /></el-icon>
            </div>
            <div class="tab-card-content">
              <h3 class="tab-card-title">家庭教育</h3>
              <p class="tab-card-desc">家庭是孩子的第一所学校</p>
            </div>
            <div class="tab-card-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>

          <div
            class="tab-card"
            :class="{ active: activeTab === 'school' }"
            @click="switchTab('school')"
          >
            <div class="tab-card-icon school-icon">
              <el-icon><School /></el-icon>
            </div>
            <div class="tab-card-content">
              <h3 class="tab-card-title">校园教育</h3>
              <p class="tab-card-desc">学校是知识的殿堂</p>
            </div>
            <div class="tab-card-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 内容展示区域 -->
        <div v-loading="loading" class="content-wrapper">
          <div
            v-if="currentIntro"
            class="intro-detail"
            :style="{ '--primary-color': currentTheme.primaryColor }"
          >
            <!-- 内容头部 -->
            <div class="intro-header">
              <div class="header-icon" :style="{ background: currentTheme.gradient }">
                <el-icon v-if="activeTab === 'family'"><House /></el-icon>
                <el-icon v-else><School /></el-icon>
              </div>
              <div class="header-text">
                <h2 class="intro-title">{{ currentIntro.title }}</h2>
                <div class="intro-meta">
                  <span class="meta-tag">
                    <el-icon><Document /></el-icon>
                    精选内容
                  </span>
                  <span class="meta-tag">
                    <el-icon><View /></el-icon>
                    专业解读
                  </span>
                </div>
              </div>
            </div>

            <!-- 内容主体 -->
            <div class="intro-content" v-html="currentIntro.content"></div>

            <!-- 底部装饰 -->
            <div class="intro-footer">
              <div class="footer-decoration"></div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-else
            :description="activeTab === 'family' ? '暂无家庭教育介绍内容' : '暂无校园教育介绍内容'"
            :image-size="200"
          >
            <template #image>
              <div class="empty-illustration">
                <el-icon class="empty-icon"><DocumentDelete /></el-icon>
              </div>
            </template>
          </el-empty>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/styles/variables.scss";

.general-education-intro {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Hero Section
.hero-section {
  position: relative;
  padding: $spacing-extra-extra-large 0;
  overflow: hidden;

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 0;

    .hero-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      animation: float 20s infinite ease-in-out;

      &.circle-1 {
        width: 400px;
        height: 400px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
        top: -100px;
        right: -100px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 300px;
        height: 300px;
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        bottom: -50px;
        left: -50px;
        animation-delay: 5s;
      }

      &.circle-3 {
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation-delay: 10s;
      }
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-30px) rotate(10deg);
    }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: $spacing-small;
      padding: $spacing-small $spacing-large;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border: 2px solid rgba(102, 126, 234, 0.3);
      border-radius: 50px;
      color: #667eea;
      font-weight: 600;
      font-size: $font-size-base;
      margin-bottom: $spacing-large;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
      }
    }

    .hero-title {
      font-size: 52px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 $spacing-large 0;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: $font-size-extra-large;
      color: $text-color-secondary;
      margin: 0 auto $spacing-extra-large 0;
      max-width: 600px;
      line-height: 1.6;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: $spacing-large;
      margin-top: $spacing-extra-large;

      .stat-item {
        text-align: center;

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: $font-size-small;
          color: $text-color-secondary;
          margin-top: $spacing-small;
        }
      }

      .stat-divider {
        width: 1px;
        height: 40px;
        background: linear-gradient(180deg, transparent 0%, $border-color-base 50%, transparent 100%);
      }
    }
  }
}

// Intro Section
.intro-section {
  padding-bottom: $spacing-extra-extra-large;
}

// 自定义卡片式Tab
.custom-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-large;
  margin-bottom: $spacing-extra-large;

  .tab-card {
    display: flex;
    align-items: center;
    gap: $spacing-large;
    padding: $spacing-large;
    background: #fff;
    border: 2px solid transparent;
    border-radius: $border-radius-extra-large;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: $box-shadow-card;
    }

    &.active {
      border-color: var(--tab-color, #667eea);
      background: var(--tab-bg, #f0f5ff);

      &::before {
        opacity: 0.05;
      }

      .tab-card-icon {
        transform: scale(1.1);
      }
    }

    &:nth-child(1) {
      --tab-color: #ff6b6b;
      --tab-bg: #fff5f5;

      &::before {
        background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
      }
    }

    &:nth-child(2) {
      --tab-color: #4ecdc4;
      --tab-bg: #f0fffe;

      &::before {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      }
    }

    .tab-card-icon {
      position: relative;
      z-index: 1;
      width: 80px;
      height: 80px;
      border-radius: $border-radius-large;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: #fff;
      transition: all 0.3s ease;
      flex-shrink: 0;

      &.family-icon {
        background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
      }

      &.school-icon {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      }
    }

    .tab-card-content {
      position: relative;
      z-index: 1;
      flex: 1;

      .tab-card-title {
        font-size: $font-size-extra-large;
        font-weight: 700;
        color: $text-color-primary;
        margin: 0 0 $spacing-small 0;
      }

      .tab-card-desc {
        font-size: $font-size-base;
        color: $text-color-secondary;
        margin: 0;
      }
    }

    .tab-card-arrow {
      position: relative;
      z-index: 1;
      font-size: 20px;
      color: var(--tab-color);
      transition: transform 0.3s ease;

      .tab-card.active & {
        transform: rotate(90deg);
      }
    }
  }
}

// 内容展示区域
.content-wrapper {
  min-height: 400px;
}

.intro-detail {
  position: relative;
  background: #fff;
  border-radius: $border-radius-extra-large;
  padding: $spacing-extra-extra-large;
  box-shadow: $box-shadow-card;
  border: 2px solid transparent;
  background-clip: padding-box;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: var(--primary-color);
    border-radius: $border-radius-extra-large;
    z-index: -1;
    opacity: 0.1;
  }

  .intro-header {
    display: flex;
    align-items: center;
    gap: $spacing-large;
    margin-bottom: $spacing-extra-large;
    padding-bottom: $spacing-large;
    border-bottom: 2px solid $border-color-lighter;

    .header-icon {
      width: 80px;
      height: 80px;
      border-radius: $border-radius-large;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .header-text {
      flex: 1;

      .intro-title {
        font-size: 36px;
        font-weight: 700;
        color: $text-color-primary;
        margin: 0 0 $spacing-base 0;
      }

      .intro-meta {
        display: flex;
        gap: $spacing-base;

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: $spacing-small;
          padding: $spacing-small $spacing-base;
          background: $background-color-base;
          border-radius: $border-radius-base;
          font-size: $font-size-small;
          color: $text-color-secondary;

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }

  .intro-content {
    font-size: $font-size-large;
    line-height: 2;
    color: $text-color-regular;

    // 富文本内容样式
    :deep(h1),
    :deep(h2),
    :deep(h3) {
      margin-top: $spacing-extra-large;
      margin-bottom: $spacing-large;
      color: $text-color-primary;
      font-weight: 700;
    }

    :deep(h1) {
      font-size: 32px;
      padding-left: $spacing-large;
      border-left: 4px solid var(--primary-color);
    }

    :deep(h2) {
      font-size: 28px;
      padding-left: $spacing-large;
      border-left: 4px solid var(--primary-color);
    }

    :deep(h3) {
      font-size: 24px;
      padding-left: $spacing-large;
      border-left: 3px solid var(--primary-color);
    }

    :deep(p) {
      margin-bottom: $spacing-large;
      text-align: justify;
    }

    :deep(img) {
      max-width: 100%;
      border-radius: $border-radius-large;
      margin: $spacing-extra-large 0;
      box-shadow: $box-shadow-card;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: $spacing-large;
      padding-left: $spacing-extra-large;

      li {
        margin-bottom: $spacing-base;
        position: relative;

        &::marker {
          color: var(--primary-color);
          font-weight: bold;
        }
      }
    }

    :deep(blockquote) {
      margin: $spacing-large 0;
      padding: $spacing-large $spacing-extra-large;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-left: 4px solid var(--primary-color);
      border-radius: $border-radius-large;
      color: $text-color-secondary;
      font-style: italic;
      position: relative;

      &::before {
        content: '"';
        position: absolute;
        top: $spacing-base;
        left: $spacing-base;
        font-size: 48px;
        color: var(--primary-color);
        opacity: 0.2;
        font-family: Georgia, serif;
      }
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: $spacing-extra-large 0;
      border-radius: $border-radius-large;
      overflow: hidden;
      box-shadow: $box-shadow-light;

      th, td {
        padding: $spacing-large;
        text-align: left;
        border-bottom: 1px solid $border-color-lighter;
      }

      th {
        background: var(--primary-color);
        color: #fff;
        font-weight: 600;
        font-size: $font-size-base;
      }

      tr {
        transition: background 0.2s ease;

        &:hover {
          background: $background-color-base;
        }

        &:last-child {
          td {
            border-bottom: none;
          }
        }
      }
    }

    :deep(strong) {
      color: var(--primary-color);
      font-weight: 700;
    }

    :deep(code) {
      padding: $spacing-small $spacing-base;
      background: $background-color-base;
      border: 1px solid $border-color-light;
      border-radius: $border-radius-small;
      font-family: 'Courier New', monospace;
      color: #e74c3c;
    }

    :deep(pre) {
      padding: $spacing-large;
      background: #2c3e50;
      border-radius: $border-radius-large;
      overflow-x: auto;
      margin: $spacing-large 0;

      code {
        background: transparent;
        border: none;
        color: #ecf0f1;
        padding: 0;
      }
    }
  }

  .intro-footer {
    margin-top: $spacing-extra-large;
    padding-top: $spacing-large;
    border-top: 1px solid $border-color-lighter;

    .footer-decoration {
      height: 4px;
      background: linear-gradient(90deg,
        var(--primary-color) 0%,
        rgba(255, 255, 255, 0) 100%);
      border-radius: 2px;
    }
  }
}

// 空状态
.empty-illustration {
  .empty-icon {
    font-size: 100px;
    color: $border-color-base;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .hero-content {
    .hero-badge {
      font-size: $font-size-small;
    }

    .hero-title {
      font-size: 32px !important;
    }

    .hero-subtitle {
      font-size: $font-size-base !important;
    }

    .hero-stats {
      flex-direction: column;
      gap: $spacing-base;

      .stat-divider {
        width: 40px;
        height: 1px;
      }
    }
  }

  .custom-tabs {
    grid-template-columns: 1fr;

    .tab-card {
      .tab-card-icon {
        width: 60px;
        height: 60px;
        font-size: 28px;
      }

      .tab-card-content .tab-card-title {
        font-size: $font-size-large;
      }
    }
  }

  .intro-detail {
    padding: $spacing-large;

    .intro-header {
      flex-direction: column;
      text-align: center;

      .header-icon {
        width: 60px;
        height: 60px;
        font-size: 28px;
      }

      .intro-title {
        font-size: 24px !important;
      }

      .intro-meta {
        justify-content: center;
      }
    }
  }
}
</style>
