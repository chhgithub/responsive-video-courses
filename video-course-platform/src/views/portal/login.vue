<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { loginUser, initUserData } from '@/utils/user-storage';

const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref({
  username: '',
  password: '',
});

const loading = ref(false);

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }

  loading.value = true;

  try {
    // 初始化用户数据
    initUserData();

    // 验证登录
    const user = loginUser(loginForm.value.username, loginForm.value.password);

    // 保存用户信息到 Store
    authStore.setToken(`token-${user.userId}-${Date.now()}`);
    authStore.setUserInfo({
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      email: user.email,
      roles: user.role ? [user.role] : [],
      organizationId: user.organizationId,
    });

    ElMessage.success('登录成功');

    // 跳转到原页面或首页
    const redirect = router.currentRoute.value.query.redirect as string;
    router.push(redirect || '/portal');
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>用户登录</h1>
        <p>欢迎回来</p>
      </div>

      <el-form :model="loginForm" label-width="80px" class="login-form">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-alert
            title="测试账号"
            type="info"
            :closable="false"
            show-icon
          >
            <div>普通用户: <code>test</code> 密码: <code>test</code></div>
            <!-- <div>总管理员: <code>admin</code> 密码: <code>123456</code></div> -->
            <div>单位管理员: <code>org_admin</code> 密码: <code>123456</code></div>
          </el-alert>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 400px;
  background: #fff;
  border-radius: $border-radius-large;
  padding: $spacing-extra-extra-large;
  box-shadow: $box-shadow-dark;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-extra-large;

  h1 {
    font-size: $font-size-extra-large;
    margin-bottom: $spacing-base;
    color: $text-color-primary;
  }

  p {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

.login-form {
  margin-bottom: $spacing-large;
}

.login-footer {
  text-align: center;
  font-size: $font-size-small;
  color: $text-color-secondary;

  a {
    color: $--el-color-primary;
    margin-left: $spacing-small;
  }
}
</style>
