<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('courses');
const mobileMenuVisible = ref(false);

// 模拟用户数据
const userInfo = computed(() => ({
  avatar:
    userStore.userInfo?.avatar ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  nickname: userStore.userInfo?.realName || '学员',
  username: userStore.userInfo?.username || 'user001',
  email: userStore.userInfo?.email || 'user@example.com',
  memberLevel: 'VIP会员',
  memberExpireTime: '2025-12-31',
  totalCourses: 5,
  completedCourses: 2,
  totalHours: 48,
}));

// 菜单项
const menuItems = [
  { key: 'courses', label: '我的课程', icon: '📚' },
  { key: 'orders', label: '订单记录', icon: '📋' },
  { key: 'settings', label: '账号设置', icon: '⚙️' },
];

function handleTabChange(key: string) {
  activeTab.value = key;
  router.push(`/member/profile/${key}`);
}

function handleLogout() {
  userStore.logout();
  router.push('/auth/login');
}
</script>

<template>
  <div class="member-profile min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto max-w-6xl">
      <!-- 用户信息卡片 -->
      <div class="mb-6 overflow-hidden rounded-xl bg-white shadow-md">
        <!-- 渐变背景条 -->
        <div class="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <div class="px-6 pb-6">
          <div
            class="-mt-12 flex flex-col items-center gap-4 md:flex-row md:items-end"
          >
            <!-- 头像 -->
            <div class="relative">
              <img
                :src="userInfo.avatar"
                :alt="userInfo.nickname"
                class="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            </div>

            <!-- 用户信息 -->
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-2xl font-bold text-gray-800">
                {{ userInfo.nickname }}
              </h1>
              <p class="text-gray-500">@{{ userInfo.username }}</p>
              <div
                class="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start"
              >
                <span
                  class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800"
                >
                  👑 {{ userInfo.memberLevel }}
                </span>
                <span class="text-sm text-gray-500">
                  有效期至 {{ userInfo.memberExpireTime }}
                </span>
              </div>
            </div>

            <!-- 退出登录按钮 -->
            <button
              @click="handleLogout"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 md:text-base"
            >
              退出登录
            </button>
          </div>

          <!-- 统计数据 -->
          <div
            class="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6"
          >
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ userInfo.totalCourses }}
              </div>
              <div class="text-sm text-gray-500">已购课程</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ userInfo.completedCourses }}
              </div>
              <div class="text-sm text-gray-500">已完成</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ userInfo.totalHours }}h
              </div>
              <div class="text-sm text-gray-500">学习时长</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mb-4 md:hidden">
        <button
          @click="mobileMenuVisible = !mobileMenuVisible"
          class="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 shadow-md"
        >
          <span class="font-medium text-gray-700">
            {{ menuItems.find((item) => item.key === activeTab)?.label }}
          </span>
          <svg
            class="h-5 w-5 text-gray-500 transition-transform"
            :class="{ 'rotate-180': mobileMenuVisible }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- 移动端下拉菜单 -->
        <div
          v-if="mobileMenuVisible"
          class="mt-2 rounded-lg bg-white shadow-md"
        >
          <button
            v-for="item in menuItems"
            :key="item.key"
            @click="
              handleTabChange(item.key);
              mobileMenuVisible = false;
            "
            class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
            :class="{ 'bg-blue-50 text-blue-600': activeTab === item.key }"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="font-medium">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- 桌面端选项卡 + 内容区域 -->
      <div class="rounded-xl bg-white shadow-md">
        <!-- 桌面端 Tab 导航 -->
        <div class="hidden border-b border-gray-200 md:block">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="item in menuItems"
              :key="item.key"
              @click="handleTabChange(item.key)"
              class="border-b-2 py-4 text-sm font-medium transition-colors"
              :class="
                activeTab === item.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
            >
              <span class="mr-2">{{ item.icon }}</span>
              {{ item.label }}
            </button>
          </nav>
        </div>

        <!-- Tab 内容 -->
        <div class="p-6">
          <!-- 我的课程 -->
          <div v-if="activeTab === 'courses'" class="tab-content">
            <router-view />
          </div>

          <!-- 订单记录 -->
          <div v-if="activeTab === 'orders'" class="tab-content">
            <router-view />
          </div>

          <!-- 账号设置 -->
          <div v-if="activeTab === 'settings'" class="tab-content">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-content {
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
