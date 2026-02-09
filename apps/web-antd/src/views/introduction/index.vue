<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Introduction } from '#/api/introduction/model';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Image, message, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { introductionList, introductionRemove } from '#/api/introduction';

import { columns, querySchema } from './data';

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
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async (_, formValues = {}) => {
        return await introductionList({
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
    keyField: 'id',
  },
  id: 'introduction-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [IntroductionDrawerComp, drawerApi] = useVbenDrawer({
  title: '介绍',
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
    } else if (comp && drawerApi.data?.type) {
      comp.setTitle(false);
      comp.loadDataByType(drawerApi.data?.type);
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

function handleEdit(row: Introduction) {
  drawerApi.setData({ id: row.id });
  drawerApi.open();
}

function handleEditByType(type: string) {
  drawerApi.setData({ type });
  drawerApi.open();
}

async function handleDelete(row: Introduction) {
  try {
    await introductionRemove([row.id]);
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
  const ids = rows.map((row: Introduction) => row.id);
  Popconfirm.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      try {
        await introductionRemove(ids);
        message.success('删除成功');
        await tableApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

// 快捷操作按钮
function quickEdit(type: string) {
  handleEditByType(type);
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="mb-4 flex flex-wrap gap-2">
      <a-button @click="quickEdit('course_intro')"> 编辑课程介绍 </a-button>
      <a-button @click="quickEdit('cert_center')"> 编辑认证中心介绍 </a-button>
      <a-button @click="quickEdit('about_us')"> 编辑关于我们 </a-button>
      <a-button @click="quickEdit('faculty')"> 编辑师资介绍 </a-button>
    </div>
    <BasicTable table-title="介绍信息列表">
      <template #toolbar-tools>
        <Space>
          <a-button danger type="primary" @click="handleMultiDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="handleAdd"> 新增介绍 </a-button>
        </Space>
      </template>
      <template #coverImage="{ row }">
        <Image
          v-if="row.coverImage"
          :src="row.coverImage"
          :width="80"
          :height="50"
          fit="cover"
          class="rounded"
        />
        <span v-else class="text-gray-400">暂无封面</span>
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
    <IntroductionDrawerComp />
  </Page>
</template>
