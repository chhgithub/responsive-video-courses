<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Order } from '@/utils/order-storage';
import type { RefundApplication } from '@/utils/order-storage';
import { auditRefund, getOrderRefundApplications } from '@/utils/order-storage';

interface Props {
  order: Order;
  application: RefundApplication;
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const loading = ref(false);
const auditForm = ref({
  approved: true,
  remark: '',
});

// 获取该订单的所有退款申请（历史记录）
const allApplications = ref<RefundApplication[]>([]);

// 历史记录展开状态
const historyExpanded = ref(false);

// 加载历史申请记录
function loadApplicationsHistory() {
  allApplications.value = getOrderRefundApplications(props.order.orderId);
}

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 获取审核状态文本
function getAuditStatusText(status: string) {
  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: '审核中', color: '#409eff' },
    approved: { text: '审核通过', color: '#67c23a' },
    rejected: { text: '审核拒绝', color: '#f56c6c' },
  };
  return statusMap[status] || { text: status, color: '#909399' };
}

// 提交审核
async function handleSubmit() {
  loading.value = true;
  try {
    await ElMessageBox.confirm(
      `确认${auditForm.value.approved ? '通过' : '拒绝'}此退款申请？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: auditForm.value.approved ? 'success' : 'warning',
      }
    );

    const success = auditRefund(
      props.application.id,
      auditForm.value.approved,
      auditForm.value.remark || undefined,
      '管理员'
    );

    if (success) {
      ElMessage.success(`审核${auditForm.value.approved ? '通过' : '拒绝'}成功`);
      emit('success');
      dialogVisible.value = false;
    } else {
      ElMessage.error('审核失败');
    }
  } catch (error) {
    // 用户取消
  } finally {
    loading.value = false;
  }
}

// 监听visible变化
import { watch } from 'vue';
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadApplicationsHistory();
      // 重置表单
      auditForm.value = {
        approved: true,
        remark: '',
      };
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="退款审核"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="refund-audit-dialog">
      <!-- 订单信息 -->
      <div class="section order-info">
        <h4 class="section-title">订单信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderId }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ order.userName }} ({{ order.userEmail }})</el-descriptions-item>
          <el-descriptions-item label="课程">{{ order.type === 'course' ? order.courseName : order.packageName }}</el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ order.price }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatTime(order.payTime) }}</el-descriptions-item>
          <el-descriptions-item label="学习进度">
            {{ application.applyProgress !== undefined ? `${application.applyProgress}%` : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 当前申请信息 -->
      <div class="section current-application">
        <h4 class="section-title">
          <el-tag type="warning" size="small">最新申请</el-tag>
          退款申请信息
        </h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="申请时间">{{ formatTime(application.applyTime) }}</el-descriptions-item>
          <el-descriptions-item label="退款原因">{{ application.reasonType }}</el-descriptions-item>
          <el-descriptions-item v-if="application.reasonDetail" label="详细说明">
            {{ application.reasonDetail }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <span :style="{ color: getAuditStatusText(application.auditStatus).color }">
              {{ getAuditStatusText(application.auditStatus).text }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="application.auditBy" label="审核人">
            {{ application.auditBy }}
          </el-descriptions-item>
          <el-descriptions-item v-if="application.auditTime" label="审核时间">
            {{ formatTime(application.auditTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="application.auditRemark" label="审核意见">
            {{ application.auditRemark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 历史申请记录 -->
      <div v-if="allApplications.length > 1" class="section history-section">
        <div class="history-header" @click="historyExpanded = !historyExpanded">
          <span>历史申请记录 (共{{ allApplications.length - 1 }}条)</span>
          <el-icon :class="{ 'expanded': historyExpanded }">
            <ArrowDown />
          </el-icon>
        </div>
        <div v-if="historyExpanded" class="history-list">
          <div
            v-for="(app, index) in allApplications.slice(1)"
            :key="app.id"
            class="history-item"
          >
            <div class="history-header-row">
              <span class="history-order">第 {{ allApplications.length - 1 - index }} 次申请</span>
              <span class="history-time">{{ formatTime(app.applyTime) }}</span>
            </div>
            <div class="history-content">
              <div class="history-reason">
                <span class="label">原因:</span>
                <span>{{ app.reasonType }}</span>
              </div>
              <div class="history-status">
                <span class="label">审核结果:</span>
                <span :style="{ color: getAuditStatusText(app.auditStatus).color }">
                  {{ getAuditStatusText(app.auditStatus).text }}
                </span>
              </div>
              <div v-if="app.auditRemark" class="history-remark">
                <span class="label">审核意见:</span>
                <span>{{ app.auditRemark }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 审核表单 -->
      <div v-if="application.auditStatus === 'pending'" class="section audit-form">
        <h4 class="section-title">审核操作</h4>
        <el-form :model="auditForm" label-width="80px">
          <el-form-item label="审核结果">
            <el-radio-group v-model="auditForm.approved">
              <el-radio :label="true">同意退款</el-radio>
              <el-radio :label="false">拒绝退款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input
              v-model="auditForm.remark"
              type="textarea"
              :rows="3"
              :placeholder="auditForm.approved ? '请输入同意退款的原因（选填）' : '请输入拒绝退款的原因'"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-if="application.auditStatus === 'pending'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        提交审核
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.refund-audit-dialog {
  .section {
    margin-bottom: $spacing-large;

    &.current-application {
      background: #f5f7fa;
      padding: $spacing-base;
      border-radius: $border-radius-base;
    }

    &.history-section {
      .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-base;
        background: #fff;
        border: 1px solid $border-color-lighter;
        border-radius: $border-radius-base;
        cursor: pointer;
        user-select: none;
        transition: $transition-base;

        &:hover {
          background: $background-color-light;
        }

        .expanded {
          transform: rotate(180deg);
        }
      }

      .history-list {
        margin-top: $spacing-base;

        .history-item {
          padding: $spacing-base;
          background: #fff;
          border: 1px solid $border-color-lighter;
          border-radius: $border-radius-base;
          margin-bottom: $spacing-base;

          &:last-child {
            margin-bottom: 0;
          }

          .history-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-small;
            padding-bottom: $spacing-small;
            border-bottom: 1px solid $border-color-lighter;

            .history-order {
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
            .history-status,
            .history-remark {
              display: flex;
              margin-bottom: $spacing-small;

              .label {
                color: $text-color-secondary;
                min-width: 80px;
                margin-right: $spacing-small;
              }
            }
          }
        }
      }
    }

    .section-title {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
      display: flex;
      align-items: center;
      gap: $spacing-small;
    }
  }
}
</style>
