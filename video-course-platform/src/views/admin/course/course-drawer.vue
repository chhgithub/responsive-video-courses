<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  mode: 'add' | 'edit';
  courseId?: number;
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

const drawerTitle = computed(() => (props.mode === 'add' ? '新增课程' : '编辑课程'));

const loading = ref(false);
const formRef = ref();

const formData = ref({
  courseName: '',
  categoryId: undefined as number | undefined,
  teacherIds: [] as number[],
  courseType: 'paid',
  difficulty: 'beginner',
  price: 0,
  originalPrice: undefined as number | undefined,
  isFree: false,
  isTrial: false,
  trialDuration: 0,
  validDays: 0,
  courseCover: '',
  courseIntro: '',
  sortOrder: 0,
  status: 'draft',
});

const formRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择课程分类', trigger: 'change' }],
  courseCover: [{ required: true, message: '请上传课程封面', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 分类选项
const categoryOptions = ref<any[]>([]);
// 讲师选项
const teacherOptions = ref<any[]>([]);

const courseTypes = [
  { label: '微课程', value: 'micro' },
  { label: '公益课程', value: 'public' },
  { label: '付费课程', value: 'paid' },
  { label: '科研赋能', value: 'research' },
  { label: 'K12集训', value: 'k12' },
  { label: '成人集训', value: 'adult' },
];

const difficulties = [
  { label: '初级', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
];

const statuses = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已下架', value: 'offline' },
];

async function loadOptions() {
  // 模拟加载选项数据
  categoryOptions.value = [
    { categoryId: 1, categoryName: '前端开发' },
    { categoryId: 2, categoryName: '后端开发' },
    { categoryId: 3, categoryName: '人工智能' },
    { categoryId: 4, categoryName: '数据分析' },
    { categoryId: 5, categoryName: '产品设计' },
  ];
  teacherOptions.value = [
    { teacherId: 1, teacherName: '张老师' },
    { teacherId: 2, teacherName: '李老师' },
    { teacherId: 3, teacherName: '王老师' },
    { teacherId: 4, teacherName: '赵老师' },
    { teacherId: 5, teacherName: '刘老师' },
    { teacherId: 6, teacherName: '陈老师' },
  ];
}

async function loadCourseData() {
  if (props.mode === 'edit' && props.courseId) {
    loading.value = true;
    try {
      // 模拟加载课程数据
      await new Promise(resolve => setTimeout(resolve, 300));
      formData.value = {
        courseName: `课程 ${props.courseId} - 实战教程`,
        categoryId: 1,
        teacherIds: [1],
        courseType: 'paid',
        difficulty: 'intermediate',
        price: 199,
        originalPrice: 299,
        isFree: false,
        isTrial: true,
        trialDuration: 120,
        validDays: 365,
        courseCover: `https://picsum.photos/seed/course${props.courseId}/300/200`,
        courseIntro: '这是一门精彩的课程',
        sortOrder: 0,
        status: 'published',
      };
    } finally {
      loading.value = false;
    }
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    loading.value = true;

    // 根据选中的讲师ID查找对应的讲师名称
    const teacherNames = formData.value.teacherIds?.length
      ? teacherOptions.value
          .filter((t) => formData.value.teacherIds?.includes(t.teacherId))
          .map((t) => t.teacherName)
      : [];

    console.log('提交的数据:', {
      ...formData.value,
      teacherNames,
    });

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 500));

    ElMessage.success(props.mode === 'add' ? '新增成功' : '编辑成功');
    emit('success');
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

function handleClosed() {
  formRef.value?.resetFields();
  formData.value = {
    courseName: '',
    categoryId: undefined,
    teacherIds: [],
    courseType: 'paid',
    difficulty: 'beginner',
    price: 0,
    originalPrice: undefined,
    isFree: false,
    isTrial: false,
    trialDuration: 0,
    validDays: 0,
    courseCover: '',
    courseIntro: '',
    sortOrder: 0,
    status: 'draft',
  };
}

watch(
  () => props.modelValue,
  async (visible) => {
    if (visible) {
      await loadOptions();
      await loadCourseData();
    }
  }
);
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerTitle"
    direction="rtl"
    size="600px"
    @closed="handleClosed"
  >
    <el-form
      v-loading="loading"
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
      </el-form-item>

      <el-form-item label="课程分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择课程分类" style="width: 100%">
          <el-option
            v-for="cat in categoryOptions"
            :key="cat.categoryId"
            :label="cat.categoryName"
            :value="cat.categoryId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="讲师">
        <el-select
          v-model="formData.teacherIds"
          placeholder="请选择讲师（可多选）"
          multiple
          collapse-tags
          collapse-tags-tooltip
          style="width: 100%"
        >
          <el-option
            v-for="teacher in teacherOptions"
            :key="teacher.teacherId"
            :label="teacher.teacherName"
            :value="teacher.teacherId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="课程类型" prop="courseType">
        <el-select v-model="formData.courseType" placeholder="请选择课程类型" style="width: 100%">
          <el-option
            v-for="type in courseTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="难度等级" prop="difficulty">
        <el-select v-model="formData.difficulty" placeholder="请选择难度等级" style="width: 100%">
          <el-option
            v-for="level in difficulties"
            :key="level.value"
            :label="level.label"
            :value="level.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="价格" prop="price">
        <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>

      <el-form-item label="原价" prop="originalPrice">
        <el-input-number
          v-model="formData.originalPrice"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="免费课程" prop="isFree">
        <el-switch v-model="formData.isFree" active-text="是" inactive-text="否" />
      </el-form-item>

      <!-- <el-form-item label="可试看" prop="isTrial">
        <el-switch v-model="formData.isTrial" active-text="是" inactive-text="否" />
      </el-form-item> -->

      <el-form-item v-if="formData.isTrial" label="试看时长" prop="trialDuration">
        <el-input-number
          v-model="formData.trialDuration"
          :min="0"
          placeholder="试看时长（秒）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="有效期（天）" prop="validDays">
        <el-input-number
          v-model="formData.validDays"
          :min="0"
          placeholder="0表示永久"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="课程封面" prop="courseCover">
        <el-input v-model="formData.courseCover" placeholder="请输入课程封面URL" />
      </el-form-item>

      <el-form-item label="课程简介" prop="courseIntro">
        <el-input
          v-model="formData.courseIntro"
          type="textarea"
          :rows="3"
          placeholder="请输入课程简介"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="status in statuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
}
</style>
