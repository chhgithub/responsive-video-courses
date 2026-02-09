<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { WechatOutlined, AlipayOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();

const currentStep = ref(0);
const paymentMethod = ref<'wechat' | 'alipay'>('wechat');
const paying = ref(false);

// 课程信息
const course = ref({
  id: Number(route.params.courseId),
  name: 'Vue3 从入门到精通',
  cover: 'https://picsum.photos/seed/vue/200/120',
  price: 199,
  originalPrice: 299,
});

// 订单信息
const order = ref({
  orderId: `ORD${Date.now()}`,
  amount: course.value.price,
  createTime: new Date().toLocaleString(),
});

const paymentStatus = ref<'success' | 'failed' | 'pending'>('pending');

function nextStep() {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

async function createPayment() {
  paying.value = true;
  // 模拟支付过程
  setTimeout(() => {
    // 模拟支付成功
    paymentStatus.value = 'success';
    paying.value = false;
    nextStep();
  }, 2000);
}

function goToCourse() {
  router.push('/member/courses');
}

function viewOrder() {
  router.push('/member/orders');
}

onMounted(() => {
  // 加载课程信息
  console.log('课程ID:', route.params.courseId);
});
</script>

<template>
  <div class="payment-page bg-gray-50 min-h-screen py-8 px-4">
    <div class="container mx-auto max-w-4xl">
      <!-- 步骤条 -->
      <a-steps :current="currentStep" class="mb-8">
        <a-step title="确认订单" />
        <a-step title="选择支付方式" />
        <a-step title="完成支付" />
      </a-steps>

      <!-- 步骤1: 订单确认 -->
      <div v-if="currentStep === 0" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6">确认订单</h2>
        <div class="flex gap-6">
          <img :src="course.cover" class="w-40 h-28 object-cover rounded" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800">{{ course.name }}</h3>
            <p class="text-gray-500 mt-2">课程有效期：购买后365天</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">订单金额</span>
            <span class="text-3xl font-bold text-red-500">¥{{ course.price }}</span>
          </div>
          <div v-if="course.originalPrice > course.price" class="text-right text-gray-400 text-sm mt-1">
            原价 ¥{{ course.originalPrice }}，已优惠 ¥{{ course.originalPrice - course.price }}
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <a-button type="primary" size="large" @click="nextStep">
            去支付
          </a-button>
        </div>
      </div>

      <!-- 步骤2: 选择支付方式 -->
      <div v-if="currentStep === 1" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6">选择支付方式</h2>

        <div class="mb-6">
          <img :src="course.cover" class="w-32 h-20 object-cover rounded mb-4" />
          <div class="text-xl font-bold text-red-500">¥{{ course.price }}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            :class="[
              'payment-option p-6 border-2 rounded-lg cursor-pointer transition-all',
              paymentMethod === 'wechat' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
            ]"
            @click="paymentMethod = 'wechat'"
          >
            <div class="flex items-center gap-4">
              <WechatOutlined class="text-4xl text-green-500" />
              <span class="text-xl font-medium">微信支付</span>
            </div>
          </div>
          <div
            :class="[
              'payment-option p-6 border-2 rounded-lg cursor-pointer transition-all',
              paymentMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
            ]"
            @click="paymentMethod = 'alipay'"
          >
            <div class="flex items-center gap-4">
              <AlipayOutlined class="text-4xl text-blue-500" />
              <span class="text-xl font-medium">支付宝</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between">
          <a-button size="large" @click="prevStep">上一步</a-button>
          <a-button type="primary" size="large" :loading="paying" @click="createPayment">
            确认支付
          </a-button>
        </div>
      </div>

      <!-- 步骤3: 支付结果 -->
      <div v-if="currentStep === 2" class="bg-white rounded-lg shadow-sm p-8">
        <a-result
          :status="paymentStatus === 'success' ? 'success' : 'error'"
          :title="paymentStatus === 'success' ? '支付成功' : '支付失败'"
          :sub-title="paymentStatus === 'success' ? '您已成功购买课程，现在可以开始学习了' : '支付未完成，请重试'"
        >
          <template #extra>
            <a-space>
              <a-button type="primary" size="large" @click="goToCourse">
                开始学习
              </a-button>
              <a-button size="large" @click="viewOrder">查看订单</a-button>
            </a-space>
          </template>
        </a-result>

        <div v-if="paymentStatus === 'success'" class="mt-6 pt-6 border-t">
          <h3 class="font-semibold text-gray-800 mb-4">订单详情</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">订单号</span>
              <span>{{ order.orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">支付方式</span>
              <span>{{ paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">支付金额</span>
              <span class="text-red-500 font-bold">¥{{ order.amount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">支付时间</span>
              <span>{{ order.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-option {
  transition: all 0.3s ease;
}

.payment-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
