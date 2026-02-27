<script setup lang="ts">
import { ref, watch, computed } from 'vue';
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
  contentType: 'video' as ContentType,
  videoType: 'upload' as 'upload' | 'third-party',
  videoId: '',
  videoUrl: '',
  audioUrl: '',
  audioDuration: 0,
  fileUrl: '',
  pageCount: 0,
  richTextContent: '',
  duration: 0,
  isFree: false,
  isTrial: false,
});

// 视频列表
const videoList = ref(getAllVideos());

// 上传文件列表
const audioFileList = ref<UploadUserFile[]>([]);
const fileFileList = ref<UploadUserFile[]>([]);

// 是否为编辑模式
const isEdit = computed(() => !!props.lessonId);

// 内容类型选项
const contentTypeOptions = [
  { label: '视频课程', value: 'video' },
  { label: '音频课程', value: 'audio' },
  { label: 'PPT课件', value: 'ppt' },
  { label: '文档资料', value: 'document' },
  { label: '富文本内容', value: 'rich-text' },
];

// 表单验证规则
const rules: FormRules = {
  lessonName: [
    { required: true, message: '请输入课时名称', trigger: 'blur' },
    { min: 2, max: 100, message: '课时名称长度应为 2-100 个字符', trigger: 'blur' },
  ],
  contentType: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
  videoId: [{ required: true, message: '请选择视频', trigger: 'change' }],
  videoUrl: [{ required: true, message: '请输入视频URL', trigger: 'blur' }],
  audioUrl: [{ required: true, message: '请上传音频文件', trigger: 'change' }],
  fileUrl: [{ required: true, message: '请上传文件', trigger: 'change' }],
  richTextContent: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }],
};

// 监听内容类型变化
watch(
  () => formData.value.contentType,
  (newType) => {
    // 清空其他类型的数据
    if (newType !== 'video') {
      formData.value.videoId = '';
      formData.value.videoUrl = '';
      formData.value.videoType = 'upload';
    }
    if (newType !== 'audio') {
      formData.value.audioUrl = '';
      formData.value.audioDuration = 0;
      audioFileList.value = [];
    }
    if (newType !== 'ppt' && newType !== 'document') {
      formData.value.fileUrl = '';
      formData.value.pageCount = 0;
      fileFileList.value = [];
    }
    if (newType !== 'rich-text') {
      formData.value.richTextContent = '';
    }
  }
);

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
            contentType: 'video',
            videoType: 'upload',
            videoId: 'v1',
            videoUrl: '',
            audioUrl: '',
            audioDuration: 0,
            fileUrl: '',
            pageCount: 0,
            richTextContent: '',
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
    contentType: 'video',
    videoType: 'upload',
    videoId: '',
    videoUrl: '',
    audioUrl: '',
    audioDuration: 0,
    fileUrl: '',
    pageCount: 0,
    richTextContent: '',
    duration: 0,
    isFree: false,
    isTrial: false,
  };
  audioFileList.value = [];
  fileFileList.value = [];
  formRef.value?.resetFields();
}

// 音频上传处理
const handleAudioUpload: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.raw) {
    // 模拟上传
    setTimeout(() => {
      formData.value.audioUrl = `https://example.com/audio/${Date.now()}.mp3`;
      formData.value.audioDuration = 1800; // 默认30分钟
      ElMessage.success('音频上传成功');
    }, 500);
  }
};

// 文件上传处理
const handleFileUpload: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.raw) {
    // 模拟上传
    setTimeout(() => {
      formData.value.fileUrl = `https://example.com/files/${Date.now()}.pptx`;
      formData.value.pageCount = Math.floor(Math.random() * 50) + 10;
      formData.value.duration = 600; // 默认10分钟
      ElMessage.success('文件上传成功');
    }, 500);
  }
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

      <el-form-item label="内容类型" prop="contentType">
        <el-select
          v-model="formData.contentType"
          placeholder="请选择内容类型"
          style="width: 100%"
        >
          <el-option
            v-for="type in contentTypeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>

      <!-- 视频类型 -->
      <template v-if="formData.contentType === 'video'">
        <el-form-item label="视频来源" prop="videoType">
          <el-radio-group v-model="formData.videoType">
            <el-radio value="upload">从视频库选择</el-radio>
            <el-radio value="third-party">第三方URL</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.videoType === 'upload'"
          label="选择视频"
          prop="videoId"
        >
          <el-select
            v-model="formData.videoId"
            placeholder="请选择视频"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="video in videoList"
              :key="video.id"
              :label="video.title"
              :value="video.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ video.title }}</span>
                <span style="color: #999; font-size: 12px;">
                  {{ formatVideoDuration(video.duration) }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-else
          label="视频URL"
          prop="videoUrl"
        >
          <el-input
            v-model="formData.videoUrl"
            placeholder="请输入第三方视频URL（支持阿里云OSS、腾讯云COS、七牛云等）"
          />
        </el-form-item>
      </template>

      <!-- 音频类型 -->
      <template v-if="formData.contentType === 'audio'">
        <el-form-item label="音频文件" prop="audioUrl">
          <el-upload
            v-model:file-list="audioFileList"
            :auto-upload="false"
            :on-change="handleAudioUpload"
            accept="audio/*"
            :limit="1"
            drag
          >
            <div class="upload-content">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                拖拽音频到此处或 <em>点击上传</em>
              </div>
              <div class="upload-hint">支持 mp3, wav, m4a, aac 格式</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="音频时长" prop="audioDuration">
          <el-input-number
            v-model="formData.audioDuration"
            :min="0"
            :step="60"
            placeholder="单位：秒"
            style="width: 100%"
          />
          <div class="form-hint">
            时长：{{ formatDurationText(formData.audioDuration) }}
          </div>
        </el-form-item>
      </template>

      <!-- PPT/文档类型 -->
      <template v-if="formData.contentType === 'ppt' || formData.contentType === 'document'">
        <el-form-item label="上传文件" prop="fileUrl">
          <el-upload
            v-model:file-list="fileFileList"
            :auto-upload="false"
            :on-change="handleFileUpload"
            :accept="formData.contentType === 'ppt' ? '.ppt,.pptx' : '.pdf,.doc,.docx'"
            :limit="1"
            drag
          >
            <div class="upload-content">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <div class="upload-hint">
                {{ formData.contentType === 'ppt' ? '支持 ppt, pptx 格式' : '支持 pdf, doc, docx 格式' }}
              </div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="页数" prop="pageCount">
          <el-input-number
            v-model="formData.pageCount"
            :min="0"
            placeholder="文件页数"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 富文本类型 -->
      <template v-if="formData.contentType === 'rich-text'">
        <el-form-item label="内容" prop="richTextContent">
          <el-input
            v-model="formData.richTextContent"
            type="textarea"
            :rows="10"
            placeholder="请输入富文本内容（支持HTML标签）"
          />
          <div class="form-hint">
            提示：可以使用 HTML 标签，如 &lt;p&gt;、&lt;img&gt;、&lt;video&gt; 等
          </div>
        </el-form-item>
      </template>

      <!-- 通用字段 -->
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
        <div class="form-hint">免费课时无需购买即可观看</div>
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
</style>
