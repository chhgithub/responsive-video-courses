<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getAllRedemptionRecords,
  getRedemptionRecordsByOrganization,
  getAllOrganizations,
} from '@/utils/general-education-storage';
import type { RedemptionRecord } from '@/types/general-education';
import { DataLine, Calendar, Clock, Calendar as CalendarMonth, Search, Download } from '@element-plus/icons-vue';

const loading = ref(false);
const records = ref<RedemptionRecord[]>([]);
const selectedOrganization = ref('');
const searchKeyword = ref('');

// 单位列表
const orgList = ref<any[]>([]);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 过滤后的记录
const filteredRecords = computed(() => {
  let result = records.value;

  // 单位筛选
  if (selectedOrganization.value) {
    result = result.filter(r => r.organizationId === selectedOrganization.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(r =>
      r.code.toLowerCase().includes(keyword) ||
      r.courseName.toLowerCase().includes(keyword) ||
      r.userName.toLowerCase().includes(keyword) ||
      r.organizationName.toLowerCase().includes(keyword)
    );
  }

  // 按时间倒序
  return result.sort((a, b) =>
    new Date(b.redeemTime).getTime() - new Date(a.redeemTime).getTime()
  );
});

// 分页数据
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 统计数据
const statistics = computed(() => {
  return {
    total: filteredRecords.value.length,
    today: filteredRecords.value.filter(r => {
      const today = new Date();
      const recordDate = new Date(r.redeemTime);
      return (
        today.getFullYear() === recordDate.getFullYear() &&
        today.getMonth() === recordDate.getMonth() &&
        today.getDate() === recordDate.getDate()
      );
    }).length,
    thisWeek: filteredRecords.value.filter(r => {
      const now = new Date();
      const recordDate = new Date(r.redeemTime);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    }).length,
    thisMonth: filteredRecords.value.filter(r => {
      const now = new Date();
      const recordDate = new Date(r.redeemTime);
      return (
        now.getFullYear() === recordDate.getFullYear() &&
        now.getMonth() === recordDate.getMonth()
      );
    }).length,
  };
});

// 格式化时间
function formatTime(time: string): string {
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 导出记录
function handleExport() {
  const csvContent = [
    ['兑换码', '课程名称', '单位', '用户', '兑换时间', 'IP地址'].join(','),
    ...records.value.map(r => [
      r.code,
      r.courseName,
      r.organizationName,
      r.userName,
      formatTime(r.redeemTime),
      r.ip || '-',
    ].join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `兑换记录_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success('导出成功');
}

// 加载记录
async function loadRecords() {
  loading.value = true;
  try {
    if (selectedOrganization.value) {
      records.value = getRedemptionRecordsByOrganization(selectedOrganization.value);
    } else {
      records.value = getAllRedemptionRecords();
    }
  } catch (error) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
}

// 加载单位列表
function loadOrganizations() {
  orgList.value = getAllOrganizations();
}

// 初始化
onMounted(() => {
  loadOrganizations();
  loadRecords();
});

// 监听筛选条件变化
watch([selectedOrganization], () => {
  loadRecords();
});
</script>

<template>
  <div class="redemption-records-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="40"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">总兑换次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon today">
              <el-icon :size="40"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.today }}</div>
              <div class="stat-label">今日兑换</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon week">
              <el-icon :size="40"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.thisWeek }}</div>
              <div class="stat-label">本周兑换</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon month">
              <el-icon :size="40"><CalendarMonth /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.thisMonth }}</div>
              <div class="stat-label">本月兑换</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和操作栏 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="{ organization: selectedOrganization, keyword: searchKeyword }">
        <el-form-item label="单位">
          <el-select
            v-model="selectedOrganization"
            placeholder="全部单位"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="org in orgList"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="searchKeyword"
            placeholder="兑换码/课程/用户"
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出记录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 记录列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="paginatedRecords"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="code" label="兑换码" width="150">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="organizationName" label="单位" width="180" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="redeemTime" label="兑换时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.redeemTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="accessValidDays" label="有效天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.accessValidDays ? 'success' : 'info'" size="small">
              {{ row.accessValidDays ? `${row.accessValidDays}天` : '永久' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="140" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRecords.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.redemption-records-page {
  padding: $spacing-large;
  background: $background-color-base;
  min-height: calc(100vh - $navbar-height);
}

.stats-row {
  margin-bottom: $spacing-large;
}

.stat-card {
  cursor: default;

  .stat-content {
    display: flex;
    align-items: center;
    gap: $spacing-large;

    .stat-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.today {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.week {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.month {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .stat-info {
      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: $text-color-primary;
        margin-bottom: $spacing-small;
      }

      .stat-label {
        font-size: $font-size-base;
        color: $text-color-secondary;
      }
    }
  }
}

.filter-card {
  margin-bottom: $spacing-large;
}

.table-card {
  .pagination-wrapper {
    margin-top: $spacing-large;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
