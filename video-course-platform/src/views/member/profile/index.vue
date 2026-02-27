<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { getUserInfo } from '@/utils/member-storage';

const router = useRouter();

// 用户信息
const userInfo = computed(() => getUserInfo());

// 菜单项
const menuItems = [
  { key: 'courses', label: '我的课程', icon: '📚', route: '/member/profile/courses' },
  { key: 'orders', label: '订单记录', icon: '📋', route: '/member/profile/orders' },
  { key: 'settings', label: '账号设置', icon: '⚙️', route: '/member/profile/settings' },
];

const activeTab = computed(() => {
  const path = router.currentRoute.value.path;
  if (path.includes('/courses')) return 'courses';
  if (path.includes('/orders')) return 'orders';
  if (path.includes('/settings')) return 'settings';
  return 'courses';
});

// 退出登录
function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('portal_login_state');
    router.push('/login');
  }
}

onMounted(() => {
  // 页面加载时的操作
});
</script>

<template>
  <div class="member-profile">
    <div class="container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <!-- 渐变背景条 -->
        <div class="card-banner"></div>

        <div class="card-content">
          <div class="user-section">
            <!-- 头像 -->
            <div class="avatar-wrapper">
              <el-avatar :size="80" :src="userInfo.avatar" />
            </div>

            <!-- 用户信息 -->
            <div class="user-info">
              <h1>{{ userInfo.nickname }}</h1>
              <p class="username">@{{ userInfo.username }}</p>

              <!-- 会员等级 -->
              <div class="member-badge">
                <el-tag type="warning" effect="dark" size="large">
                  👑 {{ userInfo.memberLevel }}
                </el-tag>
                <span class="expire-time">有效期至 {{ userInfo.memberExpireTime }}</span>
              </div>
            </div>

            <!-- 退出登录按钮 -->
            <el-button @click="handleLogout" class="logout-btn">
              退出登录
            </el-button>
          </div>

          <!-- 统计数据 -->
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <div class="stat-value">{{ userInfo.totalCourses }}</div>
                <div class="stat-label">总课程</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ userInfo.completedCourses }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <div class="stat-value">{{ userInfo.totalHours }}h</div>
                <div class="stat-label">学习时长</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-links">
        <el-card shadow="hover">
          <div class="links-grid">
            <router-link
              v-for="item in menuItems"
              :key="item.key"
              :to="item.route"
              class="quick-link"
              :class="{ active: activeTab === item.key }"
            >
              <div class="link-icon">{{ item.icon }}</div>
              <div class="link-label">{{ item.label }}</div>
            </router-link>
          </div>
        </el-card>
      </div>

      <!-- 其他快捷入口 -->
      <div class="other-links">
        <el-card shadow="hover">
          <div class="links-row">
            <router-link to="/member/learning-history" class="other-link">
              <span class="link-icon">📖</span>
              <span class="link-label">学习历史</span>
              <el-icon class="link-arrow"><ArrowRight /></el-icon>
            </router-link>
            <router-link to="/member/my-favorites" class="other-link">
              <span class="link-icon">⭐</span>
              <span class="link-label">我的收藏</span>
              <el-icon class="link-arrow"><ArrowRight /></el-icon>
            </router-link>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.member-profile {
  min-height: 100vh;
  background: $background-color-base;
  padding: $spacing-extra-large 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// 用户信息卡片
.user-card {
  background: #fff;
  border-radius: $border-radius-extra-large;
  box-shadow: $box-shadow-card;
  margin-bottom: $spacing-large;
  overflow: hidden;
}

.card-banner {
  height: 120px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.card-content {
  padding: 0 $spacing-extra-large $spacing-extra-large;
}

.user-section {
  display: flex;
  align-items: center;
  gap: $spacing-large;
  margin-top: -40px;
  margin-bottom: $spacing-extra-large;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
}

.avatar-wrapper {
  flex-shrink: 0;
}

.user-info {
  flex: 1;

  h1 {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .username {
    font-size: $font-size-base;
    color: $text-color-secondary;
    margin-bottom: $spacing-base;
  }

  .member-badge {
    display: flex;
    align-items: center;
    gap: $spacing-base;

    .expire-time {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

.logout-btn {
  flex-shrink: 0;
}

// 统计数据
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-extra-large;
  padding-top: $spacing-extra-large;
  border-top: 1px solid $border-color-lighter;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: $spacing-large;
  }
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: $spacing-small;
}

.stat-content {
  .stat-value {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}

// 快捷入口
.quick-links {
  margin-bottom: $spacing-large;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-base;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-large;
  border-radius: $border-radius-base;
  text-decoration: none;
  color: $text-color-primary;
  transition: $transition-base;

  &:hover {
    background: $background-color-base;
  }

  &.active {
    background: #eff6ff;
    color: #3b82f6;
  }

  .link-icon {
    font-size: 32px;
    margin-bottom: $spacing-small;
  }

  .link-label {
    font-size: $font-size-base;
    font-weight: 500;
  }
}

// 其他快捷入口
.other-links {
  .links-row {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }
}

.other-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-base $spacing-large;
  border-radius: $border-radius-base;
  text-decoration: none;
  color: $text-color-primary;
  transition: $transition-base;

  &:hover {
    background: $background-color-base;
  }

  .link-icon {
    font-size: 24px;
  }

  .link-label {
    font-size: $font-size-base;
  }

  .link-arrow {
    color: $text-color-placeholder;
  }
}
</style>
