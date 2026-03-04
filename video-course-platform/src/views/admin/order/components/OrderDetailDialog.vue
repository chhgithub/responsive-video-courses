<script setup lang="ts">
import { computed } from 'vue';
import type { Order, PurchaseType } from '@/utils/order-storage';

interface Props {
  order: Order;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

// 状态映射
const statusMap: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
  refund_failed: '退款失败',
};

const statusTypeMap: Record<string, any> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'info',
  refunding: 'warning',
  refunded: 'danger',
  refund_failed: 'danger',
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
</script>

<template>
  <el-dialog
    :model-value="true"
    title="订单详情"
    width="700px"
    @close="emit('close')"
  >
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
      <el-descriptions-item label="购买方式">
        {{ purchaseTypeMap[order.purchaseType] || '-' }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ formatTime(order.createTime) }}
      </el-descriptions-item>

      <el-descriptions-item label="支付时间">
        {{ formatTime(order.payTime) }}
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
</style>
