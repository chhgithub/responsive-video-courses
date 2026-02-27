<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { message, Modal, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import certDrawer from './cert-drawer.vue';

defineOptions({
  name: 'CertCenterManagement',
});

// Tab 子类别配置
const subCategoryOptions = [
  { label: '人工智能训练师', value: 'ai_trainer' },
  { label: '人工智能工程技术人员', value: 'ai_engineer' },
  { label: 'CAAC无人机执照', value: 'caac_drone' },
  { label: '技术经纪人', value: 'tech_broker' },
  { label: '其他认证', value: 'other' },
];

const activeTab = ref('ai_trainer');
const searchKeyword = ref('');
const loading = ref(false);

// Mock 数据
const mockData = ref([
  // 人工智能训练师
  {
    id: 1,
    subCategoryId: 'ai_trainer',
    title: '人工智能训练师认证介绍',
    content: '<p>人工智能训练师是新兴职业，负责设计、训练和优化AI模型。</p>',
    extraData: {
      evaluationPlan: '<p>评价计划包括理论知识考试和实操考核两部分。</p>',
      gradeAnnouncement: '<p>成绩将在考试结束后7个工作日内公示。</p>',
      registrationConsult: '<p>报名咨询请拨打：400-123-4567</p>',
    },
    isPublished: true,
    updateTime: '2025-02-02 10:00:00',
  },
  {
    id: 2,
    subCategoryId: 'ai_trainer',
    title: '人工智能训练师认证详细介绍',
    content: '<p>更详细的介绍内容...</p>',
    extraData: {
      evaluationPlan: '<p>详细评价计划...</p>',
      gradeAnnouncement: '<p>成绩公示详情...</p>',
      registrationConsult: '<p>更多报名方式...</p>',
    },
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
  // 人工智能工程技术人员
  {
    id: 3,
    subCategoryId: 'ai_engineer',
    title: 'AI工程师认证体系介绍',
    content: '<p>人工智能工程技术人员认证涵盖机器学习、深度学习等核心技术。</p>',
    extraData: {
      trainingPlan: '<p>培训计划包括理论课程和实战项目。</p>',
      registrationConsult: '<p>报名请联系：ai-cert@example.com</p>',
    },
    isPublished: true,
    updateTime: '2025-02-05 14:30:00',
  },
  {
    id: 4,
    subCategoryId: 'ai_engineer',
    title: 'AI工程师中级认证要求',
    content: '<p>中级认证要求候选人具备2年以上相关工作经验。</p>',
    extraData: {
      trainingPlan: '<p>中级培训计划详情...</p>',
      registrationConsult: '<p>中级报名咨询...</p>',
    },
    isPublished: false,
    updateTime: '2025-02-04 09:15:00',
  },
  // CAAC无人机执照
  {
    id: 5,
    subCategoryId: 'caac_drone',
    title: 'CAAC无人机驾驶员执照简介',
    content: '<p>中国民航局颁发的无人机驾驶员执照，合法合规飞行必备证书。</p>',
    extraData: {
      registrationConsult: '<p>报名咨询：138-0000-0000</p>',
      trialFlight: '<p>提供免费试飞体验服务。</p>',
    },
    isPublished: true,
    updateTime: '2025-02-08 16:20:00',
  },
  {
    id: 6,
    subCategoryId: 'caac_drone',
    title: '多旋翼无人机驾照培训',
    content: '<p>专注于多旋翼无人机的操作培训，适合航拍、测绘等应用场景。</p>',
    extraData: {
      registrationConsult: '<p>多旋翼培训报名...</p>',
      trialFlight: '<p>多旋翼试飞体验详情...</p>',
    },
    isPublished: false,
    updateTime: '2025-02-07 11:00:00',
  },
  // 技术经纪人
  {
    id: 7,
    subCategoryId: 'tech_broker',
    title: '技术经纪人资格认证',
    content: '<p>培养专业的技术转移和成果转化人才。</p>',
    extraData: {
      registrationConsult: '<p>报名咨询：tech-broker@example.com</p>',
      classPlan: '<p>每月开班，小班教学。</p>',
    },
    isPublished: true,
    updateTime: '2025-02-10 10:30:00',
  },
  {
    id: 8,
    subCategoryId: 'tech_broker',
    title: '高级技术经纪人培训',
    content: '<p>面向有经验的技术经纪人，提升专业能力和服务水平。</p>',
    extraData: {
      registrationConsult: '<p>高级培训报名...</p>',
      classPlan: '<p>季度开班计划...</p>',
    },
    isPublished: false,
    updateTime: '2025-02-09 13:45:00',
  },
  // 其他认证
  {
    id: 9,
    subCategoryId: 'other',
    title: 'PMP项目管理认证',
    content: '<p>全球认可的项目管理专业人士认证。</p>',
    extraData: {
      pmpInfo: '<p>PMP认证详情介绍...</p>',
      npdpInfo: '<p>NPDP产品经理认证详情...</p>',
    },
    isPublished: true,
    updateTime: '2025-02-12 09:00:00',
  },
  {
    id: 10,
    subCategoryId: 'other',
    title: 'NPDP产品管理认证',
    content: '<p>新产品开发专业人士认证。</p>',
    extraData: {
      pmpInfo: '<p>PMP认证更多信息...</p>',
      npdpInfo: '<p>NPDP认证详细介绍...</p>',
    },
    isPublished: false,
    updateTime: '2025-02-11 15:30:00',
  },
]);

// 当前Tab的数据（带搜索过滤）
const currentData = computed(() => {
  let data = mockData.value.filter(
    (item) => item.subCategoryId === activeTab.value,
  );

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    data = data.filter((item) =>
      item.title.toLowerCase().includes(keyword),
    );
  }

  return data;
});

// 表格列配置
const columns = [
  { type: 'seq', width: 70, title: '序号' },
  { field: 'title', title: '标题', minWidth: 300 },
  {
    field: 'isPublished',
    title: '发布状态',
    width: 100,
    slots: { default: 'status' },
  },
  { field: 'updateTime', title: '更新时间', width: 180 },
  {
    title: '操作',
    width: 280,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// 表格配置
const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        // 模拟异步查询
        return new Promise((resolve) => {
          setTimeout(() => {
            const data = currentData.value;
            resolve({
              page: {
                total: data.length,
              },
              result: data,
            });
          }, 100);
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
  id: 'cert-center-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
});

// 抽屉相关
const [CertDrawerComp, drawerApi] = useVbenDrawer({
  connectedComponent: certDrawer,
});

// 搜索处理
function handleSearch() {
  tableApi.query();
}

// 重置搜索
function handleReset() {
  searchKeyword.value = '';
  tableApi.query();
}

// 打开新增抽屉
function handleAdd() {
  drawerApi.setData({
    subCategoryId: activeTab.value,
  });
  drawerApi.open();
}

// 打开编辑抽屉
function handleEdit(row: any) {
  drawerApi.setData({
    id: row.id,
    subCategoryId: activeTab.value,
    record: row,
  });
  drawerApi.open();
}

// 删除
function handleDelete(row: any) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条内容吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      loading.value = true;
      setTimeout(() => {
        const index = mockData.value.findIndex((item) => item.id === row.id);
        if (index !== -1) {
          mockData.value.splice(index, 1);
        }
        message.success('删除成功');
        tableApi.query();
        loading.value = false;
      }, 500);
    },
  });
}

// 发布
function handlePublish(row: any) {
  loading.value = true;
  setTimeout(() => {
    // 取消同子类别下其他内容的发布状态
    mockData.value.forEach((item) => {
      if (item.subCategoryId === activeTab.value && item.isPublished) {
        item.isPublished = false;
      }
    });
    // 发布当前内容
    row.isPublished = true;
    message.success('发布成功');
    tableApi.query();
    loading.value = false;
  }, 500);
}

// 取消发布
function handleUnpublish(row: any) {
  loading.value = true;
  setTimeout(() => {
    row.isPublished = false;
    message.success('已取消发布');
    tableApi.query();
    loading.value = false;
  }, 500);
}

// Tab切换
function handleTabChange(key: string) {
  activeTab.value = key;
  searchKeyword.value = '';
  tableApi.query();
}

onMounted(() => {
  tableApi.query();
});
</script>

<template>
  <Page :auto-content-height="true">
    <!-- 搜索和Tab切换区域 -->
    <a-card class="mb-4">
      <div class="flex items-center gap-4 mb-4">
        <!-- 搜索框 -->
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索标题"
          allow-clear
          style="width: 300px"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>

      <!-- Tab切换和操作按钮 -->
      <div class="flex items-center justify-between">
        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange" class="flex-1">
          <a-tab-pane
            v-for="tab in subCategoryOptions"
            :key="tab.value"
            :tab="`${tab.label} (${currentData.filter((d) => d.subCategoryId === tab.value).length})`"
          />
        </a-tabs>

        <div class="flex items-center gap-4 ml-4">
          <div class="text-sm text-gray-600">
            <span class="font-medium">当前分类：</span>
            <Tag color="blue">{{ subCategoryOptions.find((t) => t.value === activeTab)?.label }}</Tag>
            <span class="ml-4">共 {{ currentData.length }} 条内容</span>
          </div>
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <span class="text-base">+</span>
            </template>
            新增内容
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 表格 -->
    <BasicTable table-title="内容列表">
      <template #status="{ row }">
        <Tag v-if="row.isPublished" color="success">
          <template #icon>
            <span class="mr-1">✓</span>
          </template>
          已发布
        </Tag>
        <Tag v-else color="default">草稿</Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <a-button
            v-if="!row.isPublished"
            type="primary"
            size="small"
            @click="handlePublish(row)"
          >
            发布
          </a-button>
          <a-button
            v-else
            type="default"
            size="small"
            @click="handleUnpublish(row)"
          >
            取消发布
          </a-button>
          <a-button type="link" size="small" @click="handleEdit(row)">
            编辑
          </a-button>
          <a-button type="link" size="small" danger @click="handleDelete(row)">
            删除
          </a-button>
        </Space>
      </template>
    </BasicTable>

    <!-- 抽屉组件 -->
    <CertDrawerComp @reload="tableApi.query()" />
  </Page>
</template>
