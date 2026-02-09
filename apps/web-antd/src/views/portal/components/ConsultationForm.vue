<script lang="ts" setup>
import { reactive, ref } from 'vue';

interface ConsultationData {
  name: string;
  phone: string;
  email: string;
  content: string;
}

const emit = defineEmits<{
  submit: [data: ConsultationData];
}>();

const formState = reactive<ConsultationData>({
  name: '',
  phone: '',
  email: '',
  content: '',
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

function validateForm(): boolean {
  errors.value = {};

  // 验证姓名
  if (!formState.name.trim()) {
    errors.value.name = '请输入您的姓名';
  }

  // 验证手机号
  if (!formState.phone.trim()) {
    errors.value.phone = '请输入联系电话';
  } else if (!/^1[3-9]\d{9}$/.test(formState.phone)) {
    errors.value.phone = '请输入正确的手机号';
  }

  // 验证邮箱（可选）
  if (
    formState.email &&
    !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formState.email)
  ) {
    errors.value.email = '请输入正确的邮箱地址';
  }

  // 验证内容
  if (!formState.content.trim()) {
    errors.value.content = '请输入咨询内容';
  } else if (formState.content.length < 10) {
    errors.value.content = '咨询内容至少10个字符';
  }

  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  emit('submit', { ...formState });

  // 重置表单
  formState.name = '';
  formState.phone = '';
  formState.email = '';
  formState.content = '';
  errors.value = {};
  isSubmitting.value = false;

  console.log('咨询提交成功！');
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="consultation-form">
    <!-- 姓名 -->
    <div class="mb-4">
      <label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">
        姓名 <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formState.name"
        type="text"
        placeholder="请输入您的姓名"
        class="w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
        @blur="validateForm()"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-500">
        {{ errors.name }}
      </p>
    </div>

    <!-- 联系电话 -->
    <div class="mb-4">
      <label for="phone" class="mb-1.5 block text-sm font-medium text-gray-700">
        联系电话 <span class="text-red-500">*</span>
      </label>
      <input
        id="phone"
        v-model="formState.phone"
        type="tel"
        placeholder="请输入您的手机号"
        class="w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
        @blur="validateForm()"
      />
      <p v-if="errors.phone" class="mt-1 text-sm text-red-500">
        {{ errors.phone }}
      </p>
    </div>

    <!-- 邮箱（选填） -->
    <div class="mb-4">
      <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">
        邮箱（选填）
      </label>
      <input
        id="email"
        v-model="formState.email"
        type="email"
        placeholder="请输入您的邮箱"
        class="w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        :class="errors.email ? 'border-red-500' : 'border-gray-300'"
        @blur="validateForm()"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-500">
        {{ errors.email }}
      </p>
    </div>

    <!-- 咨询内容 -->
    <div class="mb-4">
      <label
        for="content"
        class="mb-1.5 block text-sm font-medium text-gray-700"
      >
        咨询内容 <span class="text-red-500">*</span>
      </label>
      <textarea
        id="content"
        v-model="formState.content"
        placeholder="请详细描述您的问题，我们会尽快回复您"
        rows="4"
        maxlength="500"
        class="w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        :class="errors.content ? 'border-red-500' : 'border-gray-300'"
        @blur="validateForm()"
      ></textarea>
      <div class="mt-1 flex justify-between">
        <p v-if="errors.content" class="text-sm text-red-500">
          {{ errors.content }}
        </p>
        <p v-else class="text-sm text-gray-500">
          {{ formState.content.length }}/500
        </p>
      </div>
    </div>

    <!-- 提交按钮 -->
    <button
      type="submit"
      :disabled="isSubmitting"
      class="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ isSubmitting ? '提交中...' : '提交咨询' }}
    </button>
  </form>
</template>

<style scoped>
.consultation-form input:focus,
.consultation-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 10%);
}

.consultation-form input,
.consultation-form textarea {
  transition: all 0.2s ease-in-out;
}

.consultation-form input:hover,
.consultation-form textarea:hover {
  border-color: #9ca3af;
}
</style>
