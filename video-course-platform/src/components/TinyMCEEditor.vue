<script setup lang="ts">
import { ref, watch } from 'vue';
import Editor from '@tinymce/tinymce-vue';

// 引入 TinyMCE 核心及资源
import 'tinymce/tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

// 引入插件
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/anchor';

interface Props {
  modelValue: string;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容...',
  height: 500,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// TinyMCE 配置
const editorConfig = {
  height: props.height,
  menubar: false,
  license: 'gpl',
  language: 'zh_CN',
  language_url: '/tinymce/langs/zh_CN.js',
  placeholder: props.placeholder,
  promotion: false,
  statusbar: true,
  elementpath: false,
  branding: false,

  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'media',
    'table',
    'code',
    'fullscreen',
    'preview',
    'charmap',
    'insertdatetime',
    'anchor',
  ],

  toolbar:
    'undo redo | formatselect | bold italic underline strikethrough | ' +
    'alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image media table | ' +
    'removeformat code preview fullscreen',

  toolbar_mode: 'wrap',
  toolbar_sticky: true,
  toolbar_sticky_offset: 64,

  // 字体大小
  fontsize_formats: '12px 14px 16px 18px 20px 24px 28px 32px 36px',

  // 格式选项
  style_formats: [
    { title: '段落', block: 'p' },
    { title: '标题 1', block: 'h1' },
    { title: '标题 2', block: 'h2' },
    { title: '标题 3', block: 'h3' },
    { title: '标题 4', block: 'h4' },
    { title: '标题 5', block: 'h5' },
    { title: '标题 6', block: 'h6' },
    { title: '引用', block: 'blockquote' },
    { title: '代码块', block: 'pre' },
  ],

  // 内容样式
  content_style: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 10px;
    }
    p { margin: 0 0 10px 0; }
    h1, h2, h3, h4, h5, h6 { margin: 20px 0 10px 0; font-weight: 600; }
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    h4 { font-size: 18px; }
    h5 { font-size: 16px; }
    h6 { font-size: 14px; }
    ul, ol { margin: 0 0 10px 0; padding-left: 20px; }
    li { margin: 5px 0; }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 10px 0;
      color: #666;
      font-style: italic;
    }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    table td, table th { border: 1px solid #ddd; padding: 8px; }
    table th { background-color: #f5f5f5; font-weight: 600; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    pre code { background-color: transparent; padding: 0; }
  `,

  // 图片上传处理（使用 Base64）
  images_upload_handler: (blobInfo: any, progress: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject('图片上传失败');
      };
      reader.readAsDataURL(blobInfo.blob());
    }),

  // 图片文件类型验证
  images_file_types: 'jpeg,jpg,png,gif,webp,svg',

  // 自动保存草稿（可选）
  autosave_ask_before_unload: true,
  autosave_interval: '30s',
  autosave_retention: '30m',

  // 允许的元素
  valid_elements:
    '*[*]', // 允许所有元素和属性（开发环境使用宽松规则）

  // 扩展有效性
  extended_valid_elements:
    'a[charset|href|name|target|rel],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',

  // 禁用某些不安全的元素
  invalid_elements: 'script,object,embed,iframe',

  // 粘贴处理
  paste_auto_cleanup_on_paste: true,
  paste_remove_spans: true,
  paste_strip_class_attributes: 'all',
  paste_remove_styles: true,

  // 快捷键
  table_tab_navigation: true,

  // 响应式
  width: '100%',
  resize: true,

  // 初始化完成回调
  setup: (editor: any) => {
    editor.on('init', () => {
      console.log('TinyMCE initialized');
    });
  },
};

// 编辑器引用
const editorRef = ref<any>(null);

// 监听禁用状态变化
watch(
  () => props.disabled,
  (newVal) => {
    if (editorRef.value?.editor) {
      if (newVal) {
        editorRef.value.editor.setMode('readonly');
      } else {
        editorRef.value.editor.setMode('design');
      }
    }
  },
);

// 暴露方法
defineExpose({
  getEditor: () => editorRef.value?.editor,
});
</script>

<template>
  <div class="tinymce-editor-wrapper">
    <Editor
      ref="editorRef"
      :model-value="modelValue"
      :init="editorConfig"
      :disabled="disabled"
      tinymce-script-src="/tinymce/tinymce.min.js"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.tinymce-editor-wrapper {
  :deep(.tox-tinymce) {
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    &:hover {
      border-color: #c0c4cc;
    }

    &.tox-tinymce--disabled {
      background-color: #f5f7fa;
      opacity: 0.6;
    }
  }

  :deep(.tox-toolbar__primary) {
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.tox-sidebar-wrap) {
    background-color: #fff;
  }

  // 滚动条样式
  :deep(.tox-sidebar) {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;

      &:hover {
        background-color: #c0c4cc;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
    }
  }
}
</style>
