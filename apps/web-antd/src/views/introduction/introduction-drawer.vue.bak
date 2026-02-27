<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
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
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

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
      componentProps: () => ({
        placeholder: '请选择类型',
        options: Object.entries(IntroductionTypeMap).map(([value, label]) => ({
          label,
          value,
        })),
        disabled: isUpdate.value,
      }),
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
        maxCount: 1,
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
  showDefaultActions: false,
});

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);
    const { id, type } = drawerApi.getData() as {
      id?: number | string;
      type?: string;
    };
    isUpdate.value = !!id;
    // 更新 schema 中 type 字段的 disabled 状态
    formApi.updateSchema([
      {
        componentProps: {
          placeholder: '请选择类型',
          options: Object.entries(IntroductionTypeMap).map(([value, label]) => ({
            label,
            value,
          })),
          disabled: isUpdate.value,
        },
        fieldName: 'type',
      },
    ]);
    // 加载数据
    if (isUpdate.value && id) {
      const data = await getIntroductionByType(id.toString());
      await formApi.setValues({
        type: data.type,
        title: data.title,
        coverImage: data.coverImage,
      });
      editorContent.value = data.content || '';
    } else if (type) {
      try {
        const data = await getIntroductionByType(type);
        await formApi.setValues({
          type: data.type,
          title: data.title,
          coverImage: data.coverImage,
        });
        editorContent.value = data.content || '';
      } catch {
        await formApi.setValues({ type });
      }
    }
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const values = await formApi.getValues();

    if (!editorContent.value) {
      message.warning('请输入内容');
      return;
    }

    const data = {
      ...values,
      content: editorContent.value,
    };

    await (isUpdate.value ? introductionUpdate(data) : introductionAdd(data));
    emit('reload');
    message.success(isUpdate.value ? '更新成功' : '保存成功');
    drawerApi.close();
  } catch {
    message.error(isUpdate.value ? '更新失败' : '保存失败');
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  editorContent.value = '';
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <div class="space-y-4">
      <Form />
      <div>
        <div class="mb-2 text-sm font-medium text-gray-700">内容</div>
        <Tinymce v-model="editorContent" :height="400" />
      </div>
    </div>
  </BasicDrawer>
</template>
