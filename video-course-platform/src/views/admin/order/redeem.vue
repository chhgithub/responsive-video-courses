<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import RedeemOrderDetail from './components/RedeemOrderDetail.vue';
import { getAllCourses } from '@/utils/course-storage';
import { getAllPackages } from '@/utils/course-package-storage';

// 兑换订单类型
type RedeemOrderType = 'course' | 'package';

// 兑换订单状态
type RedeemOrderStatus = 'completed' | 'cancelled';

interface RedeemOrder {
  orderId: string;
  orderType: RedeemOrderType;
  status: RedeemOrderStatus;
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
  createTime: string;
  remark?: string;
  adminNote?: string;
  createdBy?: string;
}

const loading = ref(false);
const orders = ref<RedeemOrder[]>([]);
const submitting = ref(false);

// 详情对话框
const selectedOrder = ref<RedeemOrder | null>(null);
const detailDialogVisible = ref(false);

// 筛选条件
const selectedStatus = ref<RedeemOrderStatus | ''>('');
const selectedType = ref<RedeemOrderType | ''>('');
const searchKeyword = ref('');

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

// 类型选项
const typeOptions = [
  { label: '全部', value: '' },
  { label: '课程兑换', value: 'course' },
  { label: '套餐兑换', value: 'package' },
];

// 状态映射
const statusMap: Record<RedeemOrderStatus, { text: string; type: any }> = {
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'info' },
};

// 类型映射
const typeMap: Record<RedeemOrderType, { text: string; type: any }> = {
  course: { text: '课程兑换', type: 'primary' },
  package: { text: '套餐兑换', type: 'success' },
};

// 表单数据
const formData = ref({
  orderType: 'course' as RedeemOrderType,
  courseIds: [] as number[],
  courseQuantity: 1,
  packageIds: [] as number[],
  packageQuantity: 1,
  orgId: undefined as number | undefined,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  remark: '',
});

// 可选数据
const availableCourses = ref<any[]>([]);
const availablePackages = ref<any[]>([]);
const organizations = ref([
  { orgId: 1, orgName: 'XX科技有限公司' },
  { orgId: 2, orgName: 'YY职业学院' },
  { orgId: 3, orgName: 'ZZ培训中心' },
]);

// 计算总价
const totalPrice = computed(() => {
  if (formData.value.orderType === 'course') {
    return formData.value.courseIds.reduce((sum, courseId) => {
      const course = availableCourses.value.find(c => c.courseId === courseId);
      return sum + (course?.price || 0) * formData.value.courseQuantity;
    }, 0);
  } else {
    return formData.value.packageIds.reduce((sum, packageId) => {
      const pkg = availablePackages.value.find(p => p.packageId === packageId);
      return sum + (pkg?.price || 0) * formData.value.packageQuantity;
    }, 0);
  }
});

// 表单验证规则
const formRules = {
  orderType: [{ required: true, message: '请选择订单类型', trigger: 'change' }],
  courseIds: [{ required: true, message: '请选择课程', trigger: 'change' }],
  packageIds: [{ required: true, message: '请选择套餐', trigger: 'change' }],
  orgId: [{ required: true, message: '请选择单位', trigger: 'change' }],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
};

// 过滤后的订单
const filteredOrders = computed(() => {
  let result = orders.value;

  // 状态筛选
  if (selectedStatus.value) {
    result = result.filter(o => o.status === selectedStatus.value);
  }

  // 类型筛选
  if (selectedType.value) {
    result = result.filter(o => o.orderType === selectedType.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(o =>
      o.orderId.toLowerCase().includes(keyword) ||
      o.orgName.toLowerCase().includes(keyword)
    );
  }

  // 按创建时间倒序
  return result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
});

// 加载可选数据
function loadAvailableData() {
  try {
    availableCourses.value = getAllCourses().map(c => ({
      courseId: c.courseId,
      courseName: c.courseName,
      courseCover: c.courseCover,
      price: c.price,
    }));

    const allPackages = getAllPackages();
    availablePackages.value = allPackages.map(p => ({
      packageId: p.packageId,
      packageName: p.packageName,
      packageCover: p.packageCover,
      price: p.price,
    }));
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

// 类型切换
function handleTypeChange() {
  formData.value.courseIds = [];
  formData.value.packageIds = [];
}

// 提交订单（仅用于内部逻辑，实际创建在兑换码管理模块）

// 查看详情
function handleViewDetail(order: RedeemOrder) {
  console.log('查看详情订单:', order);
  console.log('订单codes:', order.codes);
  selectedOrder.value = order;
  detailDialogVisible.value = true;
}

// 添加备注
async function handleAddNote(order: RedeemOrder) {
  try {
    const { value } = await ElMessageBox.prompt('请输入备注信息', '添加备注', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: order.adminNote || '',
      inputPattern: /.+/,
      inputErrorMessage: '请输入备注信息',
    });

    const index = orders.value.findIndex(o => o.orderId === order.orderId);
    if (index !== -1) {
      orders.value[index].adminNote = value;
      localStorage.setItem('redeem_orders', JSON.stringify(orders.value));
      ElMessage.success('备注已添加');
    }
  } catch (error) {
    // 用户取消
  }
}

// 格式化购买内容
function formatPurchaseContent(row: RedeemOrder) {
  const parts: string[] = [];

  if (row.orderType === 'course' && row.courses?.length) {
    row.courses.forEach(course => {
      parts.push(`${course.courseName} × ${course.quantity}`);
    });
  }

  if (row.orderType === 'package' && row.packages?.length) {
    row.packages.forEach(pkg => {
      parts.push(`${pkg.packageName} × ${pkg.quantity}`);
    });
  }

  return parts.length > 0 ? parts.join(' + ') : '-';
}

// 格式化兑换码数量
function formatCodeCount(row: RedeemOrder) {
  return `${row.codeCount.used || 0}/${row.codeCount.total || 0}`;
}

// 格式化时间
function formatTime(time?: string) {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
}

// 加载订单数据
async function loadOrders() {
  loading.value = true;
  try {
    // 从 localStorage 读取兑换订单数据
    const data = localStorage.getItem('redeem_orders');
    orders.value = data ? JSON.parse(data) : [];
    console.log('加载兑换订单:', orders.value.length, '条');
  } catch (error) {
    console.error('加载订单失败:', error);
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadOrders();
  loadAvailableData();
});
</script>

<template>
  <div class="redeem-order-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>兑换订单管理</h2>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="订单类型">
          <el-select v-model="selectedType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

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
            placeholder="订单号/单位名称"
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
        <el-table-column prop="orderId" label="订单号" width="180" />

        <el-table-column label="单位信息" width="200">
          <template #default="{ row }">
            <div class="org-info">
              {{ row.orgName }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeMap[row.orderType]?.type || 'primary'" size="small">
              {{ typeMap[row.orderType]?.text || row.orderType || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="购买内容" min-width="300">
          <template #default="{ row }">
            <div class="purchase-content">
              <div v-if="row.orderType === 'course' && row.courses?.length" class="content-item">
                <span class="item-label">课程：</span>
                <span class="item-value">
                  {{ row.courses.map(c => `${c.courseName}×${c.quantity}`).join('、') }}
                </span>
              </div>
              <div v-if="row.orderType === 'package' && row.packages?.length" class="content-item">
                <span class="item-label">套餐：</span>
                <span class="item-value">
                  {{ row.packages.map(p => `${p.packageName}×${p.quantity}`).join('、') }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="兑换码数" width="120">
          <template #default="{ row }">
            <span @click="console.log('订单数据:', row)">
              {{ formatCodeCount(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="totalPrice" label="总价" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.totalPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type">
              {{ statusMap[row.status]?.text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="备注" width="80">
          <template #default="{ row }">
            <el-tooltip v-if="row.adminNote" :content="row.adminNote" placement="top">
              <el-icon color="#409eff"><QuestionFilled /></el-icon>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button link type="info" size="small" @click="handleAddNote(row)">
              备注
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              link
              type="danger"
              size="small"
            >
              取消订单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredOrders.length === 0" description="暂无订单数据" />
    </el-card>
    <el-dialog title="创建兑换订单" width="700px" v-model="createDialogVisible" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="订单类型" prop="orderType" required>
          <el-radio-group v-model="formData.orderType" @change="handleTypeChange">
            <el-radio value="course">课程兑换</el-radio>
            <el-radio value="package">套餐兑换</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 课程兑换 -->
        <template v-if="formData.orderType === 'course'">
          <el-form-item label="选择课程" required>
            <el-select v-model="formData.courseIds" multiple style="width: 100%">
              <el-option
                v-for="course in availableCourses"
                :key="course.courseId"
                :label="course.courseName"
                :value="course.courseId"
              >
                <div class="course-option">
                  <span class="course-name">{{ course.courseName }}</span>
                  <span class="course-price">¥{{ course.price }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="购买数量" required>
            <el-input-number
              v-model="formData.courseQuantity"
              :min="1"
              :max="999"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 套餐兑换 -->
        <template v-if="formData.orderType === 'package'">
          <el-form-item label="选择套餐" required>
            <el-select v-model="formData.packageIds" multiple style="width: 100%">
              <el-option
                v-for="pkg in availablePackages"
                :key="pkg.packageId"
                :label="pkg.packageName"
                :value="pkg.packageId"
              >
                <div class="package-option">
                  <span class="package-name">{{ pkg.packageName }}</span>
                  <span class="package-price">¥{{ pkg.price }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="购买数量" required>
            <el-input-number
              v-model="formData.packageQuantity"
              :min="1"
              :max="999"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <el-form-item label="单位" prop="orgId" required>
          <el-select v-model="formData.orgId" filterable style="width: 100%">
            <el-option
              v-for="org in organizations"
              :key="org.orgId"
              :label="org.orgName"
              :value="org.orgId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="联系信息">
          <el-input v-model="formData.contactName" placeholder="联系人" style="margin-bottom: 10px" />
          <el-input v-model="formData.contactPhone" placeholder="联系电话" style="margin-bottom: 10px" />
          <el-input v-model="formData.contactEmail" placeholder="联系邮箱（选填）" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="填写备注信息"
          />
        </el-form-item>

        <el-form-item label="总价">
          <span class="total-price">¥{{ totalPrice }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          生成兑换码
        </el-button>
      </template>
    </el-dialog>

    <!-- 兑换订单详情对话框 -->
    <RedeemOrderDetail
      v-if="selectedOrder"
      v-model="detailDialogVisible"
      :order="selectedOrder"
      @close="detailDialogVisible = false"
      @update="loadOrders"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.redeem-order-list {
  padding: $spacing-large;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    .org-info {
      font-size: $font-size-base;
      color: $text-color-primary;
    }

    .purchase-content {
      .content-item {
        display: flex;
        align-items: flex-start;
        gap: $spacing-small;

        .item-label {
          font-weight: 500;
          color: $text-color-secondary;
          flex-shrink: 0;
        }

        .item-value {
          flex: 1;
          font-size: $font-size-small;
          color: $text-color-primary;
        }
      }
    }

    .price {
      color: $--el-color-danger;
      font-weight: 600;
    }
  }
}

.course-option, .package-option {
  display: flex;
  justify-content: space-between;
  width: 100%;

  .course-name, .package-name {
    font-weight: 500;
  }

  .course-price, .package-price {
    color: #909399;
  }
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
