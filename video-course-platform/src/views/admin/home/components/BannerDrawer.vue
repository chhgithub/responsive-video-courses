<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getBannerById, addBanner, updateBanner, type Banner } from '@/utils/banner-storage';

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
  link: '',
  orderNum: 0,
  status: '1',
});

// 上传的图片URL
const uploadedImageUrl = ref('');

// 上传组件引用
const uploadRef = ref();

// 是否为编辑模式
const isEdit = computed(() => !!props.id);

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入 Banner 标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度应为 2-50 个字符', trigger: 'blur' },
  ],
  orderNum: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序号不能小于0', trigger: 'blur' },
  ],
};

// 监听 visible 变化，打开时加载数据
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.id) {
        // 编辑模式：加载数据
        const banner = getBannerById(props.id);
        if (banner) {
          formData.value = {
            title: banner.title,
            link: banner.link || '',
            orderNum: banner.orderNum,
            status: banner.status,
          };
          uploadedImageUrl.value = banner.imageUrl;
        }
      } else {
        // 新增模式：重置表单
        resetForm();
      }
    }
  }
);

// 图片上传前验证
function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return false;
  }

  return true;
}

// 自定义上传处理（转换为base64）
function handleUpload(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageUrl.value = e.target?.result as string;
    ElMessage.success('图片上传成功');
  };
  reader.onerror = () => {
    ElMessage.error('图片上传失败');
  };
  reader.readAsDataURL(file);
  return false; // 阻止自动上传
}

// 删除图片
function handleRemoveImage() {
  uploadedImageUrl.value = '';
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (!uploadedImageUrl.value) {
      ElMessage.error('请上传 Banner 图片');
      return;
    }

    loading.value = true;

    const data = {
      title: formData.value.title,
      link: formData.value.link,
      imageUrl: uploadedImageUrl.value,
      orderNum: formData.value.orderNum,
      status: formData.value.status,
    };

    if (isEdit.value) {
      updateBanner(props.id!, data);
      ElMessage.success('更新成功');
    } else {
      addBanner(data);
      ElMessage.success('新增成功');
    }

    emit('submit');
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

// 关闭抽屉
function handleClose() {
  emit('close');
}

// 重置表单
function resetForm() {
  formData.value = {
    title: '',
    link: '',
    orderNum: 0,
    status: '1',
  };
  uploadedImageUrl.value = '';
  formRef.value?.resetFields();
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="isEdit ? '编辑 Banner' : '新增 Banner'"
    size="600px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <!-- Banner 标题 -->
      <el-form-item label="Banner 标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入 Banner 标题"
          maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>

      <!-- Banner 图片 -->
      <el-form-item label="Banner 图片" required>
        <el-upload
          ref="uploadRef"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="({ file }) => handleUpload(file as File)"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          drag
        >
          <div v-if="!uploadedImageUrl" class="upload-placeholder">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <p>拖拽图片到此处或<em>点击上传</em></p>
              <p class="upload-hint">支持 jpg、png、gif 格式，大小不超过 5MB</p>
            </div>
          </div>
          <div v-else class="uploaded-image">
            <img :src="uploadedImageUrl" alt="Banner 预览" />
            <div class="image-mask">
              <el-icon @click.stop="handleRemoveImage"><Delete /></el-icon>
            </div>
          </div>
        </el-upload>
      </el-form-item>

      <!-- 跳转链接 -->
      <el-form-item label="跳转链接">
        <el-input
          v-model="formData.link"
          placeholder="请输入跳转链接（可选）"
          clearable
        >
          <template #prepend>https://</template>
        </el-input>
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="orderNum">
        <el-input-number
          v-model="formData.orderNum"
          :min="0"
          :step="1"
          placeholder="数字越小越靠前"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态">
        <el-radio-group v-model="formData.status">
          <el-radio label="1">启用</el-radio>
          <el-radio label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.upload-placeholder {
  padding: $spacing-extra-large;
  text-align: center;

  .upload-icon {
    font-size: 48px;
    color: $text-color-placeholder;
    margin-bottom: $spacing-base;
  }

  .upload-text {
    p {
      margin: $spacing-small 0;
      font-size: $font-size-base;
      color: $text-color-primary;

      em {
        color: #409eff;
        font-style: normal;
      }
    }

    .upload-hint {
      font-size: $font-size-small;
      color: $text-color-placeholder;
    }
  }
}

.uploaded-image {
  position: relative;
  width: 100%;
  height: 200px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: $border-radius-base;
  }

  .image-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: $transition-base;
    border-radius: $border-radius-base;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    .el-icon {
      font-size: 32px;
      color: #fff;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
}

:deep(.el-upload-dragger) {
  padding: 0;
  width: 100%;
  height: 200px;
  border: 1px dashed $border-color-base;
  border-radius: $border-radius-base;

  &:hover {
    border-color: #409eff;
  }
}
</style>
