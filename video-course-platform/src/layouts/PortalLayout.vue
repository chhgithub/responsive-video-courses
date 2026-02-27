<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores';
import PortalNavbar from './PortalLayout/PortalNavbar.vue';
import PortalFooter from './PortalLayout/PortalFooter.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div class="portal-layout">
    <PortalNavbar />
    <main class="portal-main">
      <router-view />
    </main>
    <PortalFooter />
  </div>
</template>

<style scoped lang="scss">
.portal-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.portal-main {
  flex: 1;
  background: $background-color-base;
}
</style>
