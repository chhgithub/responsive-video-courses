<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus';
import type { ContentType, Lesson } from '@/utils/course-storage';
import { getAllVideos, formatDuration as formatVideoDuration } from '@/utils/video-storage';

interface Props {
  chapterId?: string;
  lessonId?: string;
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
  lessonName: '',
  lessonOrder: 0,
  videoType: 'upload' as 'upload' | 'library' | 'third-party',
  videoId: '',
  videoUrl: '',
  videoDescription: '',
  videoCategory: '',
  duration: 0,
  isFree: false,
  isTrial: false,
});

// 视频列表
const videoList = ref(getAllVideos());

// 视频分类选项
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

// 上传文件列表
const videoFileList = ref<UploadUserFile[]>([]);

// 上传状态
const uploading = ref(false);
const uploadProgress = ref(0);

// 是否为编辑模式
const isEdit = computed(() => !!props.lessonId);

// 表单验证规则
const rules: FormRules = {
  lessonName: [
    { required: true, message: '请输入课时名称', trigger: 'blur' },
    { min: 2, max: 100, message: '课时名称长度应为 2-100 个字符', trigger: 'blur' },
  ],
  videoId: [{ required: true, message: '请选择视频', trigger: 'change' }],
  videoUrl: [{ required: true, message: '请输入视频URL', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }],
};

// 监听visible变化，加载数据
watch(
  () => props.visible,
  (val) => {
    if (val) {
      videoList.value = getAllVideos();
      if (props.lessonId) {
        // 编辑模式，加载数据
        loading.value = true;
        setTimeout(() => {
          formData.value = {
            lessonName: '示例课时',
            lessonOrder: 1,
            videoType: 'upload',
            videoId: 'v1',
            videoUrl: '',
            videoDescription: '这是课时视频的描述',
            videoCategory: '前端开发',
            duration: 1800,
            isFree: false,
            isTrial: true,
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
    lessonName: '',
    lessonOrder: 0,
    videoType: 'upload',
    videoId: '',
    videoUrl: '',
    videoDescription: '',
    videoCategory: '',
    duration: 0,
    isFree: false,
    isTrial: false,
  };
  videoFileList.value = [];
  formRef.value?.resetFields();
}

// 视频上传处理（本地上传）
const handleVideoUpload: UploadProps['onChange'] = (uploadFile) => {
  videoFileList.value = uploadFile;
  if (uploadFile.raw) {
    uploading.value = true;

    // 模拟上传进度
    const interval = setInterval(() => {
      uploadProgress.value += 10;
      if (uploadProgress.value >= 100) {
        clearInterval(interval);
        uploading.value = false;

        // 模拟获取视频信息
        const file = uploadFile.raw;
        formData.value.videoUrl = `https://example.com/videos/${Date.now()}.mp4`;

        // 模拟获取视频时长
        formData.value.duration = Math.floor(Math.random() * 3600) + 600; // 10-70分钟

        ElMessage.success('视频上传成功');
      }
    }, 200);
  }
};

// 移除视频
const handleVideoRemove: UploadProps['onRemove'] = () => {
  formData.value.videoUrl = '';
};

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // TODO: 调用API保存课时
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

// 格式化时长显示
function formatDurationText(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}分${secs}秒` : `${secs}秒`;
}

// 当视频来源改变时清空相关字段
watch(() => formData.value.videoType, () => {
  formData.value.videoId = '';
  formData.value.videoUrl = '';
  videoFileList.value = [];
});
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="isEdit ? '编辑课时' : '添加课时'"
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
      <el-form-item label="课时名称" prop="lessonName">
        <el-input
          v-model="formData.lessonName"
          placeholder="请输入课时名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="排序号" prop="lessonOrder">
        <el-input-number
          v-model="formData.lessonOrder"
          :min="0"
          :step="1"
          placeholder="数字越小越靠前"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 视频来源 -->
      <el-form-item label="视频来源" prop="videoType">
        <el-radio-group v-model="formData.videoType">
          <el-radio value="upload">本地上传</el-radio>
          <el-radio value="library">视频库选择</el-radio>
          <el-radio value="third-party">第三方URL</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 本地上传 -->
      <template v-if="formData.videoType === 'upload'">
        <el-form-item label="视频文件" prop="videoId">
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
      </template>

      <!-- 视频库选择 -->
      <template v-else-if="formData.videoType === 'library'">
        <el-form-item label="选择视频" prop="videoId">
          <el-select
            v-model="formData.videoId"
            placeholder="请从视频库中选择视频"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="video in videoList"
              :key="video.id"
              :label="`${video.title} (${video.category}) - ${formatVideoDuration(video.duration)}`"
              :value="video.id"
            >
              <div class="video-option">
                <div class="video-option-title">{{ video.title }}</div>
                <div class="video-option-meta">
                  <span class="video-option-category">{{ video.category }}</span>
                  <span class="video-option-duration">{{ formatVideoDuration(video.duration) }}</span>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </template>

      <!-- 第三方视频 -->
      <template v-else>
        <el-form-item label="视频URL" prop="videoUrl">
          <el-input
            v-model="formData.videoUrl"
            placeholder="请输入第三方视频URL（支持阿里云OSS、腾讯云COS、七牛云等）"
          />
        </el-form-item>
      </template>

      <!-- 视频描述 -->
      <el-form-item label="视频描述" prop="videoDescription">
        <el-input
          v-model="formData.videoDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入视频描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 视频分类 -->
      <el-form-item label="视频分类" prop="videoCategory">
        <el-select
          v-model="formData.videoCategory"
          placeholder="请选择视频分类"
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

      <!-- 学习时长 -->
      <el-form-item label="学习时长" prop="duration">
        <el-input-number
          v-model="formData.duration"
          :min="0"
          :step="60"
          placeholder="预计学习时长（秒）"
          style="width: 100%"
        />
        <div class="form-hint">
          预计学习时长：{{ formatDurationText(formData.duration) }}
        </div>
      </el-form-item>

      <el-form-item label="免费课时" prop="isFree">
        <el-switch v-model="formData.isFree" active-text="是" inactive-text="否" />
        <div class="form-hint">
          免费课时无需购买即可观看。如果课程价格为0，所有课时将自动免费
        </div>
      </el-form-item>

      <el-form-item label="可试听" prop="isTrial">
        <el-switch v-model="formData.isTrial" active-text="是" inactive-text="否" />
        <div class="form-hint">试听课时学员可在购买前观看</div>
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

.upload-progress {
  margin-top: $spacing-base;
}

.form-hint {
  margin-top: 4px;
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.video-option {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .video-option-title {
    font-size: $font-size-base;
    color: $text-color-primary;
    font-weight: 500;
  }

  .video-option-meta {
    display: flex;
    gap: 12px;
    font-size: $font-size-small;
    color: $text-color-secondary;

    .video-option-category {
      background-color: #f5f7fa;
      padding: 2px 6px;
      border-radius: 2px;
    }

    .video-option-duration {
      color: #909399;
    }
  }
}
</style>
