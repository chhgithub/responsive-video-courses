<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import Tinymce from '#/components/tinymce/src/editor.vue';

defineOptions({
  name: 'CertCenterDrawer',
});

// Tab 子类别配置
const subCategoryOptions = [
  { label: '人工智能训练师', value: 'ai_trainer' },
  { label: '人工智能工程技术人员', value: 'ai_engineer' },
  { label: 'CAAC无人机执照', value: 'caac_drone' },
  { label: '技术经纪人', value: 'tech_broker' },
  { label: '其他认证', value: 'other' },
];

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const subCategoryId = ref('ai_trainer');
const loading = ref(false);

// 表单数据
const formData = ref({
  id: null as number | null,
  title: '',
  content: '',
  extraData: {} as Record<string, string>,
});

const title = computed(() => {
  const category = subCategoryOptions.find((t) => t.value === subCategoryId.value);
  return isUpdate.value ? '编辑内容' : `新增 - ${category?.label}`;
});

// 根据Tab获取表单字段配置
function getFormFields() {
  const fields: Array<{ key: string; label: string; description: string }> = [];

  switch (subCategoryId.value) {
    case 'ai_engineer': {
      fields.push(
        {
          key: 'trainingPlan',
          label: '培训计划',
          description: '用于描述培训内容、课程安排、学习时长等信息',
        },
        {
          key: 'registrationConsult',
          label: '报名咨询',
          description: '用于报名方式、联系电话、邮箱等咨询信息',
        },
      );
      break;
    }
    case 'ai_trainer': {
      fields.push(
        {
          key: 'evaluationPlan',
          label: '评价计划',
          description: '用于描述评价流程、考试内容、评分标准等',
        },
        {
          key: 'gradeAnnouncement',
          label: '成绩公示',
          description: '用于说明成绩查询方式、公示时间、有效期等',
        },
        {
          key: 'registrationConsult',
          label: '报名咨询',
          description: '用于报名方式、联系电话、邮箱等咨询信息',
        },
      );
      break;
    }
    case 'caac_drone': {
      fields.push(
        {
          key: 'registrationConsult',
          label: '报名咨询',
          description: '用于报名方式、联系电话、邮箱等咨询信息',
        },
        {
          key: 'trialFlight',
          label: '试飞体验',
          description: '用于描述试飞活动安排、体验内容、预约方式等',
        },
      );
      break;
    }
    case 'other': {
      fields.push(
        {
          key: 'pmpInfo',
          label: 'PMP项目管理',
          description: 'PMP认证的详细介绍、报考条件、培训安排等',
        },
        {
          key: 'npdpInfo',
          label: 'NPDP产品管理',
          description: 'NPDP认证的详细介绍、报考条件、培训安排等',
        },
      );
      break;
    }
    case 'tech_broker': {
      fields.push(
        {
          key: 'registrationConsult',
          label: '报名咨询',
          description: '用于报名方式、联系电话、邮箱等咨询信息',
        },
        {
          key: 'classPlan',
          label: '开班计划',
          description: '用于描述开班时间、课程安排、授课方式等',
        },
      );
      break;
    }
  }

  return fields;
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }

    const data = drawerApi.getData() as {
      id?: number;
      subCategoryId: string;
      record?: any;
    };

    subCategoryId.value = data.subCategoryId || 'ai_trainer';
    isUpdate.value = !!data.id;

    if (isUpdate.value && data.record) {
      // 编辑模式
      formData.value = {
        id: data.id || null,
        title: data.record.title,
        content: data.record.content || '',
        extraData: { ...data.record.extraData },
      };
    } else {
      // 新增模式
      formData.value = {
        id: null,
        title: '',
        content: '',
        extraData: {},
      };
      // 初始化extraData
      getFormFields().forEach((field) => {
        formData.value.extraData[field.key] = '';
      });
    }
  },
});

async function handleConfirm() {
  if (!formData.value.title) {
    message.warning('请输入标题');
    return;
  }

  if (!formData.value.content) {
    message.warning('请输入详细介绍');
    return;
  }

  try {
    drawerApi.lock(true);
    loading.value = true;

    // TODO: 调用 API 保存数据
    // await (isUpdate.value ? updateApi(formData.value) : addApi(formData.value));

    // 模拟保存延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    message.success(isUpdate.value ? '更新成功' : '新增成功');
    emit('reload');
    drawerApi.close();
  } catch {
    message.error(isUpdate.value ? '更新失败' : '新增失败');
  } finally {
    drawerApi.lock(false);
    loading.value = false;
  }
}

async function handleClosed() {
  formData.value = {
    id: null,
    title: '',
    content: '',
    extraData: {},
  };
}

// 暴露方法供父组件调用获取表单数据
function getFormData() {
  return formData.value;
}

defineExpose({
  getFormData,
});
</script>

<template>
  <BasicDrawer :title="title" class="w-[1000px]">
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="标题" required>
        <a-input
          v-model:value="formData.title"
          placeholder="请输入标题"
          show-count
          :maxlength="100"
        />
      </a-form-item>

      <a-form-item label="详细介绍" required>
        <template #help>
          <span class="text-gray-500 text-sm">用于认证项目的整体介绍、背景说明、适用对象等</span>
        </template>
        <Tinymce v-model="formData.content" :height="300" />
      </a-form-item>

      <!-- 扩展字段富文本 -->
      <template v-if="getFormFields().length > 0">
        <a-divider orientation="left">详细信息</a-divider>
        <template v-for="field in getFormFields()" :key="field.key">
          <a-form-item :label="field.label">
            <template #help>
              <span class="text-gray-500 text-sm">{{ field.description }}</span>
            </template>
            <Tinymce v-model="formData.extraData[field.key]" :height="200" />
          </a-form-item>
        </template>
      </template>
    </a-form>
  </BasicDrawer>
</template>
