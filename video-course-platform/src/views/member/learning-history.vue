<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { getUserLearningRecords, getLearningStats, getRecentWatchedCourses } from '@/utils/learning-storage';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);

// 学习记录列表
const learningRecords = ref([]);

// 学习统计
const stats = ref({
  totalCourses: 0,
  completedCourses: 0,
  inProgressCourses: 0,
  totalWatchDuration: 0,
  averageProgress: 0,
});

// 加载学习历史
async function loadLearningHistory() {
  if (!authStore.userInfo) return;

  loading.value = true;
  try {
    // 获取学习记录
    const records = getUserLearningRecords(authStore.userInfo.userId);

    // 按最后观看时间排序
    learningRecords.value = records.sort((a, b) =>
      new Date(b.lastWatchTime).getTime() - new Date(a.lastWatchTime).getTime()
    );

    // 获取统计信息
    stats.value = getLearningStats(authStore.userInfo.userId);

    console.log('加载学习历史:', learningRecords.value.length);
  } catch (error: any) {
    ElMessage.error(error.message || '加载学习历史失败');
  } finally {
    loading.value = false;
  }
}

// 格式化时长
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

// 按日期分组
const groupedRecords = computed(() => {
  const grouped: Record<string, typeof learningRecords.value> = {};

  learningRecords.value.forEach((record) => {
    const dateKey = formatDate(record.lastWatchTime);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
  });

  return grouped;
});

// 继续学习
function handleContinueLearning(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
}

// 查看课程详情
function handleViewDetail(courseId: string) {
  router.push(`/portal/course/${courseId}`);
}

onMounted(() => {
  loadLearningHistory();
});
</script>

<template>
  <div class="learning-history">
    <div class="page-header">
      <h2>学习历史</h2>
      <p>查看您的学习记录和统计数据</p>
    </div>

    <!-- 学习统计 -->
    <el-card v-if="!loading && stats.totalCourses > 0" class="stats-card" shadow="never">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalCourses }}</div>
            <div class="stat-label">已学课程</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completedCourses }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProgressCourses }}</div>
            <div class="stat-label">学习中</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon info">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatDuration(stats.totalWatchDuration) }}</div>
            <div class="stat-label">总时长</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 学习记录列表 -->
    <div v-else-if="Object.keys(groupedRecords).length > 0" class="records-container">
      <div v-for="(records, date) in groupedRecords" :key="date" class="date-group">
        <div class="date-header">
          <h3>{{ date }}</h3>
          <span class="count">共 {{ records.length }} 条记录</span>
        </div>

        <div class="records-list">
          <div
            v-for="record in records"
            :key="record.recordId"
            class="record-item"
          >
            <!-- 课程封面 -->
            <div class="course-cover" @click="handleViewDetail(record.courseId)">
              <el-image :src="record.courseCover" fit="cover" />
              <div class="play-overlay">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>

            <!-- 课程信息 -->
            <div class="record-info">
              <h4 class="course-name" @click="handleViewDetail(record.courseId)">
                {{ record.courseName }}
              </h4>

              <!-- 学习进度 -->
              <div class="progress-section">
                <div class="progress-header">
                  <span class="progress-label">学习进度</span>
                  <span class="progress-percent">{{ record.progress }}%</span>
                </div>
                <el-progress
                  :percentage="record.progress"
                  :status="record.progress >= 100 ? 'success' : undefined"
                  :show-text="false"
                />
                <div class="progress-info">
                  <span class="lessons"
                    >已完成 {{ record.completedLessons?.length || 0 }} 课时</span
                  >
                </div>
              </div>
            </div>

            <!-- 时间和操作 -->
            <div class="record-meta">
              <div class="time-info">
                <div class="time-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ record.lastWatchTime?.split('T')[1]?.substring(0, 5) || '-' }}</span>
                </div>
                <div class="time-item">
                  <el-icon><Timer /></el-icon>
                  <span>{{ formatDuration(record.totalWatchDuration) }}</span>
                </div>
              </div>

              <el-button
                type="primary"
                :icon="VideoPlay"
                size="small"
                @click="handleContinueLearning(record.courseId)"
              >
                继续学习
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无学习记录">
        <el-button type="primary" @click="router.push('/portal/courses')">
          去选课
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.learning-history {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-extra-large;

    h2 {
      font-size: $font-size-extra-large;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    p {
      color: $text-color-secondary;
    }
  }

  .stats-card {
    margin-bottom: $spacing-extra-large;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: $spacing-large;

      .stat-item {
        display: flex;
        align-items: center;
        gap: $spacing-base;
        padding: $spacing-large;
        background: #fff;
        border-radius: $border-radius-base;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #fff;

          &.success {
            background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          }

          &.warning {
            background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
          }

          &.info {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
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
    }
  }

  .loading-container {
    padding: $spacing-extra-large 0;
  }

  .records-container {
    display: flex;
    flex-direction: column;
    gap: $spacing-extra-large;
  }

  .date-group {
    .date-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-large;

      h3 {
        font-size: $font-size-large;
        font-weight: 600;
        color: $text-color-primary;
      }

      .count {
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }

    .records-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-base;
    }
  }

  .record-item {
    display: flex;
    align-items: center;
    gap: $spacing-large;
    padding: $spacing-large;
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
    }

    .course-cover {
      position: relative;
      width: 160px;
      height: 120px;
      border-radius: $border-radius-base;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }

      .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: $transition-base;

        .play-icon {
          font-size: 36px;
          color: #fff;
        }
      }

      &:hover .play-overlay {
        opacity: 1;
      }
    }

    .record-info {
      flex: 1;
      min-width: 0;

      .course-name {
        font-size: $font-size-large;
        font-weight: 500;
        color: $text-color-primary;
        margin-bottom: $spacing-base;
        cursor: pointer;
        transition: $transition-base;

        &:hover {
          color: $--el-color-primary;
        }
      }

      .progress-section {
        margin-bottom: $spacing-small;

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: $spacing-small;

          .progress-label {
            font-size: $font-size-small;
            color: $text-color-secondary;
          }

          .progress-percent {
            font-size: $font-size-small;
            font-weight: 600;
            color: $--el-color-primary;
          }
        }

        .progress-info {
          margin-top: $spacing-small;

          .lessons {
            font-size: $font-size-extra-small;
            color: $text-color-placeholder;
          }
        }
      }
    }

    .record-meta {
      display: flex;
      flex-direction: column;
      gap: $spacing-base;
      min-width: 150px;

      .time-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .time-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: $font-size-extra-small;
          color: $text-color-placeholder;
        }
      }
    }
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
