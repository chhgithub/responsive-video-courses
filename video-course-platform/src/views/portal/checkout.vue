<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import { createOrder, payOrder } from '@/utils/order-storage';
import type { PaymentMethod } from '@/utils/order-storage';
import {
  getPackagesByCourse,
  type CoursePackage,
  calculatePackageSavings,
  formatPackagePrice,
} from '@/utils/course-package-storage';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const paying = ref(false);
const course = ref<any>(null);
const selectedPayment = ref<PaymentMethod>('alipay');

const orderId = ref<string>('');

// 相关套餐
const relatedPackages = ref<CoursePackage[]>([]);

// 获取课程ID
onMounted(() => {
  const courseId = route.params.courseId as string;
  if (!courseId) {
    ElMessage.error('课程ID不存在');
    router.push('/portal/courses');
    return;
  }

  // 检查登录状态
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push(`/login?redirect=/portal/checkout/${courseId}`);
    return;
  }

  // 获取课程信息
  course.value = getPortalCourseById(courseId);
  if (!course.value) {
    ElMessage.error('课程不存在');
    router.push('/portal/courses');
    return;
  }

  // 加载相关套餐
  loadRelatedPackages();

  // 创建订单
  createOrderData();
});

// 加载相关套餐
function loadRelatedPackages() {
  if (!course.value) return;

  try {
    const packages = getPackagesByCourse(parseInt(course.value.id));
    // 只显示前2个相关套餐
    relatedPackages.value = packages.slice(0, 2);
  } catch (error) {
    console.error('加载相关套餐失败:', error);
  }
}

// 创建订单
async function createOrderData() {
  if (!authStore.userInfo) return;

  loading.value = true;
  try {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    const order = createOrder({
      userId: authStore.userInfo.userId,
      userName: authStore.userInfo.nickname || authStore.userInfo.username,
      userAvatar: authStore.userInfo.avatar,
      userEmail: authStore.userInfo.email,
      courseId: course.value.id,
      courseName: course.value.title,
      courseCover: course.value.coverImage,
      price: course.value.price,
      originalPrice: course.value.originalPrice,
    });

    orderId.value = order.orderId;
    console.log('订单创建成功:', order);
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败');
  } finally {
    loading.value = false;
  }
}

// 选择支付方式
function selectPayment(method: PaymentMethod) {
  selectedPayment.value = method;
}

// 确认支付
async function handlePay() {
  if (!orderId.value) {
    ElMessage.error('订单不存在');
    return;
  }

  paying.value = true;
  try {
    // 模拟支付延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 支付订单
    payOrder(orderId.value, selectedPayment.value);

    ElMessage.success('支付成功！正在跳转...');

    // 延迟跳转到我的课程页面
    setTimeout(() => {
      router.push('/member/profile/courses');
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || '支付失败');
  } finally {
    paying.value = false;
  }
}

// 取消支付
function handleCancel() {
  router.back();
}
</script>

<template>
  <div class="checkout-page">
    <div v-loading="loading" class="checkout-container">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/portal/courses' }">课程中心</el-breadcrumb-item>
          <el-breadcrumb-item>{{ course?.title }}</el-breadcrumb-item>
          <el-breadcrumb-item>确认订单</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div v-if="course" class="checkout-content">
        <!-- 课程信息 -->
        <el-card class="course-info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">课程信息</span>
            </div>
          </template>

          <div class="course-detail">
            <el-image :src="course.coverImage" fit="cover" class="course-cover" />
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <div class="course-meta">
                <el-tag size="small">{{ course.category }}</el-tag>
                <span class="teacher">讲师：{{ course.teacher?.name }}</span>
              </div>
              <div class="course-stats">
                <span>⭐ {{ course.rating }}</span>
                <span>{{ course.studentCount }}人已学</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 套餐推荐 -->
        <el-card v-if="relatedPackages.length > 0" class="package-recommend-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">🎁 优惠套餐推荐</span>
              <span class="header-desc">包含本课程的超值套餐</span>
            </div>
          </template>

          <div class="packages-list">
            <div
              v-for="pkg in relatedPackages"
              :key="pkg.packageId"
              class="package-item"
            >
              <div class="package-left">
                <el-image :src="pkg.packageCover" class="package-cover" fit="cover" />
                <div class="package-info">
                  <h3>{{ pkg.packageName }}</h3>
                  <p class="course-count">包含 {{ pkg.courses.length }} 门课程</p>
                  <div class="price-info">
                    <span class="current-price">{{ formatPackagePrice(pkg.price) }}</span>
                    <span class="original-price">{{ formatPackagePrice(pkg.originalPrice) }}</span>
                    <el-tag type="danger" size="small">
                      省¥{{ (calculatePackageSavings(pkg) / 100).toFixed(0) }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <el-button
                type="primary"
                @click="router.push(`/portal/package/${pkg.packageId}`)"
              >
                查看套餐
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 支付方式 -->
        <el-card class="payment-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">选择支付方式</span>
            </div>
          </template>

          <div class="payment-methods">
            <div
              class="payment-method"
              :class="{ active: selectedPayment === 'alipay' }"
              @click="selectPayment('alipay')"
            >
              <div class="method-icon alipay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.21 17.54 3.55 19 5.54 19h12.92c1.99 0 3.33-1.46 3.12-3.91zM7.47 7h9.06c.58 0 1.06.33 1.18.8l1.09 7.66H8.2l1.09-7.66c.12-.47.6-.8 1.18-.8z"/>
                </svg>
              </div>
              <div class="method-info">
                <div class="method-name">支付宝</div>
                <div class="method-desc">推荐使用支付宝支付</div>
              </div>
              <div v-if="selectedPayment === 'alipay'" class="check-icon">
                <el-icon><Check /></el-icon>
              </div>
            </div>

            <div
              class="payment-method"
              :class="{ active: selectedPayment === 'wechat' }"
              @click="selectPayment('wechat')"
            >
              <div class="method-icon wechat">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141.049.141a.16.16 0 00.104-.035l1.873-1.233a.864.864 0 01.653-.104c1.07.281 2.21.437 3.388.437 4.748 0 8.536-3.288 8.536-7.342 0-4.055-3.788-7.342-8.588-7.342zM5.788 7.342c.72 0 1.303.608 1.303 1.358 0 .75-.583 1.357-1.303 1.357-.72 0-1.303-.607-1.303-1.357 0-.75.583-1.358 1.303-1.358zm5.806 0c.72 0 1.303.608 1.303 1.358 0 .75-.583 1.357-1.303 1.357-.72 0-1.303-.607-1.303-1.357 0-.75.583-1.358 1.303-1.358zM24 14.188c0 3.516-3.147 6.403-7.155 6.403-1.074 0-2.09-.177-3.034-.494a.722.722 0 00-.542.086l-1.638 1.076a.138.138 0 01-.16-.005c-.036.012-.06-.048-.045-.081l.34-1.284a.49.49 0 00-.177-.553C10.577 18.667 9.6 17.246 9.6 14.188c0-3.516 3.147-6.403 7.155-6.403 4.008 0 7.245 2.887 7.245 6.403zm-10.087-2.26c0 .634.505 1.148 1.128 1.148.623 0 1.128-.514 1.128-1.148 0-.634-.505-1.148-1.128-1.148-.623 0-1.128.514-1.128 1.148zm5.314 0c0 .634.505 1.148 1.128 1.148.623 0 1.128-.514 1.128-1.148 0-.634-.505-1.148-1.128-1.148-.623 0-1.128.514-1.128 1.148z"/>
                </svg>
              </div>
              <div class="method-info">
                <div class="method-name">微信支付</div>
                <div class="method-desc">使用微信扫码支付</div>
              </div>
              <div v-if="selectedPayment === 'wechat'" class="check-icon">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 订单详情 -->
        <el-card class="order-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">订单详情</span>
            </div>
          </template>

          <div class="order-detail">
            <div class="order-item">
              <span class="item-label">课程价格</span>
              <span class="item-value original-price">¥{{ course.price }}</span>
            </div>
            <div class="order-item">
              <span class="item-label">优惠</span>
              <span class="item-value discount">-¥0</span>
            </div>
            <div class="order-divider"></div>
            <div class="order-item total">
              <span class="item-label">应付金额</span>
              <span class="item-value final-price">¥{{ course.price }}</span>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="checkout-actions">
          <el-button size="large" @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="paying"
            @click="handlePay"
            class="pay-button"
          >
            {{ paying ? '支付中...' : `确认支付 ¥${course.price}` }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.checkout-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: $spacing-large;
}

.checkout-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: $spacing-large;
}

.checkout-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-title {
    font-size: $font-size-large;
    font-weight: 600;
    color: $text-color-primary;
  }
}

// 课程信息
.course-info-card {
  .course-detail {
    display: flex;
    gap: $spacing-large;
  }

  .course-cover {
    width: 200px;
    height: 150px;
    border-radius: $border-radius-base;
    flex-shrink: 0;
  }

  .course-info {
    flex: 1;

    .course-title {
      font-size: $font-size-large;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }

    .course-meta {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin-bottom: $spacing-small;
    }

    .teacher {
      color: $text-color-secondary;
      font-size: $font-size-small;
    }

    .course-stats {
      display: flex;
      gap: $spacing-large;
      color: $text-color-secondary;
      font-size: $font-size-small;
    }
  }
}

// 套餐推荐
.package-recommend-card {
  .card-header {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .header-title {
      font-size: $font-size-large;
      font-weight: 600;
      color: $text-color-primary;
    }

    .header-desc {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

.packages-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.package-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-base;
  padding: $spacing-base;
  border: 2px solid #f0f7ff;
  border-radius: $border-radius-base;
  background: #fafbff;
  transition: all 0.3s;

  &:hover {
    border-color: $--el-color-primary;
    background: #f0f7ff;
  }
}

.package-left {
  display: flex;
  gap: $spacing-base;
  flex: 1;

  .package-cover {
    width: 100px;
    height: 70px;
    border-radius: $border-radius-base;
    flex-shrink: 0;
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
    }
  }
}

// 支付方式
.payment-card {
  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: $spacing-base;
  }

  .payment-method {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    padding: $spacing-large;
    border: 2px solid $border-color-lighter;
    border-radius: $border-radius-base;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: $--el-color-primary;
    }

    &.active {
      border-color: $--el-color-primary;
      background: #f0f7ff;
    }
  }

  .method-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;

    svg {
      width: 32px;
      height: 32px;
    }

    &.alipay {
      background: #1677ff;
      color: #fff;
    }

    &.wechat {
      background: #07c160;
      color: #fff;
    }
  }

  .method-info {
    flex: 1;

    .method-name {
      font-size: $font-size-medium;
      font-weight: 500;
      color: $text-color-primary;
      margin-bottom: 4px;
    }

    .method-desc {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .check-icon {
    font-size: 24px;
    color: $--el-color-primary;
  }
}

// 订单详情
.order-card {
  .order-detail {
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-base;

      .item-label {
        color: $text-color-secondary;
        font-size: $font-size-base;
      }

      .item-value {
        font-size: $font-size-medium;
        font-weight: 500;
        color: $text-color-primary;

        &.original-price {
          text-decoration: line-through;
          color: $text-color-placeholder;
        }

        &.discount {
          color: #f56c6c;
        }

        &.final-price {
          font-size: $font-size-extra-large;
          font-weight: 600;
          color: #f56c6c;
        }
      }

      &.total {
        margin-top: $spacing-base;
      }
    }

    .order-divider {
      height: 1px;
      background: $border-color-lighter;
      margin: $spacing-large 0;
    }
  }
}

// 操作按钮
.checkout-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;

  .pay-button {
    min-width: 200px;
  }
}
</style>
