<script setup lang="ts">
interface Props {
  collapsed: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  toggle: [];
}>();

import { useAuthStore } from '@/stores';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push('/admin/login');
}
</script>

<template>
  <div class="admin-header">
    <div class="header-left">
      <el-button :icon="collapsed ? 'Expand' : 'Fold'" circle @click="emit('toggle')" />
    </div>

    <div class="header-right">
      <el-dropdown trigger="hover">
        <div class="user-info">
          <el-avatar :size="32" :src="authStore.userInfo?.avatar">
            {{ authStore.userInfo?.nickname?.charAt(0) }}
          </el-avatar>
          <span>{{ authStore.userInfo?.nickname }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
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
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.admin-header {
  height: $header-height;
  background: #fff;
  border-bottom: 1px solid $border-color-lighter;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-large;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-medium;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-large;

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
  }
}
</style>
