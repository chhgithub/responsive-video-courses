<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getOrgStudentProgress, getOrgStudents, getOrgStatistics } from '@/api/organization';
import { getUserById } from '@/utils/user-storage';
import { initializeDefaultOrganizations } from '@/utils/general-education-storage';

const route = useRoute();
const loading = ref(false);
const progressList = ref<any[]>([]);
const students = ref<any[]>([]);
const selectedStudent = ref('');

// 加载数据
function loadData() {
  loading.value = true;
  try {
    progressList.value = getOrgStudentProgress();
    students.value = getOrgStudents();
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

// 统计数据
const statistics = computed(() => {
  return getOrgStatistics();
});

// 过滤进度
const filteredProgress = computed(() => {
  if (!selectedStudent.value) {
    return progressList.value;
  }
  return progressList.value.filter(p => p.userId === selectedStudent.value);
});

// 获取进度颜色
function getProgressColor(progress: number): string {
  if (progress >= 80) return '#67C23A';
  if (progress >= 50) return '#409EFF';
  if (progress >= 20) return '#E6A23C';
  return '#F56C6C';
}

// 获取状态类型
function getStatusType(progress: number): string {
  if (progress >= 100) return 'success';
  if (progress >= 50) return 'primary';
  if (progress > 0) return 'warning';
  return 'info';
}

// 获取状态文本
function getStatusText(progress: number): string {
  if (progress >= 100) return '已完成';
  if (progress > 0) return '学习中';
  return '未开始';
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

// 导出数据
function exportProgress() {
  ElMessage.info('导出功能开发中...');
}

onMounted(() => {
  // 初始化默认单位数据（如果不存在）
  initializeDefaultOrganizations();
  // 加载进度数据
  loadData();
});
</script>

<template>
  <div class="progress-page">
    <div class="page-header">
      <h2>学习进度</h2>
      <div class="header-actions">
        <el-button @click="exportProgress">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="学员">
          <el-select
            v-model="selectedStudent"
            filterable
            placeholder="全部学员"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="student in students"
              :key="student.userId"
              :label="student.nickname"
              :value="student.userId"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadData">
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
          <div class="stat-value">{{ statistics.totalStudents }}</div>
          <div class="stat-label">总学员</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.activeStudents }}</div>
          <div class="stat-label">已激活</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalCodes }}</div>
          <div class="stat-label">总激活码</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.usedCodes }}</div>
          <div class="stat-label">已使用</div>
        </div>
      </el-card>
    </div>

    <!-- 进度列表 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="filteredProgress" stripe>
        <el-table-column prop="userName" label="学员姓名" width="120" />
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="packageName" label="套餐名称" min-width="150">
          <template #default="{ row }">
            {{ row.packageName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="学习进度" width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="getProgressColor(row.progress)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.progress)">
              {{ getStatusText(row.progress) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="120">
          <template #default="{ row }">
            {{ formatExpireTime(row.expireTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastWatchTime" label="最后学习时间" width="140">
          <template #default="{ row }">
            {{ formatDate(row.lastWatchTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="accessSource" label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="row.accessSource === 'redeem' ? 'warning' : 'primary'" size="small">
              {{ row.accessSource === 'redeem' ? '兑换' : '购买' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredProgress.length === 0" description="暂无学习记录">
        <el-button type="primary" @click="loadData">刷新</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.progress-page {
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
