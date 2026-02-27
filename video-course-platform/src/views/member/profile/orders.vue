<script setup lang="ts">
import { ref, computed } from 'vue';

import { getOrderByStatus, type Order, type OrderItem } from '@/utils/member-storage';

// 订单状态类型
type OrderStatusType = 'all' | 'pending' | 'paid' | 'cancelled' | 'refunded';

// 当前状态筛选
const activeStatus = ref<OrderStatusType>('all');

// 订单状态配置
const statusConfig = [
  { key: 'all', label: '全部订单', icon: '📋' },
  { key: 'pending', label: '待付款', icon: '⏰' },
  { key: 'paid', label: '已付款', icon: '✅' },
  { key: 'cancelled', label: '已取消', icon: '❌' },
  { key: 'refunded', label: '已退款', icon: '💰' },
];

// 订单列表
const orders = ref<Order[]>(getOrderByStatus(activeStatus.value));

// 根据 tab 显示的订单
const displayedOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === activeStatus.value);
});

// 切换状态
function handleStatusChange(status: OrderStatusType) {
  activeStatus.value = status;
  orders.value = getOrderByStatus(status);
}

// 格式化金额
function formatAmount(amount: number): string {
  return (amount / 100).toFixed(2);
}

// 获取状态文本
function getStatusText(status: string): string {
  const config = statusConfig.find((s) => s.key === status);
  return config ? config.label : status;
}

// 获取状态样式
function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    paid: 'status-paid',
    cancelled: 'status-cancelled',
    refunded: 'status-refunded',
  };
  return classMap[status] || '';
}

// 去支付
function handlePay(orderId: string) {
  console.log('去支付:', orderId);
}

// 取消订单
function handleCancel(orderId: string) {
  if (confirm('确定要取消该订单吗？')) {
    console.log('取消订单:', orderId);
  }
}

// 查看详情
function handleDetail(orderId: string) {
  console.log('查看订单详情:', orderId);
}
</script>

<template>
  <div class="my-orders">
    <!-- 状态筛选 -->
    <div class="status-tabs">
      <button
        v-for="status in statusConfig"
        :key="status.key"
        class="status-tab"
        :class="{ active: activeStatus === status.key }"
        @click="handleStatusChange(status.key as OrderStatusType)"
      >
        <span class="tab-icon">{{ status.icon }}</span>
        <span class="tab-label">{{ status.label }}</span>
      </button>
    </div>

    <!-- 订单列表 -->
    <div v-if="displayedOrders.length > 0" class="orders-list">
      <div v-for="order in displayedOrders" :key="order.id" class="order-card">
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">{{ order.orderTime }}</span>
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.cover" :alt="item.title" class="item-cover" />
            <div class="item-info">
              <h4 class="item-title">{{ item.title }}</h4>
              <p class="item-quantity">数量：{{ item.quantity }}</p>
            </div>
            <div class="item-price">¥{{ formatAmount(item.price) }}</div>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="order-footer">
          <div class="order-total">
            <span class="total-label">订单总额：</span>
            <span class="total-amount">¥{{ formatAmount(order.totalAmount) }}</span>
          </div>
          <div class="order-actions">
            <el-button
              v-if="order.status === 'pending'"
              type="danger"
              size="small"
              @click="handleCancel(order.id)"
            >
              取消订单
            </el-button>
            <el-button
              v-if="order.status === 'pending'"
              type="primary"
              size="small"
              @click="handlePay(order.id)"
            >
              去支付
            </el-button>
            <el-button size="small" @click="handleDetail(order.id)"> 查看详情 </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">暂无订单</p>
      <router-link to="/portal/courses" class="empty-link">
        <el-button type="primary">去选课</el-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-orders {
  min-height: calc(100vh - 200px);
}

// 状态筛选
.status-tabs {
  display: flex;
  gap: $spacing-base;
  margin-bottom: $spacing-extra-large;
  overflow-x: auto;
  padding-bottom: $spacing-small;
}

.status-tab {
  flex-shrink: 0;
  padding: $spacing-base $spacing-large;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 500;
  border: 1px solid $border-color-base;
  background: #fff;
  cursor: pointer;
  transition: $transition-base;
  display: flex;
  align-items: center;
  gap: $spacing-small;

  &:hover {
    border-color: #409eff;
    color: #409eff;
  }

  &.active {
    background: #409eff;
    color: #fff;
    border-color: #409eff;
  }

  .tab-icon {
    font-size: 18px;
  }
}

// 订单列表
.orders-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}

.order-card {
  background: #fff;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-card;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base $spacing-large;
  background: $background-color-base;
  border-bottom: 1px solid $border-color-lighter;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-small;
  }
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .order-no {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }

  .order-time {
    font-size: $font-size-small;
    color: $text-color-placeholder;
  }
}

.order-status {
  padding: $spacing-small $spacing-base;
  border-radius: $border-radius-small;
  font-size: $font-size-small;
  font-weight: 500;

  &.status-pending {
    background: #fff7e6;
    color: #e6a23c;
  }

  &.status-paid {
    background: #f0f9ff;
    color: #409eff;
  }

  &.status-cancelled {
    background: #f5f5f5;
    color: $text-color-secondary;
  }

  &.status-refunded {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.order-items {
  padding: $spacing-large;
}

.order-item {
  display: flex;
  gap: $spacing-base;
  padding: $spacing-base 0;

  &:not(:last-child) {
    border-bottom: 1px solid $border-color-lighter;
  }
}

.item-cover {
  width: 80px;
  height: 60px;
  border-radius: $border-radius-small;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.item-title {
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-color-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-quantity {
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.item-price {
  font-size: $font-size-medium;
  font-weight: 600;
  color: #f56c6c;
  align-self: center;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base $spacing-large;
  background: $background-color-base;
  border-top: 1px solid $border-color-lighter;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-base;
  }
}

.order-total {
  .total-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }

  .total-amount {
    font-size: $font-size-large;
    font-weight: bold;
    color: #f56c6c;
  }
}

.order-actions {
  display: flex;
  gap: $spacing-small;

  @media (max-width: 640px) {
    justify-content: flex-end;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: $spacing-extra-extra-large 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: $spacing-large;
  opacity: 0.5;
}

.empty-text {
  font-size: $font-size-medium;
  color: $text-color-secondary;
  margin-bottom: $spacing-large;
}

.empty-link {
  text-decoration: none;
}
</style>
