<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits<{
  submit: [data: ConsultationData];
}>();

interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const form = ref<ConsultationData>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
});

const rules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  subject: [
    { required: true, message: '请输入咨询主题', trigger: 'blur' },
    { min: 2, max: 50, message: '主题长度为2-50个字符', trigger: 'blur' },
  ],
  message: [
    { required: true, message: '请输入咨询内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度为10-500个字符', trigger: 'blur' },
  ],
};

const formRef = ref();

function handleSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', form.value);
      ElMessage.success('咨询已提交，我们会尽快回复您！');
      formRef.value?.resetFields();
    }
  });
}
</script>

<template>
  <div class="consultation-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      label-position="top"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入您的姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="咨询主题" prop="subject">
        <el-input v-model="form.subject" placeholder="请输入咨询主题" />
      </el-form-item>

      <el-form-item label="咨询内容" prop="message">
        <el-input
          v-model="form.message"
          type="textarea"
          :rows="4"
          placeholder="请详细描述您的问题，我们会尽快回复您"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="large" style="width: 100%" @click="handleSubmit">
          提交咨询
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.consultation-form {
  background: #fff;
  border-radius: $border-radius-large;
  padding: $spacing-extra-large;
  box-shadow: $box-shadow-card;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: $text-color-primary;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: $border-radius-base;
}
</style>
