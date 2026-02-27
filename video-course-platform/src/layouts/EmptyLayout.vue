<script setup lang="ts">
// 空布局 - 用于登录页等无导航栏的页面
</script>

<template>
  <div class="empty-layout">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.empty-layout {
  min-height: 100vh;
  background: $background-color-base;
}
</style>
