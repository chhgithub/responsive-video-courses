<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push('/portal');
}
</script>

<template>
  <div class="not-found-page">
    <div class="content">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $background-color-base;
}

.content {
  text-align: center;

  h1 {
    font-size: 120px;
    font-weight: bold;
    color: $--el-color-primary;
    margin: 0 0 $spacing-large;
  }

  p {
    font-size: $font-size-large;
    color: $text-color-secondary;
    margin-bottom: $spacing-extra-large;
  }
}
</style>
