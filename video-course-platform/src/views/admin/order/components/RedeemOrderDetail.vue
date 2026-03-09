<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

type RedeemOrderType = 'course' | 'package';

interface RedeemOrder {
  orderId: string;
  orderType: RedeemOrderType;
  status: string;
  orgId: number;
  orgName: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  courses?: {
    courseId: number;
    courseName: string;
    courseCover: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }[];
  packages?: {
    packageId: number;
    packageName: string;
    packageCover: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }[];
  totalQuantity: number;
  totalPrice: number;
  codeCount: {
    total: number;
    used: number;
  };
  codes?: {
    code: string;
    status: 'unused' | 'used';
    relatedId: number;
    relatedName: string;
    usedBy?: string;
    usedTime?: string;
    createTime: string;
  }[];
  createTime: string;
  remark?: string;
  adminNote?: string;
}

interface Props {
  order: RedeemOrder;
  modelValue?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'update'): void;
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const codesDialogVisible = ref(false);
const adminNote = ref('');
const saving = ref(false);

// 生成兑换码
function generateCodes() {
  if (!props.order) return;

  const totalCodes = props.order.totalQuantity;
  const newCodes: any[] = [];

  if (props.order.orderType === 'course' && props.order.courses) {
    // 课程兑换：每个课程生成对应数量的兑换码
    props.order.courses.forEach(course => {
      for (let i = 0; i < course.quantity; i++) {
        const code = `CODE_${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        newCodes.push({
          code,
          status: 'unused',
          relatedId: course.courseId,
          relatedName: course.courseName,
          createTime: new Date().toISOString(),
        });
      }
    });
  } else if (props.order.orderType === 'package' && props.order.packages) {
    // 套餐兑换：每个套餐生成对应数量的兑换码
    props.order.packages.forEach(pkg => {
      for (let i = 0; i < pkg.quantity; i++) {
        const code = `CODE_${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        newCodes.push({
          code,
          status: 'unused',
          relatedId: pkg.packageId,
          relatedName: pkg.packageName,
          createTime: new Date().toISOString(),
        });
      }
    });
  }

  // 保存兑换码到订单
  const orderIndex = findOrderIndex();
  if (orderIndex !== -1) {
    const orders = JSON.parse(localStorage.getItem('redeem_orders') || '[]');
    orders[orderIndex].codes = newCodes;
    orders[orderIndex].codeCount = {
      total: newCodes.length,
      used: 0,
    };
    localStorage.setItem('redeem_orders', JSON.stringify(orders));
    props.order.codes = newCodes;
    props.order.codeCount = {
      total: newCodes.length,
      used: 0,
    };

    ElMessage.success(`已生成 ${newCodes.length} 个兑换码`);
    emit('update');
  }
}

// 查找订单在localStorage中的索引
function findOrderIndex() {
  const orders = JSON.parse(localStorage.getItem('redeem_orders') || '[]');
  return orders.findIndex((o: RedeemOrder) => o.orderId === props.order.orderId);
}

// 导出兑换码
function exportCodes(type: 'all' | 'unused') {
  if (!props.order || !props.order.codes) return;

  let codes = props.order.codes;
  if (type === 'unused') {
    codes = codes.filter(c => c.status === 'unused');
  }

  if (codes.length === 0) {
    ElMessage.warning(type === 'all' ? '暂无兑换码' : '暂无未使用的兑换码');
    return;
  }

  // 生成CSV内容
  const csvContent = [
    ['兑换码', '关联商品', '状态', '使用人', '使用时间', '生成时间'].join(','),
    ...codes.map(code => [
      code.code,
      code.relatedName,
      code.status === 'unused' ? '未使用' : '已使用',
      code.usedBy || '-',
      code.usedTime || '-',
      code.createTime,
    ].join(',')),
  ].join('\n');

  // 创建下载链接
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `兑换码_${type}_${props.order.orderId}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  ElMessage.success('导出成功');
}

// 查看兑换码
function handleViewCodes() {
  codesDialogVisible.value = true;
}

// 添加备注
async function handleAddNote() {
  if (!props.order) return;

  try {
    const { value } = await ElMessageBox.prompt('请输入备注信息', '添加备注', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: adminNote.value,
      inputPattern: /.+/,
      inputErrorMessage: '请输入备注信息',
    });

    saving.value = true;
    const orderIndex = findOrderIndex();
    if (orderIndex !== -1) {
      const orders = JSON.parse(localStorage.getItem('redeem_orders') || '[]');
      orders[orderIndex].adminNote = value;
      localStorage.setItem('redeem_orders', JSON.stringify(orders));
      props.order.adminNote = value;
      adminNote.value = value;
      ElMessage.success('备注已添加');
      emit('update');
    }
  } catch (error) {
    // 用户取消
  } finally {
    saving.value = false;
  }
}

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 格式化兑换码状态
function getCodeStatusText(status: string) {
  return status === 'unused' ? '未使用' : '已使用';
}

// 获取状态标签类型
function getStatusTagType(status: string) {
  return status === 'unused' ? 'success' : 'info';
}
</script>

<template>
  <el-dialog
    v-model="codesDialogVisible"
    title="兑换码列表"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="codes-content">
      <div class="codes-header">
        <div class="codes-stats">
          <span class="stat-item">已生成：{{ order?.codeCount?.total || 0 }}个</span>
          <span class="stat-item">已使用：{{ order?.codeCount?.used || 0 }}个</span>
          <span class="stat-item">未使用：{{ (order?.codeCount?.total || 0) - (order?.codeCount?.used || 0) }}个</span>
        </div>
        <!-- <div class="codes-actions">
          <el-button type="primary" size="small" @click="exportCodes('all')">
            <el-icon><Download /></el-icon>
            导出全部
          </el-button>
          <el-button type="success" size="small" @click="exportCodes('unused')">
            <el-icon><Download /></el-icon>
            导出未使用
          </el-button>
        </div> -->
      </div>

      <el-table :data="order?.codes || []" stripe style="width: 100%" max-height="400px">
        <el-table-column prop="code" label="兑换码" width="150" />
        <el-table-column prop="relatedName" label="关联商品" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getCodeStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usedBy" label="使用人" width="120" />
        <el-table-column prop="usedTime" label="使用时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.usedTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="生成时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!order?.codes || order.codes.length === 0" description="暂无兑换码" />
    </div>
  </el-dialog>

  <el-dialog
    v-model="props.modelValue"
    title="兑换订单详情"
    width="700px"
    :close-on-click-modal="false"
    @close="emit('close')"
    @closed="emit('update:modelValue', false)"
  >
    <div class="redeem-order-detail" v-if="order">
      <!-- 订单基本信息 -->
      <div class="detail-section">
        <h4>订单基本信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderId }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="order.orderType === 'course' ? 'primary' : 'success'" size="small">
              {{ order.orderType === 'course' ? '课程兑换' : '套餐兑换' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag type="success">{{ order.status === 'completed' ? '已完成' : '已取消' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(order.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="总价" :span="2">
            <span class="total-price">¥{{ order.totalPrice }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 单位信息 -->
      <div class="detail-section">
        <h4>单位信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="单位名称">{{ order.orgName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ order.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ order.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="联系邮箱">
            {{ order.contactEmail || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 购买内容 -->
      <div class="detail-section" v-if="order.orderType === 'course' && order.courses">
        <h4>课程信息</h4>
        <div class="content-list">
          <div v-for="(course, index) in order.courses" :key="course.courseId" class="content-item">
            <span class="item-index">{{ index + 1 }}.</span>
            <span class="item-name">{{ course.courseName }}</span>
            <span class="item-quantity">× {{ course.quantity }}</span>
            <span class="item-price">¥{{ course.totalPrice }}</span>
          </div>
          <div class="content-total">
            合计：{{ order.courses.length }}个课程，总计¥{{ order.courses.reduce((sum, c) => sum + c.totalPrice, 0) }}
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="order.orderType === 'package' && order.packages">
        <h4>套餐信息</h4>
        <div class="content-list">
          <div v-for="(pkg, index) in order.packages" :key="pkg.packageId" class="content-item">
            <span class="item-index">{{ index + 1 }}.</span>
            <span class="item-name">{{ pkg.packageName }}</span>
            <span class="item-quantity">× {{ pkg.quantity }}</span>
            <span class="item-price">¥{{ pkg.totalPrice }}</span>
          </div>
          <div class="content-total">
            合计：{{ order.packages.length }}个套餐，总计¥{{ order.packages.reduce((sum, p) => sum + p.totalPrice, 0) }}
          </div>
        </div>
      </div>

      <!-- 兑换码管理 -->
      <div class="detail-section" v-if="order.status === 'completed'">
        <h4>兑换码管理</h4>
        <div class="codes-summary">
          <div class="summary-item">
            <span class="summary-label">已生成：</span>
            <span class="summary-value">{{ order.codeCount?.total || 0 }}个</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已使用：</span>
            <span class="summary-value">{{ order.codeCount?.used || 0 }}个</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">未使用：</span>
            <span class="summary-value">{{ (order.codeCount?.total || 0) - (order.codeCount?.used || 0) }}个</span>
          </div>
        </div>
        <!-- <div class="codes-actions">
          <el-button type="primary" @click="handleViewCodes">
            <el-icon><View /></el-icon>
            查看兑换码
          </el-button>
          <el-button type="success" @click="exportCodes('all')">
            <el-icon><Download /></el-icon>
            导出全部
          </el-button>
          <el-button type="warning" @click="exportCodes('unused')">
            <el-icon><Download /></el-icon>
            导出未使用
          </el-button>
        </div> -->
      </div>

      <!-- 备注 -->
      <!-- <div class="detail-section">
        <h4>备注信息</h4>
        <el-input
          v-model="adminNote"
          type="textarea"
          :rows="3"
          placeholder="填写备注信息"
        />
        <div class="note-actions">
          <el-button type="primary" :loading="saving" @click="handleAddNote">
            保存备注
          </el-button>
        </div>
      </div> -->
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.redeem-order-detail {
  .detail-section {
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-large;
    border-bottom: 1px solid $border-color-light;

    &:last-child {
      border-bottom: none;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }
  }

  .total-price {
    font-size: 18px;
    font-weight: bold;
    color: $--el-color-danger;
  }

  .content-list {
    padding: $spacing-base;
    background: $background-color-base;
    border-radius: $border-radius-base;

    .content-item {
      display: flex;
      align-items: center;
      padding: $spacing-small 0;
      gap: $spacing-base;
      font-size: $font-size-base;
      color: $text-color-primary;

      .item-index {
        font-weight: 600;
        color: $text-color-secondary;
      }

      .item-name {
        flex: 1;
        font-weight: 500;
      }

      .item-quantity {
        color: $text-color-secondary;
      }

      .item-price {
        font-weight: 600;
        color: $--el-color-danger;
      }
    }

    .content-total {
      margin-top: $spacing-base;
      padding-top: $spacing-base;
      border-top: 1px solid $border-color-light;
      font-weight: 500;
      color: $text-color-secondary;
    }
  }

  .codes-summary {
    display: flex;
    gap: $spacing-large;
    padding: $spacing-base;
    background: $background-color-base;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-base;

    .summary-item {
      .summary-label {
        color: $text-color-secondary;
        margin-right: $spacing-small;
      }

      .summary-value {
        font-weight: 600;
        color: $text-color-primary;
      }
    }
  }

  .codes-actions {
    display: flex;
    gap: $spacing-base;
  }

  .note-actions {
    margin-top: $spacing-base;
    display: flex;
    justify-content: flex-end;
  }
}

.codes-content {
  .codes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-light;

    .codes-stats {
      display: flex;
      gap: $spacing-large;

      .stat-item {
        font-size: $font-size-base;
        color: $text-color-primary;
      }
    }

    .codes-actions {
      display: flex;
      gap: $spacing-small;
    }
  }
}
</style>
