<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrgStudents, getOrgStudentDetail, searchOrgStudents } from '@/api/organization';
import { getUserById } from '@/utils/user-storage';
import { getUserRedeemedCourses, initializeDefaultOrganizations } from '@/utils/general-education-storage';
import { formatDate } from '@/utils/date-format';

const router = useRouter();
const loading = ref(false);
const students = ref<any[]>([]);
const searchKeyword = ref('');
const filterStatus = ref('');
const detailDialogVisible = ref(false);
const currentStudent = ref<any>(null);

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

// 查看学习进度
function viewProgress(student: any) {
  router.push(`/admin/org/progress?userId=${student.userId}`);
}

// 导出数据
function exportStudents() {
  ElMessage.info('导出功能开发中...');
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
  <div class="students-page">
    <div class="page-header">
      <h2>学员管理</h2>
      <!-- <div class="header-actions">
        <el-button @click="exportStudents">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div> -->
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
        :data="filteredStudents"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="激活状态" width="100">
          <template #default="{ row }">
            <el-tag :type="isActive(row) ? 'success' : 'info'">
              {{ isActive(row) ? '已激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="课程数" width="80">
          <template #default="{ row }">
            {{ getCourseCount(row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" @click="viewProgress(row)">
              学习进度
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
        <el-descriptions-item label="注册时间">{{ formatDate(currentStudent.createTime) }}</el-descriptions-item>
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

.students-page {
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
}
</style>
