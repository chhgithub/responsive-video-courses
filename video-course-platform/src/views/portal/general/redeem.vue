<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { redeemCourse, validateRedemptionCode, getAllOrganizations } from '@/utils/general-education-storage';
import { getPortalCourseById } from '@/utils/portal-course-adapter';
import { getPackageById } from '@/utils/course-package-storage';
import { CircleCheck, Collection, ArrowRight } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const redeemStep = ref(1); // 1: 输入兑换码  2: 确认课程  3: 兑换成功

const selectedOrganization = ref('');
const codeInput = ref('');
const validationResult = ref<any>(null);
const items = ref<any[]>([]); // 可能是课程或套餐
const targetType = ref<'course' | 'package'>('course');

// 课程选择对话框
const courseSelectDialogVisible = ref(false);
const selectedPackage = ref<any>(null);

// 套餐选择对话框
const packageSelectDialogVisible = ref(false);

// 课程选择对话框提示文本
const selectTipText = computed(() => {
  if (targetType.value === 'course') {
    return `您已兑换${items.value.length}门课程，请选择要学习的课程：`;
  }

  // 套餐类型
  if (selectedPackage.value) {
    return `您选择了"${selectedPackage.value.packageName}"套餐，请从以下课程中选择：`;
  }

  return `您已兑换${items.value.length}门课程，请选择要学习的课程：`;
});

// 计算是否显示"返回套餐"按钮
const showReturnButton = computed(() => {
  // 仅当选择了套餐时才显示
  return !!selectedPackage.value;
});

// 返回套餐选择页面
const handleReturnToPackageSelect = (pkg: any) => {
  // 关闭课程选择对话框
  courseSelectDialogVisible.value = false;
  // 重新打开套餐选择对话框
  // selectedPackage 保持不变，用户可以切换其他套餐
  packageSelectDialogVisible.value = true;
};

// 重新设置选中的套餐（用于返回套餐后清空）
const handleResetPackage = () => {
  selectedPackage.value = null;
};

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
  const firstItem = items.value[0];
  if (!firstItem) return;

  // ===== 课程类型 =====
  if (targetType.value === 'course') {
    // 单个课程 → 直接跳转课程学习页
    if (items.value.length === 1) {
      router.push(`/portal/course-learn/${firstItem.id}`);
      return;
    }
    // 多个课程 → 显示课程选择对话框
    courseSelectDialogVisible.value = true;
    return;
  }

  // ===== 套餐类型 =====
  if (targetType.value === 'package') {
    // 单个套餐（任意课程数）→ 显示课程选择对话框（统一行为）
    if (items.value.length === 1) {
      selectedPackage.value = firstItem;
      courseSelectDialogVisible.value = true;
      return;
    }
    // 多个套餐 → 显示套餐选择对话框
    if (items.value.length > 1) {
      packageSelectDialogVisible.value = true;
      return;
    }
  }
}

// 选择套餐（套餐选择对话框）
function handleSelectPackage(pkg: any) {
  // 保存选中的套餐
  selectedPackage.value = pkg;

  // 判断课程数
  if (pkg.courses.length > 1) {
    // 多门课程：关闭套餐对话框，打开课程选择对话框
    // packageSelectDialogVisible.value = false;
    courseSelectDialogVisible.value = true;
    return;
  }

  // 1门课程：直接跳转到课程学习页
  if (pkg.courses.length === 1) {
    const courseId = pkg.courses[0].courseId.toString();
    router.push(`/portal/course-learn/${courseId}`);
    packageSelectDialogVisible.value = false;
    courseSelectDialogVisible.value = false;
    return;
  }
}

// 课程选择对话框关闭
function onCourseSelectDialogClosed() {
  // 保持 selectedPackage 不变，不清空
  // 这样用户可以继续从套餐中选择
}

// 套餐选择对话框关闭
function onPackageSelectDialogClosed() {
  // 清空 selectedPackage
  selectedPackage.value = null;
}

// 选择课程学习（从套餐中选择）
function handleSelectCourse(course: any) {
  if (!course || !course.id) {
    ElMessage.warning('课程信息无效');
    return;
  }

  const courseId = course.id.toString();
  router.push(`/portal/course-learn/${courseId}`);
  courseSelectDialogVisible.value = false;

  // 如果是从套餐中选择，不清空 selectedPackage
  // 如果是独立课程兑换，才清空
  if (!course.packageName) {
    selectedPackage.value = null;
  }
}

// 获取所有可学习的课程列表
function getAllAvailableCourses() {
  const courses: any[] = [];
  if (targetType.value === 'course') {
    // 课程类型：直接添加所有课程
    for (const item of items.value) {
      courses.push({
        id: item.id,
        title: item.title,
        coverImage: item.coverImage,
        type: 'course'
      });
    }
  } else {
    // 套餐类型：展开选中套餐的所有课程
    const pkgToShow = selectedPackage.value || items.value[0];

    for (const course of pkgToShow.courses) {
      courses.push({
        id: course.courseId,
        title: course.courseName,
        coverImage: pkgToShow.packageCover,
        packageName: pkgToShow.packageName,
        isRequired: course.isRequired,
        type: 'package-course'
      });
    }
  }
  return courses;
}

// 获取某个目标的有效期天数
function getTargetAccessValidDays(targetId: string): number | undefined {
  // 优先使用独立有效期
  if (validationResult.value?.targetAccessValidDays?.[targetId]) {
    return validationResult.value.targetAccessValidDays[targetId];
  }
  // 其次使用统一有效期
  return validationResult.value?.accessValidDays;
}

// 格式化有效期显示
function formatAccessValidDays(days?: number): string {
  if (!days) return '永不过期';
  return `${days}天`;
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
                <div class="card-header">
                  <h2>确认兑换{{ targetType === 'package' ? '套餐' : '课程' }}</h2>
                  <span class="item-count">共{{ targetType === 'course' ? items.length + '个课程' : items.length + '个套餐' }}</span>
                </div>
              </template>

              <!-- 课程类型：网格布局 -->
              <div v-if="targetType === 'course'" class="courses-grid">
                <div v-for="item in items" :key="item.id" class="course-card-item">
                  <el-image :src="item.coverImage" fit="cover" class="item-cover" />
                  <div class="item-info">
                    <h4 class="item-title">{{ item.title }}</h4>
                    <div class="item-meta">
                      <el-tag size="small">{{ item.category }}</el-tag>
                      <span class="separator">•</span>
                      <el-rate
                        v-model="item.rating"
                        disabled
                        show-score
                        text-color="#ff9900"
                      />
                    </div>
                    <div class="item-validity">
                      有效期：{{ formatAccessValidDays(getTargetAccessValidDays(item.id)) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 套餐类型：列表+网格展示包含课程 -->
              <div v-else class="packages-list">
                <div v-for="(pkg, index) in items" :key="index" class="package-item">
                  <div class="package-header">
                    <el-image :src="pkg.packageCover" fit="cover" class="package-cover" />
                    <div class="package-basic">
                      <h4 class="package-title">{{ pkg.packageName }}</h4>
                      <p class="package-desc">{{ pkg.packageDesc }}</p>
                      <div class="package-validity">
                        有效期：{{ formatAccessValidDays(getTargetAccessValidDays(pkg.packageId.toString())) }}
                      </div>
                    </div>
                  </div>
                  <div class="package-courses-wrapper">
                    <div class="courses-label">
                      <el-icon><Collection /></el-icon>
                      <span>包含课程 ({{ pkg.courses.length }})</span>
                    </div>
                    <div class="courses-sub-grid">
                      <div v-for="course in pkg.courses" :key="course.courseId" class="course-mini-card">
                        <!-- <el-tag :type="course.isRequired ? 'warning' : 'info'" size="small">
                          {{ course.isRequired ? '必修' : '选修' }}
                        </el-tag> -->
                        <span class="course-mini-name">{{ course.courseName }}</span>
                        <!-- <div class="course-mini-validity">
                          有效期：{{ formatAccessValidDays(getTargetAccessValidDays(course.courseId.toString())) }}
                        </div> -->
                      </div>
                    </div>
                  </div>
                  <el-divider v-if="index < items.length - 1" />
                </div>
              </div>

              <div class="course-access">
                <p><strong>类型：</strong>{{ targetType === 'package' ? '课程套餐' : '课程' }}</p>
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
                <p class="success-message">
                  您已成功获得{{ targetType === 'package' ? '课程套餐' : '课程' }}访问权限
                </p>

                <div class="success-summary">
                  <div class="summary-item">
                    <span class="summary-label">类型：</span>
                    <span class="summary-value">{{ targetType === 'package' ? '课程套餐' : '课程' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">数量：</span>
                    <span class="summary-value">{{ targetType === 'package' ? items.length + '个套餐' : items.length + '个课程' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">兑换码：</span>
                    <span class="summary-value">{{ codeInput }}</span>
                  </div>
                </div>

                <!-- 课程列表展示 -->
                <div class="success-items">
                  <h3 v-if="targetType === 'course'" class="success-section-title">已获得课程</h3>
                  <h3 v-else class="success-section-title">已获得套餐</h3>

                  <!-- 课程类型：简洁列表 -->
                  <div v-if="targetType === 'course'" class="success-courses-list">
                    <div v-for="item in items" :key="item.id" class="success-course-item">
                      <el-image :src="item.coverImage" fit="cover" class="success-course-cover" />
                      <div class="success-course-info">
                        <h4>{{ item.title }}</h4>
                        <span class="success-course-meta">{{ item.category }}</span>
                        <div class="success-course-validity">
                          有效期：{{ formatAccessValidDays(getTargetAccessValidDays(item.id)) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 套餐类型：展开显示所有课程 -->
                  <div v-else class="success-packages-list">
                    <div v-for="(pkg, pIndex) in items" :key="pIndex" class="success-package-item">
                      <div class="success-package-header">
                        <el-icon><Collection /></el-icon>
                        <span class="success-package-name">{{ pkg.packageName }}</span>
                        <div class="success-package-validity">
                          有效期：{{ formatAccessValidDays(getTargetAccessValidDays(pkg.packageId.toString())) }}
                        </div>
                        <el-tag size="small" type="info">{{ pkg.courses.length }}门课程</el-tag>
                      </div>
                      <div class="success-package-courses">
                        <div v-for="(course, cIndex) in pkg.courses" :key="cIndex" class="success-package-course">
                          <!-- <el-tag :type="course.isRequired ? 'warning' : 'info'" size="small">
                            {{ course.isRequired ? '必修' : '选修' }}
                          </el-tag> -->
                          <span>{{ course.courseName }}</span>
                          <!-- <div class="success-package-course-validity">
                            有效期：{{ formatAccessValidDays(getTargetAccessValidDays(course.courseId.toString())) }}
                          </div> -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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

    <!-- 课程选择对话框 -->
    <el-dialog
      v-model="courseSelectDialogVisible"
      title="选择要学习的课程"
      width="700px"
      destroy-on-close
      @closed="onCourseSelectDialogClosed"
    >
      <div class="course-select-content">
        <p class="select-tip">{{ selectTipText }}</p>
        <el-scrollbar max-height="500px">
          <div class="course-list-select">
            <div
              v-for="course in getAllAvailableCourses()"
              :key="course.id"
              class="course-item-select"
              @click="handleSelectCourse(course)"
            >
              <el-image :src="course.coverImage" fit="cover" class="select-course-cover" />
              <div class="select-course-info">
                <h4>{{ course.title }}</h4>
                <p v-if="course.packageName" class="select-course-package">{{ course.packageName }}</p>
                <div class="select-course-validity">
                  有效期：{{ formatAccessValidDays(getTargetAccessValidDays(course.id)) }}
                </div>
                <div v-if="course.isRequired !== undefined" class="select-course-optional">
                  <!-- <el-tag :type="course.isRequired ? 'warning' : 'info'" size="small">
                    {{ course.isRequired ? '必修' : '选修' }}
                  </el-tag> -->
                </div>
              </div>
              <el-icon class="select-arrow" color="#409eff"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>

    <!-- 套餐选择对话框 -->
    <el-dialog
      v-model="packageSelectDialogVisible"
      title="选择要学习的套餐"
      width="800px"
      destroy-on-close
      @closed="onPackageSelectDialogClosed"
    >
      <div class="package-select-content">
        <el-scrollbar max-height="500px">
          <div class="package-list-select">
            <div
              v-for="(pkg, index) in items"
              :key="index"
              class="package-item-select"
              @click="handleSelectPackage(pkg)"
            >
              <el-image :src="pkg.packageCover" fit="cover" class="select-package-cover" />
              <div class="select-package-info">
                <h4>{{ pkg.packageName }}</h4>
                <p class="select-package-desc">{{ pkg.packageDesc }}</p>
                <div class="select-package-meta">
                  <span class="select-package-validity">
                    有效期：{{ formatAccessValidDays(getTargetAccessValidDays(pkg.packageId.toString())) }}
                  </span>
                  <el-tag size="small" type="info">{{ pkg.courses.length }}门课程</el-tag>
                </div>
                <div class="select-package-courses">
                  <div v-for="(course, cIndex) in pkg.courses" :key="cIndex" class="package-course-mini">
                    <!-- <el-tag :type="course.isRequired ? 'warning' : 'info'" size="small">
                      {{ course.isRequired ? '必修' : '选修' }}
                    </el-tag> -->
                    <span class="package-course-name">{{ course.courseName }}</span>
                  </div>
                </div>
              </div>
              <el-icon class="select-arrow" color="#409eff"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <el-button @click="packageSelectDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
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

// Course Card Header
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 20px;
    color: $text-color-primary;
  }

  .item-count {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

// Course Detail - Grid Layout
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-large;
  margin-bottom: $spacing-large;
}

.course-card-item {
  border: 1px solid $border-color-light;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-light;
    border-color: $--el-color-primary;
  }

  .item-cover {
    width: 100%;
    height: 180px;
  }

  .item-info {
    padding: $spacing-base;

    .item-title {
      font-size: 16px;
      color: $text-color-primary;
      margin: 0 0 $spacing-small 0;
      font-weight: 600;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: $spacing-small;

      .separator {
        color: $text-color-secondary;
      }
    }
  }
}

// Package Detail - List Layout
.packages-list {
  margin-bottom: $spacing-large;
}

.package-item {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}

.package-header {
  display: flex;
  gap: $spacing-large;
  margin-bottom: $spacing-base;

  .package-cover {
    width: 240px;
    height: 160px;
    border-radius: $border-radius-base;
    flex-shrink: 0;
  }

  .package-basic {
    flex: 1;

    .package-title {
      font-size: 20px;
      color: $text-color-primary;
      margin: 0 0 $spacing-small 0;
      font-weight: 600;
    }

    .package-desc {
      font-size: $font-size-base;
      line-height: 1.6;
      color: $text-color-regular;
      margin: 0;
    }
  }
}

.package-courses-wrapper {
  margin-top: $spacing-large;
  padding: $spacing-large;
  background: $background-color-light;
  border-radius: $border-radius-base;

  .courses-label {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    margin-bottom: $spacing-base;
    font-size: 16px;
    font-weight: 600;
    color: $text-color-primary;

    .el-icon {
      color: $--el-color-primary;
    }
  }

  .courses-sub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $spacing-small;
  }

  .course-mini-card {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    padding: $spacing-small;
    background: #fff;
    border-radius: $border-radius-small;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
    }

    .course-mini-name {
      flex: 1;
      font-size: $font-size-small;
      color: $text-color-regular;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// Course Access
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

    .success-summary {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: $spacing-large;
      margin-bottom: $spacing-extra-large;
      padding: $spacing-large;
      background: $background-color-light;
      border-radius: $border-radius-base;

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: $spacing-small;

        .summary-label {
          font-size: $font-size-small;
          color: $text-color-secondary;
        }

        .summary-value {
          font-size: $font-size-base;
          font-weight: 600;
          color: $text-color-primary;
        }
      }
    }

    .success-items {
      text-align: left;
      margin-bottom: $spacing-extra-large;

      .success-section-title {
        font-size: 18px;
        color: $text-color-primary;
        margin: 0 0 $spacing-large 0;
        text-align: center;
      }

      .success-courses-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: $spacing-base;
      }

      .success-course-item {
        display: flex;
        gap: $spacing-base;
        padding: $spacing-base;
        background: $background-color-light;
        border-radius: $border-radius-base;
        align-items: center;

        .success-course-cover {
          width: 80px;
          height: 60px;
          border-radius: $border-radius-small;
          flex-shrink: 0;
        }

        .success-course-info {
          flex: 1;
          overflow: hidden;

          h4 {
            font-size: 14px;
            color: $text-color-primary;
            margin: 0 0 $spacing-small 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .success-course-meta {
            font-size: $font-size-small;
            color: $text-color-secondary;
          }
        }
      }

      .success-packages-list {
        display: flex;
        flex-direction: column;
        gap: $spacing-large;
      }

      .success-package-item {
        border: 1px solid $border-color-light;
        border-radius: $border-radius-base;
        overflow: hidden;

        .success-package-header {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          padding: $spacing-base $spacing-large;
          background: #ecf5ff;

          .success-package-name {
            flex: 1;
            font-size: 16px;
            font-weight: 600;
            color: $text-color-primary;
          }
        }

        .success-package-courses {
          padding: $spacing-large;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: $spacing-small;
        }

        .success-package-course {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          padding: $spacing-small;
          font-size: $font-size-small;
          color: $text-color-regular;
        }
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

// Course Select Dialog
.course-select-content {
  .select-tip {
    text-align: center;
    color: $text-color-secondary;
    margin-bottom: $spacing-large;
  }

  .course-list-select {
    .course-item-select {
      display: flex;
      gap: $spacing-base;
      padding: $spacing-base;
      border-radius: $border-radius-base;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: $background-color-light;
        transform: translateX(4px);
      }

      .select-course-cover {
        width: 100px;
        height: 70px;
        border-radius: $border-radius-small;
        flex-shrink: 0;
      }

      .select-course-info {
        flex: 1;
        overflow: hidden;

        h4 {
          font-size: 15px;
          color: $text-color-primary;
          margin: 0 0 $spacing-small 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-course-package {
          font-size: $font-size-small;
          color: $text-color-secondary;
          margin: 0 0 $spacing-small 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-course-validity {
          margin-top: $spacing-small;
          font-size: $font-size-small;
          color: $text-color-secondary;
        }

        .select-course-optional {
          display: flex;
          align-items: center;
          gap: $spacing-small;
        }
      }

      .select-arrow {
        display: flex;
        align-items: center;
        font-size: 20px;
        flex-shrink: 0;
      }
    }
  }
}

// Course Validity Display
.item-validity {
  margin-top: $spacing-small;
  padding-top: $spacing-small;
  border-top: 1px solid $border-color-lighter;
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.package-validity {
  margin-top: $spacing-small;
  font-size: $font-size-base;
  color: $--el-color-primary;
  font-weight: 600;
}

.course-mini-validity {
  font-size: $font-size-extra-small;
  color: $text-color-secondary;
  margin-top: $spacing-small;
}

// Package Select Dialog
.package-select-content {
  .package-list-select {
    .package-item-select {
      display: flex;
      gap: $spacing-large;
      padding: $spacing-base;
      border-radius: $border-radius-base;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: $background-color-light;
        transform: translateX(4px);
      }

      .select-package-cover {
        width: 120px;
        height: 80px;
        border-radius: $border-radius-base;
        flex-shrink: 0;
      }

      .select-package-info {
        flex: 1;
        overflow: hidden;

        h4 {
          font-size: 16px;
          color: $text-color-primary;
          margin: 0 0 $spacing-small 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-package-desc {
          font-size: $font-size-small;
          color: $text-color-secondary;
          margin: 0 0 $spacing-base 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-package-meta {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          margin-top: $spacing-small;
        }

        .select-package-validity {
          font-size: $font-size-small;
          color: $text-color-secondary;
        }

        .select-package-courses {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: $spacing-small;
          margin-top: $spacing-base;
        }

        .package-course-mini {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          font-size: $font-size-small;
          color: $text-color-regular;
        }

        .package-course-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .select-arrow {
        display: flex;
        align-items: center;
        font-size: 20px;
        flex-shrink: 0;
      }
    }
  }
}

// Success Page Validity Display
.success-course-validity,
.success-package-validity,
.success-package-course-validity {
  margin-top: $spacing-small;
  font-size: $font-size-small;
  color: $text-color-secondary;
}

// Dialog Footer
.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: $spacing-base;
}
</style>
