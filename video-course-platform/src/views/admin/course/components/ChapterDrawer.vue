<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  id?: string;
  visible: boolean;
}

interface Emits {
  (e: 'success'): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);

// 表单数据
const formData = ref({
  chapterName: '',
  chapterOrder: 0,
});

// 是否为编辑模式
const isEdit = computed(() => !!props.id);

// 表单验证规则
const rules: FormRules = {
  chapterName: [
    { required: true, message: '请输入章节名称', trigger: 'blur' },
    { min: 2, max: 50, message: '章节名称长度应为 2-50 个字符', trigger: 'blur' },
  ],
  chapterOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
};

// 监听visible变化，加载数据
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.id) {
        // 编辑模式，加载数据
        // TODO: 从课程数据中查找章节
        loading.value = true;
        setTimeout(() => {
          formData.value = {
            chapterName: '示例章节',
            chapterOrder: 1,
          };
          loading.value = false;
        }, 300);
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
    chapterName: '',
    chapterOrder: 0,
  };
  formRef.value?.resetFields();
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // TODO: 调用API保存章节
    await new Promise((resolve) => setTimeout(resolve, 500));

    ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    emit('success');
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
    :title="isEdit ? '编辑章节' : '添加章节'"
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
      <el-form-item label="章节名称" prop="chapterName">
        <el-input
          v-model="formData.chapterName"
          placeholder="请输入章节名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="排序号" prop="chapterOrder">
        <el-input-number
          v-model="formData.chapterOrder"
          :min="0"
          :step="1"
          placeholder="数字越小越靠前"
          style="width: 100%"
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
@import '@/assets/styles/variables.scss';

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
