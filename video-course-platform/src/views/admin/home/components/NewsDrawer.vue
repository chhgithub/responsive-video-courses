<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { getNewsById, addNews, updateNews, type News } from '@/utils/news-storage';

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
  category: '新闻',
  content: '',
  publishTime: '',
  orderNum: 0,
  isActive: true,
});

// 上传组件引用
const uploadRef = ref();

// 是否为编辑模式
const isEdit = computed(() => !!props.id);

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应为 2-100 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  publishTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
};

// 分类选项
const categoryOptions = ['新闻', '公告', '通知', '活动'];

// 监听visible变化，加载数据
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.id) {
        // 编辑模式，加载数据
        const data = getNewsById(props.id);
        if (data) {
          formData.value = {
            title: data.title,
            category: data.category,
            content: data.content,
            publishTime: data.publishTime,
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
    category: '新闻',
    content: '',
    publishTime: '',
    orderNum: 0,
    isActive: true,
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
    };

    if (props.id) {
      updateNews(props.id, submitData);
      ElMessage.success('更新成功');
    } else {
      addNews(submitData);
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
    :title="isEdit ? '编辑资讯' : '新增资讯'"
    size="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
          <el-option
            v-for="item in categoryOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="发布时间" prop="publishTime">
        <el-date-picker
          v-model="formData.publishTime"
          type="date"
          placeholder="请选择发布时间"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="6"
          placeholder="请输入内容"
          maxlength="2000"
          show-word-limit
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
