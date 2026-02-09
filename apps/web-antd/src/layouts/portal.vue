<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

const router = useRouter();
const userStore = useUserStore();

const mobileMenuVisible = ref(false);
const userDropdownVisible = ref(false);

// 搜索关键字
const searchKeyword = ref('');

// 前台菜单项
const menuItems = computed(() => [
  { path: '/portal', title: '首页' },
  { path: '/portal/about', title: '关于我们' },
  { path: '/portal/courses', title: '课程中心' },
  { path: '/portal/cert', title: '认证中心' },
  { path: '/portal/teachers', title: '师资队伍' },
  { path: '/portal/general', title: '通识教育' },
]);

const isLoggedIn = computed(() => !!userStore.userInfo);

function handleMenuClick(path: string) {
  mobileMenuVisible.value = false;
  router.push(path);
}

function handleLogout() {
  userDropdownVisible.value = false;
  userStore.logout();
  router.push('/auth/login');
}

function goToProfile() {
  if (!isLoggedIn.value) {
    mobileMenuVisible.value = false;
    router.push('/auth/login');
    return;
  }
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

function toggleUserDropdown() {
  userDropdownVisible.value = !userDropdownVisible.value;
}

// 执行搜索
function handleSearch() {
  if (!searchKeyword.value.trim()) {
    return;
  }
  // 跳转到课程中心并传递搜索参数
  router.push({
    path: '/portal/courses',
    query: { keyword: searchKeyword.value.trim() },
  });
  searchKeyword.value = ''; // 清空搜索框
  mobileMenuVisible.value = false; // 关闭移动端菜单
}

// 回车搜索
function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

// 清空搜索
function clearSearch() {
  searchKeyword.value = '';
}
</script>

<template>
  <div class="portal-layout min-h-screen bg-gray-50">
    <!-- 导航栏 -->
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
              <span class="text-xl font-bold text-gray-800">课程平台</span>
            </router-link>
          </div>

          <!-- Desktop Menu -->
          <nav class="hidden space-x-1 md:flex">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
              active-class="bg-blue-50 text-blue-600 font-medium"
            >
              {{ item.title }}
            </router-link>
          </nav>

          <!-- User Actions -->
          <div class="hidden items-center space-x-3 md:flex">
            <!-- 搜索框 -->
            <div class="relative">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索课程..."
                class="w-56 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                @keydown="handleSearchKeydown"
              />
              <!-- 搜索图标 -->
              <svg
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <!-- 清空按钮（有内容时显示） -->
              <button
                v-if="searchKeyword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="clearSearch"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <template v-if="isLoggedIn">
              <div class="relative">
                <button
                  class="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
                  @click="toggleUserDropdown"
                >
                  <img
                    :src="userStore.userInfo?.avatar"
                    class="h-8 w-8 rounded-full object-cover"
                    alt="Avatar"
                  />
                  <span class="text-sm text-gray-700">我的</span>
                </button>
                <!-- Dropdown Menu -->
                <div
                  v-if="userDropdownVisible"
                  class="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white py-2 shadow-lg"
                >
                  <button
                    class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    @click="goToProfile"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    个人中心
                  </button>
                  <div class="my-1 border-t border-gray-200"></div>
                  <button
                    class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-100"
                    @click="handleLogout"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    退出登录
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <button
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                @click="goToLogin"
              >
                登录
              </button>
              <button
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="goToRegister"
              >
                注册
              </button>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <button
              class="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              @click="mobileMenuVisible = true"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="portal-main min-h-screen">
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
                <router-link to="/portal/general" class="hover:text-white">
                  通识教育
                </router-link>
              </li>
              <li>
                <router-link to="/portal/cert" class="hover:text-white">
                  认证中心
                </router-link>
              </li>
              <li>
                <router-link to="/portal/teachers" class="hover:text-white">
                  师资队伍
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

    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuVisible"
      class="fixed inset-0 z-50 bg-black bg-opacity-50"
      @click="mobileMenuVisible = false"
    >
      <div
        class="fixed right-0 top-0 h-full w-64 bg-white shadow-xl"
        @click.stop
      >
        <div class="mobile-menu p-4">
          <!-- 搜索框 -->
          <div class="relative mb-4">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索课程..."
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              @keydown="handleSearchKeydown"
            />
            <!-- 搜索图标 -->
            <svg
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <!-- 清空按钮（有内容时显示） -->
            <button
              v-if="searchKeyword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="clearSearch"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Close Button -->
          <button
            class="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100"
            @click="mobileMenuVisible = false"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- 菜单列表 -->
          <div class="mt-12 space-y-2">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="block rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-600 font-medium"
              @click="handleMenuClick(item.path)"
            >
              {{ item.title }}
            </router-link>
          </div>

          <div class="my-4 border-t border-gray-200"></div>

          <!-- 用户操作 -->
          <template v-if="isLoggedIn">
            <button
              class="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left transition-colors hover:bg-gray-100"
              @click="goToProfile"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              个人中心
            </button>
            <button
              class="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-red-600 transition-colors hover:bg-gray-100"
              @click="handleLogout"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              退出登录
            </button>
          </template>
          <template v-else>
            <button
              class="w-full rounded-lg px-4 py-3 text-left transition-colors hover:bg-gray-100"
              @click="goToLogin"
            >
              登录
            </button>
            <button
              class="mt-2 w-full rounded-lg bg-blue-50 px-4 py-3 text-center font-medium text-blue-600"
              @click="goToRegister"
            >
              注册账号
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal-navbar {
  border-bottom: 1px solid #e5e7eb;
}

/* 点击外部关闭下拉菜单 */
.portal-navbar :deep(.relative) > button:focus {
  outline: none;
}
</style>
