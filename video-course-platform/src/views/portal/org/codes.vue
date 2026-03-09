<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Refresh } from '@element-plus/icons-vue';
import { getOrgRedemptionCodes, getOrgCodeDetail, getOrgStatistics, filterOrgCodes } from '@/api/organization';
import { getAllUsers } from '@/utils/user-storage';
import { initializeDefaultOrganizations } from '@/utils/general-education-storage';

const router = useRouter();

// 返回个人中心
function handleBack() {
  router.push('/member/profile');
}

const loading = ref(false);
const codes = ref<any[]>([]);
const selectedStatus = ref('');
const detailDialogVisible = ref(false);
const currentCode = ref<any>(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(20);

// 状态映射
const statusMap = {
  unused: { text: '未使用', type: 'success' },
  used: { text: '已使用', type: 'info' },
  expired: { text: '已过期', type: 'danger' },
};

// 加载兑换码列表
function loadCodes() {
  loading.value = true;
  try {
    codes.value = getOrgRedemptionCodes();
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

// 过滤兑换码
const filteredCodes = computed(() => {
  return filterOrgCodes(selectedStatus.value);
});

// 分页后的数据
const paginatedCodes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCodes.value.slice(start, end);
});

// 总数
const total = computed(() => filteredCodes.value.length);

// 统计数据
const statistics = computed(() => {
  return getOrgStatistics();
});

// 查看详情
function viewDetail(code: any) {
  try {
    currentCode.value = getOrgCodeDetail(code.id);
    detailDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败');
  }
}

// 获取用户名
function getUserName(userId: string): string {
  const user = getAllUsers().find(u => u.userId === userId);
  return user?.nickname || user?.username || userId;
}

// 复制兑换码
function copyCode(code: string) {
  navigator.clipboard.writeText(code);
  ElMessage.success('已复制到剪贴板');
}

// 分页改变
function handlePageChange(page: number) {
  currentPage.value = page;
}

// 每页条数改变
function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
}

// 格式化日期
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化过期时间
function formatExpireTime(expireTime?: string): string {
  if (!expireTime) return '永不过期';

  const expire = new Date(expireTime);
  const now = new Date();
  const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return '已过期';
  if (diffDays === 1) return '1天后过期';
  if (diffDays < 7) return `${diffDays}天后过期`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周后过期`;
  return `${Math.ceil(diffDays / 30)}个月后过期`;
}

onMounted(() => {
  // 初始化默认单位数据（如果不存在）
  initializeDefaultOrganizations();
  // 加载兑换码列表
  loadCodes();
});
</script>

<template>
  <div class="org-codes-page">
    <!-- 返回按钮栏 -->
    <div class="back-nav">
      <el-button @click="handleBack" :icon="ArrowLeft" class="back-btn">
        返回个人中心
      </el-button>
      <div class="page-title">兑换码管理</div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">🔑</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalCodes }}</div>
            <div class="stat-label">总兑换码</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">🟢</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.unusedCodes }}</div>
            <div class="stat-label">未使用</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">🔵</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.usedCodes }}</div>
            <div class="stat-label">已使用</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">🔴</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.expiredCodes }}</div>
            <div class="stat-label">已过期</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="selectedStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="未使用" value="unused" />
            <el-option label="已使用" value="used" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadCodes">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 兑换码列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedCodes" stripe v-loading="loading">
        <el-table-column label="兑换码" width="200">
          <template #default="{ row }">
            <el-tag style="font-family: monospace; font-size: 14px;">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="兑换内容" min-width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" size="large">
              {{ statusMap[row.status].text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="120" align="center">
          <template #default="{ row }">
            {{ formatExpireTime(row.codeExpireTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="使用人" width="100" align="center">
          <template #default="{ row }">
            {{ row.usedBy ? getUserName(row.usedBy) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="使用时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'unused'"
              link
              type="primary"
              @click="copyCode(row.code)"
            >
              复制
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <el-empty v-if="!loading && filteredCodes.length === 0" description="暂无兑换码">
        <el-button type="primary" @click="loadCodes">刷新</el-button>
      </el-empty>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="兑换码详情" width="800px">
      <el-descriptions v-if="currentCode" :column="2" border>
        <el-descriptions-item label="兑换码">
          <el-tag style="font-family: monospace;">{{ currentCode.code }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="兑换内容">{{ currentCode.targetName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="currentCode.targetType === 'package' ? 'warning' : 'primary'" size="large">
            {{ currentCode.targetType === 'package' ? '套餐' : '课程' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMap[currentCode.status].type" size="large">
            {{ statusMap[currentCode.status].text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="有效期">{{ formatExpireTime(currentCode.codeExpireTime) }}</el-descriptions-item>
        <el-descriptions-item label="兑换后有效期">
          {{ currentCode.accessValidDays ? `${currentCode.accessValidDays}天` : '永不过期' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentCode.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="使用人">{{ currentCode.usedBy ? getUserName(currentCode.usedBy) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="使用时间">{{ formatDate(currentCode.usedTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentCode.note || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.org-codes-page {
  padding: $spacing-large;
}

.back-nav {
  display: flex;
  align-items: center;
  gap: $spacing-large;
  margin-bottom: $spacing-large;

  .back-btn {
    flex-shrink: 0;
  }

  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: $text-color-primary;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-large;
  margin-bottom: $spacing-large;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: $spacing-base;
  }

  .stat-icon {
    font-size: 32px;
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: $text-color-primary;
      line-height: 1;
      margin-bottom: $spacing-small;
    }

    .stat-label {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

.filter-card {
  margin-bottom: $spacing-large;
}

.table-card {
  min-height: 400px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-large;
  padding-top: $spacing-large;
  border-top: 1px solid $border-color-lighter;
}
</style>
