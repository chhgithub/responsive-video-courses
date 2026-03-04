<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  getLearningRecordsByCourseId,
  type StudentLearningRecord,
  LearningStatus,
} from '@/utils/course-storage';
import { formatDuration } from '@/utils/video-storage';

interface Props {
  courseId: number;
  courseName: string;
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const loading = ref(false);
const students = ref<StudentLearningRecord[]>([]);

// 筛选表单
const filterForm = ref({
  status: '',
  keyword: '',
});

// 统计信息
const statistics = computed(() => {
  const total = students.value.length;
  const learning = students.value.filter((s) => s.status === 'learning').length;
  const completed = students.value.filter((s) => s.status === 'completed').length;
  const dropped = students.value.filter((s) => s.status === 'dropped').length;
  const avgProgress =
    total > 0
      ? Math.round(
          students.value.reduce((sum, s) => sum + s.progress, 0) / total
        )
      : 0;

  return { total, learning, completed, dropped, avgProgress };
});

// 筛选后的学员列表
const filteredStudents = computed(() => {
  let result = students.value;

  if (filterForm.value.status) {
    result = result.filter((s) => s.status === filterForm.value.status);
  }

  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase();
    result = result.filter(
      (s) =>
        s.userName.toLowerCase().includes(keyword) ||
        s.userId.toLowerCase().includes(keyword)
    );
  }

  return result;
});

// 加载学员数据
async function loadStudents() {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    students.value = getLearningRecordsByCourseId(props.courseId);
  } finally {
    loading.value = false;
  }
}

// 重置筛选
function handleResetFilter() {
  filterForm.value = {
    status: '',
    keyword: '',
  };
}

// 获取状态标签
function getStatusLabel(status: LearningStatus): string {
  const labels = {
    learning: '学习中',
    completed: '已完成',
    dropped: '已放弃',
  };
  return labels[status] || status;
}

// 获取状态颜色
function getStatusColor(status: LearningStatus): string {
  const colors = {
    learning: 'primary',
    completed: 'success',
    dropped: 'info',
  };
  return colors[status] || 'default';
}

// 格式化学习时长
function formatStudyDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
}

onMounted(() => {
  if (props.visible) {
    loadStudents();
  }
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadStudents();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="学员学习记录"
    width="900px"
  >
    <div class="student-list">
      <!-- 统计概览 -->
      <div class="statistics-cards">
        <div class="stat-card">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">总学员数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.learning }}</div>
          <div class="stat-label">学习中</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.avgProgress }}%</div>
          <div class="stat-label">平均进度</div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <el-card class="filter-card" shadow="never">
        <el-form :model="filterForm" inline>
          <el-form-item label="学习状态">
            <el-select
              v-model="filterForm.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="学习中" value="learning" />
              <el-option label="已完成" value="completed" />
              <el-option label="已放弃" value="dropped" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索学员">
            <el-input
              v-model="filterForm.keyword"
              placeholder="输入学员姓名或ID"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary">查询</el-button>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 学员列表 -->
      <el-card v-loading="loading" class="list-card" shadow="never">
        <div class="student-items">
          <div
            v-for="student in filteredStudents"
            :key="student.recordId"
            class="student-item"
          >
            <el-avatar :src="student.userAvatar" :size="50" />
            <div class="student-info">
              <div class="student-name">{{ student.userName }}</div>
              <div class="student-meta">
                <span>报名时间: {{ student.enrollTime }}</span>
              </div>
            </div>
            <div class="student-progress">
              <div class="progress-label">
                学习进度: {{ student.progress }}%
              </div>
              <el-progress
                :percentage="student.progress"
                :status="student.progress >= 100 ? 'success' : undefined"
              />
              <div class="progress-detail">
                已完成 {{ student.completedLessons.length }} 课时
              </div>
            </div>
            <div class="student-stats">
              <div class="stat-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatStudyDuration(student.totalWatchDuration) }}</span>
              </div>
              <div class="stat-item">
                <el-icon><VideoCamera /></el-icon>
                <span>最后观看: {{ student.lastWatchTime }}</span>
              </div>
            </div>
            <div class="student-actions">
              <el-tag :type="getStatusColor(student.status)" size="small">
                {{ getStatusLabel(student.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredStudents.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无学员数据" />
          </div>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.student-list {
  .statistics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-base;
    margin-bottom: $spacing-large;

    .stat-card {
      padding: $spacing-large;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: $border-radius-base;
      color: #fff;
      text-align: center;

      &:nth-child(2) {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &:nth-child(3) {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &:nth-child(4) {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .stat-number {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: $spacing-small;
      }

      .stat-label {
        font-size: $font-size-small;
        opacity: 0.9;
      }
    }
  }

  .filter-card {
    margin-bottom: $spacing-large;
  }

  .list-card {
    .student-items {
      max-height: 500px;
      overflow-y: auto;
    }
  }

  .student-item {
    display: flex;
    align-items: center;
    gap: $spacing-large;
    padding: $spacing-large;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-base;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .student-info {
      flex: 1;
      min-width: 200px;

      .student-name {
        font-size: $font-size-medium;
        font-weight: 500;
        color: $text-color-primary;
        margin-bottom: $spacing-small;
      }

      .student-meta {
        display: flex;
        gap: $spacing-large;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }

    .student-progress {
      width: 200px;

      .progress-label {
        font-size: $font-size-small;
        color: $text-color-secondary;
        margin-bottom: $spacing-small;
      }

      .progress-detail {
        font-size: $font-size-extra-small;
        color: $text-color-secondary;
        margin-top: $spacing-small;
      }
    }

    .student-stats {
      display: flex;
      flex-direction: column;
      gap: $spacing-small;
      min-width: 150px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: $font-size-extra-small;
        color: $text-color-secondary;
      }
    }

    .student-actions {
      min-width: 80px;
      text-align: right;
    }
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
