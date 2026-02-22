<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

import { addConsultation } from '#/utils/consultation-storage';

// 假数据 - 联系方式
const contactInfo = ref({
  company: {
    name: '创新教育科技有限公司',
    address: '北京市海淀区中关村科技园区创新大厦A座18层',
    zipCode: '100080',
  },
  contacts: [
    {
      type: '咨询电话',
      value: '400-123-4567',
      icon: '📞',
      color: '#1890ff',
    },
    {
      type: '传真号码',
      value: '010-12345678',
      icon: '📠',
      color: '#52c41a',
    },
    {
      type: '电子邮箱',
      value: 'contact@company.com',
      icon: '📧',
      color: '#722ed1',
    },
    {
      type: '官方网站',
      value: 'www.company.com',
      icon: '🌐',
      color: '#fa8c16',
    },
  ],
  workingHours: {
    weekdays: '周一至周五 9:00 - 18:00',
    weekend: '周六至周日 休息',
    note: '节假日另行通知',
  },
  socialMedia: [
    { name: '微信公众号', qrCode: '📱', followers: '10万+' },
    { name: '官方微博', qrCode: '📱', followers: '5万+' },
    { name: '抖音号', qrCode: '📱', followers: '8万+' },
    { name: '小红书', qrCode: '📱', followers: '3万+' },
  ],
  offices: [
    {
      city: '北京总部',
      address: '北京市海淀区中关村科技园区创新大厦A座18层',
      phone: '010-12345678',
      email: 'beijing@company.com',
    },
    {
      city: '上海分公司',
      address: '上海市浦东新区陆家嘴金融中心B座12层',
      phone: '021-87654321',
      email: 'shanghai@company.com',
    },
    {
      city: '深圳分公司',
      address: '深圳市南山区科技园南区科苑路15号',
      phone: '0755-98765432',
      email: 'shenzhen@company.com',
    },
  ],
  form: {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  },
});

// 提交表单
const handleSubmit = () => {
  // 表单验证
  const form = contactInfo.value.form;
  if (!form.name || !form.phone || !form.email || !form.message) {
    message.warning('请填写完整信息（姓名、电话、邮箱、留言内容）');
    return;
  }

  // 电话格式验证
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(form.phone)) {
    message.warning('请输入正确的手机号码');
    return;
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    message.warning('请输入正确的邮箱地址');
    return;
  }

  try {
    // 保存到 localStorage
    addConsultation({
      name: form.name,
      phone: form.phone,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });

    message.success('感谢您的留言，我们会尽快回复！');

    // 重置表单
    form.name = '';
    form.phone = '';
    form.email = '';
    form.subject = '';
    form.message = '';
  } catch (error) {
    message.error('提交失败，请稍后重试');
    console.error('提交留言失败:', error);
  }
};
</script>

<template>
  <div class="contact-page p-6">
    <!-- 页面标题 -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-gray-900">联系我们</h1>
      <p class="mt-2 text-gray-600">我们随时为您提供帮助</p>
    </div>

    <!-- 公司信息卡片 -->
    <a-card class="mb-6" :bordered="false">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="12" class="mb-4">
          <div class="company-info">
            <h2 class="text-xl font-semibold mb-3">{{ contactInfo.company.name }}</h2>
            <p class="text-gray-700 mb-2">
              <span class="mr-2">📍</span>
              {{ contactInfo.company.address }}
            </p>
            <p class="text-gray-600">
              <span class="mr-2">📮</span>
              邮政编码：{{ contactInfo.company.zipCode }}
            </p>
          </div>
        </a-col>
        <a-col :xs="24" :lg="12">
          <div class="working-hours p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold mb-2">⏰ 工作时间</h3>
            <p class="text-gray-700 mb-1">{{ contactInfo.workingHours.weekdays }}</p>
            <p class="text-gray-600 mb-1">{{ contactInfo.workingHours.weekend }}</p>
            <p class="text-sm text-gray-500">{{ contactInfo.workingHours.note }}</p>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 联系方式 -->
    <a-card class="mb-6" title="联系方式" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="contact in contactInfo.contacts"
          :key="contact.type"
          :xs="12"
          :sm="6"
        >
          <div class="contact-item text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-3xl mb-2">{{ contact.icon }}</div>
            <p class="text-sm text-gray-600 mb-1">{{ contact.type }}</p>
            <p class="font-semibold" :style="{ color: contact.color }">
              {{ contact.value }}
            </p>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 办事处地址 -->
    <a-card class="mb-6" title="办事处地址" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="office in contactInfo.offices"
          :key="office.city"
          :xs="24"
          :sm="8"
        >
          <a-card class="office-card" hoverable>
            <template #title>
              <span class="font-semibold">{{ office.city }}</span>
            </template>
            <p class="text-gray-700 mb-2">📍 {{ office.address }}</p>
            <p class="text-gray-600 mb-1">📞 {{ office.phone }}</p>
            <p class="text-gray-600">📧 {{ office.email }}</p>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 二维码 -->
    <a-card class="mb-6" title="关注我们" :bordered="false">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="social in contactInfo.socialMedia"
          :key="social.name"
          :xs="12"
          :sm="6"
        >
          <div class="qrcode-item text-center p-4 border rounded-lg">
            <div class="text-6xl mb-2">{{ social.qrCode }}</div>
            <p class="font-semibold mb-1">{{ social.name }}</p>
            <p class="text-sm text-gray-500">粉丝数：{{ social.followers }}</p>
            <p class="text-xs text-gray-400 mt-2">扫码关注</p>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 在线留言 -->
    <a-card title="在线留言" :bordered="false">
      <a-form
        :model="contactInfo.form"
        layout="vertical"
        @submit="handleSubmit"
      >
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12">
            <a-form-item label="姓名" required>
              <a-input
                v-model:value="contactInfo.form.name"
                placeholder="请输入您的姓名"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="联系电话" required>
              <a-input
                v-model:value="contactInfo.form.phone"
                placeholder="请输入您的联系电话"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="电子邮箱" required>
          <a-input
            v-model:value="contactInfo.form.email"
            placeholder="请输入您的邮箱"
          />
        </a-form-item>
        <a-form-item label="主题">
          <a-input
            v-model:value="contactInfo.form.subject"
            placeholder="请输入留言主题"
          />
        </a-form-item>
        <a-form-item label="留言内容" required>
          <a-textarea
            v-model:value="contactInfo.form.message"
            :rows="4"
            placeholder="请输入您的留言内容"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block>
            提交留言
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 地图占位 -->
    <a-card class="mt-6" title="位置地图" :bordered="false">
      <div class="map-placeholder">
        <div class="text-center text-gray-400">
          <span class="text-6xl mb-4 block">🗺️</span>
          <p>地图加载中...</p>
          <p class="text-sm mt-2">实际部署时可接入高德/百度地图API</p>
        </div>
      </div>
    </a-card>
  </div>
</template>

<style scoped>
.contact-page {
  max-width: 1200px;
  margin: 0 auto;
}

.contact-item {
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.office-card {
  transition: transform 0.3s ease;
}

.office-card:hover {
  transform: translateY(-4px);
}

.qrcode-item {
  transition: all 0.3s ease;
}

.qrcode-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
