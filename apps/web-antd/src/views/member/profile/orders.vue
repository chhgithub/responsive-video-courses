<script lang="ts" setup>
import { onMounted, ref } from 'vue';

interface Order {
  orderId: string;
  courseId: number;
  courseName: string;
  courseCover: string;
  amount: number;
  paymentMethod: string;
  status: 'cancelled' | 'completed' | 'pending' | 'refunded';
  createTime: string;
}

const orders = ref<Order[]>([]);
const loading = ref(false);

async function loadOrders() {
  loading.value = true;
  // 模拟订单数据
  setTimeout(() => {
    orders.value = [
      {
        orderId: 'ORD20250209001',
        courseId: 1,
        courseName: 'Vue3 从入门到精通',
        courseCover: 'https://picsum.photos/seed/vue/200/120',
        amount: 199,
        paymentMethod: '微信支付',
        status: 'completed',
        createTime: '2025-02-09 10:30:00',
      },
      {
        orderId: 'ORD20250208002',
        courseId: 2,
        courseName: 'React 实战开发',
        courseCover: 'https://picsum.photos/seed/react/200/120',
        amount: 299,
        paymentMethod: '支付宝',
        status: 'completed',
        createTime: '2025-02-08 14:20:00',
      },
      {
        orderId: 'ORD20250207003',
        courseId: 3,
        courseName: 'Python 数据分析',
        courseCover: 'https://picsum.photos/seed/python/200/120',
        amount: 159,
        paymentMethod: '微信支付',
        status: 'pending',
        createTime: '2025-02-07 09:15:00',
      },
    ];
    loading.value = false;
  }, 500);
}

function getStatusInfo(status: Order['status']): {
  bg: string;
  color: string;
  text: string;
} {
  const statusMap: Record<
    Order['status'],
    { bg: string; color: string; text: string }
  > = {
    pending: { text: '待支付', color: 'text-orange-600', bg: 'bg-orange-100' },
    completed: { text: '已完成', color: 'text-green-600', bg: 'bg-green-100' },
    cancelled: { text: '已取消', color: 'text-red-600', bg: 'bg-red-100' },
    refunded: { text: '已退款', color: 'text-gray-600', bg: 'bg-gray-100' },
  };
  return (
    statusMap[status] || {
      text: '未知',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    }
  );
}

// 操作按钮
function handleOrderAction(order: Order) {
  if (order.status === 'pending') {
    // 继续支付
    console.log(`跳转到支付页面：${order.orderId}`);
  } else if (order.status === 'completed') {
    // 查看课程
    console.log(`跳转到课程详情：${order.courseId}`);
  }
}

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="order-records">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">订单记录</h2>
      <p class="text-sm text-gray-500">查看您的所有订单</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-500">加载中...</p>
    </div>

    <!-- 订单列表 -->
    <div v-else>
      <div v-if="orders.length > 0" class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="order-card overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg"
        >
          <div
            class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex gap-4">
              <!-- 课程封面 -->
              <img
                :src="order.courseCover"
                :alt="order.courseName"
                class="h-20 w-28 rounded-lg object-cover sm:h-24 sm:w-32"
              />

              <!-- 订单信息 -->
              <div>
                <h3 class="font-semibold text-gray-800">
                  {{ order.courseName }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  订单号：{{ order.orderId }}
                </p>
                <p class="text-sm text-gray-500">{{ order.createTime }}</p>
                <p class="text-sm text-gray-500">{{ order.paymentMethod }}</p>
              </div>
            </div>

            <!-- 价格和状态 -->
            <div
              class="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2"
            >
              <div class="text-right sm:text-left">
                <div class="text-2xl font-bold text-red-600">
                  ¥{{ order.amount }}
                </div>
                <span
                  class="mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium"
                  :class="[
                    getStatusInfo(order.status).bg,
                    getStatusInfo(order.status).color,
                  ]"
                >
                  {{ getStatusInfo(order.status).text }}
                </span>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2">
                <button
                  v-if="order.status === 'pending'"
                  @click="handleOrderAction(order)"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  继续支付
                </button>
                <button
                  v-if="order.status === 'completed'"
                  @click="handleOrderAction(order)"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  查看课程
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-16 text-center">
        <svg
          class="mx-auto h-24 w-24 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <p class="mt-4 text-gray-500">暂无订单记录</p>
        <router-link
          to="/portal/courses"
          class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          去选课
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
}
</style>
