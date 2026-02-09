<script lang="ts" setup>
import { onMounted, ref } from 'vue';

interface Order {
  orderId: string;
  courseName: string;
  courseCover: string;
  amount: number;
  paymentMethod: string;
  status: string;
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
        orderId: 'ORD20250115001',
        courseName: 'Vue3 从入门到精通',
        courseCover: 'https://picsum.photos/seed/vue/200/120',
        amount: 199,
        paymentMethod: '微信支付',
        status: 'completed',
        createTime: '2025-01-15 10:30:00',
      },
      {
        orderId: 'ORD20250118001',
        courseName: 'React 实战开发',
        courseCover: 'https://picsum.photos/seed/react/200/120',
        amount: 299,
        paymentMethod: '支付宝',
        status: 'completed',
        createTime: '2025-01-18 14:20:00',
      },
    ];
    loading.value = false;
  }, 500);
}

function getStatusText(status: string): { color: string; text: string } {
  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { text: '待支付', color: 'orange' },
    completed: { text: '已完成', color: 'green' },
    cancelled: { text: '已取消', color: 'red' },
    refunded: { text: '已退款', color: 'gray' },
  };
  return statusMap[status] || { text: '未知', color: 'gray' };
}

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="p-6">
    <a-spin :spinning="loading">
      <div v-if="orders.length > 0" class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="rounded-lg border p-4 transition-shadow hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <div class="flex gap-4">
              <img
                :src="order.courseCover"
                class="h-16 w-24 rounded object-cover"
              />
              <div>
                <h3 class="font-semibold text-gray-800">
                  {{ order.courseName }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  订单号：{{ order.orderId }}
                </p>
                <p class="text-sm text-gray-500">{{ order.createTime }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-red-500">
                ¥{{ order.amount }}
              </div>
              <div class="text-sm text-gray-500">{{ order.paymentMethod }}</div>
              <a-tag :color="getStatusText(order.status).color" class="mt-2">
                {{ getStatusText(order.status).text }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无订单记录" class="py-16" />
    </a-spin>
  </div>
</template>
