<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, watch } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';

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

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>();

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: [
    'group-video', // 排除视频
  ],
};

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  readOnly: props.disabled,
  MENU_CONF: {
    // 配置上传图片
    uploadImage: {
      // 自定义上传
      async customUpload(file: File, insertFn: (url: string, alt: string, href: string) => void) {
        // 使用 Base64 上传
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          insertFn(url, file.name, url);
        };
        reader.onerror = () => {
          console.error('图片上传失败');
        };
        reader.readAsDataURL(file);
      },
    },

    // 配置上传视频
    uploadVideo: {
      // 自定义上传
      async customUpload(file: File, insertFn: (url: string) => void) {
        // 使用 Base64 上传
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          insertFn(url);
        };
        reader.onerror = () => {
          console.error('视频上传失败');
        };
        reader.readAsDataURL(file);
      },
    },
  },
};

// 内容变化时
const handleChange = (editor: IDomEditor) => {
  emit('update:modelValue', editor.getHtml());
};

// 编辑器创建完成
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

// 监听禁用状态变化
watch(
  () => props.disabled,
  (newVal) => {
    if (editorRef.value) {
      editorRef.value.setReadOnly(newVal);
    }
  }
);

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

// 暴露方法
defineExpose({
  getEditor: () => editorRef.value,
});
</script>

<template>
  <div class="wang-editor-wrapper" :style="{ height: height + 'px' }">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="default"
      class="wang-editor-toolbar"
    />
    <Editor
      :model-value="modelValue"
      :defaultConfig="editorConfig"
      mode="default"
      :style="{ height: height - 40 + 'px', overflowY: 'hidden' }"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.wang-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #c0c4cc;
  }

  :deep(.wang-editor-toolbar) {
    border-bottom: 1px solid #e4e7ed;
    background-color: #fff;
    border-radius: 4px 4px 0 0;
  }

  :deep(.w-e-text-container) {
    background-color: #fff;
    border-radius: 0 0 4px 4px;

    [data-slate-editor] {
      font-size: 14px;
      line-height: 1.6;
      padding: 10px;
    }

    p {
      margin: 0 0 10px 0;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 20px 0 10px 0;
      font-weight: 600;
    }

    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    h4 { font-size: 18px; }
    h5 { font-size: 16px; }
    h6 { font-size: 14px; }

    ul, ol {
      margin: 0 0 10px 0;
      padding-left: 20px;
    }

    li {
      margin: 5px 0;
    }

    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 10px 0;
      color: #666;
      font-style: italic;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
    }

    table td, table th {
      border: 1px solid #ddd;
      padding: 8px;
    }

    table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    a {
      color: #3b82f6;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }

    pre code {
      background-color: transparent;
      padding: 0;
    }
  }
}
</style>
