<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserOrders, payOrder, cancelOrder, getOrderStats, type Order } from '@/utils/order-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
type OrderStatusType = 'all' | 'pending' | 'paid' | 'cancelled';

// 当前状态筛选
const activeStatus = ref<OrderStatusType>('all');

// 订单列表
const orders = ref<Order[]>([]);

// 订单状态配置
const statusConfig = [
  { key: 'all' as OrderStatusType, label: '全部订单', count: 0 },
  { key: 'pending' as OrderStatusType, label: '待付款', count: 0 },
  { key: 'paid' as OrderStatusType, label: '已完成', count: 0 },
  { key: 'cancelled' as OrderStatusType, label: '已取消', count: 0 },
];

// 根据筛选条件显示的订单
const displayedOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === activeStatus.value);
});

// 更新状态计数
function updateStatusCounts() {
  const stats = getOrderStats(authStore.userInfo?.userId || '');

  statusConfig[0].count = stats.total;
  statusConfig[1].count = stats.pending;
  statusConfig[2].count = stats.paid;
  statusConfig[3].count = stats.cancelled;
}

// 加载订单列表
async function loadOrders() {
  if (!authStore.userInfo) return;

  loading.value = true;
  try {
    const userOrders = getUserOrders(authStore.userInfo.userId);
    // 按创建时间倒序
    orders.value = userOrders.sort((a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );

    updateStatusCounts();
    console.log('加载订单列表:', orders.value.length);
  } catch (error: any) {
    ElMessage.error(error.message || '加载订单失败');
  } finally {
    loading.value = false;
  }
}

// 切换状态
function handleStatusChange(status: OrderStatusType) {
  activeStatus.value = status;
}

// 去支付
function handlePay(orderId: string) {
  const order = orders.value.find(o => o.orderId === orderId);
  if (!order) return;

  router.push(`/portal/checkout/${order.courseId}`);
}

// 取消订单
async function handleCancel(orderId: string) {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    cancelOrder(orderId);
    ElMessage.success('订单已取消');

    // 重新加载订单列表
    loadOrders();
  } catch (error) {
    // 用户取消操作
  }
}

// 查看课程详情
function handleViewCourse(courseId: string) {
  router.push(`/portal/course/${courseId}`);
}

// 格式化时间
function formatTime(timeStr: string): string {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 获取支付方式文本
function getPaymentMethodText(method?: string): string {
  const map: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
  };
  return map[method] || '-';
}

// 获取状态标签类型
function getStatusType(status: string): 'warning' | 'success' | 'info' | 'danger' {
  const map: Record<string, any> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'info',
  };
  return map[status] || 'info';
}

// 获取状态文本
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待付款',
    paid: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
}

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="my-orders">
    <div class="page-header">
      <h2>订单记录</h2>
      <p>查看您的所有订单</p>
    </div>

    <!-- 状态筛选 -->
    <div class="status-tabs">
      <button
        v-for="status in statusConfig"
        :key="status.key"
        class="status-tab"
        :class="{ active: activeStatus === status.key }"
        @click="handleStatusChange(status.key)"
      >
        <span class="tab-label">{{ status.label }}</span>
        <span class="tab-count">({{ status.count }})</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 订单列表 -->
    <div v-else-if="displayedOrders.length > 0" class="orders-list">
      <div v-for="order in displayedOrders" :key="order.orderId" class="order-card">
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderId }}</span>
            <span class="order-time">{{ formatTime(order.createTime) }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)" size="large">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>

        <!-- 订单内容 -->
        <div class="order-content">
          <div class="course-info" @click="handleViewCourse(order.courseId)">
            <el-image :src="order.courseCover" fit="cover" class="course-cover" />
            <div class="course-details">
              <h3 class="course-name">{{ order.courseName }}</h3>
            </div>
          </div>

          <div class="order-price">
            <div class="price-label">订单金额</div>
            <div class="price-value">¥{{ order.price }}</div>
          </div>

          <div class="order-actions">
            <!-- 待付款订单 -->
            <template v-if="order.status === 'pending'">
              <el-button type="primary" @click="handlePay(order.orderId)">
                去支付
              </el-button>
              <el-button @click="handleCancel(order.orderId)">取消订单</el-button>
            </template>

            <!-- 已完成订单 -->
            <template v-else-if="order.status === 'paid'">
              <el-button type="success" @click="handleViewCourse(order.courseId)">
                开始学习
              </el-button>
            </template>

            <!-- 已取消订单 -->
            <template v-else-if="order.status === 'cancelled'">
              <el-button type="info" @click="handleViewCourse(order.courseId)">
                再次购买
              </el-button>
            </template>
          </div>
        </div>

        <!-- 订单底部信息 -->
        <div class="order-footer">
          <span class="payment-method">
            支付方式：{{ getPaymentMethodText(order.paymentMethod) }}
          </span>
          <span v-if="order.payTime" class="pay-time">
            支付时间：{{ formatTime(order.payTime) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty :description="activeStatus === 'all' ? '暂无订单' : `暂无${statusConfig.find(s => s.key === activeStatus)?.label}`">
        <el-button v-if="activeStatus === 'all'" type="primary" @click="router.push('/portal/courses')">
          去选课
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-orders {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-extra-large;

    h2 {
      font-size: $font-size-extra-large;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    p {
      color: $text-color-secondary;
    }
  }

  .status-tabs {
    display: flex;
    gap: $spacing-base;
    margin-bottom: $spacing-extra-large;
    border-bottom: 1px solid $border-color-lighter;

    .status-tab {
      padding: $spacing-base $spacing-large;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: $font-size-medium;
      color: $text-color-secondary;
      transition: $transition-base;
      display: flex;
      align-items: center;
      gap: $spacing-small;

      &:hover {
        color: $--el-color-primary;
      }

      &.active {
        color: $--el-color-primary;
        border-bottom-color: $--el-color-primary;
        font-weight: 600;
      }

      .tab-count {
        color: $text-color-placeholder;
        font-size: $font-size-small;
      }
    }
  }

  .loading-container {
    padding: $spacing-extra-large 0;
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-large;
  }

  .order-card {
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    padding: $spacing-large;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
    }
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: $spacing-base;
    margin-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-lighter;

    .order-info {
      display: flex;
      flex-direction: column;
      gap: $spacing-small;

      .order-no {
        font-size: $font-size-base;
        color: $text-color-primary;
        font-weight: 500;
      }

      .order-time {
        font-size: $font-size-small;
        color: $text-color-placeholder;
      }
    }
  }

  .order-content {
    display: flex;
    align-items: center;
    gap: $spacing-extra-large;

    .course-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: $spacing-base;
      cursor: pointer;
      padding: $spacing-small;
      border-radius: $border-radius-small;
      transition: $transition-base;

      &:hover {
        background: $background-color-base;
      }

      .course-cover {
        width: 120px;
        height: 90px;
        border-radius: $border-radius-small;
        flex-shrink: 0;
      }

      .course-details {
        .course-name {
          font-size: $font-size-medium;
          font-weight: 500;
          color: $text-color-primary;
          margin-bottom: $spacing-small;
        }
      }
    }

    .order-price {
      text-align: center;

      .price-label {
        font-size: $font-size-small;
        color: $text-color-secondary;
        margin-bottom: $spacing-small;
      }

      .price-value {
        font-size: $font-size-extra-large;
        font-weight: 600;
        color: #f56c6c;
      }
    }

    .order-actions {
      display: flex;
      gap: $spacing-base;
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    padding-top: $spacing-base;
    margin-top: $spacing-base;
    border-top: 1px solid $border-color-lighter;
    font-size: $font-size-small;
    color: $text-color-placeholder;

    .payment-method,
    .pay-time {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
