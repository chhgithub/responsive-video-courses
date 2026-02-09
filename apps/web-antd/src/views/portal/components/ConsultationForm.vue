<script lang="ts" setup>
import { reactive } from 'vue';

import { message } from 'ant-design-vue';

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

const rules = {
  name: [{ required: true, message: '请输入您的姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入咨询内容', trigger: 'blur' },
    { min: 10, message: '咨询内容至少10个字符', trigger: 'blur' },
  ],
};

function handleSubmit() {
  emit('submit', { ...formState });
  // 重置表单
  formState.name = '';
  formState.phone = '';
  formState.email = '';
  formState.content = '';
  message.success('咨询提交成功！');
}
</script>

<template>
  <a-form
    :model="formState"
    :rules="rules"
    layout="vertical"
    @finish="handleSubmit"
  >
    <a-form-item label="姓名" name="name">
      <a-input
        v-model:value="formState.name"
        placeholder="请输入您的姓名"
        size="large"
      />
    </a-form-item>

    <a-form-item label="联系电话" name="phone">
      <a-input
        v-model:value="formState.phone"
        placeholder="请输入您的手机号"
        size="large"
      />
    </a-form-item>

    <a-form-item label="邮箱（选填）" name="email">
      <a-input
        v-model:value="formState.email"
        placeholder="请输入您的邮箱"
        size="large"
      />
    </a-form-item>

    <a-form-item label="咨询内容" name="content">
      <a-textarea
        v-model:value="formState.content"
        placeholder="请详细描述您的问题，我们会尽快回复您"
        :rows="4"
        show-count
        :maxlength="500"
      />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit" size="large" block>
        提交咨询
      </a-button>
    </a-form-item>
  </a-form>
</template>

<style scoped>
:deep(.ant-form-item-label > label) {
  font-weight: 500;
}
</style>
