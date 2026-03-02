<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import { hasUserPurchasedCourse } from '@/utils/order-storage';
import { getCourseLearningRecord, updateLearningProgress } from '@/utils/learning-storage';
import { checkUserCourseAccess } from '@/utils/general-education-storage';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const courseId = route.params.courseId as string;

// 课程数据
const course = ref<any>(null);

// 当前播放的课时
const currentLessonIndex = ref(0);

// 播放器状态
const playerReady = ref(false);

// 获取当前课时
const currentLesson = computed(() => {
  if (!course.value?.chapters) return null;
  const allLessons = course.value.chapters.flatMap((chapter: any) => chapter.lessons);
  return allLessons[currentLessonIndex.value] || null;
});

// 获取所有课时列表（扁平化）
const allLessons = computed(() => {
  if (!course.value?.chapters) return [];
  return course.value.chapters.flatMap((chapter: any, chapterIndex: number) =>
    chapter.lessons.map((lesson: any, lessonIndex: number) => ({
      ...lesson,
      chapterIndex,
      chapterName: chapter.name,
      lessonIndex,
    }))
  );
});

// 检查课程是否已购买
function checkAccess() {
  if (!course.value) return false;

  // 免费课程直接可以学习
  if (course.value.isFree) return true;

  // 付费课程需要购买或兑换
  if (!authStore.userInfo) {
    ElMessage.warning('请先登录');
    router.push(`/portal/login?redirect=/portal/course-learn/${courseId}`);
    return false;
  }

  // 检查是否已购买
  const purchased = hasUserPurchasedCourse(authStore.userInfo.userId, courseId);

  // 检查是否已兑换（通识教育）
  const redeemed = checkUserCourseAccess(authStore.userInfo.userId, courseId);

  if (!purchased && !redeemed) {
    ElMessageBox.confirm('该课程需要购买后才能学习', '提示', {
      confirmButtonText: '去购买',
      cancelButtonText: '返回',
      type: 'warning',
    }).then(() => {
      router.push(`/portal/checkout/${courseId}`);
    }).catch(() => {
      router.push(`/portal/course/${courseId}`);
    });
    return false;
  }

  return true;
}

// 加载课程数据
async function loadCourse() {
  loading.value = true;
  try {
    const courseData = getPortalCourseById(courseId);
    if (!courseData) {
      ElMessage.error('课程不存在');
      router.push('/portal/courses');
      return;
    }

    course.value = courseData;

    // 检查访问权限
    if (!checkAccess()) {
      return;
    }

    // 加载学习进度
    await loadLearningProgress();
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程失败');
  } finally {
    loading.value = false;
  }
}

// 加载学习进度
async function loadLearningProgress() {
  if (!authStore.userInfo) return;

  const record = getCourseLearningRecord(authStore.userInfo.userId, courseId);
  if (record && record.lastWatchLesson) {
    // 查找上次观看的课时的索引
    const index = allLessons.value.findIndex((lesson: any) => lesson.id === record.lastWatchLesson);
    if (index !== -1) {
      currentLessonIndex.value = index;
    }
  }
}

// 切换课时
function handleLessonChange(index: number) {
  currentLessonIndex.value = index;
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 标记课时为已完成
function handleMarkComplete() {
  if (!authStore.userInfo || !currentLesson.value) return;

  const record = getCourseLearningRecord(authStore.userInfo.userId, courseId);
  const completedLessons = record?.completedLessons || [];

  if (!completedLessons.includes(currentLesson.value.id)) {
    completedLessons.push(currentLesson.value.id);
  }

  // 更新学习进度
  const totalLessons = allLessons.value.length;
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  updateLearningProgress(authStore.userInfo.userId, courseId, {
    courseName: course.value.title,
    courseCover: course.value.coverImage,
    progress,
    lastWatchLesson: currentLesson.value.id,
    completedLessons,
    totalWatchDuration: (record?.totalWatchDuration || 0) + 300, // 假设看了5分钟
  });

  ElMessage.success('已标记为完成');

  // 自动播放下一个课时
  if (currentLessonIndex.value < allLessons.value.length - 1) {
    setTimeout(() => {
      handleLessonChange(currentLessonIndex.value + 1);
    }, 1000);
  }
}

// 返回课程详情
function handleBackToDetail() {
  router.push(`/portal/course/${courseId}`);
}

onMounted(() => {
  loadCourse();
});
</script>

<template>
  <div class="course-learn" v-loading="loading">
    <div v-if="course" class="container">
      <div class="content">
        <!-- 左侧播放器和课程信息 -->
        <div class="main-content">
          <!-- 视频播放器 -->
          <div class="player-section">
            <div class="video-container">
              <!-- 模拟视频播放器 -->
              <div class="video-player">
                <div class="player-placeholder">
                  <el-icon class="play-icon"><VideoPlay /></el-icon>
                  <p class="lesson-title">{{ currentLesson?.title || '暂无课时' }}</p>
                  <p class="lesson-desc">{{ currentLesson?.description || '请选择课时开始学习' }}</p>
                </div>
              </div>

              <!-- 播放控制栏 -->
              <div class="player-controls">
                <div class="control-info">
                  <span class="current-lesson">当前播放：{{ currentLesson?.title || '-' }}</span>
                </div>
                <div class="control-actions">
                  <el-button
                    :disabled="!currentLesson || currentLessonIndex === 0"
                    @click="handleLessonChange(currentLessonIndex - 1)"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                    上一课时
                  </el-button>
                  <el-button
                    :disabled="!currentLesson || currentLessonIndex >= allLessons.length - 1"
                    @click="handleLessonChange(currentLessonIndex + 1)"
                  >
                    下一课时
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                  <el-button
                    type="success"
                    :disabled="!currentLesson"
                    @click="handleMarkComplete"
                  >
                    <el-icon><Select /></el-icon>
                    标记完成
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 课程简介 -->
            <el-card class="course-info-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <h3>课程简介</h3>
                  <el-button type="primary" size="small" @click="handleBackToDetail">
                    查看课程详情
                  </el-button>
                </div>
              </template>
              <div class="course-description">
                {{ course.description }}
              </div>
              <div class="course-meta">
                <el-tag>讲师：{{ course.teacher?.name }}</el-tag>
                <el-tag type="success">{{ course.category }}</el-tag>
                <el-tag type="warning">{{ course.level }}</el-tag>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 右侧课时目录 -->
        <div class="side-content">
          <el-card class="chapter-list-card" shadow="never">
            <template #header>
              <div class="card-header">
                <h3>课程目录</h3>
                <span class="lesson-count">共 {{ allLessons.length }} 课时</span>
              </div>
            </template>

            <div class="chapter-list">
              <div
                v-for="(chapter, chapterIndex) in course.chapters"
                :key="chapterIndex"
                class="chapter-item"
              >
                <div class="chapter-header">
                  <span class="chapter-name">第{{ chapterIndex + 1 }}章 {{ chapter.name }}</span>
                  <span class="chapter-count">{{ chapter.lessons?.length || 0 }} 课时</span>
                </div>
                <div class="lesson-list">
                  <div
                    v-for="(lesson, lessonIndex) in chapter.lessons"
                    :key="lesson.id"
                    class="lesson-item"
                    :class="{ active: currentLesson?.id === lesson.id }"
                    @click="handleLessonChange(allLessons.findIndex((l: any) => l.id === lesson.id))"
                  >
                    <el-icon class="lesson-icon"><VideoPlay /></el-icon>
                    <span class="lesson-name">{{ lessonIndex + 1 }}. {{ lesson.title }}</span>
                    <el-icon v-if="currentLesson?.id === lesson.id" class="playing-icon">
                      <Loading />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.course-learn {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: $spacing-large 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: $spacing-large;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// 主内容区
.main-content {
  .player-section {
    margin-bottom: $spacing-large;
  }
}

// 视频容器
.video-container {
  background: #000;
  border-radius: $border-radius-base;
  overflow: hidden;
  margin-bottom: $spacing-large;
}

.video-player {
  aspect-ratio: 16 / 9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-placeholder {
  text-align: center;
  color: #fff;

  .play-icon {
    font-size: 64px;
    margin-bottom: $spacing-large;
    opacity: 0.8;
  }

  .lesson-title {
    font-size: $font-size-large;
    margin-bottom: $spacing-small;
  }

  .lesson-desc {
    font-size: $font-size-small;
    opacity: 0.7;
  }
}

// 播放控制栏
.player-controls {
  background: #1a1a1a;
  padding: $spacing-base $spacing-large;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .control-info {
    .current-lesson {
      color: #fff;
      font-size: $font-size-small;
    }
  }

  .control-actions {
    display: flex;
    gap: $spacing-small;
  }
}

// 课程信息卡片
.course-info-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: $font-size-large;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
    }

    // 确保按钮文字始终清晰可见
    :deep(.el-button) {
      color: #fff !important;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .course-description {
    font-size: $font-size-base;
    color: $text-color-secondary;
    line-height: 1.6;
    margin-bottom: $spacing-base;
  }

  .course-meta {
    display: flex;
    gap: $spacing-small;
    flex-wrap: wrap;
  }
}

// 侧边栏
.side-content {
  @media (max-width: 1024px) {
    order: -1;
  }
}

.chapter-list-card {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: $font-size-large;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
    }

    .lesson-count {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

// 章节列表
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.chapter-item {
  .chapter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-small;
    background: $background-color-base;
    border-radius: $border-radius-small;
    margin-bottom: $spacing-small;

    .chapter-name {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-color-primary;
    }

    .chapter-count {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .lesson-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  padding: $spacing-small $spacing-base;
  border-radius: $border-radius-small;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $background-color-base;
  }

  &.active {
    background: #ecf5ff;
    color: #409eff;

    .lesson-icon {
      color: #409eff;
    }
  }

  .lesson-icon {
    font-size: 14px;
    color: $text-color-placeholder;
    flex-shrink: 0;
  }

  .lesson-name {
    flex: 1;
    font-size: $font-size-small;
    color: $text-color-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playing-icon {
    font-size: 14px;
    color: #409eff;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
