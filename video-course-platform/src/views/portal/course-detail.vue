<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EditPen } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores';
import { getPortalCourseById, type PortalCourse } from '@/utils/portal-course-adapter';
import { hasUserPurchasedCourse } from '@/utils/order-storage';
import { isCourseFavorited, toggleFavorite } from '@/utils/favorite-storage';
import { getCourseLearningRecord } from '@/utils/learning-storage';
import { getReviewsByCourseId, type CourseReview, addReview, updateReview } from '@/utils/course-storage';
import { getPackagesByCourse, type CoursePackage, calculatePackageSavings, formatPackagePrice } from '@/utils/course-package-storage';

// 类型定义
interface Chapter {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'document' | 'exam';
  videoDuration?: number;
  isTrial?: boolean;
  isFree?: boolean;
}

interface Course {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  teacher: { name: string; avatar?: string };
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  studentCount: number;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  trialLessonId?: string;
  validType: 'permanent' | 'days';
  validDays?: number;
  chapters: Chapter[];
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 课程ID
const courseId = route.params.id as string;

// 课程数据
const course = ref<Course | null>(null);
const loading = ref(true);

// 交互状态
const isPurchased = ref(false);
const isFavorite = ref(false);
const learningProgress = ref(0);

// Tab
const activeTab = ref('intro');

// 评价数据
const reviews = ref<CourseReview[]>([]);
const reviewsLoading = ref(false);

// 评价对话框
const reviewDialogVisible = ref(false);
const reviewForm = ref({
  rating: 0,
  content: '',
});

// 相关套餐
const relatedPackages = ref<CoursePackage[]>([]);

// 获取当前登录用户
function getCurrentUser() {
  if (!authStore.isLoggedIn) return null;
  return authStore.userInfo;
}

// 检查购买状态
function checkPurchaseStatus(id: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return hasUserPurchasedCourse(user.userId, id);
}

// 检查收藏状态
function checkFavoriteStatus(id: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return isCourseFavorited(user.userId, id);
}

// 获取学习进度
function getProgressInfo(id: string): { progress: number; lastStudyAt: string } {
  const user = getCurrentUser();
  if (!user) return { progress: 0, lastStudyAt: '-' };

  const recordsData = localStorage.getItem('learning_records');
  if (!recordsData) return { progress: 0, lastStudyAt: '-' };

  const records = JSON.parse(recordsData);
  const courseRecords = records.filter(
    (r: any) => r.userId === user.userId && r.courseId === id
  );

  if (courseRecords.length === 0) return { progress: 0, lastStudyAt: '-' };

  const totalProgress = courseRecords.reduce((sum: number, r: any) => sum + r.progress, 0);
  const progress = Math.round(totalProgress / courseRecords.length);
  const lastStudyAt = courseRecords.sort((a: any, b: any) => b.lastStudyAt.localeCompare(a.lastStudyAt))[0]?.lastStudyAt || '-';

  return { progress, lastStudyAt };
}

// 加载评价数据（只显示已通过审核的评价）
async function loadReviews() {
  if (!course.value) return;

  reviewsLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const allReviews = getReviewsByCourseId(parseInt(course.value.id));
    // 只显示已通过审核的评价
    reviews.value = allReviews.filter((r) => r.status === 'approved');
  } catch (error) {
    console.error('加载评价失败:', error);
  } finally {
    reviewsLoading.value = false;
  }
}

// 加载相关套餐
function loadRelatedPackages() {
  if (!course.value) return;

  try {
    const packages = getPackagesByCourse(parseInt(course.value.id));
    // 只显示前3个相关套餐
    relatedPackages.value = packages.slice(0, 3);
  } catch (error) {
    console.error('加载相关套餐失败:', error);
  }
}

// 生成Mock课程数据
function generateMockCourse(): Course {
  return {
    id: courseId,
    title: 'Vue3 从入门到精通 - 完整实战课程',
    coverImage: `https://picsum.photos/seed/${courseId}/800/450`,
    description: `本课程将带你从零开始学习 Vue3，逐步掌握 Vue3 的核心概念和实战技巧。

课程内容包括：
- Vue3 Composition API 详解
- 响应式原理深度剖析
- Vue Router 4 路由管理
- Pinia 状态管理
- Element Plus 组件库实战
- 项目实战：在线教育平台

适合人群：
- 有 JavaScript 基础的前端开发者
- 想要学习 Vue3 的新手
- 希望提升实战能力的开发者

学习收获：
- 掌握 Vue3 的核心概念和最佳实践
- 能够独立开发 Vue3 项目
- 理解前端工程化思想`,
    teacher: { name: '张老师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1' },
    category: '编程',
    tags: ['Vue3', '前端', '实战', '热门'],
    rating: 4.8,
    reviewCount: 328,
    studentCount: 5420,
    price: 19900,
    originalPrice: 29900,
    isFree: false,
    trialLessonId: 'lesson-1-1',
    validType: 'permanent',
    chapters: [
      {
        id: 'chapter-1',
        title: '第1章 Vue3 基础入门',
        description: '介绍 Vue3 的发展历程和核心特性',
        lessons: [
          { id: 'lesson-1-1', title: 'Vue3 简介与环境搭建', type: 'video', videoDuration: 1800, isTrial: true },
          { id: 'lesson-1-2', title: 'Composition API 基础', type: 'video', videoDuration: 2400 },
          { id: 'lesson-1-3', title: '响应式原理详解', type: 'video', videoDuration: 2100 },
        ],
      },
      {
        id: 'chapter-2',
        title: '第2章 组件化开发',
        description: '深入学习 Vue3 组件开发',
        lessons: [
          { id: 'lesson-2-1', title: '组件基础', type: 'video', videoDuration: 1900 },
          { id: 'lesson-2-2', title: '组件通信', type: 'video', videoDuration: 2300 },
          { id: 'lesson-2-3', title: '插槽与生命周期', type: 'video', videoDuration: 2000 },
        ],
      },
      {
        id: 'chapter-3',
        title: '第3章 Vue Router 4',
        description: '路由管理详解',
        lessons: [
          { id: 'lesson-3-1', title: '路由基础配置', type: 'video', videoDuration: 1600 },
          { id: 'lesson-3-2', title: '动态路由与嵌套路由', type: 'video', videoDuration: 2200 },
          { id: 'lesson-3-3', title: '路由守卫与导航', type: 'video', videoDuration: 1800 },
        ],
      },
      {
        id: 'chapter-4',
        title: '第4章 Pinia 状态管理',
        description: 'Pinia 状态管理实战',
        lessons: [
          { id: 'lesson-4-1', title: 'Pinia 基础', type: 'video', videoDuration: 2000 },
          { id: 'lesson-4-2', title: 'Store 模块化', type: 'video', videoDuration: 1900 },
        ],
      },
    ],
  };
}

// 获取课程详情
async function loadCourseDetail() {
  loading.value = true;

  try {
    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 从后台获取课程数据
    const portalCourse = getPortalCourseById(courseId);

    if (!portalCourse) {
      ElMessage.error('课程不存在或已下架');
      course.value = null;
      return;
    }

    // 映射到页面需要的格式
    course.value = {
      id: portalCourse.id,
      title: portalCourse.title,
      coverImage: portalCourse.coverImage,
      description: portalCourse.courseIntro,
      teacher: { name: portalCourse.teacher.name },
      category: portalCourse.category,
      tags: portalCourse.tags,
      rating: portalCourse.rating,
      reviewCount: portalCourse.reviewCount,
      studentCount: portalCourse.studentCount,
      price: portalCourse.price,
      originalPrice: portalCourse.originalPrice,
      isFree: portalCourse.isFree,
      trialLessonId: portalCourse.trialLessonId,
      validType: portalCourse.validDays === 0 ? 'permanent' : 'days',
      validDays: portalCourse.validDays,
      chapters: portalCourse.chapters.map(chapter => ({
        id: chapter.chapterId,
        title: chapter.chapterName,
        description: undefined,
        lessons: chapter.lessons.map(lesson => ({
          id: lesson.lessonId,
          title: lesson.lessonName,
          type: lesson.contentType as any,
          videoDuration: lesson.duration,
          isTrial: lesson.isTrial,
          isFree: lesson.isFree,
        })),
      })),
    };

    console.log('加载课程详情成功:', course.value?.title);

    // 检查交互状态
    checkStatus();

    // 加载评价数据
    loadReviews();

    // 加载相关套餐
    loadRelatedPackages();
  } catch (error) {
    console.error('加载课程详情失败:', error);
    ElMessage.error('加载课程详情失败');
    course.value = null;
  } finally {
    loading.value = false;
  }
}

// 检查课程状态
function checkStatus() {
  if (!course.value) return;

  // 检查购买状态
  const actualPurchased = checkPurchaseStatus(courseId);
  // 原型模拟：
  // Vue3 从入门到精通 (id=1) 设置为已购买
  // React 实战开发 (id=2) 强制设置为未购买
  isPurchased.value = courseId === '1' || (courseId !== '2' && actualPurchased);

  console.log('课程状态 - courseId:', courseId, '实际购买:', actualPurchased, '最终状态:', isPurchased.value);

  // 检查收藏状态
  isFavorite.value = checkFavoriteStatus(courseId);

  // 获取学习进度
  if (isPurchased.value) {
    const progressInfo = getProgressInfo(courseId);
    learningProgress.value = progressInfo.progress;
  }
}

// 计算总课时数
const totalLessons = computed(() => {
  if (!course.value) return 0;
  return course.value.chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.length,
    0
  );
});

// 计算总时长
const totalDuration = computed(() => {
  if (!course.value) return 0;
  return course.value.chapters.reduce((sum, chapter) => {
    return (
      sum +
      chapter.lessons.reduce(
        (lessonSum, lesson) => lessonSum + (lesson.videoDuration || 0),
        0
      )
    );
  }, 0);
});

// 格式化时长
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

// 免费试听
function onTrialClick(lesson?: Lesson) {
  if (!lesson) {
    // 如果传入的课时为空，从课程中查找第一个试听课
    if (!course.value || !course.value.chapters.length) {
      ElMessage.warning('暂无试听内容');
      return;
    }

    for (const chapter of course.value.chapters) {
      const trialLesson = chapter.lessons.find(l => l.isTrial || l.isFree);
      if (trialLesson) {
        lesson = trialLesson;
        break;
      }
    }

    if (!lesson) {
      ElMessage.warning('暂无试听内容');
      return;
    }
  }

  router.push(`/portal/course-learn/${courseId}?lessonId=${lesson.id}`);
}

// 购买课程
function onPurchaseClick() {
  const user = getCurrentUser();

  if (!user) {
    ElMessage.warning('请先登录');
    router.push(`/login?redirect=/portal/course/${courseId}`);
    return;
  }

  if (!course.value) return;

  // 跳转到支付页面
  router.push(`/portal/checkout/${course.value.id}`);
}

// 开始学习
function onLearnClick() {
  router.push(`/portal/course-learn/${courseId}`);
}

// 切换收藏
async function onFavoriteClick() {
  const user = getCurrentUser();
  if (!user) {
    ElMessage.warning('请先登录');
    return;
  }

  if (!course.value) return;

  try {
    const added = toggleFavorite(user.userId, {
      courseId: course.value.id,
      courseName: course.value.title,
      courseCover: course.value.coverImage,
      teacherName: course.value.teacher.name,
      price: course.value.price,
      isFree: course.value.isFree,
    });

    isFavorite.value = added;
    ElMessage.success(added ? '收藏成功' : '已取消收藏');
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

// 购买课程
function handlePurchase() {
  const user = getCurrentUser();
  if (!user) {
    ElMessage.warning('请先登录');
    router.push(`/login?redirect=/portal/course/${courseId}`);
    return;
  }

  if (!course.value) return;

  // 跳转到支付页面
  router.push(`/portal/checkout/${course.value.id}`);
}

// 用户权限
const userPermission = computed(() => {
  if (!course.value) return 'unknown';
  if (course.value.isFree) return 'free';
  if (isPurchased.value) return 'owned';
  return 'locked';
});

// 返回课程列表
function handleBack() {
  router.push('/portal/courses');
}

// 打开评价对话框
function handleWriteReview() {
  const user = getCurrentUser();
  if (!user) {
    ElMessage.warning('请先登录');
    router.push(`/portal/login?redirect=/portal/course/${courseId}`);
    return;
  }

  if (!isPurchased.value) {
    ElMessage.warning('请先购买课程');
    return;
  }

  reviewDialogVisible.value = true;
}

// 提交评价
function handleSubmitReview() {
  if (reviewForm.value.rating === 0) {
    ElMessage.warning('请选择评分');
    return;
  }
  if (!reviewForm.value.content.trim()) {
    ElMessage.warning('请输入评价内容');
    return;
  }

  const user = getCurrentUser();
  if (!user || !course.value) return;

  // 调用添加评价 API
  const newReview: CourseReview = {
    reviewId: `review_${Date.now()}`,
    courseId: parseInt(course.value.id),
    userId: user.userId,
    userName: user.nickname || user.username,
    userAvatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    rating: reviewForm.value.rating,
    content: reviewForm.value.content.trim(),
    reviewTime: new Date().toISOString(),
    likes: 0,
    status: 'pending',
  };

  addReview(newReview);
  reviewDialogVisible.value = false;
  reviewForm.value = { rating: 0, content: '' };

  ElMessage.success('评价提交成功，等待审核');
  loadReviews();
}

// 重置评价表单
function handleResetReview() {
  reviewForm.value = { rating: 0, content: '' };
}

// 回复讲师
function handleReplyToTeacher(review: CourseReview) {
  const user = getCurrentUser();
  if (!user) {
    ElMessage.warning('请先登录');
    return;
  }

  // 只能回复自己的评价
  if (review.userId !== user.userId) {
    ElMessage.warning('只能回复自己的评价');
    return;
  }

  ElMessageBox.prompt('请输入您的回复', '回复讲师', {
    inputPattern: /\S+/,
    inputErrorMessage: '回复内容不能为空',
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputType: 'textarea',
  }).then(({ value }) => {
    if (value && value.trim()) {
      // 更新评价，添加用户回复
      const updatedReview: CourseReview = {
        ...review,
        userReplyContent: value.trim(),
        userReplyTime: new Date().toISOString(),
      };

      updateReview(updatedReview);
      ElMessage.success('回复成功');
      loadReviews();
    }
  }).catch(() => {
    // 用户取消
  });
}

// 播放课时
function playLesson(lesson: Lesson) {
  if (lesson.isTrial || lesson.isFree || userPermission.value === 'owned') {
    router.push(`/portal/course-learn/${courseId}?lessonId=${lesson.id}`);
  } else {
    onPurchaseClick();
  }
}

onMounted(() => {
  loadCourseDetail();
});
</script>

<template>
  <div v-loading="loading" class="course-detail">
    <div v-if="!course && !loading" class="error-container">
      <el-result icon="warning" title="课程不存在" sub-title="课程不存在或已下架">
        <template #extra>
          <el-button type="primary" @click="handleBack">返回课程列表</el-button>
        </template>
      </el-result>
    </div>

    <div v-else-if="course" class="container">
      <!-- 面包屑 -->
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item>
          <router-link to="/portal/courses">课程中心</router-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ course.title }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 课程基本信息 -->
      <el-card class="course-info-card" shadow="never">
        <div class="course-info">
          <!-- 封面 -->
          <div class="course-cover">
            <el-image
              :src="course.coverImage"
              :alt="course.title"
              fit="cover"
              class="cover-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <!-- 课程信息 -->
          <div class="course-details">
            <h1 class="course-title">{{ course.title }}</h1>

            <!-- 评分和学员数 -->
            <div class="course-stats">
              <div class="rating">
                <el-rate
                  v-model="course.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
                <span class="review-count">({{ course.reviewCount }}条评价)</span>
              </div>
              <el-divider direction="vertical" />
              <div class="student-count">
                <span class="count">{{ course.studentCount }}</span>
                人学习
              </div>
            </div>

            <!-- 标签 -->
            <div class="course-tags">
              <el-tag
                v-for="tag in course.tags"
                :key="tag"
                type="info"
                size="small"
                round
              >
                {{ tag }}
              </el-tag>
            </div>

            <!-- 课程属性 -->
            <div class="course-attrs">
              <div class="attr-item">
                <span class="label">讲师：</span>
                <span class="value">{{ course.teacher.name }}</span>
              </div>
              <div class="attr-item">
                <span class="label">分类：</span>
                <span class="value">{{ course.category }}</span>
              </div>
              <div class="attr-item">
                <span class="label">课时数：</span>
                <span class="value">{{ totalLessons }}课时</span>
              </div>
              <div class="attr-item">
                <span class="label">有效期：</span>
                <span class="value">
                  {{
                    course.validType === 'permanent'
                      ? '永久有效'
                      : `${course.validDays}天`
                  }}
                </span>
              </div>
              <div v-if="course.trialLessonId" class="attr-item">
                <span class="label">试听：</span>
                <span class="value trial">✓ 含试听课</span>
              </div>
            </div>

            <!-- 价格和操作 -->
            <el-divider />
            <div class="course-actions">
              <div class="price-section">
                <div v-if="course.isFree" class="free-price">
                  免费
                </div>
                <div v-else class="paid-price">
                  <span class="current-price">
                    ¥{{ (course.price / 100).toFixed(0) }}
                  </span>
                  <span
                    v-if="course.originalPrice"
                    class="original-price"
                  >
                    ¥{{ (course.originalPrice / 100).toFixed(0) }}
                  </span>
                </div>
              </div>

              <div class="action-buttons">
                <el-button
                  :type="isFavorite ? 'warning' : 'default'"
                  :icon="isFavorite ? 'StarFilled' : 'Star'"
                  @click="onFavoriteClick"
                >
                  {{ isFavorite ? '已收藏' : '加入收藏' }}
                </el-button>

                <el-button
                  v-if="course.isFree || isPurchased"
                  type="primary"
                  :icon="VideoPlay"
                  @click="onLearnClick"
                >
                  {{ isPurchased && learningProgress > 0 ? '继续学习' : '开始学习' }}
                </el-button>

                <el-button
                  v-if="course.trialLessonId"
                  type="success"
                  :icon="VideoPlay"
                  @click="onTrialClick(course.chapters[0]?.lessons[0])"
                >
                  免费试听
                </el-button>

                <el-button
                  v-if="!course.isFree && !isPurchased"
                  type="danger"
                  :icon="ShoppingCart"
                  @click="onPurchaseClick"
                >
                  立即购买
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 相关套餐 -->
      <el-card v-if="relatedPackages.length > 0" class="related-packages-card" shadow="never">
        <template #header>
          <h2>🎁 优惠套餐</h2>
          <el-button link type="primary" @click="router.push('/portal/packages')">
            查看全部套餐
          </el-button>
        </template>
        <div class="related-packages-list">
          <div
            v-for="pkg in relatedPackages"
            :key="pkg.packageId"
            class="package-item"
          >
            <div class="package-cover">
              <el-image :src="pkg.packageCover" fit="cover" />
            </div>
            <div class="package-info">
              <h3>{{ pkg.packageName }}</h3>
              <p class="course-count">包含 {{ pkg.courses.length }} 门课程</p>
              <div class="price-info">
                <span class="current-price">{{ formatPackagePrice(pkg.price) }}</span>
                <span class="original-price">{{ formatPackagePrice(pkg.originalPrice) }}</span>
                <span class="savings">省¥{{ (calculatePackageSavings(pkg) / 100).toFixed(0) }}</span>
              </div>
            </div>
            <el-button type="primary" @click="router.push(`/portal/package/${pkg.packageId}`)">
              查看详情
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- Tab切换 -->
      <el-card class="tabs-card" shadow="never">
        <div class="tabs-header">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="📖 课程介绍" name="intro">
              <div class="tab-content">
                <h2>课程介绍</h2>
                <div class="description" v-html="course.description.replace(/\n/g, '<br>')"></div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="📚 课程目录" name="catalog">
              <div class="tab-content">
                <h2>课程目录 (共{{ course.chapters.length }}章 {{ totalLessons }}课时)</h2>

                <el-collapse>
                  <el-collapse-item
                    v-for="chapter in course.chapters"
                    :key="chapter.id"
                    :title="chapter.title"
                    :name="chapter.id"
                  >
                    <template #title>
                      <div class="chapter-title">
                        {{ chapter.title }}
                        <el-tag size="small" type="info" class="lesson-count">
                          {{ chapter.lessons.length }}课时
                        </el-tag>
                      </div>
                    </template>

                    <p v-if="chapter.description" class="chapter-description">
                      {{ chapter.description }}
                    </p>

                    <div class="lessons-list">
                      <div
                        v-for="lesson in chapter.lessons"
                        :key="lesson.id"
                        class="lesson-item"
                        @click="playLesson(lesson)"
                      >
                        <div class="lesson-info">
                          <span class="lesson-icon">
                            {{
                              lesson.type === 'video'
                                ? '🎬'
                                : lesson.type === 'audio'
                                  ? '🎵'
                                  : lesson.type === 'document'
                                    ? '📄'
                                    : '📝'
                            }}
                          </span>
                          <div class="lesson-content">
                            <p class="lesson-title">{{ lesson.title }}</p>
                            <p class="lesson-meta">
                              <span v-if="lesson.videoDuration">
                                {{ formatDuration(lesson.videoDuration) }}
                              </span>
                              <el-tag
                                v-if="lesson.isTrial"
                                size="small"
                                type="success"
                              >
                                试听
                              </el-tag>
                              <el-tag
                                v-if="lesson.isFree"
                                size="small"
                                type="success"
                              >
                                免费
                              </el-tag>
                            </p>
                          </div>
                        </div>

                        <div class="lesson-action">
                          <el-button
                            v-if="lesson.isTrial || lesson.isFree || userPermission === 'owned'"
                            type="primary"
                            size="small"
                            text
                          >
                            {{ lesson.isTrial ? '试听' : '播放' }}
                          </el-button>
                          <el-button
                            v-else
                            size="small"
                            text
                            disabled
                          >
                            <el-icon><Lock /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-tab-pane>

            <el-tab-pane name="reviews">
              <template #label>
                💬 学员评价 ({{ reviews.length }})
              </template>
              <div class="tab-content">
                <div class="reviews-header">
                  <h2>学员评价</h2>

                  <!-- 写评价按钮 -->
                  <el-button
                    v-if="isPurchased && authStore.isLoggedIn"
                    type="primary"
                    :icon="EditPen"
                    @click="handleWriteReview"
                  >
                    写评价
                  </el-button>
                </div>

                <div class="reviews-summary">
                  <div class="rating-overview">
                    <div class="rating-score">{{ course.rating }}</div>
                    <el-rate
                      v-model="course.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                    <div class="review-count">{{ reviews.length }}条评价</div>
                  </div>

                  <div class="rating-distribution">
                    <div
                      v-for="star in 5"
                      :key="star"
                      class="rating-bar"
                    >
                      <span class="star-label">{{ star }}星</span>
                      <el-progress
                        :percentage="star === 5 ? 80 : star === 4 ? 15 : star === 3 ? 4 : star === 2 ? 1 : 0"
                        :show-text="false"
                        :stroke-width="8"
                      />
                      <span class="star-percent">
                        {{
                          star === 5 ? '80%' : star === 4 ? '15%' : star === 3 ? '4%' : star === 2 ? '1%' : '0%'
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <el-divider />

                <div v-loading="reviewsLoading" class="reviews-content">
                  <div v-if="reviews.length === 0" class="empty-reviews">
                    <el-empty description="暂无评价" />
                  </div>

                  <div v-else class="reviews-list">
                    <div
                      v-for="(review, index) in reviews"
                      :key="review.reviewId"
                      class="review-item"
                    >
                      <div class="review-header">
                        <el-avatar :size="40" :src="review.userAvatar" />
                        <div class="reviewer-info">
                          <p class="reviewer-name">{{ review.userName }}</p>
                          <p class="review-date">{{ review.reviewTime }}</p>
                        </div>
                        <el-rate
                          :model="review.rating"
                          disabled
                          show-score
                          text-color="#ff9900"
                        />
                      </div>
                      <p class="review-content">{{ review.content }}</p>

                      <!-- 讲师回复 -->
                      <div v-if="review.replyContent" class="review-reply teacher-reply">
                        <div class="reply-header">
                          <span class="reply-label">讲师回复</span>
                          <span class="reply-time">{{ review.replyTime }}</span>
                        </div>
                        <p class="reply-content-text">{{ review.replyContent }}</p>

                        <!-- 用户回复讲师 -->
                        <div class="reply-actions">
                          <el-button
                            v-if="!review.userReplyContent"
                            type="primary"
                            size="small"
                            text
                            @click="handleReplyToTeacher(review)"
                          >
                            回复
                          </el-button>
                        </div>
                      </div>

                      <!-- 用户对讲师回复的再回复 -->
                      <div v-if="review.userReplyContent" class="review-reply user-reply">
                        <div class="reply-header">
                          <span class="reply-label">您的回复</span>
                          <span class="reply-time">{{ review.userReplyTime }}</span>
                        </div>
                        <p class="reply-content-text">{{ review.userReplyContent }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>

      <!-- 评价对话框 -->
      <el-dialog v-model="reviewDialogVisible" title="课程评价" width="500px" :close-on-click-modal="false">
        <el-form label-width="80px">
          <el-form-item label="评分">
            <el-rate v-model="reviewForm.rating" show-text />
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请输入您对课程的评价（10-500字）"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleResetReview">重置</el-button>
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitReview">提交评价</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.course-detail {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
  padding: $spacing-extra-large 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.breadcrumb {
  margin-bottom: $spacing-large;
}

.course-info-card {
  margin-bottom: $spacing-large;
}

.related-packages-card {
  margin-bottom: $spacing-large;
  h2 {
    margin: 0;
    font-size: $font-size-extra-large;
    font-weight: 500;
  }
}

.related-packages-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: $spacing-large;
}

.package-item {
  display: flex;
  gap: $spacing-base;
  padding: $spacing-base;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-base;
  transition: all 0.3s;

  &:hover {
    border-color: $--el-color-primary;
    background: #f0f7ff;
  }

  .package-cover {
    width: 120px;
    height: 80px;
    flex-shrink: 0;
    border-radius: $border-radius-base;
    overflow: hidden;

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  .package-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-small;

    h3 {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
    }

    .course-count {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin: 0;
    }

    .price-info {
      display: flex;
      align-items: baseline;
      gap: $spacing-base;

      .current-price {
        font-size: $font-size-large;
        font-weight: bold;
        color: #f56c6c;
      }

      .original-price {
        font-size: $font-size-small;
        color: $text-color-placeholder;
        text-decoration: line-through;
      }

      .savings {
        font-size: $font-size-base;
        color: #e6a23c;
        font-weight: 500;
      }
    }
  }

  :deep(.el-button) {
    align-self: center;
  }
}

.course-info {
  display: flex;
  gap: $spacing-extra-large;

  @include respond-to($breakpoint-md) {
    flex-direction: column;
  }
}

.course-cover {
  flex-shrink: 0;
  width: 400px;

  @include respond-to($breakpoint-md) {
    width: 100%;
  }

  .cover-image {
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: $border-radius-large;
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 48px;
  }
}

.course-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: $spacing-large;
  color: $text-color-primary;
  line-height: 1.4;
}

.course-stats {
  display: flex;
  align-items: center;
  gap: $spacing-large;
  margin-bottom: $spacing-large;

  .rating {
    display: flex;
    align-items: center;
    gap: $spacing-small;

    .review-count {
      color: $text-color-secondary;
      font-size: $font-size-small;
    }
  }

  .student-count {
    color: $text-color-secondary;

    .count {
      color: $--el-color-primary;
      font-weight: 600;
    }
  }
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-small;
  margin-bottom: $spacing-large;
}

.course-attrs {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
  margin-bottom: $spacing-large;

  .attr-item {
    display: flex;
    align-items: center;
    font-size: $font-size-base;
    color: $text-color-secondary;

    .label {
      font-weight: 500;
      color: $text-color-primary;
      min-width: 70px;
    }

    .value {
      &.trial {
        color: $--el-color-success;
        font-weight: 500;
      }
    }
  }
}

.course-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-large;

  @include respond-to($breakpoint-sm) {
    flex-direction: column;
    align-items: stretch;
  }

  .price-section {
    .free-price {
      font-size: 32px;
      font-weight: 600;
      color: $--el-color-success;
    }

    .paid-price {
      .current-price {
        font-size: 36px;
        font-weight: 600;
        color: $--el-color-danger;
      }

      .original-price {
        font-size: 20px;
        color: $text-color-placeholder;
        text-decoration: line-through;
        margin-left: $spacing-small;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: $spacing-base;
    flex-shrink: 0;

    @include respond-to($breakpoint-sm) {
      width: 100%;

      button {
        flex: 1;
      }
    }
  }
}

.tabs-card {
  .tabs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base $spacing-large 0;

    :deep(.el-tabs) {
      flex: 1;
    }
  }

  .tab-content {
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: $spacing-large;
      color: $text-color-primary;
    }
  }

  .description {
    line-height: 1.8;
    color: $text-color-regular;
  }
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: $spacing-medium;
  font-weight: 500;
}

.chapter-description {
  margin-bottom: $spacing-base;
  color: $text-color-secondary;
  font-size: $font-size-small;
}

.lessons-list {
  .lesson-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-base;
    border-radius: $border-radius-base;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: $background-color-base;
    }

    .lesson-info {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      flex: 1;

      .lesson-icon {
        font-size: 20px;
      }

      .lesson-content {
        .lesson-title {
          margin: 0 0 $spacing-small 0;
          font-weight: 500;
          color: $text-color-primary;
        }

        .lesson-meta {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          font-size: $font-size-small;
          color: $text-color-secondary;
          margin: 0;
        }
      }
    }

    .lesson-action {
      flex-shrink: 0;
    }
  }
}

.reviews-summary {
  display: flex;
  gap: $spacing-extra-large;
  padding: $spacing-extra-large;
  background: #f9fafc;
  border-radius: $border-radius-large;
  margin-bottom: $spacing-extra-large;

  @include respond-to($breakpoint-sm) {
    flex-direction: column;
  }

  .rating-overview {
    text-align: center;
    flex-shrink: 0;

    .rating-score {
      font-size: 48px;
      font-weight: 600;
      color: $text-color-primary;
    }

    .review-count {
      margin-top: $spacing-small;
      color: $text-color-secondary;
    }
  }

  .rating-distribution {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-small;

    .rating-bar {
      display: flex;
      align-items: center;
      gap: $spacing-base;

      .star-label {
        min-width: 40px;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }

      .star-percent {
        min-width: 50px;
        font-size: $font-size-small;
        color: $text-color-secondary;
        text-align: right;
      }
    }
  }
}

.reviews-list {
  .review-item {
    padding: $spacing-large 0;
    border-bottom: 1px solid $border-color-lighter;

    &:last-child {
      border-bottom: none;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin-bottom: $spacing-base;

      .reviewer-info {
        flex: 1;

        .reviewer-name {
          margin: 0 0 $spacing-small 0;
          font-weight: 500;
          color: $text-color-primary;
        }

        .review-date {
          margin: 0;
          font-size: $font-size-small;
          color: $text-color-secondary;
        }
      }
    }

    .review-content {
      margin: 0;
      color: $text-color-regular;
      line-height: 1.6;
    }

    .review-reply {
      margin-top: $spacing-base;
      padding: $spacing-base;
      border-radius: $border-radius-small;

      &.teacher-reply {
        background: #f0f7ff;
        border-left: 3px solid $--el-color-primary;
      }

      &.user-reply {
        background: #f5f7fa;
        border-left: 3px solid $--el-color-success;
      }

      .reply-header {
        display: flex;
        gap: $spacing-base;
        margin-bottom: $spacing-small;
        font-size: $font-size-small;

        .reply-label {
          font-weight: 500;
          color: $text-color-primary;
        }

        .reply-time {
          color: $text-color-secondary;
        }
      }

      .reply-content-text {
        margin: 0;
        color: $text-color-regular;
        line-height: 1.6;
      }

      .reply-actions {
        margin-top: $spacing-small;
        text-align: right;
      }
    }
  }
}

.reviews-content {
  min-height: 200px;
}

.empty-reviews {
  padding: $spacing-extra-extra-large 0;
}

.load-more {
  width: 100%;
  margin-top: $spacing-large;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-large;
}
</style>
