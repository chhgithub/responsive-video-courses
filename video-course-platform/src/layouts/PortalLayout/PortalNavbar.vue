<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

const searchKeyword = ref('');
const mobileMenuVisible = ref(false);

// 菜单项配置
const menuItems = [
  { path: '/portal', title: '首页' },
  { path: '/portal/courses', title: '课程中心' },
  {
    path: '/portal/cert',
    title: '认证中心',
    children: [
      { path: '/portal/cert/ai-trainer', title: '人工智能训练师' },
      { path: '/portal/cert/ai-engineer', title: '人工智能工程技术人员' },
      { path: '/portal/cert/drone', title: 'CAAC无人机执照' },
      { path: '/portal/cert/tech-broker', title: '技术经纪人' },
      { path: '/portal/cert/other', title: '其他认证项目' },
    ],
  },
  { path: '/portal/about/faculty', title: '师资队伍' },
  {
    path: '/portal/about',
    title: '关于我们',
    children: [
      { path: '/portal/about/research', title: '关于研究院' },
      { path: '/portal/about/digital', title: '关于数字创新中心' },
      { path: '/portal/about/education', title: '关于教育培训中心' },
      { path: '/portal/about/contact', title: '联系我们' },
    ],
  },
];

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/portal/courses',
      query: { keyword: searchKeyword.value.trim() },
    });
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/portal');
}
</script>

<template>
  <header class="portal-navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <div class="logo" @click="router.push('/portal')">
          <span class="logo-icon">V</span>
          <span class="logo-text">课程平台</span>
        </div>

        <!-- Desktop Menu -->
        <nav class="desktop-menu">
          <template v-for="item in menuItems" :key="item.path">
            <el-dropdown v-if="item.children" trigger="hover">
              <span class="menu-item">
                {{ item.title }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <router-link
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    custom
                    v-slot="{ navigate }"
                  >
                    <el-dropdown-item @click="navigate">
                      {{ child.title }}
                    </el-dropdown-item>
                  </router-link>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <router-link v-else :to="item.path" class="menu-item">
              {{ item.title }}
            </router-link>
          </template>
        </nav>

        <!-- User Actions -->
        <div class="user-actions">
          <!-- Search -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索课程..."
            class="search-input"
            @keyup.enter="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- Auth Buttons -->
          <template v-if="authStore.isLoggedIn">
            <el-dropdown trigger="hover">
              <div class="user-info">
                <el-avatar :size="32" :src="authStore.userInfo?.avatar">
                  {{ authStore.userInfo?.nickname?.charAt(0) }}
                </el-avatar>
                <span>{{ authStore.userInfo?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/member/profile')">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="router.push('/login')">登录</el-button>
            <el-button type="primary" @click="router.push('/register')">
              注册
            </el-button>
          </template>

          <!-- Mobile Menu Toggle -->
          <el-button
            class="mobile-menu-toggle"
            :icon="Menu"
            @click="mobileMenuVisible = true"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <el-drawer v-model="mobileMenuVisible" direction="rtl" size="280px">
      <template #header>
        <span>菜单</span>
      </template>
      <div class="mobile-menu-content">
        <!-- 移动端菜单项 -->
        <el-menu
          :default-active="router.currentRoute.value.path"
          @select="mobileMenuVisible = false"
        >
          <template v-for="item in menuItems" :key="item.path">
            <el-sub-menu v-if="item.children" :index="item.path">
              <template #title>{{ item.title }}</template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.path"
                :index="child.path"
              >
                <router-link :to="child.path">{{ child.title }}</router-link>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.path">
              <router-link :to="item.path">{{ item.title }}</router-link>
            </el-menu-item>
          </template>
        </el-menu>

        <div class="mobile-auth-buttons">
          <template v-if="authStore.isLoggedIn">
            <el-button @click="router.push('/member/profile')">
              个人中心
            </el-button>
            <el-button type="danger" @click="handleLogout">
              退出登录
            </el-button>
          </template>
          <template v-else>
            <el-button @click="router.push('/login')">登录</el-button>
            <el-button type="primary" @click="router.push('/register')">
              注册
            </el-button>
          </template>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.portal-navbar {
  background: #fff;
  box-shadow: $box-shadow-light;
  position: sticky;
  top: 0;
  z-index: $z-index-top;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.navbar-content {
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-large;
}

.logo {
  display: flex;
  align-items: center;
  gap: $spacing-medium;
  cursor: pointer;
  flex-shrink: 0;

  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, $--el-color-primary 0%, #a0cfff 100%);
    border-radius: $border-radius-large;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: bold;
    font-size: 20px;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 600;
    color: $text-color-primary;
  }
}

.desktop-menu {
  display: flex;
  gap: $spacing-base;

  @include respond-to($breakpoint-md) {
    display: none;
  }
}

.menu-item {
  padding: $spacing-small $spacing-large;
  border-radius: $border-radius-base;
  color: $text-color-regular;
  text-decoration: none;
  transition: $transition-base;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $spacing-small;

  &:hover {
    background: $background-color-base;
    color: $--el-color-primary;
  }

  &.router-link-active {
    background: #ecf5ff;
    color: $--el-color-primary;
  }
}

.user-actions {
  display: flex;
  align-items: center;
  gap: $spacing-medium;
  flex-shrink: 0;

  .search-input {
    width: 240px;

    @include respond-to($breakpoint-md) {
      display: none;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    cursor: pointer;
    padding: $spacing-small $spacing-base;
    border-radius: $border-radius-base;
    transition: background 0.3s;

    &:hover {
      background: $background-color-base;
    }
  }

  .mobile-menu-toggle {
    display: none;

    @include respond-to($breakpoint-md) {
      display: flex;
    }
  }
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-extra-large;
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
  padding: $spacing-large 0;
  border-top: 1px solid $border-color-lighter;
}
</style>
