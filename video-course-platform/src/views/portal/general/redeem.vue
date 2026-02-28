<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores';
import { redeemCourse, validateRedemptionCode } from '@/utils/general-education-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';

const authStore = useAuthStore();

const loading = ref(false);
const redeemStep = ref(1); // 1: 输入兑换码  2: 确认课程  3: 兑换成功

const codeInput = ref('');
const validationResult = ref<any>(null);
const course = ref<any>(null);

// 第一步：验证兑换码
async function handleValidateCode() {
  if (!codeInput.value.trim()) {
    ElMessage.warning('请输入兑换码');
    return;
  }

  loading.value = true;
  try {
    const result = validateRedemptionCode(codeInput.value.trim());

    if (!result.valid) {
      ElMessage.error(result.error || '兑换码无效');
      return;
    }

    validationResult.value = result.code;

    // 获取课程信息
    course.value = getPortalCourseById(result.code.courseId);
    if (!course.value) {
      ElMessage.error('课程不存在');
      return;
    }

    redeemStep.value = 2;
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败');
  } finally {
    loading.value = false;
  }
}

// 第二步：确认兑换
async function handleConfirmRedeem() {
  if (!authStore.userInfo) {
    ElMessage.warning('请先登录');
    return;
  }

  loading.value = true;
  try {
    const result = redeemCourse(
      authStore.userInfo.userId,
      authStore.userInfo.nickname || authStore.userInfo.username,
      codeInput.value.trim()
    );

    if (result.success) {
      redeemStep.value = 3;
    } else {
      ElMessage.error(result.error || '兑换失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '兑换失败');
  } finally {
    loading.value = false;
  }
}

// 重新兑换
function handleRedeemAgain() {
  redeemStep.value = 1;
  codeInput.value = '';
  validationResult.value = null;
  course.value = null;
}

// 跳转学习
function handleGoToCourse() {
  if (course.value) {
    window.location.href = `/portal/course-learn/${course.value.id}`;
  }
}

// 格式化过期时间
function formatExpireTime(expireTime: string) {
  const now = new Date();
  const expire = new Date(expireTime);
  const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return '已过期';
  if (diffDays <= 7) return `${diffDays}天`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}周`;
  return `${Math.ceil(diffDays / 30)}天`;
}
</script>

<template>
  <div class="redeem-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">课程兑换</h1>
            <p class="hero-subtitle">输入兑换码，获取优质课程</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 兑换流程 -->
    <section class="redeem-section">
      <div class="container">
        <div class="redeem-container">
          <!-- 步骤指示器 -->
          <el-steps :active="redeemStep" finish-status="success" class="steps">
            <el-step title="输入兑换码" />
            <el-step title="确认课程" />
            <el-step title="兑换成功" />
          </el-steps>

          <!-- 步骤1: 输入兑换码 -->
          <div v-if="redeemStep === 1" class="step-content">
            <el-card class="input-card" shadow="hover">
              <template #header>
                <h2>输入兑换码</h2>
              </template>

              <el-form label-position="top" label-width="120px">
                <el-form-item label="兑换码">
                  <el-input
                    v-model="codeInput"
                    placeholder="请输入12位兑换码（如：ABCD-1234-5678）"
                    size="large"
                    clearable
                    style="text-transform: uppercase; font-family: monospace;"
                  />
                  <div class="field-tip">兑换码不区分大小写，忽略连字符</div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    :loading="loading"
                    @click="handleValidateCode"
                    style="width: 200px"
                  >
                    验证兑换码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 使用说明 -->
            <el-card class="tips-card" shadow="never">
              <template #header>
                <h3>使用说明</h3>
              </template>
              <div class="tips-content">
                <p>1. 输入您的兑换码（由单位提供）</p>
                <p>2. 系统验证兑换码并显示对应课程</p>
                <p>3. 确认课程信息后完成兑换</p>
                <p>4. 兑换成功后可在"我的课程"中学习</p>
                <p class="text-warning">注意：兑换码有效期为兑换后的30天，请及时学习</p>
              </div>
            </el-card>
          </div>

          <!-- 步骤2: 确认课程 -->
          <div v-if="redeemStep === 2 && course" class="step-content">
            <el-card class="course-card" shadow="hover">
              <template #header>
                <h2>确认兑换课程</h2>
              </template>

              <div class="course-detail">
                <el-image
                  :src="course.coverImage"
                  fit="cover"
                  class="course-cover"
                />
                <div class="course-info">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <div class="course-meta">
                    <el-tag size="small">{{ course.category }}</el-tag>
                    <span class="separator">•</span>
                    <el-rate
                      v-model="course.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                  </div>
                  <p class="course-desc">{{ course.courseIntro }}</p>
                  <div class="course-tags">
                    <el-tag
                      v-for="tag in course.tags"
                      :key="tag"
                      size="small"
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <div class="course-access">
                    <p><strong>有效期：</strong>兑换后30天</p>
                    <p><strong>单位：</strong>{{ validationResult?.organizationName }}</p>
                  </div>
                </div>
              </div>

              <div class="action-buttons">
                <el-button @click="redeemStep = 1">返回</el-button>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  @click="handleConfirmRedeem"
                >
                  确认兑换
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 步骤3: 兑换成功 -->
          <div v-if="redeemStep === 3" class="step-content">
            <el-card class="success-card" shadow="hover">
              <div class="success-content">
                <el-icon class="success-icon" color="#67C23A" :size="80">
                  <CircleCheck />
                </el-icon>
                <h2 class="success-title">兑换成功！</h2>
                <p class="success-message">您已成功获得课程访问权限</p>

                <el-descriptions :column="1" border class="success-info">
                  <el-descriptions-item label="课程名称">
                    {{ course?.title }}
                  </el-descriptions-item>
                  <el-descriptions-item label="有效期">
                    30天
                  </el-descriptions-item>
                  <el-descriptions-item label="兑换码">
                    {{ codeInput }}
                  </el-descriptions-item>
                </el-descriptions>

                <div class="success-actions">
                  <el-button @click="handleGoToCourse" type="primary" size="large">
                    立即学习
                  </el-button>
                  <el-button @click="handleRedeemAgain">
                    继续兑换
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.redeem-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
}

.container {
  max-width: 900px;
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

// Redeem Section
.redeem-section {
  padding-bottom: $spacing-extra-extra-large;
}

.redeem-container {
  max-width: 700px;
  margin: 0 auto;
}

.steps {
  margin-bottom: $spacing-extra-large;
}

.step-content {
  .input-card,
  .course-card,
  .success-card {
    margin-bottom: $spacing-large;
  }

  .tips-card {
    margin-top: $spacing-large;
  }
}

.field-tip {
  margin-top: $spacing-small;
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.tips-content {
  p {
    line-height: 2;
    margin-bottom: $spacing-small;

    &:last-child {
      margin-bottom: 0;
    }

    .text-warning {
      color: $--el-color-warning;
    }
  }
}

// Course Detail
.course-detail {
  display: flex;
  gap: $spacing-large;

  .course-cover {
    width: 240px;
    height: 160px;
    border-radius: $border-radius-base;
    flex-shrink: 0;
  }

  .course-info {
    flex: 1;

    .course-title {
      font-size: 24px;
      color: $text-color-primary;
      margin: 0 0 $spacing-base 0;
    }

    .course-meta {
      display: flex;
      align-items: center;
      gap: $spacing-small;
      margin-bottom: $spacing-base;

      .separator {
        color: $text-color-secondary;
      }
    }

    .course-desc {
      font-size: $font-size-base;
      line-height: 1.8;
      color: $text-color-regular;
      margin-bottom: $spacing-base;
    }

    .course-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-small;
      margin-bottom: $spacing-large;
    }

    .course-access {
      p {
        font-size: $font-size-small;
        color: $text-color-secondary;
        margin-bottom: $spacing-small;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: $text-color-primary;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
  margin-top: $spacing-extra-large;
}

// Success Card
.success-card {
  .success-content {
    text-align: center;
    padding: $spacing-extra-large 0;

    .success-icon {
      margin-bottom: $spacing-large;
    }

    .success-title {
      font-size: 32px;
      color: $text-color-primary;
      margin: 0 0 $spacing-base 0;
    }

    .success-message {
      font-size: $font-size-large;
      color: $text-color-regular;
      margin-bottom: $spacing-large;
    }

    .success-info {
      margin-bottom: $spacing-large;

      :deep(.el-descriptions__label) {
        font-weight: 600;
      }
    }

    .success-actions {
      display: flex;
      flex-direction: column;
      gap: $spacing-base;
      align-items: center;
    }
  }
}
</style>
