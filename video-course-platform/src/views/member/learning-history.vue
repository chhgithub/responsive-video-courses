<script setup lang="ts">
import { ref } from 'vue';

import { getLearningHistory, type LearningRecord } from '@/utils/member-storage';

// 学习历史记录
const learningHistory = ref<LearningRecord[]>(getLearningHistory());

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
    return dateStr.split(' ')[0];
  }
}

// 按日期分组
function groupByDate(records: LearningRecord[]): Record<string, LearningRecord[]> {
  const grouped: Record<string, LearningRecord[]> = {};

  records.forEach((record) => {
    const dateKey = formatDate(record.studyTime);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
  });

  return grouped;
}

// 分组后的记录
const groupedRecords = ref<Record<string, LearningRecord[]>>(groupByDate(learningHistory.value));

// 继续学习
function handleContinueLearning(recordId: string) {
  console.log('继续学习:', recordId);
}

// 查看课程
function handleViewCourse(courseId: string) {
  console.log('查看课程:', courseId);
}
</script>

<template>
  <div class="learning-history">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>学习历史</h2>
      <p class="page-subtitle">记录您的学习足迹</p>
    </div>

    <!-- 学习记录 -->
    <div v-if="learningHistory.length > 0" class="history-list">
      <div v-for="(records, date) in groupedRecords" :key="date" class="history-group">
        <!-- 日期标题 -->
        <div class="date-header">
          <div class="date-label">{{ date }}</div>
          <div class="record-count">{{ records.length }} 条记录</div>
        </div>

        <!-- 记录列表 -->
        <div class="records-list">
          <div v-for="record in records" :key="record.id" class="record-card">
            <!-- 课程信息 -->
            <div class="course-info">
              <div class="course-title">{{ record.courseTitle }}</div>
              <div class="lesson-title">{{ record.lessonTitle }}</div>
              <div class="study-time">
                <el-icon><Clock /></el-icon>
                <span>{{ record.studyTime }}</span>
              </div>
            </div>

            <!-- 观看时长 -->
            <div class="duration-info">
              <div class="duration-label">观看时长</div>
              <div class="duration-value">{{ formatDuration(record.watchDuration) }}</div>
            </div>

            <!-- 操作按钮 -->
            <div class="record-actions">
              <el-button
                type="primary"
                size="small"
                @click="handleContinueLearning(record.id)"
              >
                继续学习
              </el-button>
              <el-button size="small" @click="handleViewCourse(record.courseId)">
                查看课程
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📖</div>
      <p class="empty-text">还没有学习记录</p>
      <router-link to="/portal/courses" class="empty-link">
        <el-button type="primary">开始学习</el-button>
      </router-link>
    </div>

    <!-- 统计信息 -->
    <div v-if="learningHistory.length > 0" class="stats-section">
      <el-card shadow="hover">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-value">{{ learningHistory.length }}</div>
              <div class="stat-label">学习记录</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">
                {{ formatDuration(learningHistory.reduce((sum, r) => sum + r.watchDuration, 0)) }}
              </div>
              <div class="stat-label">总时长</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ Object.keys(groupedRecords).length }}</div>
              <div class="stat-label">学习天数</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.learning-history {
  max-width: 900px;
  margin: 0 auto;
  padding: $spacing-extra-large 0;
}

.page-header {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .page-subtitle {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

// 历史记录列表
.history-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-extra-large;
}

.history-group {
  .date-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-base;
    padding-bottom: $spacing-small;
    border-bottom: 2px solid #409eff;

    .date-label {
      font-size: $font-size-medium;
      font-weight: 600;
      color: #409eff;
    }

    .record-count {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.record-card {
  background: #fff;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-card;
  padding: $spacing-large;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: $spacing-large;
  transition: $transition-base;

  &:hover {
    box-shadow: $box-shadow-hover;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-small;

  .course-title {
    font-size: $font-size-medium;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .lesson-title {
    font-size: $font-size-base;
    color: $text-color-secondary;
    margin-bottom: $spacing-small;
  }

  .study-time {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-placeholder;

    .el-icon {
      font-size: 14px;
    }
  }
}

.duration-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-base;
  background: $background-color-base;
  border-radius: $border-radius-base;
  min-width: 100px;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: flex-start;
    gap: $spacing-base;
  }

  .duration-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
    margin-bottom: $spacing-small;

    @media (max-width: 768px) {
      margin-bottom: 0;
    }
  }

  .duration-value {
    font-size: $font-size-large;
    font-weight: bold;
    color: #409eff;
  }
}

.record-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: $spacing-small;
  padding-top: $spacing-base;
  border-top: 1px solid $border-color-lighter;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

// 统计信息
.stats-section {
  margin-top: $spacing-extra-large;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-extra-large;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: $spacing-large;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  text-align: center;
  justify-content: center;
}

.stat-icon {
  font-size: 40px;
}

.stat-content {
  .stat-value {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: $spacing-extra-extra-large 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: $spacing-large;
  opacity: 0.5;
}

.empty-text {
  font-size: $font-size-medium;
  color: $text-color-secondary;
  margin-bottom: $spacing-large;
}

.empty-link {
  text-decoration: none;
}
</style>
