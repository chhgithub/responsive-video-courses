<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Order, PurchaseType, RefundApplication } from '@/utils/order-storage';
import { getOrderRefundApplications } from '@/utils/order-storage';
import { ElMessage } from 'element-plus';

interface Props {
  order: Order;
  activeTab?: 'basic' | 'refund';
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'basic'
});

const emit = defineEmits<{
  close: [];
  refresh: [];
}>();

// 当前激活的标签
const activeTab = ref(props.activeTab);

// 退款申请列表
const refundApplications = ref<RefundApplication[]>([]);

// 加载退款申请记录
function loadRefundApplications() {
  try {
    refundApplications.value = getOrderRefundApplications(props.order.orderId);
  } catch (error) {
    console.error('加载退款申请失败:', error);
  }
}

// 监听订单变化，重新加载退款申请
watch(() => props.order.orderId, () => {
  loadRefundApplications();
}, { immediate: true });

// 监听activeTab变化
watch(() => props.activeTab, (newTab) => {
  activeTab.value = newTab;
});

// 状态映射
const statusMap: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  refund_pending: '退款审核中',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
  refund_failed: '退款失败',
};

const statusTypeMap: Record<string, any> = {
  pending: 'warning',
  paid: 'success',
  refund_pending: 'info',
  cancelled: 'info',
  refunding: 'warning',
  refunded: 'danger',
  refund_failed: 'danger',
};

// 审核状态映射
const auditStatusMap: Record<string, { text: string; type: any }> = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '审核通过', type: 'success' },
  rejected: { text: '审核拒绝', type: 'danger' },
};

// 购买方式映射
const purchaseTypeMap: Record<PurchaseType, string> = {
  purchase: '购买',
  redeem: '兑换',
};

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 格式化金额
function formatPrice(price: number) {
  return price > 0 ? `¥${price}` : '免费';
}

// 审核操作
async function handleAudit(applicationId: string, approved: boolean) {
  try {
    const { value } = await ElMessageBox.prompt(
      approved ? '请输入审核通过意见' : '请输入拒绝原因',
      approved ? '同意退款' : '拒绝退款',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请填写审核意见',
      }
    );

    const { auditRefund } = await import('@/utils/order-storage');
    const success = auditRefund(applicationId, approved, value, '管理员');

    if (success) {
      ElMessage.success(approved ? '审核通过' : '审核拒绝');
      loadRefundApplications();
      emit('refresh');
    } else {
      ElMessage.error('操作失败');
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<template>
  <el-dialog
    :model-value="true"
    title="订单详情"
    width="800px"
    @close="emit('close')"
  >
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基本信息标签页 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="2" border>
      <!-- 订单基本信息 -->
      <el-descriptions-item label="订单号" :span="2">
        {{ order.orderId }}
      </el-descriptions-item>

      <el-descriptions-item label="订单状态">
        <el-tag :type="statusTypeMap[order.status]">
          {{ statusMap[order.status] }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="支付方式">
        {{ order.paymentMethod === 'alipay' ? '支付宝' : order.paymentMethod === 'wechat' ? '微信' : '-' }}
      </el-descriptions-item>
      <!-- <el-descriptions-item label="购买方式">
        {{ purchaseTypeMap[order.purchaseType] || '-' }}
      </el-descriptions-item> -->
      <el-descriptions-item label="支付时间">
        {{ formatTime(order.payTime) }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ formatTime(order.createTime) }}
      </el-descriptions-item>


      <!-- 课程信息 -->
      <el-descriptions-item label="课程名称" :span="2">
        <div class="course-detail">
          <el-image
            :src="order.courseCover"
            fit="cover"
            class="course-cover"
          />
          <div class="course-info">
            <div class="course-name">{{ order.courseName }}</div>
          </div>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="课程价格">
        <span v-if="order.originalPrice && order.originalPrice > order.price" class="original-price">
          ¥{{ order.originalPrice }}
        </span>
        <span class="current-price">{{ formatPrice(order.price) }}</span>
      </el-descriptions-item>

      <!-- 用户信息 -->
      <!-- <el-descriptions-item label="用户ID">
        {{ order.userId }}
      </el-descriptions-item> -->

      <el-descriptions-item label="用户名">
        {{ order.userName || '-' }}
      </el-descriptions-item>

      <el-descriptions-item label="用户邮箱">
        {{ order.userEmail || '-' }}
      </el-descriptions-item>

      <!-- 备注 -->
      <el-descriptions-item label="管理员备注" :span="2">
        {{ order.adminNote || '-' }}
      </el-descriptions-item>

      <!-- 退款信息 -->
      <template v-if="order.status === 'refunded' || order.status === 'refund_failed'">
        <el-descriptions-item label="退款时间">
          {{ formatTime(order.refundTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="退款原因">
          {{ order.refundReason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="order.status === 'refund_failed'" label="退款失败原因">
          {{ order.refundFailReason || '-' }}
        </el-descriptions-item>
      </template>
    </el-descriptions>
      </el-tab-pane>

      <!-- 退款管理标签页 -->
      <el-tab-pane label="退款申请记录" name="refund">
        <div class="refund-management">
          <!-- 当前申请状态 -->
          <!-- <div class="current-status">
            <h4>当前状态</h4>
            <el-tag :type="statusTypeMap[order.status]" size="large">
              {{ statusMap[order.status] }}
            </el-tag>
            <div v-if="order.status === 'refunding'" class="refund-progress">
              <p>退款处理中，请耐心等待第三方支付平台处理结果。</p>
              <p class="hint">退款可能需要1-3个工作日到账。</p>
            </div>
            <div v-if="order.status === 'refund_failed'" class="refund-failed">
              <p>退款失败原因：{{ order.refundFailReason || '-' }}</p>
              <p class="hint">请联系客服处理。</p>
            </div>
          </div> -->

          <!-- 退款申请记录 -->
          <div class="refund-history">
            <!-- <h4>退款申请记录</h4> -->
            <el-table
              :data="refundApplications"
              stripe
              style="width: 100%"
              
              max-height="400px"
            >
              <!-- <el-table-column prop="id" label="申请编号" width="180" /> -->
              <el-table-column prop="applyTime" label="申请时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.applyTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="reasonType" label="退款原因" width="120" />
              <!-- <el-table-column label="申请进度" width="100">
                <template #default="{ row }">
                  {{ row.applyProgress ? `${row.applyProgress}%` : '-' }}
                </template>
              </el-table-column> -->
              <el-table-column prop="auditStatus" label="审核状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="auditStatusMap[row.auditStatus]?.type || 'info'" size="small">
                    {{ auditStatusMap[row.auditStatus]?.text || '-' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="auditBy" label="审核人" width="100" />
              <el-table-column prop="auditTime" label="审核时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.auditTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="auditRemark" label="审核意见" min-width="150" show-overflow-tooltip />
              <!-- <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.auditStatus === 'pending'"
                    link
                    type="success"
                    size="small"
                    @click="handleAudit(row.id, true)"
                  >
                    同意
                  </el-button>
                  <el-button
                    v-if="row.auditStatus === 'pending'"
                    link
                    type="danger"
                    size="small"
                    @click="handleAudit(row.id, false)"
                  >
                    拒绝
                  </el-button>
                  <span v-else>-</span>
                </template>
              </el-table-column> -->
            </el-table>

            <el-empty v-if="refundApplications.length === 0" description="暂无退款申请记录" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.course-detail {
  display: flex;
  align-items: center;
  gap: $spacing-base;

  .course-cover {
    width: 80px;
    height: 60px;
    border-radius: $border-radius-base;
    flex-shrink: 0;
  }

  .course-info {
    flex: 1;
    min-width: 0;

    .course-name {
      font-size: $font-size-base;
      color: $text-color-primary;
      font-weight: 500;
    }
  }
}

.original-price {
  text-decoration: line-through;
  color: $text-color-secondary;
  margin-right: $spacing-small;
}

.current-price {
  color: $--el-color-danger;
  font-weight: 600;
  font-size: $font-size-large;
}

.refund-management {
  .current-status {
    margin-bottom: $spacing-large;
    padding: $spacing-base;
    background: $background-color-base;
    border-radius: $border-radius-base;

    h4 {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }

    .refund-progress,
    .refund-failed {
      margin-top: $spacing-base;

      p {
        margin: $spacing-small 0;
        color: $text-color-secondary;
      }

      .hint {
        font-size: $font-size-small;
        color: $--el-color-warning;
      }
    }
  }

  .refund-history {
    h4 {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }
  }
}
</style>
