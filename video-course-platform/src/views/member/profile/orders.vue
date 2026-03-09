<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, ShoppingCart, Key, InfoFilled, OfficeBuilding } from '@element-plus/icons-vue';
import { getUserOrders, payOrder, cancelOrder, getOrderStats, forceRefreshOrderData, forceRefreshRefundData, type Order } from '@/utils/order-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import { applyForRefund, getOrderRefundApplications, type RefundApplication } from '@/utils/order-storage';
import { getRedemptionRecordsByUserId, type RedemptionRecord } from '@/utils/general-education-storage';
import { getPortalCourseById as getCourseById } from '@/utils/portal-course-adapter';
import { getPackageById } from '@/utils/course-package-storage';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
type OrderStatusType = 'all' | 'pending' | 'paid' | 'cancelled' | 'refund_pending' | 'refunding' | 'refunded' | 'refund_failed';

// Tab切换：购买订单 | 兑换记录
type TabType = 'purchase' | 'redeem';
const activeTab = ref<TabType>('purchase');

// 当前状态筛选（购买订单）
const activeStatus = ref<OrderStatusType>('all');

// 兑换记录状态筛选
const redeemStatus = ref<'all' | 'used' | 'expired'>('all');

// 购买订单列表
const orders = ref<Order[]>([]);

// 兑换记录列表
const redemptionRecords = ref<RedemptionRecord[]>([]);

// 订单状态配置
const statusConfig = [
  { key: 'all' as OrderStatusType, label: '全部订单', count: 0 },
  { key: 'pending' as OrderStatusType, label: '待付款', count: 0 },
  { key: 'paid' as OrderStatusType, label: '已完成', count: 0 },
  { key: 'cancelled' as OrderStatusType, label: '已取消', count: 0 },
  { key: 'refund_pending' as OrderStatusType, label: '退款审核中', count: 0 },
  { key: 'refunding' as OrderStatusType, label: '退款中', count: 0 },
  { key: 'refunded' as OrderStatusType, label: '已退款', count: 0 },
  { key: 'refund_failed' as OrderStatusType, label: '退款失败', count: 0 },
];

// 兑换记录状态配置
const redeemStatusConfig = [
  { key: 'all', label: '全部兑换', count: 0 },
  { key: 'used', label: '已使用', count: 0 },
  { key: 'expired', label: '已过期', count: 0 },
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

// 退款记录对话框
const refundHistoryDialogVisible = ref(false);
const refundHistoryApplications = ref<RefundApplication[]>([]);

// 根据筛选条件显示的订单
const displayedOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === activeStatus.value);
});

// 检查兑换记录是否已过期
function isRecordExpired(record: RedemptionRecord): boolean {
  if (!record.accessValidDays) return false;
  const now = new Date();
  const redeemTime = new Date(record.redeemTime);
  const expireTime = new Date(redeemTime.getTime() + record.accessValidDays * 24 * 60 * 60 * 1000);
  return now > expireTime;
}

// 根据筛选条件显示的兑换记录
const displayedRedeemRecords = computed(() => {
  const records = redemptionRecords.value;

  if (redeemStatus.value === 'all') {
    return records;
  }
  if (redeemStatus.value === 'used') {
    // 显示未过期的记录
    return records.filter(r => !isRecordExpired(r));
  }
  if (redeemStatus.value === 'expired') {
    // 显示已过期的记录
    return records.filter(r => isRecordExpired(r));
  }

  return records;
});

// 检查订单是否有退款记录
function hasRefundRecords(orderId: string): boolean {
  const records = getOrderRefundApplications(orderId);
  return records.length > 0;
}

// 更新状态计数
function updateStatusCounts() {
  const userOrders = orders.value;

  statusConfig[0].count = userOrders.length; // 全部订单
  statusConfig[1].count = userOrders.filter(o => o.status === 'pending').length; // 待付款
  statusConfig[2].count = userOrders.filter(o => o.status === 'paid').length; // 已完成
  statusConfig[3].count = userOrders.filter(o => o.status === 'cancelled').length; // 已取消
  statusConfig[4].count = userOrders.filter(o => o.status === 'refund_pending').length; // 退款审核中
  statusConfig[5].count = userOrders.filter(o => o.status === 'refunding').length; // 退款中
  statusConfig[6].count = userOrders.filter(o => o.status === 'refunded').length; // 已退款
  statusConfig[7].count = userOrders.filter(o => o.status === 'refund_failed').length; // 退款失败
}

// 更新兑换记录状态计数
function updateRedeemStatusCounts() {
  const records = redemptionRecords.value;

  redeemStatusConfig[0].count = records.length; // 全部兑换
  redeemStatusConfig[1].count = records.filter(r => !isRecordExpired(r)).length; // 已使用（未过期）
  redeemStatusConfig[2].count = records.filter(r => isRecordExpired(r)).length; // 已过期
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
    forceRefreshRefundData();

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

// 加载兑换记录
async function loadRedemptionRecords() {
  if (!authStore.userInfo) {
    console.warn('用户未登录');
    ElMessage.warning('请先登录');
    return;
  }

  const userId = authStore.userInfo.userId;
  console.log('===== 开始加载兑换记录 =====');
  console.log('当前用户ID:', userId);

  loading.value = true;
  try {
    const records = getRedemptionRecordsByUserId(userId);
    console.log('获取到兑换记录数量:', records.length, '条');

    // 按兑换时间倒序
    redemptionRecords.value = records.sort((a, b) =>
      new Date(b.redeemTime).getTime() - new Date(a.redeemTime).getTime()
    );

    updateRedeemStatusCounts();
    console.log('最终兑换记录:', redemptionRecords.value.length, '条');

    if (redemptionRecords.value.length === 0) {
      ElMessage.info('暂无兑换记录');
    }
  } catch (error: any) {
    console.error('加载兑换记录失败:', error);
    ElMessage.error(error.message || '加载兑换记录失败');
  } finally {
    loading.value = false;
  }
}

// 切换状态
function handleStatusChange(status: OrderStatusType) {
  activeStatus.value = status;
}

// 切换兑换记录状态
function handleRedeemStatusChange(status: 'all' | 'used' | 'expired') {
  redeemStatus.value = status;
}

// 切换Tab
function handleTabChange(tab: TabType) {
  activeTab.value = tab;
  if (tab === 'purchase') {
    loadOrders();
  } else {
    loadRedemptionRecords();
  }
}

// 手动刷新订单数据
function handleForceRefresh() {
  console.log('手动刷新数据...');
  forceRefreshOrderData();
  forceRefreshRefundData();
  if (activeTab.value === 'purchase') {
    loadOrders();
  } else {
    loadRedemptionRecords();
  }
  ElMessage.success('数据已刷新');
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

  // 只有已支付和退款失败的订单可以申请退款
  if (order.status !== 'paid' && order.status !== 'refund_failed') {
    ElMessage.info('当前订单状态不支持申请退款');
    return;
  }

  currentOrder.value = order;
  refundForm.value = {
    reason: '',
    description: '',
  };
  refundDialogVisible.value = true;
}

// 打开退款记录对话框
function handleViewRefundHistory(order: Order) {
  console.log('=== 打开退款记录 ===');
  console.log('订单ID:', order.orderId);
  console.log('订单名称:', order.type === 'course' ? order.courseName : order.packageName);
  console.log('订单状态:', order.status);

  currentOrder.value = order;
  refundHistoryApplications.value = getOrderRefundApplications(order.orderId);

  console.log('退款记录数量:', refundHistoryApplications.value.length);
  console.log('退款记录详情:', refundHistoryApplications.value);

  if (refundHistoryApplications.value.length === 0) {
    console.warn('该订单暂无退款记录');
    ElMessage.info('该订单暂无退款申请记录');
  } else {
    refundHistoryDialogVisible.value = true;
  }
}

// 提交退款申请
async function handleSubmitRefund() {
  if (!currentOrder.value) return;

  if (!refundForm.value.reason) {
    ElMessage.warning('请选择退款原因');
    return;
  }

  refundSubmitting.value = true;
  try {
    // 调用新的退款申请 API
    await applyForRefund(
      currentOrder.value.orderId,
      refundForm.value.reason,
      refundForm.value.description || undefined
    );

    console.log('退款申请已提交，订单ID:', currentOrder.value.orderId);

    // 关闭对话框
    refundDialogVisible.value = false;

    ElMessage.success('退款申请已提交，请等待审核');

    // 使用 nextTick 确保数据更新后再切换标签
    await nextTick();

    // 自动切换到"退款审核中"标签页
    activeStatus.value = 'refund_pending';
    console.log('已切换到退款审核中标签，当前状态:', activeStatus.value);

    // 等待 DOM 更新后再刷新数据
    await nextTick();

    // 重新加载订单列表
    await loadOrders();
  } catch (error: any) {
    console.error('退款申请失败:', error);
    ElMessage.error(error.message || '提交失败，请稍后重试');
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
    refund_pending: 'warning',
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
    refund_pending: '退款审核中',
    refunding: '退款中',
    refunded: '已退款',
    refund_failed: '退款失败',
  };
  return map[status] || status;
}

// 获取课程/套餐封面
function getCourseCover(courseId: string): string {
  const course = getCourseById(courseId);
  if (course) {
    return course.cover || 'https://picsum.photos/seed/default/300/200';
  }

  // 如果不是课程，尝试获取套餐
  const pkg = getPackageById(parseInt(courseId));
  if (pkg) {
    return pkg.packageCover || 'https://picsum.photos/seed/default/300/200';
  }

  return 'https://picsum.photos/seed/default/300/200';
}

// 获取兑换记录状态类型
function getRedeemRecordStatusType(record: RedemptionRecord): any {
  if (isRecordExpired(record)) {
    return 'info';
  }
  return 'success';
}

// 获取兑换记录状态文本
function getRedeemRecordStatusText(record: RedemptionRecord): string {
  if (isRecordExpired(record)) {
    return '已过期';
  }
  return '学习中';
}

// 判断是否为套餐兑换
function isPackageRedemption(record: RedemptionRecord): boolean {
  return !!record.packageId && !!record.packageName;
}

onMounted(() => {
  if (activeTab.value === 'purchase') {
    loadOrders();
  } else {
    loadRedemptionRecords();
  }
});
</script>

<template>
  <div class="my-orders">
    <div class="page-header">
      <div class="header-left">
        <h2>订单记录</h2>
        <p>查看您的所有订单和兑换记录</p>
      </div>
      <el-button :icon="Refresh" @click="handleForceRefresh">刷新数据</el-button>
    </div>

    <!-- 二级Tab切换 -->
    <div class="tab-switcher">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'purchase' }"
        @click="handleTabChange('purchase')"
      >
        <el-icon><ShoppingCart /></el-icon>
        购买订单
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'redeem' }"
        @click="handleTabChange('redeem')"
      >
        <el-icon><Key /></el-icon>
        兑换记录
      </button>
    </div>

    <!-- 购买订单 -->
    <template v-if="activeTab === 'purchase'">
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
                type="warning"
                @click="handleApplyRefund(order)"
              >
                申请退款
              </el-button>
            </template>

            <!-- 退款审核中订单 -->
            <template v-else-if="order.status === 'refund_pending'">
              <el-button type="info" disabled>退款审核中...</el-button>
              <el-button v-if="hasRefundRecords(order.orderId)" type="info" @click="handleViewRefundHistory(order)">
                查看记录
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
              <el-button v-if="hasRefundRecords(order.orderId)" type="info" @click="handleViewRefundHistory(order)">
                查看记录
              </el-button>
            </template>

            <!-- 已退款订单 -->
            <template v-else-if="order.status === 'refunded'">
              <el-button
                type="info"
                @click="order.type === 'package' ? handleViewPackage(order.packageId) : handleViewCourse(order.courseId)"
              >
                再次购买
              </el-button>
              <el-button v-if="hasRefundRecords(order.orderId)" type="info" @click="handleViewRefundHistory(order)">
                查看记录
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
              <el-button v-if="hasRefundRecords(order.orderId)" type="info" @click="handleViewRefundHistory(order)">
                查看记录
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
        <!-- <div v-if="order.status === 'refunding'" class="refund-info">
          <div class="refund-reason">
            <span class="label">退款原因：</span>
            <span class="value">{{ order.refundReason || '-' }}</span>
          </div>
        </div> -->

        <!-- 退款记录引导提示 -->
        <!-- <div
          v-if="hasRefundRecords(order.orderId) && ['refunded', 'refund_failed'].includes(order.status)"
          class="refund-tip"
        >
          <el-icon><InfoFilled /></el-icon>
          退款详情请查看退款记录
        </div> -->
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
    </template>

    <!-- 兑换记录 -->
    <template v-if="activeTab === 'redeem'">
      <!-- 状态筛选 -->
      <div class="status-tabs">
        <button
          v-for="status in redeemStatusConfig"
          :key="status.key"
          class="status-tab"
          :class="{ active: redeemStatus === status.key }"
          @click="handleRedeemStatusChange(status.key)"
        >
          <span class="tab-label">{{ status.label }}</span>
          <span class="tab-count">({{ status.count }})</span>
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 兑换记录列表 -->
      <div v-else-if="displayedRedeemRecords.length > 0" class="redeem-list">
        <div v-for="record in displayedRedeemRecords" :key="record.id" class="redeem-card">
          <!-- 兑换码头部 -->
          <div class="redeem-header">
            <div class="redeem-info">
              <el-icon class="code-icon"><Key /></el-icon>
              <span class="code-text">兑换码：{{ record.code }}</span>
            </div>
            <span class="redeem-time">{{ formatTime(record.redeemTime) }}</span>
          </div>

          <!-- 兑换内容 -->
          <div class="redeem-content">
            <el-image
              :src="getCourseCover(record.courseId || record.packageId)"
              fit="cover"
              class="course-cover"
            />
            <div class="course-details">
              <h3 class="course-name">{{ record.courseName }}</h3>
              <el-tag v-if="isPackageRedemption(record)" size="small" type="warning" style="margin-bottom: 8px;">
                套餐
              </el-tag>
              <div class="org-info">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ record.organizationName }}</span>
              </div>
            </div>
          </div>

          <!-- 兑换底部 -->
          <!-- <div class="redeem-footer">
            <el-tag :type="getRedeemRecordStatusType(record)" size="large">
              {{ getRedeemRecordStatusText(record) }}
            </el-tag>
          </div> -->
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty :description="redeemStatus === 'all' ? '暂无兑换记录' : `暂无${redeemStatusConfig.find(s => s.key === redeemStatus)?.label}`">
        </el-empty>
      </div>
    </template>

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
              3. 退款申请提交后订单状态变为"退款审核中"，请等待管理员审核<br>
              4. 可以多次申请退款，每次申请都会有独立记录
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

    <!-- 退款记录对话框 -->
    <el-dialog
      v-model="refundHistoryDialogVisible"
      title="退款申请记录"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="refundHistoryApplications.length > 0" class="refund-history-dialog">
        <div
          v-for="(app, index) in refundHistoryApplications"
          :key="app.id"
          :class="['history-item', { 'latest': index === 0 }]"
        >
          <div class="history-header">
            <el-tag v-if="index === 0" type="success" size="small">最新申请</el-tag>
            <span class="history-title">第 {{ refundHistoryApplications.length - index }} 次退款申请</span>
            <span class="history-time">{{ formatTime(app.applyTime) }}</span>
          </div>
          <div class="history-content">
            <div class="history-reason">
              <span class="label">退款原因:</span>
              <span>{{ app.reasonType }}</span>
            </div>
            <div v-if="app.reasonDetail" class="history-detail">
              <span class="label">详细说明:</span>
              <span>{{ app.reasonDetail }}</span>
            </div>
            <div class="history-status">
              <span class="label">审核状态:</span>
              <el-tag v-if="app.auditStatus === 'pending'" type="warning" size="small">审核中...</el-tag>
              <el-tag v-else-if="app.auditStatus === 'approved'" type="success" size="small">审核通过</el-tag>
              <el-tag v-else-if="app.auditStatus === 'rejected'" type="danger" size="small">审核拒绝</el-tag>
            </div>
            <div v-if="app.auditBy" class="history-audit-by">
              <span class="label">审核人:</span>
              <span>{{ app.auditBy }}</span>
            </div>
            <div v-if="app.auditTime" class="history-audit-time">
              <span class="label">审核时间:</span>
              <span>{{ formatTime(app.auditTime) }}</span>
            </div>
            <div v-if="app.auditRemark" class="history-audit-remark">
              <span class="label">审核意见:</span>
              <span>{{ app.auditRemark }}</span>
            </div>
            <div v-if="app.refundTime" class="history-refund-time">
              <span class="label">退款完成时间:</span>
              <span>{{ formatTime(app.refundTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无退款申请记录" />
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

  // Tab切换器
  .tab-switcher {
    display: flex;
    gap: $spacing-base;
    margin-bottom: $spacing-extra-large;
    padding-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-lighter;

    .tab-button {
      padding: $spacing-base $spacing-extra-large;
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

  .redeem-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-large;
  }

  .redeem-card {
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    padding: $spacing-large;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
    }
  }

  .redeem-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: $spacing-base;
    margin-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-lighter;

    .redeem-info {
      display: flex;
      align-items: center;
      gap: $spacing-small;

      .code-icon {
        color: $--el-color-primary;
      }

      .code-text {
        font-size: $font-size-base;
        color: $text-color-primary;
        font-weight: 500;
      }
    }

    .redeem-time {
      font-size: $font-size-small;
      color: $text-color-placeholder;
    }
  }

  .redeem-content {
    display: flex;
    align-items: center;
    gap: $spacing-extra-large;
    margin-bottom: $spacing-base;

    .course-cover {
      width: 120px;
      height: 90px;
      border-radius: $border-radius-small;
      flex-shrink: 0;
    }

    .course-details {
      flex: 1;
      min-width: 0;

      .course-name {
        font-size: $font-size-medium;
        font-weight: 500;
        color: $text-color-primary;
        margin-bottom: $spacing-small;
      }

      .org-info {
        display: flex;
        align-items: center;
        gap: $spacing-small;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }

  .redeem-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-base;
    margin-top: $spacing-base;
    border-top: 1px solid $border-color-lighter;
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

  .refund-tip {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    padding: $spacing-base;
    margin-top: $spacing-base;
    background: #f5f7fa;
    border-radius: $border-radius-small;
    color: $text-color-secondary;
    font-size: $font-size-small;

    .el-icon {
      color: $--el-color-primary;
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

  // 退款记录对话框样式
  .refund-history-dialog {
    .history-item {
      padding: $spacing-base;
      background: #fff;
      border: 1px solid $border-color-lighter;
      border-radius: $border-radius-base;
      margin-bottom: $spacing-base;

      &.latest {
        border-left: 4px solid #67c23a;
        background: #f0f9ff;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: $spacing-small;
        border-bottom: 1px solid $border-color-lighter;

        .history-title {
          font-weight: 600;
          color: $text-color-primary;
        }

        .history-time {
          font-size: $font-size-small;
          color: $text-color-secondary;
        }
      }

      .history-content {
        .history-reason,
        .history-detail,
        .history-status,
        .history-audit-by,
        .history-audit-time,
        .history-audit-remark,
        .history-refund-time {
          display: flex;
          margin-bottom: $spacing-small;

          .label {
            color: $text-color-secondary;
            min-width: 100px;
            margin-right: $spacing-small;
          }
        }
      }
    }
  }
}
</style>
