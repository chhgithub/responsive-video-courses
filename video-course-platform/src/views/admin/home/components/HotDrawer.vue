<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getHotTopicById, addHotTopic, updateHotTopic, type HotTopic } from '@/utils/news-storage';

interface Props {
  id?: string;
  visible: boolean;
}

interface Emits {
  (e: 'submit'): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);

// 表单数据
const formData = ref({
  title: '',
  content: '',
  createdAt: '',
  orderNum: 0,
  isActive: false,
});

// 是否为编辑模式
const isEdit = computed(() => !!props.id);

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入热点标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应为 2-100 个字符', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入热点内容', trigger: 'blur' },
    { min: 5, max: 500, message: '内容长度应为 5-500 个字符', trigger: 'blur' },
  ],
  createdAt: [{ required: true, message: '请选择创建时间', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
};

// 监听visible变化，加载数据
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.id) {
        // 编辑模式，加载数据
        const data = getHotTopicById(props.id);
        if (data) {
          formData.value = {
            title: data.title,
            content: data.content || '',
            createdAt: data.createdAt,
            orderNum: data.orderNum,
            isActive: data.isActive,
          };
        }
      } else {
        // 新增模式，重置表单
        resetForm();
      }
    }
  },
);

// 重置表单
function resetForm() {
  formData.value = {
    title: '',
    content: '',
    createdAt: new Date().toISOString().split('T')[0],
    orderNum: 0,
    isActive: false,
  };
  formRef.value?.resetFields();
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const submitData = {
      ...formData.value,
      link: '',
      coverImage: '',
    };

    if (props.id) {
      updateHotTopic(props.id, submitData);
      ElMessage.success('更新成功');
    } else {
      addHotTopic(submitData);
      ElMessage.success('新增成功');
    }

    emit('submit');
    handleClose();
  } catch (error) {
    console.error('表单验证失败:', error);
    ElMessage.error('请检查表单内容');
  } finally {
    loading.value = false;
  }
}

// 关闭抽屉
function handleClose() {
  resetForm();
  emit('close');
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="isEdit ? '编辑热点' : '新增热点'"
    size="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="热点标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入热点标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="热点内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请输入热点内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="发布时间" prop="createdAt">
        <el-date-picker
          v-model="formData.createdAt"
          type="date"
          placeholder="请选择发布时间"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="排序" prop="orderNum">
        <el-input-number
          v-model="formData.orderNum"
          :min="0"
          :step="1"
          placeholder="数字越小越靠前"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="isActive">
        <el-switch
          v-model="formData.isActive"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
