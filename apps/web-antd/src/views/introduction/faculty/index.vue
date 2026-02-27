<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { message } from 'ant-design-vue';
import Tinymce from '#/components/tinymce/src/editor.vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({
  name: 'FacultyManagement',
});

// Tab 子类别配置
const subCategoryOptions = [
  { label: '师资展示', value: 'showcase' },
  { label: '师资申请', value: 'application' },
  { label: '师资咨询', value: 'consultation' },
];

const activeTab = ref('showcase');
const loading = ref(false);

// Mock 数据
const mockData = ref([
  {
    id: 1,
    subCategoryId: 'showcase',
    title: '金牌讲师团队',
    content: '<p>我们拥有强大的师资团队，汇聚行业顶尖专家，为学员提供专业、实用的培训课程。</p><p>我们的讲师团队包括：</p><ul><li>资深行业专家</li><li>知名企业技术骨干</li><li>高校教授学者</li></ul>',
    extraData: {},
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
  {
    id: 2,
    subCategoryId: 'application',
    title: '成为我们的讲师',
    content: '<p>如果您是行业专家，欢迎加入我们的讲师团队。请填写以下申请信息。</p>',
    extraData: {
      applicationIntro:
        '<h3>申请成为讲师需要满足以下条件：</h3><ol><li>具有相关专业背景，本科及以上学历</li><li>有3年以上相关工作经验或2年以上教学经验</li><li>热爱教育事业，具备良好的沟通表达能力</li><li>能保证稳定的授课时间</li></ol><h3>申请流程：</h3><ol><li>提交申请资料</li><li>资格审核</li><li>试讲评估</li><li>签约合作</li></ol>',
    },
    isPublished: false,
    updateTime: '2025-02-01 10:00:00',
  },
  {
    id: 3,
    subCategoryId: 'consultation',
    title: '师资咨询服务',
    content: '<p>如果您有任何关于师资的问题，欢迎咨询。</p>',
    extraData: {
      consultIntro:
        '<h3>我们提供以下咨询服务：</h3><ul><li><strong>师资培训咨询：</strong>为企业和机构提供专业的师资培训方案</li><li><strong>课程设计咨询：</strong>根据需求定制专业课程内容</li><li><strong>教学方法咨询：</strong>提供先进的教学方法和工具指导</li></ul><h3>咨询方式：</h3><ul><li>电话咨询：400-123-4567</li><li>邮箱咨询：faculty@example.com</li><li>在线咨询：网站右下角客服</li></ul>',
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

// 根据Tab获取表单字段配置
function getFormFields() {
  if (activeTab.value === 'application') {
    return [{ key: 'applicationIntro', label: '申请说明' }];
  }
  if (activeTab.value === 'consultation') {
    return [{ key: 'consultIntro', label: '咨询服务说明' }];
  }
  return [];
}

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
  // 初始化extraData
  getFormFields().forEach((field) => {
    formData.value.extraData[field.key] = '';
  });
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
      <h2 class="text-xl font-semibold">师资介绍管理</h2>
      <p class="text-sm text-gray-500">管理师资展示、申请、咨询等信息，每个分类下可添加多条内容</p>
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

        <!-- 扩展字段富文本 -->
        <template v-if="getFormFields().length > 0">
          <a-divider orientation="left">详细信息</a-divider>
          <template v-for="field in getFormFields()" :key="field.key">
            <a-form-item :label="field.label">
              <Tinymce
                v-model="formData.extraData[field.key]"
                :height="250"
              />
            </a-form-item>
          </template>
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
