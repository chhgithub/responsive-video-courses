<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { registerUser, getUserByUsername, getUserByPhone } from '@/utils/user-storage';

const router = useRouter();

// 表单数据
const registerForm = ref({
  role: 'student' as 'student' | 'teacher',
  username: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  avatar: '',
  agreePolicy: false,
});

// 头像上传输入框引用
const avatarInput = ref<HTMLInputElement>();

// 表单验证状态
const errors = ref({
  username: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreePolicy: '',
});

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = registerForm.value.password;
  if (!pwd) return { level: 0, text: '', class: '' };
  if (pwd.length < 6) return { level: 1, text: '弱', class: 'weak' };
  if (pwd.length < 10) return { level: 2, text: '中', class: 'medium' };
  return { level: 3, text: '强', class: 'strong' };
});

// 强度条宽度
const strengthWidth = computed(() => {
  return `${(passwordStrength.value.level / 3) * 100}%`;
});

// 用户名验证
function validateUsername(): boolean {
  const username = registerForm.value.username.trim();
  if (!username) {
    errors.value.username = '请输入用户名';
    return false;
  }
  const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  if (!regex.test(username)) {
    errors.value.username = '用户名必须是3-20位字母、数字或下划线，且以字母开头';
    return false;
  }
  errors.value.username = '';
  return true;
}

// 昵称验证
function validateNickname(): boolean {
  const nickname = registerForm.value.nickname.trim();
  if (!nickname) {
    errors.value.nickname = '请输入昵称';
    return false;
  }
  if (nickname.length < 2 || nickname.length > 20) {
    errors.value.nickname = '昵称长度为2-20位';
    return false;
  }
  errors.value.nickname = '';
  return true;
}

// 手机号验证
function validatePhone(): boolean {
  const phone = registerForm.value.phone.trim();
  if (!phone) {
    errors.value.phone = '请输入手机号';
    return false;
  }
  const regex = /^1[3-9]\d{9}$/;
  if (!regex.test(phone)) {
    errors.value.phone = '请输入正确的手机号';
    return false;
  }
  errors.value.phone = '';
  return true;
}

// 检查用户名是否存在
function checkUsernameExists(username: string): boolean {
  return !!getUserByUsername(username);
}

// 检查手机号是否存在
function checkPhoneExists(phone: string): boolean {
  return !!getUserByPhone(phone);
}
function checkPhoneExists(phone: string): boolean {
  const users = JSON.parse(localStorage.getItem('portal_users') || '[]');
  return users.some((u: any) => u.phone === phone);
}

// 密码验证
function validatePassword(): boolean {
  if (!registerForm.value.password) {
    errors.value.password = '请输入密码';
    return false;
  }
  if (registerForm.value.password.length < 6) {
    errors.value.password = '密码至少需要6位';
    return false;
  }
  errors.value.password = '';
  return true;
}

// 确认密码验证
function validateConfirmPassword(): boolean {
  if (!registerForm.value.confirmPassword) {
    errors.value.confirmPassword = '请确认密码';
    return false;
  }
  if (registerForm.value.confirmPassword !== registerForm.value.password) {
    errors.value.confirmPassword = '两次密码不一致';
    return false;
  }
  errors.value.confirmPassword = '';
  return true;
}

// 协议验证
function validateAgree(): boolean {
  if (!registerForm.value.agreePolicy) {
    errors.value.agreePolicy = '请先同意用户协议和隐私政策';
    return false;
  }
  errors.value.agreePolicy = '';
  return true;
}

// 头像上传 - 转换为 base64
function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 验证格式
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只支持 jpg、png、gif 格式的图片');
    return;
  }

  // 验证大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB');
    return;
  }

  // 转换为 base64
  const reader = new FileReader();
  reader.onload = (e) => {
    registerForm.value.avatar = e.target?.result as string;
    ElMessage.success('头像上传成功');
  };
  reader.readAsDataURL(file);
}

// 选择角色
function selectRole(role: 'student' | 'teacher') {
  registerForm.value.role = role;
}

// 提交注册
function handleRegister() {
  // 验证所有字段
  const isUsernameValid = validateUsername();
  const isNicknameValid = validateNickname();
  const isPhoneValid = validatePhone();
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();
  const isAgreeValid = validateAgree();

  if (
    !isUsernameValid ||
    !isNicknameValid ||
    !isPhoneValid ||
    !isPasswordValid ||
    !isConfirmValid ||
    !isAgreeValid
  ) {
    return;
  }

  // 检查用户名是否已存在
  if (checkUsernameExists(registerForm.value.username)) {
    ElMessage.error('用户名已存在，请更换');
    return;
  }

  // 检查手机号是否已存在
  if (checkPhoneExists(registerForm.value.phone)) {
    ElMessage.error('该手机号已被注册');
    return;
  }

  // 生成默认头像（如果未上传）
  const avatar =
    registerForm.value.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.value.username}`;

  // 使用用户存储工具注册
  try {
    registerUser({
      username: registerForm.value.username,
      nickname: registerForm.value.nickname,
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      avatar,
    });

    // 成功提示
    ElMessage.success('注册成功！即将跳转到登录页...');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败');
  }
}

// 跳转到登录
function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="register-page">
    <div class="container">
      <div class="register-card">
        <div class="register-content">
          <!-- 左侧品牌区 -->
          <div class="brand-section">
            <div class="brand-header">
              <div class="logo">
                <span class="logo-text">V</span>
              </div>
              <h1>欢迎加入我们</h1>
              <p>创建账号，开启学习之旅</p>
            </div>

            <div class="feature-list">
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>海量优质课程</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>专业讲师指导</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>学习证书认证</span>
              </div>
            </div>
          </div>

          <!-- 右侧表单区 -->
          <div class="form-section">
            <h2>创建账号</h2>

            <el-form :model="registerForm" label-position="top" class="register-form">
              <!-- 角色选择 -->
              <div class="form-group">
                <label class="form-label">选择角色</label>
                <div class="role-selection">
                  <div
                    class="role-card"
                    :class="{ active: registerForm.role === 'student' }"
                    @click="selectRole('student')"
                  >
                    <div class="role-icon">👨‍🎓</div>
                    <div class="role-name">学员</div>
                    <div class="role-desc">学习课程</div>
                  </div>
                  <div
                    class="role-card"
                    :class="{ active: registerForm.role === 'teacher' }"
                    @click="selectRole('teacher')"
                  >
                    <div class="role-icon">👨‍🏫</div>
                    <div class="role-name">讲师</div>
                    <div class="role-desc">分享知识</div>
                  </div>
                </div>
              </div>

              <!-- 用户名 -->
              <div class="form-group">
                <label class="form-label">用户名</label>
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  @blur="validateUsername"
                />
                <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
                <p v-else class="hint-text">3-20位字母、数字或下划线</p>
              </div>

              <!-- 昵称 -->
              <div class="form-group">
                <label class="form-label">昵称</label>
                <el-input
                  v-model="registerForm.nickname"
                  placeholder="请输入昵称"
                  @blur="validateNickname"
                />
                <p v-if="errors.nickname" class="error-text">{{ errors.nickname }}</p>
                <p v-else class="hint-text">2-20位中文、字母、数字或符号</p>
              </div>

              <!-- 手机号 -->
              <div class="form-group">
                <label class="form-label">手机号</label>
                <el-input
                  v-model="registerForm.phone"
                  placeholder="请输入手机号"
                  maxlength="11"
                  @blur="validatePhone"
                />
                <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
                <p v-else class="hint-text">用于找回密码和账号安全验证</p>
              </div>

              <!-- 密码 -->
              <div class="form-group">
                <label class="form-label">密码</label>
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  @blur="validatePassword"
                />
                <!-- 密码强度指示器 -->
                <div v-if="registerForm.password" class="password-strength">
                  <div class="strength-bar">
                    <div
                      class="strength-fill"
                      :class="passwordStrength.class"
                      :style="{ width: strengthWidth }"
                    ></div>
                  </div>
                  <span
                    class="strength-text"
                    :class="{
                      'text-weak': passwordStrength.class === 'weak',
                      'text-medium': passwordStrength.class === 'medium',
                      'text-strong': passwordStrength.class === 'strong',
                    }"
                  >
                    {{ passwordStrength.text }}
                  </span>
                </div>
              </div>

              <!-- 确认密码 -->
              <div class="form-group">
                <label class="form-label">确认密码</label>
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  @blur="validateConfirmPassword"
                />
                <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
              </div>

              <!-- 头像上传 -->
              <div class="form-group">
                <label class="form-label">头像</label>
                <div class="avatar-upload">
                  <div class="avatar-preview">
                    <div class="avatar-circle">
                      <img v-if="registerForm.avatar" :src="registerForm.avatar" alt="头像预览" />
                      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div class="upload-controls">
                    <input
                      ref="avatarInput"
                      type="file"
                      class="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      @change="handleAvatarUpload"
                    />
                    <el-button @click="avatarInput?.click()">选择图片</el-button>
                    <p class="hint-text">支持 jpg、png、gif 格式，大小不超过 2MB</p>
                  </div>
                </div>
              </div>

              <!-- 协议同意 -->
              <div class="form-group">
                <label class="agreement-label">
                  <el-checkbox v-model="registerForm.agreePolicy" />
                  <span class="agreement-text">
                    我已阅读并同意
                    <a href="#" class="link">《用户协议》</a>
                    和
                    <a href="#" class="link">《隐私政策》</a>
                  </span>
                </label>
                <p v-if="errors.agreePolicy" class="error-text">{{ errors.agreePolicy }}</p>
              </div>

              <!-- 注册按钮 -->
              <el-button type="primary" class="register-button" @click="handleRegister">
                立即注册
              </el-button>

              <!-- 已有账号 -->
              <p class="login-prompt">
                已有账号？
                <a class="link" @click="goToLogin">立即登录</a>
              </p>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #f3e8ff 100%);
  padding: $spacing-extra-large;
}

.container {
  width: 100%;
  max-width: 1000px;
}

.register-card {
  background: #fff;
  border-radius: $border-radius-extra-large;
  box-shadow: $box-shadow-dark;
  overflow: hidden;
}

.register-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

/* 左侧品牌区 */
.brand-section {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: #fff;
  padding: $spacing-extra-extra-large;
  display: flex;
  flex-direction: column;
}

.brand-header {
  margin-bottom: $spacing-extra-extra-large;
}

.logo {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-large;
}

.logo-text {
  font-size: $font-size-extra-large;
  font-weight: bold;
}

.brand-header h1 {
  font-size: $font-size-extra-extra-large;
  margin-bottom: $spacing-base;
}

.brand-header p {
  color: rgba(255, 255, 255, 0.8);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: $spacing-base;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

/* 右侧表单区 */
.form-section {
  padding: $spacing-extra-extra-large;
}

.form-section h2 {
  font-size: $font-size-extra-large;
  font-weight: bold;
  color: $text-color-primary;
  margin-bottom: $spacing-extra-large;
}

.register-form {
  .form-group {
    margin-bottom: $spacing-large;
  }
}

.form-label {
  display: block;
  margin-bottom: $spacing-base;
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-color-primary;
}

/* 角色选择 */
.role-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-base;
}

.role-card {
  border: 2px solid $border-color-base;
  border-radius: $border-radius-base;
  padding: $spacing-base;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #93c5fd;
  }

  &.active {
    border-color: #3b82f6;
    background: #eff6ff;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 20 20'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E");
      background-size: 12px;
      background-position: center;
      background-repeat: no-repeat;
    }
  }
}

.role-icon {
  font-size: $font-size-extra-extra-large;
  margin-bottom: $spacing-small;
}

.role-name {
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: 4px;
}

.role-desc {
  font-size: $font-size-small;
  color: $text-color-secondary;
}

/* 错误提示 */
.error-text {
  margin-top: 4px;
  font-size: $font-size-extra-small;
  color: var(--el-color-danger);
}

.hint-text {
  margin-top: 4px;
  font-size: $font-size-extra-small;
  color: $text-color-secondary;
}

/* 密码强度 */
.password-strength {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  margin-top: $spacing-small;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;

  &.weak {
    background: #ef4444;
  }

  &.medium {
    background: #f59e0b;
  }

  &.strong {
    background: #22c55e;
  }
}

.strength-text {
  font-size: $font-size-small;

  &.text-weak {
    color: #ef4444;
  }

  &.text-medium {
    color: #f59e0b;
  }

  &.text-strong {
    color: #22c55e;
  }
}

/* 头像上传 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: $spacing-large;
}

.avatar-preview {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border: 2px dashed $border-color-base;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;

  svg {
    width: 40px;
    height: 40px;
    color: $text-color-secondary;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.upload-controls {
  .hint-text {
    margin-top: $spacing-small;
    margin-bottom: 0;
  }
}

.hidden {
  display: none;
}

/* 协议 */
.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: $spacing-small;
  cursor: pointer;
}

.agreement-text {
  font-size: $font-size-base;
  color: $text-color-regular;
}

.link {
  color: #3b82f6;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

/* 注册按钮 */
.register-button {
  width: 100%;
  height: 44px;
  font-size: $font-size-base;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  border: none;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
}

/* 登录提示 */
.login-prompt {
  text-align: center;
  margin-top: $spacing-base;
  font-size: $font-size-base;
  color: $text-color-regular;
}

/* 响应式 */
@media (max-width: 768px) {
  .register-page {
    padding: $spacing-base;
  }

  .register-content {
    grid-template-columns: 1fr;
  }

  .brand-section {
    padding: $spacing-extra-large;
  }

  .form-section {
    padding: $spacing-large;
  }

  .role-selection {
    grid-template-columns: 1fr;
  }

  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
