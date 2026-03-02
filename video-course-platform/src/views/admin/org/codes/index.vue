<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getOrgRedemptionCodes, getOrgCodeDetail, getOrgStatistics, filterOrgCodes } from '@/api/organization';
import { getAllUsers } from '@/utils/user-storage';
import { formatDate, formatExpireTime } from '@/utils/date-format';
import { initializeDefaultOrganizations } from '@/utils/general-education-storage';

const loading = ref(false);
const codes = ref<any[]>([]);
const selectedStatus = ref('');
const detailDialogVisible = ref(false);
const currentCode = ref<any>(null);

// 状态映射
const statusMap = {
  unused: { text: '未使用', type: 'success' },
  used: { text: '已使用', type: 'info' },
  expired: { text: '已过期', type: 'danger' },
};

// 加载激活码列表
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

// 过滤激活码
const filteredCodes = computed(() => {
  return filterOrgCodes(selectedStatus.value);
});

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

// 复制激活码
function copyCode(code: string) {
  navigator.clipboard.writeText(code);
  ElMessage.success('已复制到剪贴板');
}

// 导出数据
function exportCodes() {
  ElMessage.info('导出功能开发中...');
}

onMounted(() => {
  // 初始化默认单位数据（如果不存在）
  initializeDefaultOrganizations();
  // 加载激活码列表
  loadCodes();
});
</script>

<template>
  <div class="codes-page">
    <div class="page-header">
      <h2>激活码管理</h2>
      <div class="header-actions">
        <el-button @click="exportCodes">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
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

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalCodes }}</div>
          <div class="stat-label">总激活码</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.unusedCodes }}</div>
          <div class="stat-label">未使用</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.usedCodes }}</div>
          <div class="stat-label">已使用</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.expiredCodes }}</div>
          <div class="stat-label">已过期</div>
        </div>
      </el-card>
    </div>

    <!-- 激活码列表 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="filteredCodes" stripe>
        <el-table-column label="激活码" width="180">
          <template #default="{ row }">
            <el-tag style="font-family: monospace;">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="兑换内容" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type">
              {{ statusMap[row.status].text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="120">
          <template #default="{ row }">
            {{ formatExpireTime(row.codeExpireTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="使用人" width="100">
          <template #default="{ row }">
            {{ row.usedBy ? getUserName(row.usedBy) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="使用时间" width="140">
          <template #default="{ row }">
            {{ formatDate(row.usedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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

      <el-empty v-if="!loading && filteredCodes.length === 0" description="暂无激活码">
        <el-button type="primary" @click="loadCodes">刷新</el-button>
      </el-empty>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="激活码详情" width="800px">
      <el-descriptions v-if="currentCode" :column="2" border>
        <el-descriptions-item label="激活码">{{ currentCode.code }}</el-descriptions-item>
        <el-descriptions-item label="兑换内容">{{ currentCode.targetName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="currentCode.targetType === 'package' ? 'warning' : 'primary'" size="small">
            {{ currentCode.targetType === 'package' ? '套餐' : '课程' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMap[currentCode.status].type">
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

.codes-page {
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

    .header-actions {
      display: flex;
      gap: $spacing-small;
    }
  }

  .filter-card {
    margin-bottom: $spacing-large;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-card {
    text-align: center;
  }

  .stat-content {
    padding: 16px 0;
  }

  .stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 14px;
    color: $text-color-secondary;
  }
}
</style>
