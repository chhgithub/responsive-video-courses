<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserById, updateUser, changePassword, type User } from '@/utils/user-storage';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);

// 用户信息
const userInfo = reactive<Partial<User>>({});

// 表单引用
const basicFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 基本信息表单
const basicForm = reactive({
  nickname: '',
  email: '',
  phone: '',
  gender: '' as 'male' | 'female' | 'other' | '',
  age: '',
  birthday: '',
  avatar: '',
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 头像上传预览
const avatarPreview = ref('');

// 基本信息表单验证规则
const basicRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度应为 2-20 个字符', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  age: [
    { pattern: /^(1[5-9]|[2-9]\d)$/, message: '请输入正确的年龄（15-99）', trigger: 'blur' },
  ],
};

// 修改密码表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
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
  const textMap: Record<string, string> = {
    weak: '弱',
    medium: '中',
    strong: '强',
  };
  return textMap[passwordStrength.value] || '';
}

// 获取密码强度颜色
function getStrengthColor(): string {
  const colorMap: Record<string, string> = {
    weak: '#f56c6c',
    medium: '#e6a23c',
    strong: '#67c23a',
  };
  return colorMap[passwordStrength.value] || '';
}

// 加载用户信息
async function loadUserInfo() {
  if (!authStore.userInfo?.userId) return;

  loading.value = true;
  try {
    const user = getUserById(authStore.userInfo.userId);
    if (!user) {
      ElMessage.error('用户不存在');
      return;
    }

    // 更新用户信息
    Object.assign(userInfo, user);

    // 填充表单
    basicForm.nickname = user.nickname || '';
    basicForm.email = user.email || '';
    basicForm.phone = user.phone || '';
    basicForm.gender = user.gender || '';
    basicForm.age = user.age?.toString() || '';
    basicForm.birthday = user.birthday || '';
    basicForm.avatar = user.avatar || '';
    avatarPreview.value = user.avatar || '';

    console.log('加载用户信息成功');
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户信息失败');
  } finally {
    loading.value = false;
  }
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
    const result = e.target?.result as string;
    avatarPreview.value = result;
    basicForm.avatar = result;
  };
  reader.readAsDataURL(file);

  return false; // 阻止自动上传
}

// 保存基本信息
async function handleSaveBasic() {
  if (!basicFormRef.value) return;

  try {
    await basicFormRef.value.validate();

    saving.value = true;

    // 准备更新数据
    const updateData: Partial<User> = {
      nickname: basicForm.nickname,
      email: basicForm.email || undefined,
      phone: basicForm.phone || undefined,
      gender: basicForm.gender || undefined,
      age: basicForm.age ? parseInt(basicForm.age) : undefined,
      birthday: basicForm.birthday || undefined,
      avatar: basicForm.avatar || undefined,
    };

    // 更新用户信息
    const updated = updateUser(userInfo.userId!, updateData);

    if (updated) {
      // 同步更新 store
      authStore.setUserInfo({
        userId: updated.userId,
        username: updated.username,
        nickname: updated.nickname,
        avatar: updated.avatar,
      });

      ElMessage.success('保存成功');
    } else {
      ElMessage.error('保存失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    saving.value = false;
  }
}

// 修改密码
async function handleChangePassword() {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();

    await ElMessageBox.confirm('修改密码后需要重新登录，确定要继续吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 调用修改密码
    const success = changePassword(
      userInfo.userId!,
      passwordForm.oldPassword,
      passwordForm.newPassword
    );

    if (success) {
      ElMessage.success('密码修改成功，请重新登录');

      // 清空密码表单
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      passwordStrength.value = '';

      // 退出登录
      setTimeout(() => {
        authStore.logout();
        router.push('/portal/login');
      }, 1500);
    } else {
      ElMessage.error('原密码错误');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改密码失败:', error);
    }
  }
}

// 重置基本信息表单
function handleResetBasic() {
  basicForm.nickname = userInfo.nickname || '';
  basicForm.email = userInfo.email || '';
  basicForm.phone = userInfo.phone || '';
  basicForm.gender = userInfo.gender || '';
  basicForm.age = userInfo.age?.toString() || '';
  basicForm.birthday = userInfo.birthday || '';
  basicForm.avatar = userInfo.avatar || '';
  avatarPreview.value = userInfo.avatar || '';
}

// 重置密码表单
function handleResetPassword() {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordStrength.value = '';
}

onMounted(() => {
  loadUserInfo();
});
</script>

<template>
  <div class="account-settings">
    <div class="page-header">
      <h2>账号设置</h2>
      <p>管理您的个人信息和账号安全</p>
    </div>

    <!-- 基本信息 -->
    <el-card v-loading="loading" class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
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

        <!-- 性别 -->
        <el-form-item label="性别">
          <el-radio-group v-model="basicForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">保密</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 年龄 -->
        <el-form-item label="年龄" prop="age">
          <el-input
            v-model.number="basicForm.age"
            type="number"
            placeholder="请输入年龄"
            clearable
          />
        </el-form-item>

        <!-- 生日 -->
        <el-form-item label="生日">
          <el-date-picker
            v-model="basicForm.birthday"
            type="date"
            placeholder="请选择生日"
            value-format="YYYY-MM-DD"
            clearable
          />
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
          <el-button type="primary" :loading="saving" @click="handleSaveBasic">
            保存
          </el-button>
          <el-button @click="handleResetBasic">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 修改密码 -->
    <el-card class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Lock /></el-icon>
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
          <el-button type="primary" @click="handleChangePassword">
            确认修改
          </el-button>
          <el-button @click="handleResetPassword">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.account-settings {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-extra-large;

    h2 {
      font-size: $font-size-extra-large;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    p {
      color: $text-color-secondary;
    }
  }

  .setting-card {
    margin-bottom: $spacing-large;

    :deep(.el-card__header) {
      padding: $spacing-large $spacing-large;
      background: $background-color-base;
      border-bottom: 1px solid $border-color-lighter;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: $spacing-small;

      .el-icon {
        font-size: 20px;
        color: $--el-color-primary;
      }

      .card-title {
        font-size: $font-size-large;
        font-weight: 600;
        color: $text-color-primary;
      }
    }

    :deep(.el-card__body) {
      padding: $spacing-large;
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
</style>
