<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

interface Props {
  modelValue: string; // base64 图片
  aspectRatio?: number; // 宽高比，如 16/9, 4/3, 1
  maxWidth?: number; // 最大宽度
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 0, // 0 表示自由裁剪
  maxWidth: 1920,
});

const emit = defineEmits<Emits>();

// 裁剪器实例
const cropper = ref<InstanceType<typeof VueCropper>>();

// 上传的文件
const uploadedFile = ref<File | null>(null);

// 上传图片前的预览
const previewUrl = ref('');

// 是否显示裁剪对话框
const showDialog = ref(false);

// 选择文件
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }

  // 验证文件大小（最大10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过10MB');
    return;
  }

  uploadedFile.value = file;

  // 读取文件预览
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
    showDialog.value = true;
  };
  reader.readAsDataURL(file);
}

// 确认裁剪
function handleConfirm() {
  if (!cropper.value) return;

  cropper.value.getCropData((data: string) => {
    emit('update:modelValue', data);
    showDialog.value = false;
    previewUrl.value = '';
    uploadedFile.value = null;
  });
}

// 取消裁剪
function handleCancel() {
  showDialog.value = false;
  previewUrl.value = '';
  uploadedFile.value = null;
  emit('cancel');
}

// 旋转
function handleRotate(deg: number) {
  cropper.value?.rotate(deg);
}

// 缩放
function handleZoom(scale: number) {
  cropper.value?.changeScale(scale);
}

// 重置
function handleRefresh() {
  cropper.value?.refresh();
}

// 暴露方法给父组件
defineExpose({
  handleFileSelect,
});
</script>

<template>
  <div class="image-cropper-wrapper">
    <!-- 当前图片预览 -->
    <div v-if="modelValue" class="current-image">
      <img :src="modelValue" alt="当前图片" />
      <div class="image-actions">
        <el-button type="primary" size="small" @click="() => ($refs.fileInput as any)?.click()">
          更换图片
        </el-button>
      </div>
    </div>

    <!-- 上传按钮 -->
    <el-upload
      v-else
      :show-file-list="false"
      :before-upload="() => false"
      accept="image/*"
      class="upload-area"
    >
      <el-button type="primary">
        <el-icon><Upload /></el-icon>
        上传图片
      </el-button>
    </el-upload>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 裁剪对话框 -->
    <el-dialog v-model="showDialog" title="裁剪图片" width="800px" :close-on-click-modal="false">
      <div class="cropper-container">
        <VueCropper
          ref="cropper"
          :img="previewUrl"
          :auto-crop="true"
          :auto-crop-width="200"
          :auto-crop-height="150"
          :fixed="props.aspectRatio > 0"
          :fixed-number="[props.aspectRatio, 1]"
          :center-box="true"
          :can-move="true"
          :can-move-box="true"
          :high="true"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div class="toolbar">
            <el-button size="small" @click="handleRotate(-90)">
              <el-icon><RefreshLeft /></el-icon>
              左旋转
            </el-button>
            <el-button size="small" @click="handleRotate(90)">
              <el-icon><RefreshRight /></el-icon>
              右旋转
            </el-button>
            <el-button size="small" @click="handleZoom(1)">
              <el-icon><ZoomIn /></el-icon>
              放大
            </el-button>
            <el-button size="small" @click="handleZoom(-1)">
              <el-icon><ZoomOut /></el-icon>
              缩小
            </el-button>
            <el-button size="small" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
          <div class="actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleConfirm">确认</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.image-cropper-wrapper {
  width: 100%;
}

.current-image {
  position: relative;
  width: 100%;
  max-width: 400px;

  img {
    width: 100%;
    border-radius: $border-radius-base;
    border: 1px solid $border-color-lighter;
  }

  .image-actions {
    margin-top: $spacing-base;
  }
}

.upload-area {
  :deep(.el-upload) {
    display: block;
  }
}

.cropper-container {
  width: 100%;
  height: 500px;
  background: #000;
}

.dialog-footer {
  .toolbar {
    display: flex;
    gap: $spacing-small;
    margin-bottom: $spacing-base;
    flex-wrap: wrap;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-base;
  }
}
</style>
