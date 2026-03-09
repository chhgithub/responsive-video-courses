<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { VideoPlay } from '@element-plus/icons-vue';
import { getUserOrders } from '@/utils/order-storage';
import { getUserLearningRecords } from '@/utils/learning-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import { getUserRedeemedCourses } from '@/utils/general-education-storage';
import {
  getPackageLearningRecordsByUser,
  getPackageById,
  calculatePackageProgress,
  type PackageLearningRecord,
  type CoursePackage,
} from '@/utils/course-package-storage';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const activeTab = ref<'learning' | 'completed'>('learning');

// 统一的学习项目类型
type ItemType = 'course' | 'package';

// 课程/套餐列表（包含学习记录）
interface LearningItem {
  itemId: string;
  itemType: ItemType; // 课程或套餐
  orderId?: string; // 订单ID（如果有）
  source: 'purchase' | 'redeem'; // 来源：购买/兑换

  // 课程字段
  courseId?: string;
  courseName?: string;
  courseCover?: string;
  totalLessons?: number;
  completedLessons?: number;

  // 套餐字段
  packageId?: number;
  packageName?: string;
  packageCover?: string;
  packageDesc?: string;
  totalCourses?: number;
  completedCourses?: number;
  courses?: Array<{
    courseId: number;
    courseName: string;
    courseCover: string;
  }>;

  // 通用字段
  price: number;
  progress: number;
  lastWatchTime: string;
  totalWatchDuration: number;
}

const learningItems = ref<LearningItem[]>([]);

// 计算显示的项目
const displayedItems = computed(() => {
  if (activeTab.value === 'learning') {
    return learningItems.value.filter((item) => item.progress < 100);
  } else {
    return learningItems.value.filter((item) => item.progress >= 100);
  }
});

// 统计数据
const stats = computed(() => {
  const learning = learningItems.value.filter((item) => item.progress < 100).length;
  const completed = learningItems.value.filter((item) => item.progress >= 100).length;
  return { learning, completed };
});

// 加载我的课程数据
async function loadMyCourses() {
  if (!authStore.userInfo) return;

  loading.value = true;
  try {
    const allItems: LearningItem[] = [];

    // 1. 获取用户订单（已购买的课程和套餐）
    const orders = getUserOrders(authStore.userInfo.userId);
    const paidOrders = orders.filter((o) => o.status === 'paid');

    // 2. 获取用户兑换的课程
    const redeemedCourses = getUserRedeemedCourses(authStore.userInfo.userId);

    // 3. 获取课程学习记录
    const courseLearningRecords = getUserLearningRecords(authStore.userInfo.userId);

    // 4. 获取套餐学习记录
    const packageLearningRecords = getPackageLearningRecordsByUser(authStore.userInfo.userId);

    // 5. 处理购买的课程
    for (const order of paidOrders) {
      if (order.type === 'course') {
        const record = courseLearningRecords.find((r) => r.courseId === order.courseId);
        const course = getPortalCourseById(order.courseId);

        allItems.push({
          itemId: order.courseId,
          itemType: 'course',
          orderId: order.orderId,
          source: 'purchase',
          courseId: order.courseId,
          courseName: order.courseName,
          courseCover: order.courseCover,
          price: order.price,
          progress: record?.progress || 0,
          lastWatchTime: record?.lastWatchTime || '-',
          totalWatchDuration: record?.totalWatchDuration || 0,
          completedLessons: record?.completedLessons?.length || 0,
          totalLessons: course?.lessons?.length || 0,
        });
      }
    }

    // 6. 处理购买的套餐
    for (const order of paidOrders) {
      if (order.type === 'package') {
        const pkg = getPackageById(parseInt(order.packageId || '0'));
        if (!pkg) continue;

        const record = packageLearningRecords.find((r) => r.packageId === pkg.packageId);

        allItems.push({
          itemId: `package_${pkg.packageId}`,
          itemType: 'package',
          orderId: order.orderId,
          source: 'purchase',
          packageId: pkg.packageId,
          packageName: order.packageName || pkg.packageName,
          packageCover: order.packageCover || pkg.packageCover,
          packageDesc: pkg.packageDesc,
          price: order.price,
          progress: record?.progress || 0,
          lastWatchTime: record?.lastWatchTime || '-',
          totalWatchDuration: record?.totalWatchDuration || 0,
          totalCourses: pkg.courses.length,
          completedCourses: record?.completedCourses?.length || 0,
          courses: pkg.courses.map(c => ({
            courseId: c.courseId,
            courseName: c.courseName,
            courseCover: c.courseCover,
          })),
        });
      }
    }

    // 7. 处理兑换的课程
    for (const access of redeemedCourses) {
      // 检查是否已经在购买的课程中（去重）
      if (allItems.some((item) => item.itemType === 'course' && item.courseId === access.courseId)) {
        continue;
      }

      const record = courseLearningRecords.find((r) => r.courseId === access.courseId);
      const course = getPortalCourseById(access.courseId);

      allItems.push({
        itemId: access.courseId,
        itemType: 'course',
        orderId: access.id,
        source: 'redeem',
        courseId: access.courseId,
        courseName: access.packageName || course?.title || '未知课程',
        courseCover: course?.cover || 'https://picsum.photos/seed/default/300/200',
        price: 0,
        packageName: access.packageName,
        progress: record?.progress || 0,
        lastWatchTime: record?.lastWatchTime || '-',
        totalWatchDuration: record?.totalWatchDuration || 0,
        completedLessons: record?.completedLessons?.length || 0,
        totalLessons: course?.lessons?.length || 0,
      });
    }

    learningItems.value = allItems;

    console.log('加载我的课程:', learningItems.value.length);
    console.log('购买课程:', paidOrders.filter(o => o.type === 'course').length,
                '购买套餐:', paidOrders.filter(o => o.type === 'package').length,
                '兑换课程:', redeemedCourses.length);
  } catch (error: any) {
    ElMessage.error(error.message || '加载课程失败');
  } finally {
    loading.value = false;
  }
}

// 继续学习（课程）
function handleContinueCourse(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
}

// 继续学习（套餐）
function handleContinuePackage(packageId: number, courses: any[]) {
  if (courses && courses.length > 0) {
    // 找到第一个未完成的课程
    const firstCourse = courses[0];
    router.push(`/portal/course-learn/${firstCourse.courseId}`);
  }
}

// 查看课程详情
function handleViewCourseDetail(courseId: string) {
  router.push(`/portal/course/${courseId}`);
}

// 查看套餐详情
function handleViewPackageDetail(packageId: number) {
  router.push(`/portal/package/${packageId}`);
}

// 点击学习项目（课程或套餐）
function handleItemClick(item: LearningItem) {
  if (item.itemType === 'course') {
    handleContinueLearning(item.courseId!);
  } else {
    handleContinuePackage(item.packageId!, item.courses || []);
  }
}

// 继续学习（根据类型调用）
function handleContinueLearning(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
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
      <p>查看您购买的课程、套餐和学习进度</p>
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

    <!-- 课程/套餐列表 -->
    <div v-else-if="displayedItems.length > 0" class="courses-list">
      <!-- 套餐卡片 -->
      <div
        v-for="item in displayedItems.filter(i => i.itemType === 'package')"
        :key="item.itemId"
        class="course-card package-card"
      >
        <!-- 套餐封面 -->
        <div class="course-cover" @click="handleViewPackageDetail(item.packageId!)">
          <el-image :src="item.packageCover" fit="cover" />
          <div class="play-overlay">
            <el-icon class="play-icon"><VideoPlay /></el-icon>
          </div>
          <div class="package-badge">套餐</div>
        </div>

        <!-- 套餐信息 -->
        <div class="course-info">
          <h3 class="course-title" @click="handleViewPackageDetail(item.packageId!)">
            {{ item.packageName }}
          </h3>
          <!-- 来源标签 -->
          <div class="course-tags">
            <el-tag :type="item.source === 'purchase' ? 'success' : 'warning'" size="small">
              {{ item.source === 'purchase' ? '购买' : '兑换' }}
            </el-tag>
            <el-tag type="primary" size="small">{{ item.totalCourses }} 门课程</el-tag>
          </div>

          <!-- 套餐描述 -->
          <p v-if="item.packageDesc" class="package-desc">{{ item.packageDesc }}</p>

          <!-- 学习进度 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">学习进度</span>
              <span class="progress-percent">{{ item.progress }}%</span>
            </div>
            <el-progress :percentage="item.progress" :show-text="false" />
            <div class="progress-info">
              <span class="last-watch">最后学习：{{ item.lastWatchTime }}</span>
              <span class="watch-duration">
                已学习 {{ Math.floor(item.totalWatchDuration / 60) }} 分钟
              </span>
            </div>
          </div>

          <!-- 套餐包含的课程 -->
          <div v-if="item.courses && item.courses.length > 0" class="package-courses">
            <div class="courses-title">包含课程</div>
            <div class="mini-courses-list">
              <div
                v-for="course in item.courses.slice(0, 3)"
                :key="course.courseId"
                class="mini-course-item"
                @click="handleContinueLearning(course.courseId.toString())"
              >
                <el-image :src="course.courseCover" fit="cover" />
                <span>{{ course.courseName }}</span>
              </div>
              <div v-if="item.courses.length > 3" class="more-courses">
                +{{ item.courses.length - 3 }} 门
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <el-button
              type="primary"
              :icon="VideoPlay"
              @click="handleContinuePackage(item.packageId!, item.courses || [])"
            >
              {{ activeTab === 'learning' ? '继续学习' : '重新学习' }}
            </el-button>
            <el-button @click="handleViewPackageDetail(item.packageId!)">查看详情</el-button>
          </div>
        </div>
      </div>

      <!-- 课程卡片 -->
      <div
        v-for="item in displayedItems.filter(i => i.itemType === 'course')"
        :key="item.itemId"
        class="course-card"
      >
        <!-- 课程封面 -->
        <div class="course-cover" @click="handleViewCourseDetail(item.courseId!)">
          <el-image :src="item.courseCover" fit="cover" />
          <div class="play-overlay">
            <el-icon class="play-icon"><VideoPlay /></el-icon>
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-title" @click="handleViewCourseDetail(item.courseId!)">
            {{ item.courseName }}
          </h3>
          <!-- 课程来源标签 -->
          <div class="course-tags">
            <el-tag :type="item.source === 'purchase' ? 'success' : 'warning'" size="small">
              {{ item.source === 'purchase' ? '购买' : '兑换' }}
            </el-tag>
            <el-tag v-if="item.packageName" size="small" type="info">
              {{ item.packageName }}
            </el-tag>
          </div>

          <!-- 学习进度 -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">学习进度</span>
              <span class="progress-percent">{{ item.progress }}%</span>
            </div>
            <el-progress :percentage="item.progress" :show-text="false" />
            <div class="progress-info">
              <span class="last-watch">最后学习：{{ item.lastWatchTime }}</span>
              <span class="watch-duration"
                >已学习 {{ Math.floor(item.totalWatchDuration / 60) }} 分钟</span
              >
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <el-button
              type="primary"
              :icon="VideoPlay"
              @click="handleContinueLearning(item.courseId!)"
            >
              {{ activeTab === 'learning' ? '继续学习' : '重新学习' }}
            </el-button>
            <el-button @click="handleViewCourseDetail(item.courseId!)">查看详情</el-button>
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

    // 套餐卡片特殊样式
    &.package-card {
      border: 2px solid #e6a23c;

      .course-title {
        color: #e6a23c;
      }
    }
  }

  .course-cover {
    position: relative;
    width: 100%;
    height: 200px;
    cursor: pointer;
    overflow: hidden;

    .package-badge {
      position: absolute;
      top: $spacing-small;
      right: $spacing-small;
      background: linear-gradient(135deg, #e6a23c 0%, #f09a5f 100%);
      color: #fff;
      padding: 4px 12px;
      border-radius: $border-radius-small;
      font-size: $font-size-small;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(230, 162, 60, 0.4);
      z-index: 1;
    }

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

  // 套餐卡片特殊处理
  .package-card .course-info {
    padding: $spacing-large;
  }

  .course-title {
    font-size: $font-size-large;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      color: $--el-color-primary;
    }
  }

  .course-tags {
    display: flex;
    gap: $spacing-small;
    margin-bottom: $spacing-base;
  }

  .package-desc {
    color: $text-color-secondary;
    font-size: $font-size-small;
    margin-bottom: $spacing-base;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .package-courses {
    margin-bottom: $spacing-base;

    .courses-title {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-small;
      font-weight: 500;
    }

    .mini-courses-list {
      display: flex;
      gap: $spacing-small;
      align-items: center;

      .mini-course-item {
        display: flex;
        align-items: center;
        gap: $spacing-small;
        background: $background-color-base;
        padding: $spacing-small;
        border-radius: $border-radius-small;
        cursor: pointer;
        transition: $transition-base;

        &:hover {
          background: #ecf5ff;
        }

        :deep(.el-image) {
          width: 40px;
          height: 40px;
          border-radius: $border-radius-small;
          flex-shrink: 0;
        }

        span {
          font-size: $font-size-extra-small;
          color: $text-color-primary;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .more-courses {
        font-size: $font-size-extra-small;
        color: $text-color-secondary;
        padding: $spacing-small;
      }
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
