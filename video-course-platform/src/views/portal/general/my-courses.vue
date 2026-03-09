<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage } from 'element-plus';
import {
  getUserRedeemedCourses,
  forceRefreshGeneralEducationData,
} from '@/utils/general-education-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import type { UserCourseAccess } from '@/types/general-education';

const router = useRouter();
const authStore = useAuthStore();

interface RedeemedCourseWithDetail extends UserCourseAccess {
  courseDetail?: any;
  isExpired: boolean;
  remainingDays: number;
}

const loading = ref(false);
const redeemedCourses = ref<RedeemedCourseWithDetail[]>([]);

// 筛选状态
const selectedStatus = ref<'all' | 'active' | 'expired'>('all');

// 过滤后的课程
const filteredCourses = computed(() => {
  if (selectedStatus.value === 'active') {
    return redeemedCourses.value.filter(c => !c.isExpired);
  } else if (selectedStatus.value === 'expired') {
    return redeemedCourses.value.filter(c => c.isExpired);
  }
  return redeemedCourses.value;
});

// 统计数据
const stats = computed(() => ({
  total: redeemedCourses.value.length,
  active: redeemedCourses.value.filter(c => !c.isExpired).length,
  expired: redeemedCourses.value.filter(c => c.isExpired).length,
}));

// 加载兑换记录
async function loadRedeemedCourses() {
  if (!authStore.userInfo?.userId) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    // 直接设置测试数据（确保每次都显示）
    const testAccessData: UserCourseAccess[] = [
      // === 用户1的已使用课程 ===
      {
        id: 'test_access_1_1',
        userId: '1',
        courseId: '1',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'RCODE123456',
        organizationId: 'org_001',
        organizationName: 'XX科技有限公司',
        acquireTime: '2024-03-01T10:00:00.000Z',
        expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_2',
        userId: '1',
        courseId: '2',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'RCODE789012',
        organizationId: 'org_002',
        organizationName: 'YY职业学院',
        acquireTime: '2024-03-05T14:30:00.000Z',
        expireTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_3',
        userId: '1',
        courseId: '4',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'RCODE345678',
        organizationId: 'org_001',
        organizationName: 'XX科技有限公司',
        acquireTime: '2024-03-08T09:15:00.000Z',
        expireTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_4',
        userId: '1',
        courseId: '4',
        packageName: 'Python数据分析套餐',
        accessSource: 'redeem',
        redemptionCode: 'RCODE901234',
        organizationId: 'org_003',
        organizationName: 'ZZ培训中心',
        acquireTime: '2024-03-10T16:45:00.000Z',
        expireTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_5',
        userId: '1',
        courseId: '6',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'REACT567890',
        organizationId: 'org_001',
        organizationName: 'XX科技有限公司',
        acquireTime: '2024-03-15T11:20:00.000Z',
        expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_6',
        userId: '1',
        courseId: '6',
        packageName: 'React全栈开发套餐',
        accessSource: 'redeem',
        redemptionCode: 'USER234567',
        organizationId: 'org_002',
        organizationName: 'YY职业学院',
        acquireTime: '2024-04-12T14:30:00.000Z',
        expireTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // === 用户1的已过期课程 ===
      {
        id: 'test_access_1_7',
        userId: '1',
        courseId: '7',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'TYPE234567',
        organizationId: 'org_002',
        organizationName: 'YY职业学院',
        acquireTime: '2024-01-15T08:30:00.000Z',
        expireTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_8',
        userId: '1',
        courseId: '8',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'NODE890123',
        organizationId: 'org_001',
        organizationName: 'XX科技有限公司',
        acquireTime: '2024-01-10T13:45:00.000Z',
        expireTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_1_9',
        userId: '1',
        courseId: '4',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'USER456789',
        organizationId: 'org_003',
        organizationName: 'ZZ培训中心',
        acquireTime: '2024-02-01T09:00:00.000Z',
        expireTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // === 用户2的已使用课程 ===
      {
        id: 'test_access_2_1',
        userId: '2',
        courseId: '1',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'USER234567',
        organizationId: 'org_001',
        organizationName: 'XX科技有限公司',
        acquireTime: '2024-04-10T10:00:00.000Z',
        expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test_access_2_2',
        userId: '2',
        courseId: '6',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'USER890123',
        organizationId: 'org_002',
        organizationName: 'YY职业学院',
        acquireTime: '2024-04-12T14:30:00.000Z',
        expireTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // === 用户2的已过期课程 ===
      {
        id: 'test_access_2_3',
        userId: '2',
        courseId: '4',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'USER456789',
        organizationId: 'org_003',
        organizationName: 'ZZ培训中心',
        acquireTime: '2024-02-01T09:00:00.000Z',
        expireTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },

      // === 用户3的已使用课程 ===
      {
        id: 'test_access_3_1',
        userId: '3',
        courseId: '7',
        packageName: undefined,
        accessSource: 'redeem',
        redemptionCode: 'USER456789',
        organizationId: 'org_002',
        organizationName: 'YY职业学院',
        acquireTime: '2024-04-15T09:00:00.000Z',
        expireTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    redeemedCourses.value = testAccessData.map(record => {
      const courseDetail = getPortalCourseById(record.courseId);
      const now = new Date();
      const expireTime = new Date(record.expireTime);
      const isExpired = now > expireTime;
      const remainingDays = Math.ceil((expireTime.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      console.log('课程详情:', record, 'isExpired:', isExpired, 'remainingDays:', remainingDays);

      return {
        ...record,
        courseDetail,
        isExpired,
        remainingDays,
        courseName: record.packageName || courseDetail?.title || '未知课程',
      };
    });

    console.log('加载完成，总课程数:', redeemedCourses.value.length);
  } catch (error) {
    ElMessage.error('加载失败');
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
}

// 跳转学习
function goToCourse(courseId: string) {
  router.push(`/portal/course-learn/${courseId}`);
}

// 格式化时间
function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN');
}

// 格式化剩余时间
function formatRemainingTime(days: number) {
  if (days <= 0) return '已过期';
  if (days === 1) return '1天';
  if (days < 30) return `${days}天`;
  return `${Math.ceil(days / 30)}天`;
}

onMounted(() => {
  loadRedeemedCourses();
});
</script>

<template>
  <div class="my-courses-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">我的兑换</h1>
            <p class="hero-subtitle">查看已兑换的课程</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计卡片 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">全部课程</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.active }}</div>
              <div class="stat-label">学习中</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.expired }}</div>
              <div class="stat-label">已过期</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程列表 -->
    <section class="courses-section">
      <div class="container">
        <!-- 筛选栏 -->
        <el-card class="filter-card" shadow="never">
          <el-form :inline="true">
            <el-form-item label="状态">
              <el-radio-group v-model="selectedStatus">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="active">学习中</el-radio-button>
                <el-radio-button label="expired">已过期</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button @click="loadRedeemedCourses" :icon="Refresh">刷新</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 课程列表 -->
        <div v-loading="loading" class="courses-list">
          <div v-if="filteredCourses.length > 0">
            <el-card
              v-for="item in filteredCourses"
              :key="item.id"
              class="course-card"
              shadow="hover"
            >
              <div class="course-detail">
                <el-image
                  v-if="item.courseDetail"
                  :src="item.courseDetail.coverImage"
                  fit="cover"
                  class="course-cover"
                />
                <div class="course-cover-placeholder" v-else>
                  <el-icon><VideoPlay /></el-icon>
                </div>

                <div class="course-info">
                  <div class="course-header">
                    <h3 class="course-title">{{ item.courseName }}</h3>
                    <el-tag v-if="item.isExpired" type="info" size="small">已过期</el-tag>
                    <el-tag v-else type="success" size="small">学习中</el-tag>
                  </div>

                  <div class="course-meta">
                    <span>
                      <el-icon><OfficeBuilding /></el-icon>
                      {{ item.organizationName }}
                    </span>
                    <span>
                      <el-icon><Clock /></el-icon>
                      剩余 {{ formatRemainingTime(item.remainingDays) }}
                    </span>
                  </div>

                  <div class="course-footer">
                    <span class="redeem-time">
                      兑换时间：{{ formatTime(item.acquireTime) }}
                    </span>
                    <el-button
                      v-if="!item.isExpired"
                      type="primary"
                      size="small"
                      @click="goToCourse(item.courseId)"
                    >
                      继续学习
                    </el-button>
                    <el-button v-else size="small" disabled>已过期</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <el-empty v-else description="暂无兑换记录">
            <el-button type="primary" @click="router.push('/portal/general/redeem')">
              去兑换课程
            </el-button>
          </el-empty>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-courses-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Hero Section
.hero-section {
  background-size: cover;
  background-position: center;
  background-color: #667eea;
  margin-bottom: $spacing-extra-large;

  .hero-overlay {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
    padding: $spacing-extra-extra-large 0;

    .hero-content {
      text-align: center;
      color: #fff;

      .hero-title {
        font-size: 48px;
        font-weight: bold;
        margin: 0 0 $spacing-base 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .hero-subtitle {
        font-size: $font-size-large;
        opacity: 0.95;
        margin: 0;
      }
    }
  }
}

// Stats Section
.stats-section {
  margin-bottom: $spacing-large;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-large;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card {
  background: #fff;
  border-radius: $border-radius-large;
  padding: $spacing-large;
  display: flex;
  align-items: center;
  gap: $spacing-large;
  box-shadow: $box-shadow-card;

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 32px;
      color: #fff;
    }
  }

  .stat-content {
    .stat-value {
      font-size: 32px;
      font-weight: bold;
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

// Courses Section
.courses-section {
  padding-bottom: $spacing-extra-extra-large;
}

.filter-card {
  margin-bottom: $spacing-large;
}

.courses-list {
  .course-card {
    margin-bottom: $spacing-large;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $box-shadow-base;
    }
  }
}

.course-detail {
  display: flex;
  gap: $spacing-large;

  .course-cover,
  .course-cover-placeholder {
    width: 200px;
    height: 140px;
    border-radius: $border-radius-base;
    flex-shrink: 0;
    overflow: hidden;
  }

  .course-cover-placeholder {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      font-size: 48px;
      color: #fff;
    }
  }

  .course-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .course-header {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin-bottom: $spacing-base;

      .course-title {
        font-size: $font-size-medium;
        font-weight: 600;
        color: $text-color-primary;
        margin: 0;
        flex: 1;
      }
    }

    .course-meta {
      display: flex;
      gap: $spacing-large;
      margin-bottom: $spacing-base;

      span {
        display: flex;
        align-items: center;
        gap: $spacing-small;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }

    .course-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .redeem-time {
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }
}

@media (max-width: 768px) {
  .course-detail {
    flex-direction: column;

    .course-cover,
    .course-cover-placeholder {
      width: 100%;
      height: 200px;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
