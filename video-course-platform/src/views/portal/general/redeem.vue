<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { redeemCourse, validateRedemptionCode, getAllOrganizations } from '@/utils/general-education-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import { getPackageById } from '@/utils/course-package-storage';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const redeemStep = ref(1); // 1: 输入兑换码  2: 确认课程  3: 兑换成功

const selectedOrganization = ref('');
const codeInput = ref('');
const validationResult = ref<any>(null);
const items = ref<any[]>([]); // 可能是课程或套餐
const targetType = ref<'course' | 'package'>('course');

// 第一步：验证兑换码
async function handleValidateCode() {
  // 双重校验1：检查是否选择了单位
  if (!selectedOrganization.value) {
    ElMessage.warning('请选择单位');
    return;
  }

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

    // 双重校验3：检查单位是否匹配
    if (result.code.organizationId !== selectedOrganization.value) {
      ElMessage.error('兑换码与选择的单位不匹配');
      return;
    }

    validationResult.value = result.code;
    targetType.value = result.code.targetType;

    // 获取课程或套餐信息
    items.value = [];
    if (result.code.targetType === 'course') {
      for (const targetId of result.code.targetIds) {
        const course = getPortalCourseById(targetId);
        if (course) items.value.push(course);
      }
    } else {
      for (const targetId of result.code.targetIds) {
        const pkg = getPackageById(parseInt(targetId));
        if (pkg) items.value.push(pkg);
      }
    }

    if (items.value.length === 0) {
      ElMessage.error('课程/套餐不存在');
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
      codeInput.value.trim(),
      selectedOrganization.value // 传递选择的单位ID
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
  selectedOrganization.value = '';
  codeInput.value = '';
  validationResult.value = null;
  items.value = [];
}

// 跳转学习
function handleGoToCourse() {
  if (items.value.length > 0) {
    // 如果是课程，直接跳转；如果是套餐，跳转到第一个课程
    const firstItem = items.value[0];
    if (targetType.value === 'course') {
      // 确保课程ID是字符串类型
      const courseId = firstItem.id.toString();
      router.push(`/portal/course-learn/${courseId}`);
    } else {
      // 套餐：跳转到第一个课程，确保课程ID是字符串类型
      const courseId = firstItem.courses[0].courseId.toString();
      router.push(`/portal/course-learn/${courseId}`);
    }
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
                <el-form-item label="选择单位" required>
                  <el-select
                    v-model="selectedOrganization"
                    filterable
                    placeholder="请搜索单位名称"
                    size="large"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="org in getAllOrganizations()"
                      :key="org.id"
                      :label="org.name"
                      :value="org.id"
                    />
                  </el-select>
                  <div class="field-tip">请先选择兑换码所属的单位</div>
                </el-form-item>

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
                <p>1. 选择兑换码所属的单位</p>
                <p>2. 输入您的兑换码（由单位提供）</p>
                <p>3. 系统验证兑换码并显示对应课程/套餐</p>
                <p>4. 确认课程信息后完成兑换</p>
                <p>5. 兑换成功后可在"我的课程"中学习</p>
                <p class="text-warning">注意：兑换码必须与选择的单位匹配</p>
              </div>
            </el-card>
          </div>

          <!-- 步骤2: 确认课程 -->
          <div v-if="redeemStep === 2 && items.length > 0" class="step-content">
            <el-card class="course-card" shadow="hover">
              <template #header>
                <h2>确认兑换{{ targetType === 'package' ? '套餐' : '课程' }}</h2>
              </template>

              <div v-for="(item, index) in items" :key="index" class="course-item">
                <div v-if="targetType === 'course'" class="course-detail">
                  <el-image
                    :src="item.coverImage"
                    fit="cover"
                    class="course-cover"
                  />
                  <div class="course-info">
                    <h3 class="course-title">{{ item.title }}</h3>
                    <div class="course-meta">
                      <el-tag size="small">{{ item.category }}</el-tag>
                      <span class="separator">•</span>
                      <el-rate
                        v-model="item.rating"
                        disabled
                        show-score
                        text-color="#ff9900"
                      />
                    </div>
                    <p class="course-desc">{{ item.courseIntro }}</p>
                  </div>
                </div>

                <div v-else class="package-detail">
                  <el-image
                    :src="item.packageCover"
                    fit="cover"
                    class="course-cover"
                  />
                  <div class="course-info">
                    <h3 class="course-title">{{ item.packageName }}</h3>
                    <p class="course-desc">{{ item.packageDesc }}</p>
                    <div class="package-courses">
                      <p><strong>包含课程：</strong></p>
                      <ul>
                        <li v-for="course in item.courses" :key="course.courseId">
                          {{ course.courseName }} {{ course.isRequired ? '(必修)' : '(选修)' }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <el-divider v-if="index < items.length - 1" />
              </div>

              <div class="course-access">
                <p><strong>类型：</strong>{{ targetType === 'package' ? '课程套餐' : '课程' }}</p>
                <p><strong>有效期：</strong>{{ validationResult?.accessValidDays ? `${validationResult.accessValidDays}天` : '永不过期' }}</p>
                <p><strong>单位：</strong>{{ validationResult?.organizationName }}</p>
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
                <p class="success-message">您已成功获得{{ targetType === 'package' ? '套餐' : '课程' }}访问权限</p>

                <el-descriptions :column="1" border class="success-info">
                  <el-descriptions-item :label="targetType === 'package' ? '套餐名称' : '课程名称'">
                    {{ items.map(item => targetType === 'course' ? item.title : item.packageName).join(', ') }}
                  </el-descriptions-item>
                  <el-descriptions-item label="类型">
                    {{ targetType === 'package' ? '课程套餐' : '课程' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="有效期">
                    {{ validationResult?.accessValidDays ? `${validationResult.accessValidDays}天` : '永不过期' }}
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
.course-item {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}

.course-detail,
.package-detail {
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

    .package-courses {
      margin-bottom: $spacing-base;

      p {
        font-size: $font-size-base;
        color: $text-color-primary;
        margin: 0 0 $spacing-small 0;
      }

      ul {
        padding-left: 20px;
        margin: 0;

        li {
          line-height: 1.8;
          color: $text-color-regular;
        }
      }
    }
  }
}

.course-access {
  margin-top: $spacing-large;
  padding-top: $spacing-large;
  border-top: 1px solid $border-color-light;

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
