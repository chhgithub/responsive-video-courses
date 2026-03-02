<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';
import { loginUser } from '@/utils/user-storage';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginForm = ref({
  username: '',
  password: '',
});
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    // 验证用户
    const user = loginUser(loginForm.value.username, loginForm.value.password);

    // 设置登录信息
    const token = `token-${user.userId}-${Date.now()}`;
    authStore.setToken(token);
    authStore.setUserInfo({
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username,
      roles: [user.role || 'student'],
      organizationId: user.organizationId,
    });

    ElMessage.success('登录成功');

    // 根据角色跳转到不同页面
    const role = user.role || 'student';
    let defaultRoute = '/admin/home/banner';

    if (role === 'admin') {
      defaultRoute = '/admin/home/banner';
    } else if (role === 'org_admin') {
      defaultRoute = '/admin/org/students';
    }

    const redirect = (route.query.redirect as string) || defaultRoute;
    router.push(redirect);
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败');
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
        <el-alert title="测试账号" type="info" :closable="false">
          <div>管理员账号：<strong>admin / 123456</strong></div>
          <div>单位管理员账号：<strong>org_admin / 123456</strong></div>
        </el-alert>
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
