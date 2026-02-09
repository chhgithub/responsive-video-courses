<script setup lang="ts">
import { ref } from 'vue';

import { useVbenForm } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import {
  getIntroductionByType,
  introductionAdd,
  introductionUpdate,
  IntroductionTypeMap,
} from '#/api/introduction';
import Tinymce from '#/components/tinymce/src/editor.vue';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);

// 富文本编辑器内容
const editorContent = ref('');

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 100,
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择类型',
        options: Object.entries(IntroductionTypeMap).map(([value, label]) => ({
          label,
          value,
        })),
        disabled: isUpdate.value,
      },
      fieldName: 'type',
      label: '类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入标题',
      },
      fieldName: 'title',
      label: '标题',
      rules: 'required',
    },
    {
      component: 'ImageUpload',
      componentProps: {
        class: 'w-full',
        limit: 1,
        text: '上传封面图',
      },
      fieldName: 'coverImage',
      label: '封面图',
    },
  ],
  wrapperClass: 'grid-cols-1',
  submitButtonOptions: {
    text: '提交',
  },
  showDefaultActions: true,
});

// 加载数据
async function loadData(id: number) {
  try {
    const data = await getIntroductionByType(id.toString());
    await formApi.setValues({
      type: data.type,
      title: data.title,
      coverImage: data.coverImage,
    });
    editorContent.value = data.content || '';
  } catch {
    message.error('加载介绍信息失败');
  }
}

// 按类型加载数据
async function loadDataByType(type: string) {
  try {
    const data = await getIntroductionByType(type);
    await formApi.setValues({
      type: data.type,
      title: data.title,
      coverImage: data.coverImage,
    });
    editorContent.value = data.content || '';
  } catch {
    // 如果没有数据，设置默认类型
    await formApi.setValues({ type });
  }
}

// 提交表单
async function handleSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }
  const values = await formApi.getValues();

  if (!editorContent.value) {
    message.warning('请输入内容');
    return false;
  }

  try {
    const data = {
      ...values,
      content: editorContent.value,
    };

    if (isUpdate.value) {
      await introductionUpdate({
        ...data,
        id: values.id,
      });
      message.success('更新成功');
    } else {
      await introductionAdd(data);
      message.success('保存成功');
    }
    emit('reload');
    return true;
  } catch {
    message.error(isUpdate.value ? '更新失败' : '保存失败');
    return false;
  }
}

// 暴露方法给父组件调用
defineExpose({
  loadData,
  loadDataByType,
  setTitle: (update: boolean) => {
    isUpdate.value = update;
  },
  handleSubmit,
});
</script>

<template>
  <div class="space-y-4">
    <Form />
    <div>
      <div class="mb-2 text-sm font-medium text-gray-700">内容</div>
      <Tinymce v-model="editorContent" :height="400" />
    </div>
  </div>
</template>
