<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Refresh } from '@element-plus/icons-vue';
import { getOrgStudents, getOrgStudentDetail, searchOrgStudents } from '@/api/organization';
import { getUserRedeemedCourses, initializeDefaultOrganizations } from '@/utils/general-education-storage';

const router = useRouter();

// 返回个人中心
function handleBack() {
  router.push('/member/profile');
}

const loading = ref(false);
const students = ref<any[]>([]);
const searchKeyword = ref('');
const filterStatus = ref('');
const detailDialogVisible = ref(false);
const currentStudent = ref<any>(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(20);

// 加载学员列表
function loadStudents() {
  loading.value = true;
  try {
    students.value = getOrgStudents();
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

// 过滤学员
const filteredStudents = computed(() => {
  let result = students.value;

  // 搜索过滤
  if (searchKeyword.value) {
    result = searchOrgStudents(searchKeyword.value);
  }

  // 状态过滤
  if (filterStatus.value === 'active') {
    result = result.filter(s => isActive(s));
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(s => !isActive(s));
  }

  return result;
});

// 分页后的数据
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStudents.value.slice(start, end);
});

// 总数
const total = computed(() => filteredStudents.value.length);

// 检查学员是否已激活
function isActive(student: any): boolean {
  const accessRecords = getUserRedeemedCourses(student.userId);
  return accessRecords.length > 0;
}

// 获取学员的课程数
function getCourseCount(userId: string): number {
  const accessRecords = getUserRedeemedCourses(userId);
  return accessRecords.length;
}

// 查看详情
function viewDetail(student: any) {
  try {
    currentStudent.value = getOrgStudentDetail(student.userId);
    detailDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败');
  }
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

// 格式化性别
function formatGender(gender?: string): string {
  const genderMap: Record<string, string> = {
    'male': '男',
    'female': '女',
    'other': '其他',
  };
  return genderMap[gender || ''] || '-';
}

onMounted(() => {
  // 初始化默认单位数据（如果不存在）
  initializeDefaultOrganizations();
  // 加载学员列表
  loadStudents();
});
</script>

<template>
  <div class="org-students-page">
    <!-- 返回按钮栏 -->
    <div class="back-nav">
      <el-button @click="handleBack" :icon="ArrowLeft" class="back-btn">
        返回个人中心
      </el-button>
      <div class="page-title">学员管理</div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">总学员</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ filteredStudents.filter(s => isActive(s)).length }}</div>
            <div class="stat-label">已激活</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">⏰</div>
          <div class="stat-info">
            <div class="stat-value">{{ filteredStudents.filter(s => !isActive(s)).length }}</div>
            <div class="stat-label">未激活</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-value">{{ students.reduce((sum, s) => sum + getCourseCount(s.userId), 0) }}</div>
            <div class="stat-label">总课程数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="搜索">
          <el-input
            v-model="searchKeyword"
            placeholder="姓名/手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="已激活" value="active" />
            <el-option label="未激活" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadStudents">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学员列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="paginatedStudents"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="激活状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="isActive(row) ? 'success' : 'info'" size="large">
              {{ isActive(row) ? '已激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="课程数" width="80" align="center">
          <template #default="{ row }">
            {{ getCourseCount(row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">
              详情
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

      <el-empty v-if="!loading && filteredStudents.length === 0" description="暂无学员">
        <el-button type="primary" @click="loadStudents">刷新</el-button>
      </el-empty>
    </el-card>

    <!-- 学员详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="学员详情" width="700px">
      <el-descriptions v-if="currentStudent" :column="2" border>
        <el-descriptions-item label="用户名">{{ currentStudent.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentStudent.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentStudent.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentStudent.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ formatGender(currentStudent.gender) }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentStudent.age || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentStudent.createTime }}</el-descriptions-item>
        <el-descriptions-item label="激活状态">
          <el-tag :type="currentStudent.courseCount > 0 ? 'success' : 'info'">
            {{ currentStudent.courseCount > 0 ? '已激活' : '未激活' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="课程总数">{{ currentStudent.courseCount }}</el-descriptions-item>
        <el-descriptions-item label="有效课程">{{ currentStudent.activeCourses }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.org-students-page {
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
