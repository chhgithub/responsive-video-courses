<script lang="ts" setup>
import { message } from 'ant-design-vue';

import { ref } from 'vue';

// Mock 数据
const contactInfo = ref({
  title: '联系我们',
  phone: '400-123-4567',
  fax: '010-12345678',
  email: 'contact@example.com',
  website: 'https://www.example.com',
  address: '北京市海淀区中关村科技园',
  zipCode: '100080',
  workingHours: {
    weekdays: '周一至周五 9:00 - 18:00',
    weekend: '周六至周日 休息',
  },
  qrcodes: [
    {
      name: '微信公众号',
      image: 'https://picsum.photos/seed/wechat/200/200',
      followers: '10万+',
    },
    {
      name: '官方微博',
      image: 'https://picsum.photos/seed/weibo/200/200',
      followers: '50万+',
    },
  ],
  offices: [
    {
      city: '北京',
      address: '北京市海淀区中关村科技园',
      phone: '010-12345678',
    },
    {
      city: '上海',
      address: '上海市浦东新区张江高科',
      phone: '021-87654321',
    },
  ],
});

const formData = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
});

function handleSubmit() {
  message.success('感谢您的留言，我们会尽快回复！');
  formData.value = { name: '', email: '', phone: '', message: '' };
}
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-gradient-to-r from-orange-500 to-red-500 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">{{ contactInfo.title }}</h1>
        <p class="text-xl text-orange-100">我们随时为您提供帮助</p>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-4xl">
          <!-- 联系方式 -->
          <div class="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-if="contactInfo.phone"
              class="rounded-lg bg-orange-50 p-6 text-center"
            >
              <div class="mb-3 text-4xl">📞</div>
              <p class="text-sm text-gray-600 mb-1">咨询电话</p>
              <p class="font-semibold text-orange-600">{{ contactInfo.phone }}</p>
            </div>
            <div
              v-if="contactInfo.fax"
              class="rounded-lg bg-blue-50 p-6 text-center"
            >
              <div class="mb-3 text-4xl">📠</div>
              <p class="text-sm text-gray-600 mb-1">传真号码</p>
              <p class="font-semibold text-blue-600">{{ contactInfo.fax }}</p>
            </div>
            <div
              v-if="contactInfo.email"
              class="rounded-lg bg-green-50 p-6 text-center"
            >
              <div class="mb-3 text-4xl">📧</div>
              <p class="text-sm text-gray-600 mb-1">电子邮箱</p>
              <p class="font-semibold text-green-600">{{ contactInfo.email }}</p>
            </div>
            <div
              v-if="contactInfo.website"
              class="rounded-lg bg-purple-50 p-6 text-center"
            >
              <div class="mb-3 text-4xl">🌐</div>
              <p class="text-sm text-gray-600 mb-1">官方网站</p>
              <p class="font-semibold text-purple-600">
                {{ contactInfo.website }}
              </p>
            </div>
          </div>

          <!-- 地址信息 -->
          <div
            v-if="contactInfo.address"
            class="mb-12 rounded-lg bg-gray-100 p-6 text-center"
          >
            <p class="text-gray-700 mb-2">📍 {{ contactInfo.address }}</p>
            <p v-if="contactInfo.zipCode" class="text-gray-600">
              📮 邮政编码：{{ contactInfo.zipCode }}
            </p>
          </div>

          <!-- 工作时间 -->
          <div
            v-if="contactInfo.workingHours"
            class="mb-12 rounded-lg bg-gray-100 p-6 text-center"
          >
            <h3 class="mb-3 text-xl font-semibold text-gray-900">⏰ 工作时间</h3>
            <p
              v-if="contactInfo.workingHours.weekdays"
              class="text-gray-700 mb-1"
            >
              {{ contactInfo.workingHours.weekdays }}
            </p>
            <p
              v-if="contactInfo.workingHours.weekend"
              class="text-gray-600"
            >
              {{ contactInfo.workingHours.weekend }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 办事处 -->
    <section
      v-if="contactInfo.offices && contactInfo.offices.length > 0"
      class="bg-gray-50 py-16"
    >
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">
          办事处地址
        </h2>
        <div class="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
          <div
            v-for="office in contactInfo.offices"
            :key="office.city"
            class="rounded-lg bg-white p-6 shadow-md"
          >
            <h3 class="mb-4 text-xl font-semibold text-gray-900">{{ office.city }}</h3>
            <p class="mb-2 text-gray-700">📍 {{ office.address }}</p>
            <p class="text-gray-600">📞 {{ office.phone }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 二维码 -->
    <section
      v-if="contactInfo.qrcodes && contactInfo.qrcodes.length > 0"
      class="py-16"
    >
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">关注我们</h2>
        <div class="mx-auto max-w-3xl grid gap-6 md:grid-cols-3">
          <div
            v-for="social in contactInfo.qrcodes"
            :key="social.name"
            class="rounded-lg border-2 border-gray-200 p-6 text-center transition-all hover:border-orange-500"
          >
            <img
              v-if="social.image"
              :src="social.image"
              :alt="social.name"
              class="mx-auto mb-3 h-32 w-32 object-contain"
            />
            <div class="mb-3 text-6xl">📱</div>
            <p class="font-semibold text-gray-900 mb-1">{{ social.name }}</p>
            <p v-if="social.followers" class="text-sm text-gray-500">
              粉丝数：{{ social.followers }}
            </p>
            <p class="text-xs text-gray-400 mt-2">扫码关注</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 在线留言 -->
    <section class="bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">在线留言</h2>
        <div class="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  姓名 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="请输入您的姓名"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  联系电话 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  required
                  placeholder="请输入您的联系电话"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                电子邮箱 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                placeholder="请输入您的邮箱"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                留言内容 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formData.message"
                required
                :rows="4"
                placeholder="请输入您的留言内容"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              ></textarea>
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              提交留言
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
}
</style>
