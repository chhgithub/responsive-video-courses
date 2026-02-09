<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Course } from '#/api/course/model';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Image, message, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  categoryTree,
  courseList,
  courseRemove,
  teacherList,
} from '#/api/course';

import { columns, querySchema } from './data';

// 加载选项
const categoryOptions = ref<any[]>([]);
const teacherOptions = ref<any[]>([]);

async function loadOptions() {
  try {
    const [categoryData, teacherData] = await Promise.all([
      categoryTree(),
      teacherList(),
    ]);
    // 转换为树形选项
    const convertToOptions = (items: any[]) => {
      return items.map((item) => ({
        label: item.categoryName,
        value: item.categoryId,
        children: item.children?.length
          ? convertToOptions(item.children)
          : undefined,
      }));
    };
    categoryOptions.value = convertToOptions(categoryData);
    teacherOptions.value = teacherData.map((item: any) => ({
      label: item.teacherName,
      value: item.teacherId,
    }));
  } catch (error) {
    console.error('加载选项失败:', error);
  }
}

// 查询表单配置
let tableApi: any;

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  handleReset: async () => {
    const { formApi, reload } = tableApi;
    await formApi.resetForm();
    const formValues = formApi.form.values;
    formApi.setLatestSubmissionValues(formValues);
    await reload(formValues);
  },
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await courseList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  headerCellConfig: {
    height: 44,
  },
  cellConfig: {
    height: 48,
  },
  rowConfig: {
    keyField: 'courseId',
  },
  id: 'course-index',
};

const [BasicTable, tableApiInstance] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

tableApi = tableApiInstance;

// 动态更新表单选项
function updateFormOptions() {
  if (formOptions.schema) {
    const categoryField = formOptions.schema.find(
      (s: any) => s.fieldName === 'categoryId',
    );
    if (categoryField) {
      (categoryField.componentProps as any).options = categoryOptions.value;
    }
    const teacherField = formOptions.schema.find(
      (s: any) => s.fieldName === 'teacherId',
    );
    if (teacherField) {
      (teacherField.componentProps as any).options = teacherOptions.value;
    }
  }
}

// 组件挂载时加载选项并更新表单
onMounted(async () => {
  await loadOptions();
  updateFormOptions();
});

const [CourseDrawerComp, drawerApi] = useVbenDrawer({
  title: '课程',
  closable: true,
  async onConfirm() {
    const comp = drawerApi.componentRef;
    if (comp) {
      const result = await comp.handleSubmit();
      if (result) {
        await tableApi.query();
        drawerApi.close();
      }
    }
  },
  onOpened: () => {
    const comp = drawerApi.componentRef;
    if (comp && drawerApi.data?.id) {
      comp.setTitle(true);
      comp.loadData(drawerApi.data?.id);
    } else {
      comp?.setTitle(false);
      comp?.handleReset?.();
    }
  },
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

function handleEdit(row: Course) {
  drawerApi.setData({ id: row.courseId });
  drawerApi.open();
}

async function handleDelete(row: Course) {
  try {
    await courseRemove([row.courseId]);
    message.success('删除成功');
    await tableApi.query();
  } catch {
    message.error('删除失败');
  }
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    message.warning('请选择要删除的记录');
    return;
  }
  const ids = rows.map((row: Course) => row.courseId);
  Popconfirm.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      try {
        await courseRemove(ids);
        message.success('删除成功');
        await tableApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="课程列表">
      <template #toolbar-tools>
        <Space>
          <a-button danger type="primary" @click="handleMultiDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="handleAdd"> 新增课程 </a-button>
        </Space>
      </template>
      <template #cover="{ row }">
        <Image
          v-if="row.courseCover"
          :src="row.courseCover"
          :width="60"
          :height="40"
          fit="cover"
          class="rounded"
        />
        <span v-else class="text-gray-400">暂无封面</span>
      </template>
      <template #price="{ row }">
        <Tag v-if="row.isFree" color="green">免费</Tag>
        <template v-else>
          <span class="font-bold text-red-500">¥{{ row.price || 0 }}</span>
          <span
            v-if="row.originalPrice && row.originalPrice > row.price"
            class="ml-1 text-xs text-gray-400 line-through"
          >
            ¥{{ row.originalPrice }}
          </span>
        </template>
      </template>
      <template #status="{ row }">
        <Tag :color="row.status === 'published' ? 'green' : 'default'">
          {{ row.status === 'published' ? '上架' : '下架' }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Space>
          <a-button type="link" size="small" @click="handleEdit(row)">
            编辑
          </a-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger> 删除 </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <CourseDrawerComp />
  </Page>
</template>
