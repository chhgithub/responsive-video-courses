<script setup lang="ts">
import { ref, watch } from 'vue';

// TinyMCE 类型声明
declare const tinymce: any;

interface Props {
  modelValue: string;
  placeholder?: string;
  height?: number;
  readonly?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  height: 400,
  readonly: false,
});

const emit = defineEmits<Emits>();

// 编辑器内容
const content = ref(props.modelValue);

// TinyMCE 配置
const tinymceConfig = {
  height: props.height,
  menubar: true,
  language: 'zh_CN',
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'code',
    'help',
    'wordcount',
  ],
  toolbar:
    'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | image | table | code | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  placeholder: props.placeholder,
  readonly: props.readonly ? 1 : 0,
  images_upload_handler: (blobInfo: any, progress: any) => {
    return new Promise((resolve, reject) => {
      // TODO: 实现图片上传到服务器
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject('上传失败');
      };
      reader.readAsDataURL(blobInfo.blob());
    });
  },
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    content.value = newValue;
  }
);

// 内容变化时更新外部值
function handleContentChange(newValue: string) {
  content.value = newValue;
  emit('update:modelValue', newValue);
}
</script>

<template>
  <div class="rich-text-editor">
    <Editor
      v-model="content"
      :api-key="'no-api-key'"
      :init="tinymceConfig"
      @update:model-value="handleContentChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Editor from '@tinymce/tinymce-vue';

export default defineComponent({
  components: {
    Editor,
  },
});
</script>

<style scoped lang="scss">
.rich-text-editor {
  :deep(.tox-tinymce) {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
  }

  :deep(.tox-statusbar) {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
