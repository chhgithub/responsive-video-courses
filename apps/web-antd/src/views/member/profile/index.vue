<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('courses');

// 模拟用户数据
const userInfo = computed(() => ({
  avatar: userStore.userInfo?.avatar || 'https://picsum.photos/seed/user/100/100',
  nickname: userStore.userInfo?.realName || '学员',
  username: userStore.userInfo?.username || 'user001',
  email: userStore.userInfo?.email || 'user@example.com',
  memberLevel: 'VIP会员',
  memberExpireTime: '2025-12-31',
  totalCourses: 5,
  completedCourses: 2,
  totalHours: 48,
}));

function handleTabChange(key: string) {
  activeTab.value = key;
}

function handleLogout() {
  userStore.logout();
  router.push('/auth/login');
}
</script>

<template>
  <div class="member-profile bg-gray-50 min-h-screen py-8 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- 用户信息卡片 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div class="px-6 pb-6">
          <div class="flex flex-col md:flex-row items-center md:items-end -mt-12 gap-4">
            <a-avatar :size="96" :src="userInfo.avatar" class="border-4 border-white shadow-lg" />
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-2xl font-bold text-gray-800">{{ userInfo.nickname }}</h1>
              <p class="text-gray-500">@{{ userInfo.username }}</p>
            </div>
            <a-button @click="handleLogout">退出登录</a-button>
          </div>

          <!-- 统计数据 -->
          <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ userInfo.totalCourses }}</div>
              <div class="text-sm text-gray-500">已购课程</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ userInfo.completedCourses }}</div>
              <div class="text-sm text-gray-500">已完成</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ userInfo.totalHours }}h</div>
              <div class="text-sm text-gray-500">学习时长</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 选项卡内容 -->
      <div class="bg-white rounded-lg shadow-sm">
        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane key="courses" tab="我的课程">
            <router-view name="courses" />
          </a-tab-pane>
          <a-tab-pane key="orders" tab="订单记录">
            <router-view name="orders" />
          </a-tab-pane>
          <a-tab-pane key="settings" tab="账号设置">
            <router-view name="settings" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>
