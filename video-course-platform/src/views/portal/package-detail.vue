<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores';
import {
  getPackageById,
  getAllPackages,
  type CoursePackage,
  calculatePackageSavings,
  formatPackagePrice,
} from '@/utils/course-package-storage';
import {
  addPackageLearningRecord,
  type PackageLearningRecord,
} from '@/utils/course-package-storage';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const purchasing = ref(false);
const pkg = ref<CoursePackage | null>(null);
const isPurchased = ref(false);

const packageId = computed(() => parseInt(route.params.id as string));

// 获取是否已购买
const checkPurchased = computed(() => {
  if (!authStore.userInfo || !pkg.value) return false;

  const recordsData = localStorage.getItem('package_learning_records');
  if (!recordsData) return false;

  const records: PackageLearningRecord[] = JSON.parse(recordsData);
  return records.some(
    r => r.packageId === packageId.value && r.userId === authStore.userInfo.userId
  );
});

// 加载套餐详情
async function loadPackageDetail() {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const packageData = getPackageById(packageId.value);
    if (!packageData) {
      ElMessage.error('套餐不存在');
      router.push('/portal/packages');
      return;
    }
    pkg.value = packageData;
    isPurchased.value = checkPurchased.value;
  } finally {
    loading.value = false;
  }
}

// 跳转课程详情
function goToCourseDetail(courseId: number) {
  router.push(`/portal/course/${courseId}`);
}

// 购买套餐
async function handlePurchase() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push(`/login?redirect=/portal/package/${packageId.value}`);
    return;
  }

  if (isPurchased.value) {
    ElMessage.info('您已购买此套餐');
    return;
  }

  if (!pkg.value) return;

  try {
    await ElMessageBox.confirm(
      `确定要购买《${pkg.value.packageName}》吗？`,
      '确认购买',
      {
        confirmButtonText: '确定购买',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    purchasing.value = true;

    // 模拟购买延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 创建套餐学习记录
    const record: PackageLearningRecord = {
      packageId: packageId.value,
      userId: authStore.userInfo!.userId,
      userName: authStore.userInfo!.nickname || authStore.userInfo!.username,
      userAvatar: authStore.userInfo!.avatar || '',
      enrollTime: new Date().toISOString(),
      expiryTime: pkg.value.validDays > 0
        ? new Date(Date.now() + pkg.value.validDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      progress: 0,
      completedCourses: [],
      totalWatchDuration: 0,
      lastWatchTime: new Date().toISOString(),
      lastWatchCourse: 0,
      status: 'learning',
      courseProgress: pkg.value.courses.map(c => ({
        courseId: c.courseId,
        courseName: c.courseName,
        progress: 0,
        completed: false,
        watchDuration: 0,
      })),
    };

    addPackageLearningRecord(record);

    ElMessage.success('购买成功！');
    isPurchased.value = true;

    // 刷新套餐购买数
    const packages = getAllPackages();
    const index = packages.findIndex(p => p.packageId === packageId.value);
    if (index !== -1) {
      packages[index].enrollCount++;
      localStorage.setItem('course_packages', JSON.stringify(packages));
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('购买失败');
    }
  } finally {
    purchasing.value = false;
  }
}

// 开始学习
function startLearning() {
  if (!pkg.value || !pkg.value.courses[0]) return;
  const firstCourseId = pkg.value.courses[0].courseId;
  router.push(`/portal/course-learn/${firstCourseId}`);
}

// 格式化日期
function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

onMounted(() => {
  loadPackageDetail();
});
</script>

<template>
  <div v-loading="loading" class="package-detail">
    <!-- 错误提示 -->
    <div v-if="!pkg && !loading" class="error-container">
      <el-result icon="warning" title="套餐不存在" sub-title="套餐不存在或已下架">
        <template #extra>
          <el-button type="primary" @click="router.push('/portal/packages')">返回套餐列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 套餐详情 -->
    <div v-else-if="pkg" class="container">
      <!-- 面包屑 -->
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item>
          <router-link to="/portal/packages">课程套餐</router-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ pkg.packageName }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 套餐信息 -->
      <el-card class="package-info-card" shadow="never">
        <div class="package-header">
          <div class="package-cover">
            <el-image :src="pkg.packageCover" fit="cover" />
          </div>
          <div class="package-info">
            <h1 class="package-name">{{ pkg.packageName }}</h1>
            <p class="package-desc">{{ pkg.packageDesc }}</p>

            <!-- 套餐标签 -->
            <div class="package-tags">
              <el-tag type="success" v-if="pkg.isTrial">支持试学 {{ pkg.trialDays }}天</el-tag>
              <el-tag type="info">{{ pkg.courses.length }}门课程</el-tag>
              <el-tag>{{ pkg.enrollCount }}人购买</el-tag>
              <el-tag type="warning">{{ pkg.rating }}分</el-tag>
            </div>

            <!-- 价格信息 -->
            <div class="price-section">
              <div class="current-price">
                <span class="price">{{ formatPackagePrice(pkg.price) }}</span>
                <span class="discount">{{ pkg.discount.toFixed(0) }}折</span>
              </div>
              <div class="price-comparison">
                <span class="original-price">
                  原价：{{ formatPackagePrice(pkg.originalPrice) }}
                </span>
                <span class="savings">
                  省¥{{ (calculatePackageSavings(pkg) / 100).toFixed(0) }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button
                v-if="isPurchased"
                type="success"
                size="large"
                :icon="VideoPlay"
                @click="startLearning"
              >
                开始学习
              </el-button>
              <el-button
                v-else
                type="danger"
                size="large"
                :loading="purchasing"
                :disabled="pkg.status !== 'published'"
                @click="handlePurchase"
              >
                {{ purchasing ? '购买中...' : '立即购买' }}
              </el-button>
              <el-button size="large" @click="router.push('/portal/packages')">
                返回列表
              </el-button>
            </div>
          </div>
        </div>

        <!-- 套餐属性 -->
        <el-divider />
        <div class="package-attributes">
          <div class="attribute-item">
            <span class="label">有效期：</span>
            <span class="value">{{ pkg.validDays > 0 ? `${pkg.validDays}天` : '永久有效' }}</span>
          </div>
          <!-- <div class="attribute-item">
            <span class="label">评价数：</span>
            <span class="value">{{ pkg.reviewCount }}条</span>
          </div> -->
          <div class="attribute-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(pkg.createTime) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 包含的课程 -->
      <el-card class="courses-card" shadow="never">
        <template #header>
          <h2>包含课程（共{{ pkg.courses.length }}门）</h2>
        </template>

        <div class="courses-list">
          <div
            v-for="course in pkg.courses"
            :key="course.courseId"
            class="course-item"
          >
            <div class="course-cover">
              <el-image :src="course.courseCover" fit="cover" />
            </div>
            <div class="course-info">
              <h3>{{ course.courseName }}</h3>
              <p>讲师：{{ course.teacherName }}</p>
              <p>原价：{{ formatPackagePrice(course.originalPrice) }}</p>
              <!-- <el-tag v-if="course.isRequired" type="danger" size="small">必修</el-tag>
              <el-tag v-else type="info" size="small">选修</el-tag> -->
            </div>
            <el-button
              link
              type="primary"
              @click="goToCourseDetail(course.courseId)"
            >
              查看课程详情
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.package-detail {
  min-height: calc(100vh - 120px);
  background: $background-color-base;
  padding: $spacing-large 0;
}

.error-container {
  max-width: 800px;
  margin: $spacing-extra-large auto;
  padding: $spacing-large;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.breadcrumb {
  margin-bottom: $spacing-large;
}

// 套餐信息卡片
.package-info-card {
  margin-bottom: $spacing-large;
}

.package-header {
  display: flex;
  gap: $spacing-extra-large;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.package-cover {
  width: 400px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
  }

  :deep(.el-image) {
    width: 100%;
    border-radius: $border-radius-large;
  }
}

.package-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.package-name {
  font-size: 32px;
  font-weight: bold;
  color: $text-color-primary;
  margin: 0;
}

.package-desc {
  font-size: $font-size-base;
  color: $text-color-secondary;
  line-height: 1.6;
  margin: 0;
}

.package-tags {
  display: flex;
  gap: $spacing-small;
  flex-wrap: wrap;
}

.price-section {
  margin: $spacing-large 0;

  .current-price {
    display: flex;
    align-items: baseline;
    gap: $spacing-base;

    .price {
      font-size: 48px;
      font-weight: bold;
      color: #f56c6c;
    }

    .discount {
      font-size: 24px;
      font-weight: 500;
      color: #e6a23c;
      padding: 4px 12px;
      background: #fff7e6;
      border-radius: 6px;
    }
  }

  .price-comparison {
    display: flex;
    align-items: center;
    gap: $spacing-large;

    .original-price {
      font-size: $font-size-base;
      color: $text-color-placeholder;
      text-decoration: line-through;
    }

    .savings {
      font-size: 18px;
      color: #f56c6c;
      font-weight: 500;
    }
  }
}

.action-buttons {
  display: flex;
  gap: $spacing-base;

  @media (max-width: 480px) {
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }
}

.package-attributes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-large;

  .attribute-item {
    display: flex;
    align-items: center;
    gap: $spacing-base;

    .label {
      font-weight: 500;
      color: $text-color-secondary;
    }

    .value {
      color: $text-color-primary;
    }
  }
}

// 课程列表卡片
.courses-card {
  h2 {
    margin: 0;
    font-size: $font-size-extra-large;
    font-weight: 500;
  }
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.course-item {
  display: flex;
  align-items: center;
  gap: $spacing-large;
  padding: $spacing-large;
  background: $background-color-base;
  border-radius: $border-radius-base;
  transition: all 0.3s;

  &:hover {
    background: #f0f7ff;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
}

.course-cover {
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

.course-info {
  flex: 1;

  h3 {
    font-size: $font-size-large;
    font-weight: 600;
    color: $text-color-primary;
    margin: 0 0 $spacing-small 0;
  }

  p {
    font-size: $font-size-small;
    color: $text-color-secondary;
    margin: $spacing-small 0;
  }
}
</style>
