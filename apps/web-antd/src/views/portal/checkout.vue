<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import {
	mockCourses,
	type Course,
} from '#/mock/course-center';

import { createOrder } from '#/utils/order-storage';

const route = useRoute();
const router = useRouter();

// 课程ID
const courseId = route.params.id as string;

// 课程数据
const course = ref<Course | null>(null);
const loading = ref(true);

// 订单信息
const orderInfo = ref({
	courseId: '',
	courseType: 'course' as 'course' | 'package',
	originalPrice: 0,
	finalPrice: 0,
	couponId: '',
	couponDiscount: 0,
});

// 优惠券列表
const coupons = ref([
	{ id: '1', name: '新人优惠', discount: 20, type: 'percent', minAmount: 10000 },
	{ id: '2', name: '限时优惠', discount: 50, type: 'amount', minAmount: 0 },
	{ id: '3', name: '会员折扣', discount: 10, type: 'percent', minAmount: 0 },
]);

// 选中的优惠券
const selectedCoupon = ref(coupons.value[0]);

// 支付方式
const paymentMethod = ref('alipay');

// 加载课程详情
function loadCourseDetail() {
	loading.value = true;
	setTimeout(() => {
		const found = mockCourses.find((c) => c.id === courseId);
		if (found) {
			course.value = found;
			orderInfo.value = {
				courseId: found.id,
				courseType: 'course',
				originalPrice: found.price,
				finalPrice: found.price,
				couponId: '',
				couponDiscount: 0,
			};
		}
		loading.value = false;
	}, 300);
}

// 计算最终价格
const finalPrice = computed(() => {
	if (!course.value) return 0;
	let price = course.value.price;

	// 应用优惠券
	if (selectedCoupon.value) {
		const coupon = selectedCoupon.value;
		if (coupon.type === 'percent') {
			price = price * (1 - coupon.discount / 100);
		} else {
			price = Math.max(0, price - coupon.discount * 100);
		}
	}

	return Math.floor(price);
});

// 选择优惠券
function handleSelectCoupon(coupon: any) {
	selectedCoupon.value = coupon;
}

// 确认支付
function handlePay() {
	if (!course.value) return;

	// 获取当前用户
	const userState = localStorage.getItem('portal_login_state');
	if (!userState) {
		message.warning('请先登录');
		router.push('/portal/login');
		return;
	}
	const user = JSON.parse(userState);

	// 创建订单
	const order = createOrder({
		userId: user.user.id,
		courseId: course.value.id,
		courseTitle: course.value.title,
		courseCover: course.value.coverImage,
		originalPrice: course.value.price,
		actualPrice: finalPrice.value,
		couponId: selectedCoupon.value?.id,
		couponDiscount: orderInfo.value.couponDiscount,
		status: 'paid',
		paidAt: new Date().toLocaleString('zh-CN'),
	});

	// 支付成功提示
	message.success('支付成功！');

	// 延迟跳转到我的课程页
	setTimeout(() => {
		router.push('/member/profile/courses');
	}, 1500);
}

// 返回课程详情
function handleBack() {
	router.push(`/portal/course-detail/${courseId}`);
}

onMounted(() => {
	loadCourseDetail();
});
</script>

<template>
  <div class="checkout-page min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 面包屑 -->
      <div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <button class="hover:text-blue-600" @click="handleBack">课程详情</button>
        <span>/</span>
        <span class="text-gray-800">确认订单</span>
      </div>

      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
      </div>

      <div v-else-if="!course" class="py-16 text-center text-gray-500">
        课程不存在
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- 左侧：订单信息 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 课程信息 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-gray-800">课程信息</h2>
            <div class="flex gap-4">
              <img
                :src="course.coverImage"
                :alt="course.title"
                class="h-32 w-48 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="mb-2 text-xl font-semibold text-gray-800">
                  {{ course.title }}
                </h3>
                <p class="mb-3 text-sm text-gray-600 line-clamp-2">
                  {{ course.description }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in course.tags"
                    :key="tag"
                    class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 优惠券 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-gray-800">优惠券</h2>
            <div class="space-y-3">
              <div
                v-for="coupon in coupons"
                :key="coupon.id"
                class="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:border-blue-500"
                :class="
                  selectedCoupon?.id === coupon.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                "
                @click="handleSelectCoupon(coupon)"
              >
                <div>
                  <p class="font-medium text-gray-800">{{ coupon.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{
                      coupon.type === 'percent'
                        ? `折扣${coupon.discount}%`
                        : `减${coupon.discount}元`
                    }}
                    <span v-if="coupon.minAmount > 0">
                      ，满¥{{ (coupon.minAmount / 100).toFixed(0) }}可用
                    </span>
                  </p>
                </div>
                <div class="text-sm">
                  <span
                    v-if="selectedCoupon?.id === coupon.id"
                    class="text-blue-600"
                  >
                    ✓ 已选择
                  </span>
                </div>
              </div>

              <button
                class="w-full rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600"
                @click="selectedCoupon = null"
              >
                不使用优惠券
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧：支付信息 -->
        <div class="space-y-6">
          <!-- 价格明细 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-gray-800">价格明细</h2>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">课程原价</span>
                <span class="text-gray-800">
                  ¥{{ (course.originalPrice || course.price / 100).toFixed(2) }}
                </span>
              </div>
              <div
                v-if="course.originalPrice && course.originalPrice > course.price"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-600">活动优惠</span>
                <span class="text-red-500">
                  -¥{{ ((course.originalPrice - course.price) / 100).toFixed(2) }}
                </span>
              </div>
              <div
                v-if="selectedCoupon"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-600">优惠券</span>
                <span class="text-red-500">
                  -
                  {{
                    selectedCoupon.type === 'percent'
                      ? ((course.price * selectedCoupon.discount) / 100 / 100).toFixed(2)
                      : (selectedCoupon.discount).toFixed(2)
                  }}元
                </span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between">
                  <span class="text-base font-medium text-gray-800">实付金额</span>
                  <span class="text-2xl font-bold text-red-500">
                    ¥{{ (finalPrice / 100).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 支付方式 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-gray-800">支付方式</h2>
            <div class="space-y-3">
              <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                     :class="paymentMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="alipay"
                  class="h-4 w-4 text-blue-600"
                />
                <img src="https://img.alipay.com/static/favicon.ico" alt="" class="h-6" />
                <span class="text-sm font-medium text-gray-700">支付宝</span>
              </label>
              <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                     :class="paymentMethod === 'wechat' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="wechat"
                  class="h-4 w-4 text-green-600"
                />
                <span class="text-2xl">💬</span>
                <span class="text-sm font-medium text-gray-700">微信支付</span>
              </label>
              <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                     :class="paymentMethod === 'balance' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="balance"
                  class="h-4 w-4 text-orange-600"
                />
                <span class="text-2xl">💰</span>
                <span class="text-sm font-medium text-gray-700">余额支付</span>
              </label>
            </div>
          </div>

          <!-- 提交订单 -->
          <button
            class="w-full rounded-lg bg-red-500 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-red-600"
            @click="handlePay"
          >
            立即支付 ¥{{ (finalPrice / 100).toFixed(2) }}
          </button>

          <!-- 提示 -->
          <div class="rounded-lg bg-blue-50 p-4">
            <p class="text-sm text-blue-800">
              <span class="font-medium">💡 温馨提示：</span>
              提交订单后请在30分钟内完成支付，超时订单将自动取消
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
