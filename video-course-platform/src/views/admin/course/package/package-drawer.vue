<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { CoursePackage, PackageCourse } from '@/utils/course-package-storage';
import {
  calculateOriginalPrice,
  calculateDiscount,
  calculateSavings,
} from '@/utils/course-package-storage';

interface Props {
  modelValue: boolean;
  mode: 'add' | 'edit';
  packageId?: number;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const drawerTitle = computed(() => (props.mode === 'add' ? '新建套餐' : '编辑套餐'));

const loading = ref(false);
const formRef = ref();

// Mock 课程数据（用于原型演示）
interface Course {
  courseId: number;
  courseName: string;
  courseCover: string;
  teacherName: string;
  price: number;
}

const mockCourses: Course[] = [
  {
    courseId: 1,
    courseName: 'Vue3 从入门到精通',
    courseCover: 'https://picsum.photos/seed/course1/300/200',
    teacherName: '张老师',
    price: 199,
  },
  {
    courseId: 2,
    courseName: 'React 实战开发',
    courseCover: 'https://picsum.photos/seed/course2/300/200',
    teacherName: '李老师',
    price: 299,
  },
  {
    courseId: 3,
    courseName: 'Node.js 后端开发',
    courseCover: 'https://picsum.photos/seed/course3/300/200',
    teacherName: '王老师',
    price: 399,
  },
  {
    courseId: 4,
    courseName: 'Python 数据分析',
    courseCover: 'https://picsum.photos/seed/course4/300/200',
    teacherName: '赵老师',
    price: 499,
  },
  {
    courseId: 5,
    courseName: 'UI/UX 设计基础',
    courseCover: 'https://picsum.photos/seed/course5/300/200',
    teacherName: '刘老师',
    price: 199,
  },
  {
    courseId: 6,
    courseName: '人工智能入门',
    courseCover: 'https://picsum.photos/seed/course6/300/200',
    teacherName: '陈老师',
    price: 599,
  },
];

// 所有课程列表
const allCourses = ref<Course[]>(mockCourses);

// 选中的课程
const selectedCourses = ref<PackageCourse[]>([]);

// 表单数据
const formData = ref({
  packageName: '',
  packageDesc: '',
  packageCover: '',
  price: 0,
  originalPrice: 0,
  discount: 0,
  validDays: 0,
  isPermanent: true,
  isTrial: false,
  trialDays: 0,
  status: 'draft' as 'draft' | 'published' | 'offline',
  sortOrder: 0,
});

const formRules = {
  packageName: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  packageDesc: [{ required: true, message: '请输入套餐描述', trigger: 'blur' }],
  packageCover: [{ required: true, message: '请输入套餐封面URL', trigger: 'blur' }],
  price: [{ required: true, message: '请输入套餐价格', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 计算原价总和
const calculatedOriginalPrice = computed(() => {
  return calculateOriginalPrice(selectedCourses.value);
});

// 计算折扣
const calculatedDiscount = computed(() => {
  return calculateDiscount(formData.value.price, calculatedOriginalPrice.value);
});

// 计算节省金额
const calculatedSavings = computed(() => {
  return calculateSavings(formData.value.price, calculatedOriginalPrice.value);
});

// 可选课程列表（未选中的）
const availableCourses = computed(() => {
  const selectedIds = selectedCourses.value.map((c) => c.courseId);
  return allCourses.value.filter((c) => !selectedIds.includes(c.courseId));
});

// 监听套餐价格变化，自动更新原价
watch(
  () => selectedCourses.value,
  (courses) => {
    formData.value.originalPrice = calculateOriginalPrice(courses);
    formData.value.discount = calculateDiscount(formData.value.price, formData.value.originalPrice);
  },
  { deep: true }
);

// 监听套餐价格变化
watch(
  () => formData.value.price,
  (price) => {
    formData.value.discount = calculateDiscount(price, formData.value.originalPrice);
  }
);

async function loadOptions() {
  // 原型演示：直接使用 mock 数据
  allCourses.value = mockCourses;
  console.log('加载 mock 课程数据，共', allCourses.value.length, '门课程');
}

async function loadPackageData() {
  if (props.mode === 'edit' && props.packageId) {
    loading.value = true;
    try {
      // TODO: 从存储加载套餐数据
      await new Promise((resolve) => setTimeout(resolve, 300));
      // 临时使用mock数据
      formData.value = {
        packageName: 'Vue全栈开发套餐',
        packageDesc: '从Vue3基础到Node.js后端',
        packageCover: 'https://picsum.photos/seed/pkg1/400/300',
        price: 499,
        originalPrice: 797,
        discount: 37.4,
        validDays: 365,
        isPermanent: false,
        isTrial: true,
        trialDays: 7,
        status: 'published',
        sortOrder: 1,
      };
      // 加载包含的课程
      selectedCourses.value = [
        {
          packageId: props.packageId,
          courseId: 1,
          courseName: 'Vue3 从入门到精通',
          courseCover: 'https://picsum.photos/seed/course1/300/200',
          teacherName: '张老师',
          originalPrice: 199,
          isRequired: true,
          sortOrder: 1,
        },
      ];
    } finally {
      loading.value = false;
    }
  }
}

// 添加课程到套餐
function handleAddCourse(course: Course) {
  const maxSort = selectedCourses.value.reduce((max, c) => Math.max(max, c.sortOrder), 0);
  selectedCourses.value.push({
    packageId: props.packageId || 0,
    courseId: course.courseId,
    courseName: course.courseName,
    courseCover: course.courseCover,
    teacherName: course.teacherName,
    originalPrice: course.price,
    isRequired: true,
    sortOrder: maxSort + 1,
  });
  console.log('添加课程:', course.courseName, '当前已选:', selectedCourses.value.length, '门');
}

// 移除课程
function handleRemoveCourse(courseId: number) {
  const course = selectedCourses.value.find((c) => c.courseId === courseId);
  selectedCourses.value = selectedCourses.value.filter((c) => c.courseId !== courseId);
  // 重新排序
  selectedCourses.value.forEach((c, index) => {
    c.sortOrder = index + 1;
  });
  console.log('移除课程:', course?.courseName, '剩余:', selectedCourses.value.length, '门');
}

// 切换必修/选修
function handleToggleRequired(course: PackageCourse) {
  course.isRequired = !course.isRequired;
}

// 上移课程
function handleMoveUp(course: PackageCourse) {
  const index = selectedCourses.value.findIndex((c) => c.courseId === course.courseId);
  if (index > 0) {
    const temp = selectedCourses.value[index - 1];
    selectedCourses.value[index - 1] = selectedCourses.value[index];
    selectedCourses.value[index] = temp;
    // 更新排序号
    selectedCourses.value[index - 1].sortOrder = index;
    selectedCourses.value[index].sortOrder = index + 1;
  }
}

// 下移课程
function handleMoveDown(course: PackageCourse) {
  const index = selectedCourses.value.findIndex((c) => c.courseId === course.courseId);
  if (index < selectedCourses.value.length - 1) {
    const temp = selectedCourses.value[index + 1];
    selectedCourses.value[index + 1] = selectedCourses.value[index];
    selectedCourses.value[index] = temp;
    // 更新排序号
    selectedCourses.value[index + 1].sortOrder = index + 1;
    selectedCourses.value[index].sortOrder = index;
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    loading.value = true;

    // 构建套餐数据
    const packageData: Omit<CoursePackage, 'packageId'> = {
      packageName: formData.value.packageName,
      packageDesc: formData.value.packageDesc,
      packageCover: formData.value.packageCover,
      price: formData.value.price,
      originalPrice: formData.value.originalPrice,
      discount: formData.value.discount,
      validDays: formData.value.isPermanent ? 0 : formData.value.validDays,
      isTrial: formData.value.isTrial,
      trialDays: formData.value.trialDays,
      status: formData.value.status,
      courses: selectedCourses.value.map((c, index) => ({
        ...c,
        sortOrder: index + 1,
      })),
      enrollCount: 0,
      rating: 0,
      reviewCount: 0,
      sortOrder: formData.value.sortOrder,
      createTime: new Date().toISOString().split('T')[0],
    };

    // TODO: 调用API保存套餐
    await new Promise((resolve) => setTimeout(resolve, 500));

    ElMessage.success(props.mode === 'add' ? '新建成功' : '编辑成功');
    emit('success');
    drawerVisible.value = false;
  } catch (error) {
    console.error('表单验证失败:', error);
    ElMessage.error('请检查表单内容');
  } finally {
    loading.value = false;
  }
}

function handleClosed() {
  formRef.value?.resetFields();
  formData.value = {
    packageName: '',
    packageDesc: '',
    packageCover: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    validDays: 0,
    isPermanent: true,
    isTrial: false,
    trialDays: 0,
    status: 'draft',
    sortOrder: 0,
  };
  selectedCourses.value = [];
}

watch(
  () => props.modelValue,
  async (visible) => {
    if (visible) {
      await loadOptions();
      await loadPackageData();
    }
  }
);
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerTitle"
    direction="rtl"
    size="700px"
    @closed="handleClosed"
  >
    <el-form
      v-loading="loading"
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>

        <el-form-item label="套餐名称" prop="packageName">
          <el-input
            v-model="formData.packageName"
            placeholder="请输入套餐名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="套餐描述" prop="packageDesc">
          <el-input
            v-model="formData.packageDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入套餐描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="封面图片" prop="packageCover">
          <el-input
            v-model="formData.packageCover"
            placeholder="请输入封面图片URL"
          />
        </el-form-item>

        <el-form-item label="有效期" prop="validDays">
          <div class="validity-setting">
            <el-radio-group v-model="formData.isPermanent">
              <el-radio :label="true">永久有效</el-radio>
              <el-radio :label="false">有限期</el-radio>
            </el-radio-group>
            <el-input-number
              v-if="!formData.isPermanent"
              v-model="formData.validDays"
              :min="1"
              placeholder="天数"
              style="width: 150px; margin-left: 12px"
            />
          </div>
        </el-form-item>
      </div>

      <!-- 价格设置 -->
      <div class="form-section">
        <div class="section-title">价格设置</div>

        <el-form-item label="套餐价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="unit">元</span>
        </el-form-item>

        <div class="price-info">
          <div class="info-item">
            <span class="label">原价总和：</span>
            <span class="value">¥{{ calculatedOriginalPrice }}</span>
          </div>
          <div class="info-item">
            <span class="label">折扣：</span>
            <span class="value discount">{{ calculatedDiscount }}%</span>
          </div>
          <div class="info-item">
            <span class="label">节省：</span>
            <span class="value savings">¥{{ calculatedSavings }}</span>
          </div>
        </div>
      </div>

      <!-- 包含课程 -->
      <div class="form-section">
        <div class="section-title">包含课程 ({{ selectedCourses.length }}门)</div>

        <div class="courses-selector">
          <!-- 可选课程 -->
          <div class="available-courses">
            <div class="courses-header">可选课程</div>
            <div class="courses-list">
              <div
                v-for="course in availableCourses"
                :key="course.courseId"
                class="course-card"
                @click="handleAddCourse(course)"
              >
                <el-image :src="course.courseCover" fit="cover" class="course-cover" lazy />
                <div class="course-info">
                  <div class="course-name">{{ course.courseName }}</div>
                  <div class="course-meta">
                    <span>{{ course.teacherName }}</span>
                    <span>¥{{ course.price }}</span>
                  </div>
                </div>
                <el-icon class="add-icon"><Plus /></el-icon>
              </div>
            </div>
            <el-empty v-if="availableCourses.length === 0" description="已全部添加" :image-size="60" />
          </div>

          <!-- 已选课程 -->
          <div class="selected-courses">
            <div class="courses-header">已选课程</div>
            <div class="courses-list">
              <div
                v-for="course in selectedCourses"
                :key="course.courseId"
                class="course-card selected"
              >
                <el-image :src="course.courseCover" fit="cover" class="course-cover" lazy />
                <div class="course-info">
                  <div class="course-name">{{ course.courseName }}</div>
                  <div class="course-meta">
                    <span>{{ course.teacherName }}</span>
                    <span>¥{{ course.originalPrice }}</span>
                    <el-tag size="small" :type="course.isRequired ? 'primary' : 'info'">
                      {{ course.isRequired ? '必修' : '选修' }}
                    </el-tag>
                  </div>
                </div>
                <div class="course-actions">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="handleToggleRequired(course)"
                  >
                    {{ course.isRequired ? '设为选修' : '设为必修' }}
                  </el-button>
                  <el-button link type="danger" size="small" @click="handleRemoveCourse(course.courseId)">
                    移除
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-if="selectedCourses.length === 0" description="暂未添加课程" :image-size="60" />
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="form-section">
        <div class="section-title">其他设置</div>

        <el-form-item label="试听">
          <div class="trial-setting">
            <el-switch v-model="formData.isTrial" />
            <span v-if="formData.isTrial" style="margin-left: 12px">
              试听
              <el-input-number
                v-model="formData.trialDays"
                :min="1"
                :max="30"
                style="width: 100px; margin: 0 8px"
              />
              天
            </span>
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="上架" value="published" />
            <el-option label="下架" value="offline" />
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">

.form-section {
  margin-bottom: $spacing-large;
  padding-bottom: $spacing-large;
  border-bottom: 1px solid $border-color-lighter;

  &:last-child {
    border-bottom: none;
  }
}

.section-title {
  font-size: $font-size-medium;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-large;
}

.unit {
  margin-left: $spacing-small;
  color: $text-color-secondary;
}

.validity-setting {
  display: flex;
  align-items: center;
}

.price-info {
  display: flex;
  gap: $spacing-large;
  padding: $spacing-base;
  background: $background-color-base;
  border-radius: $border-radius-base;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: $font-size-small;
      color: $text-color-secondary;
    }

    .value {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;

      &.discount {
        color: #f56c6c;
      }

      &.savings {
        color: #67c23a;
      }
    }
  }
}

.courses-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-base;
}

.courses-header {
  font-size: $font-size-medium;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: $spacing-base;
}

.courses-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  padding: $spacing-small;
}

.course-card {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  padding: $spacing-small;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-small;
  margin-bottom: $spacing-small;
  cursor: pointer;
  transition: $transition-base;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover:not(.selected) {
    border-color: #409eff;
    background: #ecf5ff;
  }

  &.selected {
    cursor: default;
  }
}

.course-cover {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  flex-shrink: 0;
}

.course-info {
  flex: 1;
  min-width: 0;

  .course-name {
    font-size: $font-size-small;
    font-weight: 500;
    color: $text-color-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
  }

  .course-meta {
    display: flex;
    gap: $spacing-small;
    font-size: $font-size-extra-small;
    color: $text-color-secondary;
  }
}

.add-icon {
  color: #409eff;
  font-size: 20px;
  flex-shrink: 0;
}

.course-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.trial-setting {
  display: flex;
  align-items: center;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
