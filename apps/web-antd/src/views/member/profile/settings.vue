<script lang="ts" setup>
import { reactive } from 'vue';
import { message } from 'ant-design-vue';
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

function handleSubmit() {
  // 模拟保存
  message.success('保存成功');
}

function handleAvatarChange() {
  message.info('头像上传功能待实现');
}
</script>

<template>
  <div class="p-6 max-w-2xl">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">基本信息</h2>
      <p class="text-gray-500">管理您的个人信息</p>
    </div>

    <!-- 头像 -->
    <div class="flex items-center gap-4 mb-6 pb-6 border-b">
      <a-avatar :size="80" :src="userStore.userInfo?.avatar" />
      <div>
        <a-button @click="handleAvatarChange">更换头像</a-button>
        <p class="text-sm text-gray-500 mt-2">支持 JPG、PNG 格式，大小不超过 2MB</p>
      </div>
    </div>

    <!-- 表单 -->
    <a-form :model="formState" layout="vertical" @finish="handleSubmit">
      <a-form-item label="昵称">
        <a-input v-model:value="formState.nickname" placeholder="请输入昵称" />
      </a-form-item>

      <a-form-item label="邮箱">
        <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
      </a-form-item>

      <a-form-item label="手机号">
        <a-input v-model:value="formState.phone" disabled />
      </a-form-item>

      <a-form-item label="性别">
        <a-radio-group v-model:value="formState.gender">
          <a-radio value="male">男</a-radio>
          <a-radio value="female">女</a-radio>
          <a-radio value="other">其他</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="生日">
        <a-date-picker v-model:value="formState.birthday" class="w-full" placeholder="请选择生日" />
      </a-form-item>

      <a-form-item label="个人简介">
        <a-textarea v-model:value="formState.bio" placeholder="介绍一下自己" :rows="4" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" size="large">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
