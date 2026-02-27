<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { getUserOrders } from '@/utils/order-storage';
import { getUserLearningRecords } from '@/utils/learning-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const activeTab = ref<'learning' | 'completed'>('learning');

// 课程列表（包含学习记录）
interface CourseWithProgress {
  orderId: string;
  courseId: string;
  courseName: string;
  courseCover: string;
  price: number;
  progress: number;
  lastWatchTime: string;
  totalWatchDuration: number;
  completedLessons: number;
  totalLessons: number;
}

const coursesWithProgress = ref<CourseWithProgress[]>([]);

// 计算显示的课程
const displayedCourses = computed(() => {
  if (activeTab.value === 'learning') {
    return coursesWithProgress.value.filter((c) => c.progress < 100);
  } else {
    return coursesWithProgress.value.filter((c) => c.progress >= 100);
  }
});

// 统计数据
const stats = computed(() => {
  const learning = coursesWithProgress.value.filter((c) => c.progress < 100).length;
  const completed = coursesWithProgress.value.filter((c) => c.progress >= 100).length;
  return { learning, completed };
});

// 加载我的课程数据
async function loadMyCourses() {
  if (!authStore.userInfo) return;

  loading.value = true;
  try {
    // 获取用户订单（已购买的课程）
    const orders = getUserOrders(authStore.userInfo.userId);
    const paidOrders = orders.filter((o) => o.status === 'paid');

    // 获取学习记录
    const learningRecords = getUserLearningRecords(authStore.userInfo.userId);

    // 合并数据
    coursesWithProgress.value = paidOrders.map((order) => {
      const record = learningRecords.find((r) => r.courseId === order.courseId);

      return {
        orderId: order.orderId,
        courseId: order.courseId,
        courseName: order.courseName,
        courseCover: order.courseCover,
        price: order.price,
        progress: record?.progress || 0,
        lastWatchTime: record?.lastWatchTime || '-',
        totalWatchDuration: record?.totalWatchDuration || 0,
        completedLessons: record?.completedLessons?.length || 0,
        totalLessons: 0, // TODO: 从课程数据获取总课时数
      };
    });

    console.log('加载我的课程:', coursesWithProgress.value.length);
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程失败');
  } finally {
    loading.value = false;
  }
}

// 继续学习
function handleContinueLearning(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
}

// 重新学习
function handleRelearn(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
}

// 查看课程详情
function handleViewDetail(courseId: string) {
  router.push(`/portal/course/${courseId}`);
}

// 切换 tab
function handleTabChange(tab: 'learning' | 'completed') {
  activeTab.value = tab;
}

onMounted(() => {
  loadMyCourses();
});
</script>

<template>
  <div class="my-courses">
    <div class="page-header">
      <h2>我的课程</h2>
      <p>查看您购买的课程和学习进度</p>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs-wrapper">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'learning' }"
        @click="handleTabChange('learning')"
      >
        <span>学习中</span>
        <span class="badge">{{ stats.learning }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'completed' }"
        @click="handleTabChange('completed')"
      >
        <span>已完成</span>
        <span class="badge">{{ stats.completed }}</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 课程列表 -->
    <div v-else-if="displayedCourses.length > 0" class="courses-list">
      <div v-for="course in displayedCourses" :key="course.orderId" class="course-card">
        <!-- 课程封面 -->
        <div class="course-cover" @click="handleViewDetail(course.courseId)">
          <el-image :src="course.courseCover" fit="cover" />
          <div class="play-overlay">
            <el-icon class="play-icon"><VideoPlay /></el-icon>
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-title" @click="handleViewDetail(course.courseId)">
            {{ course.courseName }}
          </h3>

          <!-- 学习进度 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">学习进度</span>
              <span class="progress-percent">{{ course.progress }}%</span>
            </div>
            <el-progress :percentage="course.progress" :show-text="false" />
            <div class="progress-info">
              <span class="last-watch">最后学习：{{ course.lastWatchTime }}</span>
              <span class="watch-duration"
                >已学习 {{ Math.floor(course.totalWatchDuration / 60) }} 分钟</span
              >
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <el-button
              type="primary"
              :icon="VideoPlay"
              @click="handleContinueLearning(course.courseId)"
            >
              {{ activeTab === 'learning' ? '继续学习' : '重新学习' }}
            </el-button>
            <el-button @click="handleViewDetail(course.courseId)">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty :description="activeTab === 'learning' ? '暂无学习中的课程' : '暂无已完成的课程'">
        <el-button type="primary" @click="router.push('/portal/courses')">
          去选课
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-courses {
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

  .tabs-wrapper {
    display: flex;
    gap: $spacing-base;
    margin-bottom: $spacing-extra-large;
    border-bottom: 1px solid $border-color-lighter;

    .tab-btn {
      padding: $spacing-base $spacing-large;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: $font-size-medium;
      color: $text-color-secondary;
      transition: $transition-base;
      display: flex;
      align-items: center;
      gap: $spacing-small;

      &:hover {
        color: $--el-color-primary;
      }

      &.active {
        color: $--el-color-primary;
        border-bottom-color: $--el-color-primary;
        font-weight: 600;
      }

      .badge {
        background: $--el-color-primary;
        color: #fff;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: $font-size-extra-small;
      }
    }
  }

  .loading-container {
    padding: $spacing-extra-large 0;
  }

  .courses-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: $spacing-large;
  }

  .course-card {
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    overflow: hidden;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
      transform: translateY(-2px);
    }
  }

  .course-cover {
    position: relative;
    width: 100%;
    height: 200px;
    cursor: pointer;
    overflow: hidden;

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
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: $transition-base;

      .play-icon {
        font-size: 48px;
        color: #fff;
      }
    }

    &:hover .play-overlay {
      opacity: 1;
    }
  }

  .course-info {
    padding: $spacing-large;
  }

  .course-title {
    font-size: $font-size-large;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-base;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      color: $--el-color-primary;
    }
  }

  .progress-section {
    margin-bottom: $spacing-large;

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
      display: flex;
      justify-content: space-between;
      margin-top: $spacing-small;

      .last-watch,
      .watch-duration {
        font-size: $font-size-extra-small;
        color: $text-color-placeholder;
      }
    }
  }

  .course-actions {
    display: flex;
    gap: $spacing-base;
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
