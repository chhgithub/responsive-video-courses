<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserOrders, payOrder, cancelOrder, getOrderStats, forceRefreshOrderData, adminUpdateOrderStatus, type Order } from '@/utils/order-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
type OrderStatusType = 'all' | 'pending' | 'paid' | 'cancelled' | 'refunding' | 'refunded' | 'refund_failed';

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
  { key: 'refunding' as OrderStatusType, label: '退款中', count: 0 },
  { key: 'refunded' as OrderStatusType, label: '已退款', count: 0 },
  { key: 'refund_failed' as OrderStatusType, label: '退款失败', count: 0 },
];

// 退款相关
const refundDialogVisible = ref(false);
const currentOrder = ref<Order | null>(null);
const refundSubmitting = ref(false);
const refundForm = ref({
  reason: '',
  description: '',
});
const refundDaysLeft = ref(0);

// 根据筛选条件显示的订单
const displayedOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === activeStatus.value);
});

// 更新状态计数
function updateStatusCounts() {
  const userOrders = orders.value;

  statusConfig[0].count = userOrders.length; // 全部订单
  statusConfig[1].count = userOrders.filter(o => o.status === 'pending').length; // 待付款
  statusConfig[2].count = userOrders.filter(o => o.status === 'paid').length; // 已完成
  statusConfig[3].count = userOrders.filter(o => o.status === 'cancelled').length; // 已取消
  statusConfig[4].count = userOrders.filter(o => o.status === 'refunding').length; // 退款中
  statusConfig[5].count = userOrders.filter(o => o.status === 'refunded').length; // 已退款
  statusConfig[6].count = userOrders.filter(o => o.status === 'refund_failed').length; // 退款失败
}

// 加载订单列表
async function loadOrders() {
  if (!authStore.userInfo) {
    console.warn('用户未登录');
    ElMessage.warning('请先登录');
    return;
  }

  const userId = authStore.userInfo.userId;
  console.log('===== 开始加载订单 =====');
  console.log('当前用户ID:', userId);

  loading.value = true;
  try {
    // 先强制刷新数据（确保测试数据存在）
    console.log('调用强制刷新订单数据...');
    forceRefreshOrderData();

    // 等待让 localStorage 更新完成
    await new Promise(resolve => setTimeout(resolve, 500));

    const userOrders = getUserOrders(userId);
    console.log('获取到用户订单数量:', userOrders.length, '条');
    console.log('订单详情:', userOrders);

    // 按创建时间倒序
    orders.value = userOrders.sort((a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );

    updateStatusCounts();
    console.log('最终订单列表:', orders.value.length, '条');

    if (orders.value.length === 0) {
      ElMessage.warning('暂无订单数据');
    }
  } catch (error: any) {
    console.error('加载订单失败:', error);
    ElMessage.error(error.message || '加载订单失败');
  } finally {
    loading.value = false;
  }
}

// 切换状态
function handleStatusChange(status: OrderStatusType) {
  activeStatus.value = status;
}

// 手动刷新订单数据
function handleForceRefresh() {
  console.log('手动刷新订单数据...');
  forceRefreshOrderData();
  loadOrders();
  ElMessage.success('订单数据已刷新');
}

// 去支付
function handlePay(orderId: string) {
  const order = orders.value.find(o => o.orderId === orderId);
  if (!order) return;

  // 套餐订单不支持支付，需要重新购买
  if (order.type === 'package') {
    ElMessage.info('套餐订单请在套餐详情页重新购买');
    handleViewPackage(order.packageId);
    return;
  }

  // 单课程订单才能去支付
  if (!order.courseId) {
    ElMessage.error('订单异常：缺少课程信息');
    return;
  }

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
function handleViewCourse(courseId: string | undefined) {
  if (!courseId) return;
  router.push(`/portal/course/${courseId}`);
}

// 查看套餐详情
function handleViewPackage(packageId: string | undefined) {
  if (!packageId) return;
  router.push(`/portal/package/${packageId}`);
}

// 开始学习（跳转到视频学习页面）
function handleStartLearning(order: any) {
  if (order.type === 'package') {
    // 套餐订单：跳转到套餐详情页
    router.push(`/portal/package/${order.packageId}`);
  } else {
    // 课程订单：跳转到课程学习页面
    router.push(`/portal/course-learn/${order.courseId}`);
  }
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

// 打开退款对话框
function handleApplyRefund(order: Order) {
  // 套餐订单不支持退款
  if (order.type === 'package') {
    ElMessage.warning('套餐订单暂不支持线上退款，请联系客服处理');
    return;
  }

  // 退款中订单不允许重复申请
  if (order.status === 'refunding') {
    ElMessage.info('退款申请处理中，请勿重复提交');
    return;
  }

  // 检查退款期限（假设订单支付后7天内可申请退款）
  // 暂时注释此限制以方便测试
  // const payTime = order.payTime;
  // if (payTime) {
  //   const orderDate = new Date(payTime);
  //   const daysSincePayment = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  //   if (daysSincePayment > 7) {
  //     ElMessage.warning('已超过7天退款期限，无法申请退款');
  //     return;
  //   }
  // }

  currentOrder.value = order;
  refundForm.value = {
    reason: '',
    description: '',
  };
  refundDialogVisible.value = true;
}

// 提交退款申请
async function handleSubmitRefund() {
  if (!currentOrder.value) return;

  if (!refundForm.value.reason) {
    ElMessage.warning('请选择退款原因');
    return;
  }

  if (!refundForm.value.description || refundForm.value.description.length < 5) {
    ElMessage.warning('请输入退款说明（至少5个字）');
    return;
  }

  refundSubmitting.value = true;
  try {
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 更新订单状态为"退款中"
    adminUpdateOrderStatus(
      currentOrder.value.orderId,
      'refunding',
      refundForm.value.reason
    );

    console.log('退款申请已提交，订单ID:', currentOrder.value.orderId);

    // 关闭对话框
    refundDialogVisible.value = false;

    // 使用 nextTick 确保数据更新后再切换标签
    await nextTick();

    // 自动切换到"退款中"标签页
    activeStatus.value = 'refunding';
    console.log('已切换到退款中标签，当前状态:', activeStatus.value);

    // 等待 DOM 更新后再刷新数据
    await nextTick();

    // 重新加载订单列表
    await loadOrders();
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试');
  } finally {
    refundSubmitting.value = false;
  }
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
    refunding: 'warning',
    refunded: 'danger',
    refund_failed: 'danger',
  };
  return map[status] || 'info';
}

// 获取状态文本
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待付款',
    paid: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款',
    refund_failed: '退款失败',
  };
  return map[status] || status;
}

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="my-orders">
    <!-- 调试信息 -->
    <!-- <el-alert
      v-if="authStore.userInfo"
      title="调试信息"
      type="info"
      :closable="false"
      style="margin-bottom: 20px;"
    >
      用户ID: {{ authStore.userInfo.userId }} | 用户名: {{ authStore.userInfo.username }}
      | 订单数量: {{ orders.length }}
    </el-alert>
    <el-alert
      v-else
      title="未登录"
      type="warning"
      :closable="false"
      style="margin-bottom: 20px;"
    >
      请先登录
    </el-alert> -->

    <div class="page-header">
      <div class="header-left">
        <h2>订单记录</h2>
        <p>查看您的所有订单</p>
      </div>
      <el-button :icon="Refresh" @click="handleForceRefresh">刷新数据</el-button>
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
          <div
            class="course-info"
            @click="order.type === 'package' ? handleViewPackage(order.packageId) : handleViewCourse(order.courseId)"
          >
            <el-image
              :src="order.type === 'package' ? order.packageCover : order.courseCover"
              fit="cover"
              class="course-cover"
            />
            <div class="course-details">
              <h3 class="course-name">
                {{ order.type === 'package' ? order.packageName : order.courseName }}
              </h3>
              <el-tag v-if="order.type === 'package'" size="small" type="warning">
                套餐（{{ order.packageCourses?.length || 0 }}门课程）
              </el-tag>
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
              <el-button
                type="success"
                @click="handleStartLearning(order)"
              >
                开始学习
              </el-button>
              <el-button
                type="warning"
                @click="handleApplyRefund(order)"
              >
                申请退款
              </el-button>
            </template>

            <!-- 已取消订单 -->
            <template v-else-if="order.status === 'cancelled'">
              <el-button
                type="info"
                @click="order.type === 'package' ? handleViewPackage(order.packageId) : handleViewCourse(order.courseId)"
              >
                再次购买
              </el-button>
            </template>

            <!-- 退款中订单 -->
            <template v-else-if="order.status === 'refunding'">
              <el-button type="warning" disabled>退款处理中</el-button>
            </template>

            <!-- 已退款订单 -->
            <template v-else-if="order.status === 'refunded'">
              <el-button
                type="info"
                @click="order.type === 'package' ? handleViewPackage(order.packageId) : handleViewCourse(order.courseId)"
              >
                再次购买
              </el-button>
            </template>

            <!-- 退款失败订单 -->
            <template v-else-if="order.status === 'refund_failed'">
              <el-button
                type="warning"
                @click="handleApplyRefund(order)"
              >
                重新申请退款
              </el-button>
              <el-button
                type="info"
                @click="order.type === 'package' ? handleViewPackage(order.packageId) : handleViewCourse(order.courseId)"
              >
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
          <span v-if="order.refundTime" class="refund-time">
            退款时间：{{ formatTime(order.refundTime) }}
          </span>
        </div>

        <!-- 退款信息 -->
        <div v-if="order.status === 'refunded' || order.status === 'refund_failed'" class="refund-info">
          <div class="refund-reason">
            <span class="label">退款原因：</span>
            <span class="value">{{ order.refundReason || '-' }}</span>
          </div>
          <!-- <div v-if="order.status === 'refund_failed'" class="refund-fail-reason">
            <span class="label">失败原因：</span>
            <span class="value">{{ order.refundFailReason || '-' }}</span>
          </div> -->
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

    <!-- 退款申请对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input :value="currentOrder?.orderId" disabled />
        </el-form-item>

        <el-form-item label="商品信息">
          <div class="product-info">
            <el-image
              v-if="currentOrder?.type === 'course'"
              :src="currentOrder?.courseCover"
              fit="cover"
              class="product-image"
            />
            <el-image
              v-else
              :src="currentOrder?.packageCover"
              fit="cover"
              class="product-image"
            />
            <div>
              <div class="product-name">
                {{ currentOrder?.type === 'course' ? currentOrder?.courseName : currentOrder?.packageName }}
              </div>
              <div class="product-price">
                <span v-if="currentOrder?.originalPrice && currentOrder?.originalPrice > currentOrder?.price">
                  原价：¥{{ currentOrder.originalPrice }}
                </span>
                实付：¥{{ currentOrder.price }}
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="退款原因" required>
          <el-select v-model="refundForm.reason" placeholder="请选择退款原因">
            <el-option label="不想要了" value="不想要了" />
            <el-option label="商品信息有误" value="商品信息有误" />
            <el-option label="重复购买" value="重复购买" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细说明">
          <el-input
            v-model="refundForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细描述退款原因（至少5个字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 16px;"
        >
          <template #default>
            <div style="font-size: 13px;">
              退款说明：<br>
              1. 订单支付后 <span style="color: #f56c6c;">7天</span> 内可申请退款<br>
              2. 套餐订单暂不支持线上退款，请联系客服处理<br>
              3. 退款申请提交后订单状态变为"退款中"，请等待管理员审核
            </div>
          </template>
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="refundSubmitting"
          @click="handleSubmitRefund"
        >
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-orders {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-extra-large;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .header-left {
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
    .pay-time,
    .refund-time {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .refund-info {
    padding: $spacing-base;
    margin-top: $spacing-base;
    background: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: $border-radius-small;
    font-size: $font-size-small;

    .refund-reason,
    .refund-fail-reason {
      display: flex;
      gap: $spacing-small;
      margin-bottom: $spacing-small;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 500;
        color: #f56c6c;
        flex-shrink: 0;
      }

      .value {
        color: $text-color-regular;
      }
    }
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }

  // 退款对话框样式
  .product-info {
    display: flex;
    gap: $spacing-base;

    .product-image {
      width: 80px;
      height: 60px;
      border-radius: $border-radius-base;
      flex-shrink: 0;
    }

    .product-name {
      flex: 1;
      font-size: $font-size-base;
      color: $text-color-primary;
      margin-bottom: 4px;

      .product-price {
        font-weight: 500;
        color: $text-color-secondary;
        font-size: $font-size-small;
        margin-top: 4px;

        .original-price {
          color: $text-color-placeholder;
        }

        .current-price {
          color: #f56c6c;
          font-size: $font-size-large;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
