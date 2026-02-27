<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { message } from 'ant-design-vue';
import Tinymce from '#/components/tinymce/src/editor.vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({
  name: 'AboutUsManagement',
});

// Tab 子类别配置
const subCategoryOptions = [
  { label: '研究院介绍', value: 'research_institute' },
  { label: '数字创新中心', value: 'digital_center' },
  { label: '教育培训中心', value: 'education_center' },
  { label: '联系我们', value: 'contact' },
];

const activeTab = ref('research_institute');
const loading = ref(false);

// Mock 数据
const mockData = ref([
  {
    id: 1,
    subCategoryId: 'research_institute',
    title: '关于创新教育研究院',
    content:
      '<p>创新教育研究院成立于2010年，是一家专注于教育创新研究与实践的专业机构。</p><p>我们致力于推动教育理念创新、教学方法改革和人才培养模式探索。</p>',
    extraData: {},
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
  {
    id: 2,
    subCategoryId: 'digital_center',
    title: '关于数字创新中心',
    content:
      '<p>数字创新中心成立于2015年，是集技术研发、成果转化、人才培养于一体的综合性创新平台。</p>',
    extraData: {},
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
  {
    id: 3,
    subCategoryId: 'education_center',
    title: '关于教育培训中心',
    content:
      '<p>教育培训中心成立于2012年，是一家专注于职业技能培训和继续教育的专业机构。</p><p>我们以"专业培训，成就未来"为宗旨，为学员提供高质量、实用的培训课程。</p>',
    extraData: {},
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
  {
    id: 4,
    subCategoryId: 'contact',
    title: '联系我们',
    content: '<p>欢迎联系我们，获取更多信息。</p>',
    extraData: {
      phone: '400-123-4567',
      fax: '010-12345678',
      email: 'contact@example.com',
      website: 'https://www.example.com',
      address: '北京市海淀区中关村科技园',
      workWeekdays: '周一至周五 9:00 - 18:00',
      workWeekend: '周六至周日 休息',
    },
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
]);

// 当前Tab的数据
const currentData = computed(() => {
  return mockData.value.filter((item) => item.subCategoryId === activeTab.value);
});

// 表格配置
const gridOptions = ref<VxeGridProps>({
  columns: [
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
  ],
  data: [],
  height: 'auto',
  keepSource: true,
});

const { gridRef } = useVbenVxeGrid({ gridOptions });

function reload() {
  gridOptions.value.data = [...currentData.value];
}

// Modal相关
const modalVisible = ref(false);
const modalTitle = ref('');
const isEdit = ref(false);
const currentId = ref<number | null>(null);

// 表单数据
const formData = ref({
  title: '',
  content: '',
  extraData: {} as Record<string, string>,
});

// 打开新增Modal
function handleAdd() {
  isEdit.value = false;
  modalTitle.value = `新增 - ${subCategoryOptions.find((t) => t.value === activeTab.value)?.label}`;
  currentId.value = null;
  formData.value = {
    title: '',
    content: '',
    extraData: {},
  };
  // 如果是联系我们，初始化联系信息字段
  if (activeTab.value === 'contact') {
    formData.value.extraData = {
      phone: '',
      fax: '',
      email: '',
      website: '',
      address: '',
      workWeekdays: '',
      workWeekend: '',
    };
  }
  modalVisible.value = true;
}

// 打开编辑Modal
function handleEdit(row: any) {
  isEdit.value = true;
  modalTitle.value = '编辑内容';
  currentId.value = row.id;
  formData.value = {
    title: row.title,
    content: row.content || '',
    extraData: { ...row.extraData },
  };
  modalVisible.value = true;
}

// 保存
function handleSave() {
  if (!formData.value.title) {
    message.warning('请输入标题');
    return;
  }

  if (!formData.value.content) {
    message.warning('请输入详细介绍');
    return;
  }

  loading.value = true;
  setTimeout(() => {
    if (isEdit.value && currentId.value) {
      // 编辑
      const index = mockData.value.findIndex((item) => item.id === currentId.value);
      if (index !== -1) {
        mockData.value[index] = {
          ...mockData.value[index],
          title: formData.value.title,
          content: formData.value.content,
          extraData: formData.value.extraData,
          updateTime: new Date().toLocaleString('zh-CN'),
        };
      }
      message.success('更新成功');
    } else {
      // 新增
      const newId = Math.max(...mockData.value.map((item) => item.id), 0) + 1;
      mockData.value.push({
        id: newId,
        subCategoryId: activeTab.value,
        title: formData.value.title,
        content: formData.value.content,
        extraData: formData.value.extraData,
        isPublished: false,
        updateTime: new Date().toLocaleString('zh-CN'),
      });
      message.success('新增成功');
    }
    modalVisible.value = false;
    reload();
    loading.value = false;
  }, 500);
}

// 删除
function handleDelete(row: any) {
  loading.value = true;
  setTimeout(() => {
    const index = mockData.value.findIndex((item) => item.id === row.id);
    if (index !== -1) {
      mockData.value.splice(index, 1);
    }
    message.success('删除成功');
    reload();
    loading.value = false;
  }, 500);
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
    reload();
    loading.value = false;
  }, 500);
}

// 取消发布
function handleUnpublish(row: any) {
  loading.value = true;
  setTimeout(() => {
    row.isPublished = false;
    message.success('已取消发布');
    reload();
    loading.value = false;
  }, 500);
}

// Tab切换
function handleTabChange(key: string) {
  activeTab.value = key;
  reload();
}

// 监听Tab变化，重新加载表格
watch(activeTab, () => {
  reload();
});

onMounted(() => {
  reload();
});
</script>

<template>
  <div class="h-full p-4">
    <!-- 页面标题 -->
    <div class="mb-4">
      <h2 class="text-xl font-semibold">关于我们介绍管理</h2>
      <p class="text-sm text-gray-500">管理关于我们的各类信息，每个分类下可添加多条内容</p>
    </div>

    <!-- Tab切换和操作栏 -->
    <a-card class="mb-4">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane
          v-for="tab in subCategoryOptions"
          :key="tab.value"
          :tab="`${tab.label} (${currentData.filter(d => d.subCategoryId === tab.value).length})`"
        />
      </a-tabs>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          <span class="font-medium">当前分类：</span>
          <a-tag color="blue">{{ subCategoryOptions.find((t) => t.value === activeTab)?.label }}</a-tag>
          <span class="ml-4">共 {{ currentData.length }} 条内容</span>
        </div>
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <span class="text-base">+</span>
          </template>
          新增内容
        </a-button>
      </div>
    </a-card>

    <!-- 表格 -->
    <a-card>
      <vxe-grid ref="gridRef" v-bind="gridOptions">
        <template #status="{ row }">
          <a-tag v-if="row.isPublished" color="success">
            <template #icon>
              <span class="mr-1">✓</span>
            </template>
            已发布
          </a-tag>
          <a-tag v-else color="default">草稿</a-tag>
        </template>

        <template #action="{ row }">
          <a-space>
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
            <a-popconfirm
              title="确定要删除这条内容吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(row)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </vxe-grid>
    </a-card>

    <!-- 新增/编辑Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="1000"
      :mask-closable="false"
      :destroy-on-close="true"
    >
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
          <Tinymce v-model="formData.content" :height="300" />
        </a-form-item>

        <!-- 联系我们特有字段 -->
        <template v-if="activeTab === 'contact'">
          <a-divider orientation="left">联系信息</a-divider>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="咨询电话" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input v-model:value="formData.extraData.phone" placeholder="400-xxx-xxxx" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="传真号码" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input v-model:value="formData.extraData.fax" placeholder="010-xxxxxxxx" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="电子邮箱" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input v-model:value="formData.extraData.email" placeholder="example@xxx.com" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="官方网站" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input v-model:value="formData.extraData.website" placeholder="https://www.example.com" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="公司地址">
            <a-textarea v-model:value="formData.extraData.address" :rows="2" placeholder="请输入公司地址" />
          </a-form-item>

          <a-divider orientation="left">工作时间</a-divider>

          <a-form-item label="工作日时间">
            <a-input v-model:value="formData.extraData.workWeekdays" placeholder="例如：周一至周五 9:00 - 18:00" />
          </a-form-item>

          <a-form-item label="周末时间">
            <a-input v-model:value="formData.extraData.workWeekend" placeholder="例如：周六至周日 休息" />
          </a-form-item>
        </template>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="modalVisible = false">取消</a-button>
          <a-button type="primary" :loading="loading" @click="handleSave">
            保存
          </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>
