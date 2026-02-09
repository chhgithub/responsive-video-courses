<script setup lang="ts">
import type { CourseCategory, CourseTeacher } from '#/api/course/model';

import { onMounted, ref } from 'vue';

import { useVbenForm } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import {
  categoryTree,
  courseAdd,
  courseUpdate,
  getCourseForEdit,
  teacherList,
} from '#/api/course';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);

// 分类选项
const categoryOptions = ref<CourseCategory[]>([]);
// 讲师选项
const teacherOptions = ref<CourseTeacher[]>([]);

// 加载选项数据
async function loadOptions() {
  try {
    const [categoryData, teacherData] = await Promise.all([
      categoryTree(),
      teacherList(),
    ]);
    categoryOptions.value = categoryData;
    teacherOptions.value = teacherData;
  } catch (error) {
    console.error('加载选项失败:', error);
  }
}

onMounted(() => {
  loadOptions();
});

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
      component: 'Input',
      componentProps: {
        placeholder: '请输入课程名称',
      },
      fieldName: 'courseName',
      label: '课程名称',
      rules: 'required',
    },
    {
      component: 'TreeSelect',
      componentProps: {
        placeholder: '请选择课程分类',
        treeData: categoryOptions,
        fieldNames: { label: 'categoryName', value: 'categoryId' },
      },
      fieldName: 'categoryId',
      label: '课程分类',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择讲师',
        options: teacherOptions,
        fieldNames: { label: 'teacherName', value: 'teacherId' },
      },
      fieldName: 'teacherId',
      label: '讲师',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '0',
        min: 0,
        precision: 2,
        class: 'w-full',
      },
      fieldName: 'price',
      label: '价格',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '0',
        min: 0,
        precision: 2,
        class: 'w-full',
      },
      fieldName: 'originalPrice',
      label: '原价',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
      fieldName: 'isFree',
      label: '免费课程',
    },
    {
      component: 'ImageUpload',
      componentProps: {
        class: 'w-full',
        limit: 1,
        text: '上传封面',
      },
      fieldName: 'courseCover',
      label: '课程封面',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入课程简介',
        rows: 3,
        maxlength: 200,
        showCount: true,
      },
      fieldName: 'courseIntro',
      label: '课程简介',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '0',
        min: 0,
        class: 'w-full',
      },
      fieldName: 'sortOrder',
      label: '排序',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '上架', value: 'published' },
          { label: '下架', value: 'draft' },
        ],
      },
      fieldName: 'status',
      label: '状态',
      rules: 'required',
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
    const data = await getCourseForEdit(id);
    await formApi.setValues(data);
  } catch {
    message.error('加载课程信息失败');
  }
}

// 提交表单
async function handleSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }
  const values = await formApi.getValues();
  try {
    if (isUpdate.value) {
      await courseUpdate({
        ...values,
        courseId: values.courseId,
      });
      message.success('更新成功');
    } else {
      await courseAdd(values);
      message.success('新增成功');
    }
    emit('reload');
    return true;
  } catch {
    message.error(isUpdate.value ? '更新失败' : '新增失败');
    return false;
  }
}

// 暴露方法给父组件调用
defineExpose({
  loadData,
  setTitle: (update: boolean) => {
    isUpdate.value = update;
  },
  handleSubmit,
});
</script>

<template>
  <Form />
</template>
