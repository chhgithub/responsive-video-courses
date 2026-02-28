<script setup lang="ts">
import { ref, watch } from 'vue';
import WangEditor from '@/components/WangEditor.vue';
import type { AboutUsInfo } from '@/types/introduction';

interface Props {
  data: AboutUsInfo;
  subCategory: string;
  saving: boolean;
}

interface Emits {
  (e: 'save', data: AboutUsInfo): void;
  (e: 'togglePublish'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = ref<AboutUsInfo>({ ...props.data });
const formRef = ref();

// 标题映射
const titleMap: Record<string, string> = {
  research: '关于研究院',
  digital: '关于数字创新中心',
  education: '关于教育培训中心',
};

// 监听props变化，更新表单数据
watch(
  () => props.data,
  (newData) => {
    formData.value = { ...newData };
  },
  { deep: true }
);

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

// 保存
async function handleSave() {
  try {
    await formRef.value?.validate();
    emit('save', formData.value);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 切换发布状态
function handleTogglePublish() {
  emit('togglePublish');
}

</script>

<template>
  <div class="about-us-content">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h3>{{ titleMap[subCategory] }}内容编辑</h3>
      </div>
      <div class="toolbar-right">
        <el-tag :type="formData.isPublished ? 'success' : 'info'" size="large">
          {{ formData.isPublished ? '已发布' : '草稿' }}
        </el-tag>
        <el-button
          :type="formData.isPublished ? 'warning' : 'success'"
          @click="handleTogglePublish"
        >
          {{ formData.isPublished ? '取消发布' : '发布' }}
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </div>
    </div>

    <!-- 表单 -->
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="content-form">
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <WangEditor
          v-model="formData.content"
          placeholder="请输入内容"
          :height="500"
        />
      </el-form-item>

      <el-form-item label="排序">
        <el-input-number v-model="formData.sortOrder" :min="1" :max="999" />
        <div class="field-tip">
          <el-text type="info" size="small">数字越小排序越靠前</el-text>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.about-us-content {
  padding: $spacing-large;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-light;

    .toolbar-left {
      h3 {
        margin: 0;
        font-size: 18px;
        color: $text-color-primary;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: $spacing-base;
    }
  }

  .content-form {
    .image-uploader {
      width: 100%;
      max-width: 600px;

      .image-preview {
        position: relative;
        width: 100%;
        height: 200px;
        border-radius: $border-radius-base;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: $spacing-base;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          gap: $spacing-small;
        }
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        border: 2px dashed $border-color;
        border-radius: $border-radius-base;
        background-color: $background-color-light;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: $primary-color;
          background-color: $primary-color-light;
        }

        .el-icon {
          font-size: 48px;
          color: $text-color-secondary;
        }

        .upload-text {
          margin-top: $spacing-small;
          color: $text-color-secondary;
        }
      }
    }

    .upload-tip {
      margin-top: $spacing-small;
    }

    .field-tip {
      margin-left: $spacing-small;
    }
  }
}
</style>
