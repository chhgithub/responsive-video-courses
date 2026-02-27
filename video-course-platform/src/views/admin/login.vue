<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginForm = ref({
  username: 'admin',
  password: '123456',
});
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 设置登录信息
    authStore.setToken('admin-token-123456');
    authStore.setUserInfo({
      userId: '1',
      username: loginForm.value.username,
      nickname: '管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      roles: ['admin'],
    });

    ElMessage.success('登录成功');
    
    // 跳转到后台主页Banner配置或重定向页面
    const redirect = (route.query.redirect as string) || '/admin/home/banner';
    router.push(redirect);
  } catch (error) {
    ElMessage.error('登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>后台管理系统</h1>
        <p>请登录以继续</p>
      </div>

      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="handleLogin" 
            size="large" 
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tips">
        <el-alert title="测试账号: admin / 123456" type="info" :closable="false" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #304156 0%, #263445 100%);
}

.login-container {
  width: 400px;
  background: #fff;
  border-radius: $border-radius-large;
  padding: $spacing-extra-extra-large;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-extra-large;

  h1 {
    font-size: 28px;
    margin-bottom: $spacing-base;
    color: #303133;
  }

  p {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

.login-form {
  margin-bottom: $spacing-large;
}

.login-tips {
  margin-top: $spacing-large;
}
</style>
