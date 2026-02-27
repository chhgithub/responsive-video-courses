<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import { getUserInfo, saveUserInfo, type UserInfo } from '@/utils/member-storage';

// 用户信息
const userInfo = reactive<UserInfo>({ ...getUserInfo() });

// 表单引用
const basicFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 基本信息表单
const basicForm = reactive({
  nickname: userInfo.nickname,
  email: userInfo.email,
  phone: userInfo.phone,
  avatar: userInfo.avatar,
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 头像上传预览
const avatarPreview = ref(userInfo.avatar);

// 基本信息表单验证规则
const basicRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度应为 2-20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
};

// 修改密码表单验证规则
const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为 6-20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 密码强度
const passwordStrength = ref<'weak' | 'medium' | 'strong' | ''>('');

// 计算密码强度
function calculateStrength(password: string) {
  if (!password) {
    passwordStrength.value = '';
    return;
  }

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) {
    passwordStrength.value = 'weak';
  } else if (strength <= 3) {
    passwordStrength.value = 'medium';
  } else {
    passwordStrength.value = 'strong';
  }
}

// 密码输入变化
function handlePasswordChange(value: string) {
  calculateStrength(value);
}

// 获取密码强度文本
function getStrengthText(): string {
  const textMap = {
    weak: '弱',
    medium: '中',
    strong: '强',
  };
  return textMap[passwordStrength.value] || '';
}

// 获取密码强度颜色
function getStrengthColor(): string {
  const colorMap = {
    weak: '#f56c6c',
    medium: '#e6a23c',
    strong: '#67c23a',
  };
  return colorMap[passwordStrength.value] || '';
}

// 头像上传前
function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }

  // 转换为 base64 预览
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
    basicForm.avatar = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  return false; // 阻止自动上传
}

// 保存基本信息
async function handleSaveBasic() {
  if (!basicFormRef.value) return;

  try {
    await basicFormRef.value.validate();

    // 更新用户信息
    Object.assign(userInfo, {
      nickname: basicForm.nickname,
      email: basicForm.email,
      phone: basicForm.phone,
      avatar: basicForm.avatar,
    });

    // 保存到 localStorage
    saveUserInfo(userInfo);

    ElMessage.success('保存成功');
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 修改密码
async function handleChangePassword() {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();

    // TODO: 调用 API 修改密码
    console.log('修改密码:', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });

    ElMessage.success('密码修改成功，请重新登录');

    // 重置表单
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    passwordStrength.value = '';
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 重置基本信息表单
function handleResetBasic() {
  basicForm.nickname = userInfo.nickname;
  basicForm.email = userInfo.email;
  basicForm.phone = userInfo.phone;
  basicForm.avatar = userInfo.avatar;
  avatarPreview.value = userInfo.avatar;
}

// 重置密码表单
function handleResetPassword() {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordStrength.value = '';
}
</script>

<template>
  <div class="account-settings">
    <!-- 基本信息 -->
    <el-card class="setting-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">基本信息</span>
        </div>
      </template>

      <el-form
        ref="basicFormRef"
        :model="basicForm"
        :rules="basicRules"
        label-width="100px"
        label-position="left"
      >
        <!-- 头像 -->
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            accept="image/*"
          >
            <img v-if="avatarPreview" :src="avatarPreview" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="avatar-tip">支持 jpg、png 格式，大小不超过 2MB</div>
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="basicForm.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="basicForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="basicForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSaveBasic">保存</el-button>
          <el-button @click="handleResetBasic">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 修改密码 -->
    <el-card class="setting-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">修改密码</span>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        label-position="left"
      >
        <!-- 原密码 -->
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 新密码 -->
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            clearable
            @input="handlePasswordChange"
          />
          <!-- 密码强度指示器 -->
          <div v-if="passwordStrength" class="password-strength">
            <span class="strength-label">密码强度：</span>
            <span class="strength-value" :style="{ color: getStrengthColor() }">
              {{ getStrengthText() }}
            </span>
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="passwordStrength"
                :style="{ backgroundColor: getStrengthColor() }"
              ></div>
            </div>
          </div>
        </el-form-item>

        <!-- 确认新密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
          <el-button @click="handleResetPassword">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账号信息 -->
    <el-card class="setting-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">账号信息</span>
        </div>
      </template>

      <div class="account-info">
        <div class="info-item">
          <span class="info-label">用户名：</span>
          <span class="info-value">{{ userInfo.username }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">会员等级：</span>
          <el-tag type="warning" effect="dark">{{ userInfo.memberLevel }}</el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">会员有效期：</span>
          <span class="info-value">{{ userInfo.memberExpireTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">注册时间：</span>
          <span class="info-value">{{ userInfo.registerTime }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.account-settings {
  max-width: 800px;
  margin: 0 auto;
}

.setting-card {
  margin-bottom: $spacing-large;

  .card-header {
    .card-title {
      font-size: $font-size-large;
      font-weight: 600;
      color: $text-color-primary;
    }
  }
}

// 头像上传
.avatar-uploader {
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid $border-color-lighter;
  }

  .avatar-uploader-icon {
    font-size: 32px;
    color: $text-color-placeholder;
    width: 100px;
    height: 100px;
    border: 2px dashed $border-color-base;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
  }
}

.avatar-tip {
  margin-top: $spacing-small;
  font-size: $font-size-small;
  color: $text-color-placeholder;
}

// 密码强度
.password-strength {
  margin-top: $spacing-small;
  display: flex;
  align-items: center;
  gap: $spacing-small;

  .strength-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }

  .strength-value {
    font-size: $font-size-small;
    font-weight: 600;
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    background: #e4e7ed;
    border-radius: 2px;
    overflow: hidden;
    max-width: 100px;
  }

  .strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: all 0.3s ease;

    &.weak {
      width: 33%;
    }

    &.medium {
      width: 66%;
    }

    &.strong {
      width: 100%;
    }
  }
}

// 账号信息
.account-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  padding: $spacing-base;
  background: $background-color-base;
  border-radius: $border-radius-small;

  .info-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }

  .info-value {
    font-size: $font-size-base;
    color: $text-color-primary;
    font-weight: 500;
  }
}
</style>
