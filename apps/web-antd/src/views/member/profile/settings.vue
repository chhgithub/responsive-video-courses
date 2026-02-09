<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { useUserStore } from '@vben/stores';

const userStore = useUserStore();

const formState = reactive({
  nickname: userStore.userInfo?.realName || '',
  email: userStore.userInfo?.email || '',
  phone: '138****8888',
  gender: 'male',
  birthday: '',
  bio: '',
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

function validateForm(): boolean {
  errors.value = {};

  // 验证昵称
  if (!formState.nickname.trim()) {
    errors.value.nickname = '请输入昵称';
  }

  // 验证邮箱
  if (
    formState.email &&
    !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formState.email)
  ) {
    errors.value.email = '请输入正确的邮箱地址';
  }

  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  // 模拟保存
  setTimeout(() => {
    isSubmitting.value = false;
    console.log('保存成功！');
    // 这里可以调用 API 保存用户信息
  }, 500);
}

function handleAvatarChange() {
  console.log('头像上传功能待实现');
}

// 性别选项
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];
</script>

<template>
  <div class="account-settings max-w-3xl">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">账号设置</h2>
      <p class="text-sm text-gray-500">管理您的个人信息和安全设置</p>
    </div>

    <!-- 头像设置 -->
    <div class="mb-6 rounded-xl bg-white p-6 shadow-md">
      <h3 class="mb-4 text-lg font-semibold text-gray-800">头像</h3>
      <div class="flex items-center gap-6">
        <img
          :src="
            userStore.userInfo?.avatar ||
            'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          "
          alt="头像"
          class="h-20 w-20 rounded-full object-cover"
        />
        <div>
          <button
            @click="handleAvatarChange"
            class="mb-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            更换头像
          </button>
          <p class="text-sm text-gray-500">
            支持 JPG、PNG 格式，大小不超过 2MB
          </p>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="mb-6 rounded-xl bg-white p-6 shadow-md">
      <h3 class="mb-6 text-lg font-semibold text-gray-800">基本信息</h3>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- 昵称 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              昵称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formState.nickname"
              type="text"
              placeholder="请输入昵称"
              class="w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="errors.nickname ? 'border-red-500' : 'border-gray-300'"
              @blur="validateForm()"
            />
            <p v-if="errors.nickname" class="mt-1 text-sm text-red-500">
              {{ errors.nickname }}
            </p>
          </div>

          <!-- 邮箱 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              v-model="formState.email"
              type="email"
              placeholder="请输入邮箱"
              class="w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              :class="errors.email ? 'border-red-500' : 'border-gray-300'"
              @blur="validateForm()"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-500">
              {{ errors.email }}
            </p>
          </div>

          <!-- 手机号 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              手机号
            </label>
            <input
              v-model="formState.phone"
              type="tel"
              disabled
              class="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500"
            />
            <p class="mt-1 text-sm text-gray-500">如需修改手机号，请联系客服</p>
          </div>

          <!-- 性别 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              性别
            </label>
            <div class="flex gap-4">
              <label
                v-for="option in genderOptions"
                :key="option.value"
                class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors"
                :class="
                  formState.gender === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                "
              >
                <input
                  v-model="formState.gender"
                  :value="option.value"
                  type="radio"
                  :name="option.value"
                  class="sr-only"
                />
                {{ option.label }}
              </label>
            </div>
          </div>

          <!-- 生日 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              生日
            </label>
            <input
              v-model="formState.birthday"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <!-- 个人简介 -->
        <div class="mt-6">
          <label class="mb-2 block text-sm font-medium text-gray-700">
            个人简介
          </label>
          <textarea
            v-model="formState.bio"
            placeholder="介绍一下自己"
            rows="4"
            maxlength="200"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">
            {{ formState.bio.length }}/200
          </p>
        </div>

        <!-- 保存按钮 -->
        <div class="mt-6 flex justify-end">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="rounded-lg bg-blue-600 px-8 py-2.5 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 安全设置 -->
    <div class="rounded-xl bg-white p-6 shadow-md">
      <h3 class="mb-4 text-lg font-semibold text-gray-800">安全设置</h3>
      <div class="space-y-4">
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4"
        >
          <div>
            <h4 class="font-medium text-gray-800">修改密码</h4>
            <p class="text-sm text-gray-500">定期修改密码，保护账号安全</p>
          </div>
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            修改
          </button>
        </div>

        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4"
        >
          <div>
            <h4 class="font-medium text-gray-800">绑定手机</h4>
            <p class="text-sm text-gray-500">已绑定：{{ formState.phone }}</p>
          </div>
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            更换
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-800">绑定邮箱</h4>
            <p class="text-sm text-gray-500">
              {{ formState.email || '未绑定' }}
            </p>
          </div>
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            {{ formState.email ? '更换' : '绑定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border-width: 0;
  clip: rect(0, 0, 0, 0);
}
</style>
