<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminAddOrderNote,
  getOrderRefundApplications,
  auditRefund,
  forceRefreshOrderData,
  type Order,
  OrderStatus,
  PurchaseType,
  type RefundApplication
} from '@/utils/order-storage';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Download, Select, CloseBold } from '@element-plus/icons-vue';
import OrderDetailDialog from './components/OrderDetailDialog.vue';

const loading = ref(false);
const orders = ref<Order[]>([]);

// 详情对话框
const selectedOrder = ref<Order | null>(null);
const detailDialogVisible = ref(false);
const detailTab = ref<'basic' | 'refund'>('basic');

// 审核对话框
const auditDialogVisible = ref(false);
const auditForm = ref({
  orderId: '',
  applicationId: '',
  approved: false,
  remark: ''
});
const auditing = ref(false);

// 审核记录对话框
const historyDialogVisible = ref(false);
const historyOrders = ref<Order[]>([]);

// 筛选条件
const selectedStatus = ref<OrderStatus | ''>('');
const searchKeyword = ref('');

// 订单状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '退款审核中', value: 'refund_pending' },
  { label: '已取消', value: 'cancelled' },
  { label: '退款中', value: 'refunding' },
  { label: '已退款', value: 'refunded' },
  { label: '退款失败', value: 'refund_failed' },
];

// 状态映射
const statusMap: Record<OrderStatus, { text: string; type: any }> = {
  pending: { text: '待支付', type: 'warning' },
  paid: { text: '已支付', type: 'success' },
  refund_pending: { text: '退款审核中', type: 'info' },
  cancelled: { text: '已取消', type: 'info' },
  refunding: { text: '退款中', type: 'warning' },
  refunded: { text: '已退款', type: 'danger' },
  refund_failed: { text: '退款失败', type: 'danger' },
};

// 购买方式映射
const purchaseTypeMap: Record<PurchaseType, { text: string; type: any }> = {
  purchase: { text: '购买', type: 'primary' },
  redeem: { text: '兑换', type: 'success' },
};

// 过滤后的订单（只显示购买订单）
const filteredOrders = computed(() => {
  let result = orders.value.filter(o => o.purchaseType === 'purchase');

  // 状态筛选
  if (selectedStatus.value) {
    result = result.filter(o => o.status === selectedStatus.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(o =>
      o.orderId.toLowerCase().includes(keyword) ||
      o.courseName.toLowerCase().includes(keyword) ||
      o.userName?.toLowerCase().includes(keyword) ||
      o.userEmail?.toLowerCase().includes(keyword)
    );
  }

  // 按创建时间倒序
  return result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
});

// 加载订单列表
async function loadOrders() {
  loading.value = true;
  try {
    orders.value = adminGetAllOrders();
    console.log('加载订单:', orders.value.length, '条');
  } catch (error) {
    console.error('加载订单失败:', error);
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
  }
}

// 查看详情
function handleViewDetail(order: Order, tab: 'basic' | 'refund' = 'basic') {
  selectedOrder.value = order;
  detailTab.value = tab;
  detailDialogVisible.value = true;
}

// 打开审核对话框
function handleOpenAudit(order: Order) {
  const applications = getOrderRefundApplications(order.orderId);
  const pendingApp = applications.find(app => app.auditStatus === 'pending');
  if (pendingApp) {
    auditForm.value = {
      orderId: order.orderId,
      applicationId: pendingApp.id,
      approved: false,
      remark: ''
    };
    auditDialogVisible.value = true;
  } else {
    ElMessage.warning('没有待审核的退款申请');
  }
}

// 提交审核
async function submitAudit() {
  if (!auditForm.value.remark) {
    ElMessage.warning('请填写审核意见');
    return;
  }

  auditing.value = true;
  try {
    const success = auditRefund(
      auditForm.value.applicationId,
      auditForm.value.approved,
      auditForm.value.remark,
      '管理员'
    );

    if (success) {
      ElMessage.success(auditForm.value.approved ? '审核通过' : '审核拒绝');
      auditDialogVisible.value = true;
      await loadOrders();
      auditDialogVisible.value = false;
    } else {
      ElMessage.error('操作失败');
    }
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('操作失败');
  } finally {
    auditing.value = false;
  }
}

// 打开审核记录
function handleViewHistory(order: Order) {
  // 直接打开详情对话框并切换到退款tab
  handleViewDetail(order, 'refund');
}

// 标记为已支付
async function handleMarkAsPaid(order: Order) {
  if (order.status !== 'pending') {
    ElMessage.warning('只能标记待支付订单');
    return;
  }

  try {
    await ElMessageBox.confirm('确认将此订单标记为已支付？', '确认操作', {
      type: 'warning',
    });

    const success = adminUpdateOrderStatus(order.orderId, 'paid');
    if (success) {
      ElMessage.success('操作成功');
      await loadOrders();
    } else {
      ElMessage.error('操作失败');
    }
  } catch (error) {
    // 用户取消
  }
}

// 取消订单
async function handleCancel(order: Order) {
  if (order.status !== 'pending') {
    ElMessage.warning('只能取消待支付订单');
    return;
  }

  try {
    await ElMessageBox.confirm('确认取消此订单？', '确认操作', {
      type: 'warning',
    });

    const success = adminUpdateOrderStatus(order.orderId, 'cancelled');
    if (success) {
      ElMessage.success('操作成功');
      await loadOrders();
    } else {
      ElMessage.error('操作失败');
    }
  } catch (error) {
    // 用户取消
  }
}

// 退款
async function handleRefund(order: Order) {
  if (order.status !== 'paid') {
    ElMessage.warning('只能对已支付订单进行退款');
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt('请输入退款原因', '退款处理', {
      confirmButtonText: '确认退款',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入退款原因',
    });

    const success = adminUpdateOrderStatus(order.orderId, 'refunding', value);
    if (success) {
      ElMessage.success('退款已提交');
      await loadOrders();
    } else {
      ElMessage.error('退款提交失败');
    }
  } catch (error) {
    // 用户取消
  }
}

// 重新发起退款（仅对退款失败的订单）
async function handleRetryRefund(order: Order) {
  if (order.status !== 'refund_failed') {
    ElMessage.warning('只能对退款失败的订单重新发起退款');
    return;
  }

  try {
    await ElMessageBox.confirm('确认要重新发起退款吗？', '确认操作', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    const success = adminUpdateOrderStatus(order.orderId, 'refunding', '重新发起退款');
    if (success) {
      ElMessage.success('重新发起退款成功');
      await loadOrders();
    } else {
      ElMessage.error('重新发起退款失败');
    }
  } catch (error) {
    // 用户取消
  }
}

// 添加备注
async function handleAddNote(order: Order) {
  try {
    const { value } = await ElMessageBox.prompt('请输入备注信息', '添加备注', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: order.adminNote || '',
      inputPattern: /.+/,
      inputErrorMessage: '请输入备注信息',
    });

    const success = adminAddOrderNote(order.orderId, value);
    if (success) {
      ElMessage.success('备注已添加');
      await loadOrders();
    } else {
      ElMessage.error('添加失败');
    }
  } catch (error) {
    // 用户取消
  }
}

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 格式化金额
function formatPrice(price: number) {
  return price > 0 ? `¥${price}` : '免费';
}

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="order-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>购买订单管理</h2>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="订单状态">
          <el-select v-model="selectedStatus" placeholder="请选择状态" clearable style="width: 150px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="searchKeyword"
            placeholder="订单号/课程名/用户名/邮箱"
            clearable
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadOrders">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="filteredOrders"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderId" label="订单号" width="200" />

        <el-table-column label="课程信息" min-width="250">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.courseCover"
                fit="cover"
                class="course-cover"
                lazy
              />
              <div class="course-details">
                <div class="course-name">{{ row.courseName }}</div>
                <div class="course-price">
                  <span v-if="row.originalPrice && row.originalPrice > row.price" class="original-price">
                    ¥{{ row.originalPrice }}
                  </span>
                  <span class="current-price">{{ formatPrice(row.price) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户名" width="120">
          <template #default="{ row }">
            <span>{{ row.userName || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="{ row }">
            {{ row.paymentMethod === 'alipay' ? '支付宝' : row.paymentMethod === 'wechat' ? '微信' : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">
              {{ statusMap[row.status]?.text || row.status || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="支付时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.payTime) }}
          </template>
        </el-table-column>

        <el-table-column label="备注" width="120">
          <template #default="{ row }">
            <el-tooltip v-if="row.adminNote" :content="row.adminNote" placement="top">
              <el-icon color="#409eff"><QuestionFilled /></el-icon>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>

            <!-- 待支付状态 -->
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              size="small"
              @click="handleMarkAsPaid(row)"
            >
              标记已付
            </el-button>

            <!-- 已支付状态 -->
            <template v-if="row.status === 'paid'">
              <el-button
                link
                type="danger"
                size="small"
                @click="handleRefund(row)"
              >
                退款
              </el-button>
            </template>

            <!-- 退款审核中状态 -->
            <el-button
              v-if="row.status === 'refund_pending'"
              link
              type="warning"
              size="small"
              @click="handleOpenAudit(row)"
            >
              退款审核
            </el-button>

            <!-- 退款中状态 -->
            <el-button
              v-if="row.status === 'refunding'"
              link
              type="info"
              size="small"
              @click="handleViewDetail(row, 'refund')"
            >
              查看进度
            </el-button>

            <!-- 退款成功/失败状态 -->
            <el-button
              v-if="row.status === 'refunded' || row.status === 'refund_failed'"
              link
              type="info"
              size="small"
              @click="handleViewHistory(row)"
            >
              审核记录
            </el-button>

            <!-- 退款失败状态 -->
            <el-button
              v-if="row.status === 'refund_failed'"
              link
              type="warning"
              size="small"
              @click="handleRetryRefund(row)"
            >
              重新退款
            </el-button>

            <!-- 备注按钮（所有状态） -->
            <el-button link type="info" size="small" @click="handleAddNote(row)">
              备注
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredOrders.length === 0" description="暂无订单数据" />
    </el-card>

    <!-- 订单详情对话框 -->
    <OrderDetailDialog
      v-if="selectedOrder && detailDialogVisible"
      :order="selectedOrder"
      :active-tab="detailTab"
      @close="detailDialogVisible = false"
      @refresh="loadOrders"
    />

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="退款审核"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="订单号">
          {{ auditForm.orderId }}
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :label="true">
              <el-icon color="#67c23a"><Select /></el-icon>
              同意
            </el-radio>
            <el-radio :label="false">
              <el-icon color="#f56c6c"><CloseBold /></el-icon>
              拒绝
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="4"
            :placeholder="auditForm.approved ? '请输入审核通过意见' : '请输入拒绝原因'"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditing" @click="submitAudit">
          {{ auditForm.approved ? '同意退款' : '拒绝退款' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.order-list {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-large;

    h2 {
      font-size: 24px;
      color: $text-color-primary;
      margin: 0;
    }
  }

  .filter-card {
    margin-bottom: $spacing-large;

    .filter-form {
      margin-bottom: 0;
    }
  }

  .table-card {
    .course-info {
      display: flex;
      align-items: center;
      gap: $spacing-small;

      .course-cover {
        width: 60px;
        height: 45px;
        border-radius: $border-radius-base;
        flex-shrink: 0;
      }

      .course-details {
        flex: 1;
        min-width: 0;

        .course-name {
          font-size: $font-size-base;
          color: $text-color-primary;
          margin-bottom: $spacing-small / 2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .course-price {
          font-size: $font-size-small;

          .original-price {
            text-decoration: line-through;
            color: $text-color-secondary;
            margin-right: $spacing-small / 2;
          }

          .current-price {
            color: $--el-color-danger;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
