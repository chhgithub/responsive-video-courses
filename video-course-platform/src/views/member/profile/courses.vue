<script setup lang="ts">
import { computed, ref } from 'vue';

import { getLearningCourses, getCompletedCourses, type MyCourse } from '@/utils/member-storage';

// 当前激活的 tab
const activeTab = ref<'learning' | 'completed'>('learning');

// 学习中的课程
const learningCourses = ref<MyCourse[]>(getLearningCourses());

// 已完成的课程
const completedCourses = ref<MyCourse[]>(getCompletedCourses());

// 根据 tab 显示的课程
const displayedCourses = computed(() => {
  return activeTab.value === 'learning' ? learningCourses.value : completedCourses.value;
});

// 切换 tab
function handleTabChange(tab: 'learning' | 'completed') {
  activeTab.value = tab;
}

// 继续学习
function handleContinueLearning(courseId: string) {
  console.log('继续学习课程:', courseId);
  // 跳转到学习页面
}

// 重新学习
function handleRelearn(courseId: string) {
  console.log('重新学习课程:', courseId);
  // 跳转到学习页面
}
</script>

<template>
  <div class="my-courses">
    <!-- Tab 切换 -->
    <div class="tabs-wrapper">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'learning' }"
        @click="handleTabChange('learning')"
      >
        学习中
        <span class="badge">{{ learningCourses.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'completed' }"
        @click="handleTabChange('completed')"
      >
        已完成
        <span class="badge">{{ completedCourses.length }}</span>
      </button>
    </div>

    <!-- 课程列表 -->
    <div v-if="displayedCourses.length > 0" class="courses-list">
      <div v-for="course in displayedCourses" :key="course.id" class="course-card">
        <!-- 课程封面 -->
        <div class="course-cover">
          <img :src="course.cover" :alt="course.title" />
          <div class="course-category">{{ course.category }}</div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-title">{{ course.title }}</h3>
          <p class="course-teacher">讲师：{{ course.teacher }}</p>
          <p class="course-time">最后学习：{{ course.lastStudyTime }}</p>

          <!-- 学习进度 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">学习进度</span>
              <span class="progress-text"
                >{{ course.completedLessons }} / {{ course.totalLessons }} 课时</span
              >
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
            </div>
            <div class="progress-percent">{{ course.progress }}%</div>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <el-button
              v-if="activeTab === 'learning'"
              type="primary"
              @click="handleContinueLearning(course.id)"
            >
              继续学习
            </el-button>
            <el-button v-else type="success" @click="handleRelearn(course.id)">
              重新学习
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <p class="empty-text">
        {{ activeTab === 'learning' ? '还没有开始学习的课程' : '还没有已完成的课程' }}
      </p>
      <router-link to="/portal/courses" class="empty-link">
        <el-button type="primary">去选课</el-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-courses {
  min-height: calc(100vh - 200px);
}

// Tab 切换
.tabs-wrapper {
  display: flex;
  gap: $spacing-base;
  margin-bottom: $spacing-extra-large;
  border-bottom: 2px solid $border-color-lighter;
}

.tab-btn {
  padding: $spacing-base $spacing-large;
  font-size: $font-size-medium;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  color: $text-color-secondary;
  border-bottom: 3px solid transparent;
  transition: $transition-base;
  display: flex;
  align-items: center;
  gap: $spacing-small;

  &:hover {
    color: $text-color-primary;
  }

  &.active {
    color: #409eff;
    border-bottom-color: #409eff;
  }

  .badge {
    background: #f0f2f5;
    color: $text-color-secondary;
    font-size: $font-size-small;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: normal;
  }

  &.active .badge {
    background: #e6f7ff;
    color: #409eff;
  }
}

// 课程列表
.courses-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-large;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.course-card {
  background: #fff;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-card;
  overflow: hidden;
  transition: $transition-base;

  &:hover {
    box-shadow: $box-shadow-hover;
    transform: translateY(-2px);
  }
}

.course-cover {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .course-category {
    position: absolute;
    top: $spacing-base;
    left: $spacing-base;
    padding: $spacing-small $spacing-base;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: $font-size-small;
    border-radius: $border-radius-small;
  }
}

.course-info {
  padding: $spacing-large;
}

.course-title {
  font-size: $font-size-medium;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-small;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-teacher,
.course-time {
  font-size: $font-size-small;
  color: $text-color-secondary;
  margin-bottom: $spacing-small;
}

// 进度条
.progress-section {
  margin: $spacing-base 0;
  padding: $spacing-base;
  background: $background-color-base;
  border-radius: $border-radius-small;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-small;

  .progress-label {
    font-size: $font-size-small;
    color: $text-color-secondary;
  }

  .progress-text {
    font-size: $font-size-small;
    color: $text-color-primary;
    font-weight: 500;
  }
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: $spacing-small;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-percent {
  text-align: right;
  font-size: $font-size-small;
  color: #409eff;
  font-weight: 600;
}

// 操作按钮
.course-actions {
  margin-top: $spacing-base;
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
