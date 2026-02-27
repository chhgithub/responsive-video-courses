<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus';
import { getVideoById, addVideo, updateVideo, type Video } from '@/utils/video-storage';

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
const uploading = ref(false);
const uploadProgress = ref(0);

// 表单数据
const formData = ref({
  title: '',
  description: '',
  videoType: 'upload' as 'upload' | 'third-party',
  videoUrl: '',
  thumbnailUrl: '',
  duration: 0,
  fileSize: 0,
  format: 'mp4',
  uploadTime: '',
  category: '',
});

// 上传文件列表
const videoFileList = ref<UploadUserFile[]>([]);
const thumbnailFileList = ref<UploadUserFile[]>([]);

// 是否为编辑模式
const isEdit = computed(() => !!props.id);

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应为 2-100 个字符', trigger: 'blur' },
  ],
  videoType: [{ required: true, message: '请选择视频类型', trigger: 'change' }],
  videoUrl: [{ required: true, message: '请输入或上传视频', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
};

// 分类选项
const categoryOptions = [
  '前端开发',
  '后端开发',
  '人工智能',
  '数据科学',
  '产品设计',
  '移动开发',
  '云计算',
  '其他',
];

// 监听visible变化，加载数据
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.id) {
        // 编辑模式，加载数据
        const data = getVideoById(props.id);
        if (data) {
          formData.value = {
            title: data.title,
            description: data.description,
            videoType: data.videoType,
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl,
            duration: data.duration,
            fileSize: data.fileSize || 0,
            format: data.format,
            uploadTime: data.uploadTime,
            category: data.category,
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
    description: '',
    videoType: 'upload',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    fileSize: 0,
    format: 'mp4',
    uploadTime: new Date().toISOString().split('T')[0],
    category: '',
  };
  videoFileList.value = [];
  thumbnailFileList.value = [];
  formRef.value?.resetFields();
}

// 视频上传处理
const handleVideoUpload: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  videoFileList.value = uploadFiles;
  // 模拟上传并获取视频信息
  if (uploadFile.raw) {
    uploading.value = true;
    uploadProgress.value = 0;

    // 模拟上传进度
    const interval = setInterval(() => {
      uploadProgress.value += 10;
      if (uploadProgress.value >= 100) {
        clearInterval(interval);
        uploading.value = false;

        // 模拟获取视频信息
        const file = uploadFile.raw;
        formData.value.videoUrl = `https://example.com/videos/${Date.now()}.${formData.value.format}`;
        formData.value.fileSize = file.size;
        formData.value.format = file.name.split('.').pop() || 'mp4';

        // 模拟获取视频时长（实际应该由后端返回）
        formData.value.duration = Math.floor(Math.random() * 3600) + 600; // 10-70分钟

        // 自动生成封面（使用随机图片）
        formData.value.thumbnailUrl = `https://picsum.photos/seed/${Date.now()}/300/200`;

        ElMessage.success('视频上传成功');
      }
    }, 200);
  }
};

// 移除视频
const handleVideoRemove: UploadProps['onRemove'] = () => {
  formData.value.videoUrl = '';
  formData.value.fileSize = 0;
};

// 封面上传处理
const handleThumbnailUpload: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.raw) {
    // 模拟上传
    setTimeout(() => {
      formData.value.thumbnailUrl = `https://picsum.photos/seed/${Date.now()}/300/200`;
      ElMessage.success('封面上传成功');
    }, 500);
  }
};

// 移除封面
const handleThumbnailRemove: UploadProps['onRemove'] = () => {
  formData.value.thumbnailUrl = '';
};

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
      updateVideo(props.id, submitData);
      ElMessage.success('更新成功');
    } else {
      addVideo(submitData);
      ElMessage.success('新增成功');
    }

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

// 手动输入视频URL
function handleVideoUrlInput() {
  // 当手动输入URL时，清空上传列表
  if (formData.value.videoUrl) {
    videoFileList.value = [];
  }
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="isEdit ? '编辑视频' : '添加视频'"
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
      <el-form-item label="视频标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入视频标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="视频描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入视频描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="视频类型" prop="videoType">
        <el-radio-group v-model="formData.videoType">
          <el-radio value="upload">本地上传</el-radio>
          <el-radio value="third-party">第三方视频</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 本地上传 -->
      <template v-if="formData.videoType === 'upload'">
        <el-form-item label="视频文件" prop="videoUrl">
          <el-upload
            v-model:file-list="videoFileList"
            class="video-uploader"
            :auto-upload="false"
            :on-change="handleVideoUpload"
            :on-remove="handleVideoRemove"
            accept="video/*"
            :limit="1"
            drag
          >
            <div v-if="!formData.videoUrl" class="upload-content">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                拖拽视频到此处或 <em>点击上传</em>
              </div>
              <div class="upload-hint">支持 mp4, avi, mov, wmv, flv 格式</div>
            </div>
            <div v-else class="video-uploaded">
              <el-icon><VideoCamera /></el-icon>
              <span>视频已上传</span>
            </div>
          </el-upload>
          <div v-if="uploading" class="upload-progress">
            <el-progress :percentage="uploadProgress" />
          </div>
        </el-form-item>

        <el-form-item v-if="formData.fileSize" label="文件大小">
          <span class="info-text">
            {{ (formData.fileSize / 1024 / 1024).toFixed(2) }} MB
          </span>
        </el-form-item>
      </template>

      <!-- 第三方视频 -->
      <template v-else>
        <el-form-item label="视频URL" prop="videoUrl">
          <el-input
            v-model="formData.videoUrl"
            placeholder="请输入第三方视频URL（支持阿里云OSS、腾讯云COS、七牛云等）"
            @input="handleVideoUrlInput"
          />
        </el-form-item>

        <el-form-item label="视频格式" prop="format">
          <el-select v-model="formData.format" placeholder="请选择格式">
            <el-option label="MP4" value="mp4" />
            <el-option label="FLV" value="flv" />
            <el-option label="M3U8" value="m3u8" />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="视频时长" prop="duration">
        <el-input-number
          v-model="formData.duration"
          :min="0"
          :step="60"
          placeholder="单位：秒"
          style="width: 100%"
        />
        <div class="form-hint">
          当前时长：{{ Math.floor(formData.duration / 60) }} 分 {{ formData.duration % 60 }} 秒
        </div>
      </el-form-item>

      <el-form-item label="封面图" prop="thumbnailUrl">
        <el-upload
          v-model:file-list="thumbnailFileList"
          class="thumbnail-uploader"
          :auto-upload="false"
          :on-change="handleThumbnailUpload"
          :on-remove="handleThumbnailRemove"
          accept="image/*"
          :limit="1"
          list-type="picture-card"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="form-hint">建议尺寸：300x200，支持 jpg、png 格式</div>
      </el-form-item>

      <el-form-item v-if="formData.thumbnailUrl" label="预览">
        <el-image
          :src="formData.thumbnailUrl"
          fit="cover"
          style="width: 150px; height: 100px; border-radius: 4px"
        />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select
          v-model="formData.category"
          placeholder="请选择分类"
          filterable
          allow-create
          style="width: 100%"
        >
          <el-option
            v-for="cat in categoryOptions"
            :key="cat"
            :label="cat"
            :value="cat"
          />
        </el-select>
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

.video-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px;
  }
}

.upload-content {
  text-align: center;

  .upload-icon {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 16px;
  }

  .upload-text {
    font-size: $font-size-base;
    color: $text-color-primary;

    em {
      color: #409eff;
      font-style: normal;
    }
  }

  .upload-hint {
    margin-top: 8px;
    font-size: $font-size-small;
    color: $text-color-secondary;
  }
}

.video-uploaded {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #67c23a;
  font-size: $font-size-medium;

  .el-icon {
    font-size: 32px;
  }
}

.upload-progress {
  margin-top: $spacing-base;
}

.thumbnail-uploader {
  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 150px;
      height: 100px;
    }
  }

  :deep(.el-upload--picture-card) {
    width: 150px;
    height: 100px;
  }
}

.form-hint {
  margin-top: 4px;
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.info-text {
  color: $text-color-regular;
  font-size: $font-size-base;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
