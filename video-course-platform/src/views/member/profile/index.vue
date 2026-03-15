<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getUserById } from '@/utils/user-storage';
import { getUserOrders } from '@/utils/order-storage';
import { getUserLearningRecords, getLearningStats } from '@/utils/learning-storage';
// 动态导入子页面组件
import { defineAsyncComponent } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

// 返回上一页
function handleBack() {
  router.back();
}

const loading = ref(false);

// 内容类型状态
type ContentType = 'courses' | 'orders' | 'favorites' | 'settings' | 'org-info';
const contentType = ref<ContentType>('courses');

// 动态导入子页面组件
import MyFavorites from '../my-favorites.vue';

const components = {
  courses: defineAsyncComponent(() => import('./courses.vue')),
  orders: defineAsyncComponent(() => import('./orders.vue')),
  favorites: defineAsyncComponent({
    loader: () => new Promise(resolve => resolve(MyFavorites)),
    loadingComponent: ElSkeleton,
    delay: 200,
  }),
  settings: defineAsyncComponent(() => import('./settings.vue')),
  'org-info': defineAsyncComponent(() => import('./org-info.vue')),
};

// 当前显示的组件
const currentComponent = computed(() => components[contentType.value]);

// 用户信息
const userInfo = ref({
  username: '',
  nickname: '',
  avatar: '',
  totalCourses: 0,
  completedCourses: 0,
  totalHours: 0,
});

// 菜单项
const menuItems = computed(() => {
  const items = [
    { key: 'courses', label: '我的课程', icon: '📚', route: '/member/profile/courses' },
    { key: 'orders', label: '订单记录', icon: '📋', route: '/member/profile/orders' },
    { key: 'favorites', label: '我的收藏', icon: '❤️', route: '/member/my-favorites' },
    { key: 'settings', label: '账号设置', icon: '⚙️', route: '/member/profile/settings' },
  ];

  // 单位管理员可以看到单位信息
  if (authStore.userInfo?.roles?.includes('org_admin')) {
    items.splice(3, 0, { key: 'org-info', label: '单位信息', icon: '🏢', route: '/member/profile/org-info' });
  }

  return items;
});

const activeTab = computed(() => contentType.value);

// 加载用户信息
async function loadUserInfo() {
  if (!authStore.userInfo?.userId) return;

  loading.value = true;
  try {
    const user = getUserById(authStore.userInfo.userId);
    if (!user) {
      ElMessage.error('用户不存在');
      return;
    }

    // 获取订单统计
    const orders = getUserOrders(authStore.userInfo.userId);
    const paidOrders = orders.filter(o => o.status === 'paid').length;

    // 获取学习统计
    const stats = getLearningStats(authStore.userInfo.userId);
    const totalHours = Math.floor(stats.totalWatchDuration / 3600);

    userInfo.value = {
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      totalCourses: paidOrders,
      completedCourses: stats.completedCourses,
      totalHours,
    };
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户信息失败');
  } finally {
    loading.value = false;
  }
}

// 导航到指定内容类型
function handleNavigate(type: ContentType) {
  contentType.value = type;
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    authStore.logout();
    router.push('/portal/login');
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadUserInfo();
});
</script>

<template>
  <div class="member-profile" v-loading="loading">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-section">
        <el-button @click="handleBack" :icon="ArrowLeft" circle />
      </div>

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
            </div>

            <!-- 退出登录按钮 -->
            <el-button @click="handleLogout" class="logout-btn" plain>
              退出登录
            </el-button>
          </div>

          <!-- 统计数据 -->
          <!-- <div class="stats-section">
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
          </div> -->
        </div>
      </div>

      <!-- 快捷入口导航 -->
      <div class="quick-links">
        <el-card shadow="never">
          <div class="links-grid">
            <div
              v-for="item in menuItems"
              :key="item.key"
              class="quick-link"
              :class="{ active: activeTab === item.key }"
              @click="handleNavigate(item.key as ContentType)"
            >
              <div class="link-icon">{{ item.icon }}</div>
              <div class="link-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 子路由内容 -->
      <div class="content-area">
        <component
          :is="currentComponent"
          v-if="currentComponent"
          :embedded="contentType === 'favorites'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.member-profile {
  min-height: calc(100vh - 120px);
  background: $background-color-base;
  padding: $spacing-extra-large 0;
}

.back-section {
  margin-bottom: $spacing-base;
}

.container {
  max-width: 1200px;
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

// 快捷入口导航
.quick-links {
  margin-bottom: $spacing-large;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-large;
  border-radius: $border-radius-base;
  cursor: pointer;
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

// 内容区域
.content-area {
  min-height: 400px;
}
</style>
