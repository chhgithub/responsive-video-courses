<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  {
    title: '课程兑换',
    description: '使用兑换码获取课程访问权限',
    icon: 'Ticket',
    path: '/portal/general/redeem',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: '我的兑换',
    description: '查看已兑换的课程和学习进度',
    icon: 'Document',
    path: '/portal/general/my-courses',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    requiresAuth: true,
  },
];

function handleMenuClick(item: any) {
  if (item.requiresAuth) {
    // Auth check will be handled by router meta
  }
  router.push(item.path);
}
</script>

<template>
  <div class="general-education-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">通识教育</h1>
            <p class="hero-subtitle">拓宽知识面，提升综合素养</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="menu-section">
      <div class="container">
        <div class="menu-grid">
          <div
            v-for="item in menuItems"
            :key="item.path"
            class="menu-card"
            @click="handleMenuClick(item)"
          >
            <div class="card-icon" :style="{ background: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <div class="card-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 说明卡片 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <h3>使用说明</h3>
          </template>
          <div class="info-content">
            <div class="info-item">
              <el-icon class="info-icon" color="#409eff"><CircleCheck /></el-icon>
              <div class="info-text">
                <h4>获取兑换码</h4>
                <p>联系您所在的单位（学校或企业）获取课程兑换码</p>
              </div>
            </div>
            <div class="info-item">
              <el-icon class="info-icon" color="#67C23A"><CircleCheck /></el-icon>
              <div class="info-text">
                <h4>兑换课程</h4>
                <p>在"课程兑换"页面输入兑换码，确认课程信息后完成兑换</p>
              </div>
            </div>
            <div class="info-item">
              <el-icon class="info-icon" color="#E6A23C"><CircleCheck /></el-icon>
              <div class="info-text">
                <h4>开始学习</h4>
                <p>兑换成功后，您将获得30天的课程访问权限，可随时开始学习</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.general-education-page {
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

      .hero-title {
        font-size: 48px;
        font-weight: bold;
        margin: 0 0 $spacing-base 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .hero-subtitle {
        font-size: $font-size-large;
        opacity: 0.95;
        margin: 0;
      }
    }
  }
}

// Menu Section
.menu-section {
  padding-bottom: $spacing-extra-extra-large;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: $spacing-large;
  margin-bottom: $spacing-extra-large;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.menu-card {
  background: #fff;
  border-radius: $border-radius-large;
  padding: $spacing-extra-large;
  display: flex;
  align-items: center;
  gap: $spacing-large;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: $box-shadow-card;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-base;
  }

  .card-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 32px;
      color: #fff;
    }
  }

  .card-content {
    flex: 1;

    h3 {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0 0 $spacing-small 0;
    }

    p {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin: 0;
    }
  }

  .card-arrow {
    color: $text-color-secondary;
    flex-shrink: 0;

    .el-icon {
      font-size: 24px;
    }
  }
}

.info-card {
  :deep(.el-card__header) {
    background: #f5f7fa;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-medium;
      color: $text-color-primary;
      margin: 0;
    }
  }
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-large;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.info-item {
  display: flex;
  gap: $spacing-base;

  .info-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .info-text {
    h4 {
      font-size: $font-size-base;
      color: $text-color-primary;
      margin: 0 0 $spacing-small 0;
    }

    p {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin: 0;
      line-height: 1.6;
    }
  }
}
</style>
