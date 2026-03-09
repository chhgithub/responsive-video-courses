<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Refresh } from '@element-plus/icons-vue';
import { getOrgStudentProgress, getOrgStudents, getOrgStatistics } from '@/api/organization';
import { getUserById } from '@/utils/user-storage';
import { initializeDefaultOrganizations } from '@/utils/general-education-storage';

const router = useRouter();

// 返回个人中心
function handleBack() {
  router.push('/member/profile');
}

const loading = ref(false);
const progressList = ref<any[]>([]);
const students = ref<any[]>([]);
const selectedStudent = ref('');

// 分页
const currentPage = ref(1);
const pageSize = ref(20);

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

// 分页后的数据
const paginatedProgress = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProgress.value.slice(start, end);
});

// 总数
const total = computed(() => filteredProgress.value.length);

// 获取进度颜色
function getProgressColor(progress: number): string {
  if (progress >= 80) return '#67C23A';
  if (progress >= 50) return '#409EFF';
  if (progress >= 20) return '#E6A23C';
  return '#F56C6C';
}

// 获取进度百分比
function getProgressPercentage(progress: number): number {
  return Math.round(progress);
}

// 获取进度文本
function getProgressText(progress: number): string {
  if (progress >= 100) return '已完成';
  if (progress > 0) return `${progress}%`;
  return '未开始';
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
  if (progress >= 50) return '进行中';
  if (progress > 0) return '学习中';
  return '未开始';
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
  // 加载进度数据
  loadData();
});
</script>

<template>
  <div class="org-progress-page">
    <!-- 返回按钮栏 -->
    <div class="back-nav">
      <el-button @click="handleBack" :icon="ArrowLeft" class="back-btn">
        返回个人中心
      </el-button>
      <div class="page-title">学习进度</div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalStudents }}</div>
            <div class="stat-label">总学员</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.activeStudents }}</div>
            <div class="stat-label">已激活</div>
          </div>
        </div>
      </el-card>
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
          <div class="stat-icon">🔓</div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.usedCodes }}</div>
            <div class="stat-label">已使用</div>
          </div>
        </div>
      </el-card>
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

    <!-- 进度列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="paginatedProgress"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="userName" label="学员姓名" width="120" />
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="packageName" label="套餐名称" min-width="150">
          <template #default="{ row }">
            {{ row.packageName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="学习进度" width="200">
          <template #default="{ row }">
            <div class="progress-wrapper">
              <el-progress
                :percentage="getProgressPercentage(row.progress)"
                :color="getProgressColor(row.progress)"
                :show-text="false"
              />
              <span class="progress-text">{{ getProgressText(row.progress) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度百分比" width="120" align="center">
          <template #default="{ row }">
            {{ getProgressPercentage(row.progress) }}%
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.progress)" size="large">
              {{ getStatusText(row.progress) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="120" align="center">
          <template #default="{ row }">
            {{ formatExpireTime(row.expireTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastWatchTime" label="最后学习时间" width="160" />
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

      <el-empty v-if="!loading && filteredProgress.length === 0" description="暂无学习记录">
        <el-button type="primary" @click="loadData">刷新</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.org-progress-page {
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

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-small;
}

.progress-text {
  font-size: $font-size-small;
  color: $text-color-secondary;
  min-width: 60px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-large;
  padding-top: $spacing-large;
  border-top: 1px solid $border-color-lighter;
}
</style>
