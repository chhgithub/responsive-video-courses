<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore, useAppStore } from '@/stores';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';

const authStore = useAuthStore();
const appStore = useAppStore();
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar :collapsed="appStore.sidebarCollapsed" />

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Header -->
      <AdminHeader
        :collapsed="appStore.sidebarCollapsed"
        @toggle="appStore.toggleSidebar"
      />

      <!-- Content -->
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.admin-layout {
  display: flex;
  min-height: 100vh;

  .admin-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .admin-content {
    flex: 1;
    padding: $spacing-large;
    overflow-y: auto;
    background: $background-color-base;
  }
}
</style>
