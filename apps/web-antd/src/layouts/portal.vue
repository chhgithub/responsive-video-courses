<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import { MenuOutlined, UserOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const mobileMenuVisible = ref(false);

// 前台菜单项
const menuItems = computed(() => [
  { path: '/portal', title: '首页' },
  { path: '/portal/courses', title: '课程中心' },
  { path: '/portal/micro', title: '微课程' },
  { path: '/portal/public', title: '公益课程' },
  { path: '/portal/research', title: '科研赋能' },
  { path: '/portal/training', title: '集训计划' },
]);

const isLoggedIn = computed(() => !!userStore.userInfo);

function handleMenuClick(path: string) {
  mobileMenuVisible.value = false;
  router.push(path);
}

function handleLogout() {
  userStore.logout();
  router.push('/auth/login');
}

function goToProfile() {
  mobileMenuVisible.value = false;
  router.push('/member/profile');
}

function goToLogin() {
  mobileMenuVisible.value = false;
  router.push('/auth/login');
}

function goToRegister() {
  mobileMenuVisible.value = false;
  router.push('/auth/register');
}
</script>

<template>
  <div class="portal-layout min-h-screen bg-gray-50">
    <!-- 响应式导航栏 -->
    <header class="portal-navbar sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <router-link to="/portal" class="flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
              >
                <span class="text-lg font-bold text-white">V</span>
              </div>
              <span class="hidden text-xl font-bold text-gray-800 sm:inline"
                >课程平台</span
              >
            </router-link>
          </div>

          <!-- Desktop Menu -->
          <nav class="hidden space-x-1 md:flex">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
              active-class="bg-blue-50 text-blue-600 font-medium"
            >
              {{ item.title }}
            </router-link>
          </nav>

          <!-- User Actions -->
          <div class="hidden items-center space-x-3 md:flex">
            <template v-if="isLoggedIn">
              <a-dropdown>
                <div
                  class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
                >
                  <a-avatar :size="32" :src="userStore.userInfo?.avatar">
                    <UserOutlined />
                  </a-avatar>
                  <span class="text-gray-700">{{
                    userStore.userInfo?.realName || '用户'
                  }}</span>
                </div>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="profile" @click="goToProfile">
                      <UserOutlined class="mr-2" />
                      个人中心
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="logout" @click="handleLogout">
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
            <template v-else>
              <a-button @click="goToLogin">登录</a-button>
              <a-button type="primary" @click="goToRegister">注册</a-button>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <a-button type="text" @click="mobileMenuVisible = true">
              <MenuOutlined class="text-xl" />
            </a-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="portal-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="portal-footer mt-auto bg-gray-800 py-12 text-gray-300">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 class="mb-4 text-lg font-bold text-white">关于我们</h3>
            <p class="text-sm">专业的在线视频课程学习平台</p>
          </div>
          <div>
            <h3 class="mb-4 text-lg font-bold text-white">快速链接</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <router-link to="/portal/courses" class="hover:text-white">
                  课程中心
                </router-link>
              </li>
              <li>
                <router-link to="/portal/public" class="hover:text-white">
                  公益课程
                </router-link>
              </li>
              <li>
                <router-link to="/portal/research" class="hover:text-white">
                  科研赋能
                </router-link>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="mb-4 text-lg font-bold text-white">帮助中心</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white">常见问题</a></li>
              <li><a href="#" class="hover:text-white">联系客服</a></li>
              <li><a href="#" class="hover:text-white">意见反馈</a></li>
            </ul>
          </div>
          <div>
            <h3 class="mb-4 text-lg font-bold text-white">联系我们</h3>
            <p class="text-sm">电话：400-123-4567</p>
            <p class="text-sm">邮箱：support@example.com</p>
          </div>
        </div>
        <div class="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2025 视频课程平台. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Mobile Menu Drawer -->
    <a-drawer
      v-model:open="mobileMenuVisible"
      placement="right"
      :width="280"
      :closable="true"
    >
      <div class="mobile-menu">
        <!-- 菜单列表 -->
        <div class="mb-6">
          <div
            v-for="item in menuItems"
            :key="item.path"
            class="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-gray-100"
            @click="handleMenuClick(item.path)"
          >
            {{ item.title }}
          </div>
        </div>

        <a-divider />

        <!-- 用户操作 -->
        <template v-if="isLoggedIn">
          <div
            class="cursor-pointer rounded-lg px-4 py-3 hover:bg-gray-100"
            @click="goToProfile"
          >
            <UserOutlined class="mr-2" />
            个人中心
          </div>
          <div
            class="cursor-pointer rounded-lg px-4 py-3 text-red-500 hover:bg-gray-100"
            @click="handleLogout"
          >
            退出登录
          </div>
        </template>
        <template v-else>
          <div
            class="cursor-pointer rounded-lg px-4 py-3 hover:bg-gray-100"
            @click="goToLogin"
          >
            登录
          </div>
          <div
            class="mt-2 cursor-pointer rounded-lg bg-blue-50 px-4 py-3 text-center text-blue-600"
            @click="goToRegister"
          >
            注册账号
          </div>
        </template>
      </div>
    </a-drawer>
  </div>
</template>

<style scoped>
.portal-navbar {
  border-bottom: 1px solid #e5e7eb;
}

.portal-main {
  min-height: calc(100vh - 64px - 300px);
}
</style>
