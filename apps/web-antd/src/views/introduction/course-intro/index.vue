<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import type { IntroductionContent } from '#/api/introduction';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({
  name: 'CourseIntroManagement',
});

const loading = ref(false);

const mockData = ref<IntroductionContent[]>([
  {
    id: 1,
    categoryId: 'course_intro',
    subCategoryId: 'default',
    title: '课程介绍',
    content: '<p>我们提供优质的视频课程，涵盖前端、后端、移动端等多个技术领域。</p>',
    isPublished: false,
    sortOrder: 1,
    createTime: '2025-02-01 10:00:00',
    updateTime: '2025-02-01 10:00:00',
  },
]);

const gridOptions = ref<VxeGridProps>({
  columns: [
    { type: 'checkbox', width: 50 },
    { field: 'title', title: '标题', minWidth: 200 },
    { field: 'isPublished', title: '状态', width: 100, slots: { default: 'status' } },
    { field: 'updateTime', title: '更新时间', width: 180 },
    { title: '操作', width: 280, fixed: 'right', slots: { default: 'action' } },
  ],
  data: [],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
});

const { gridRef } = useVbenVxeGrid({ gridOptions });

function reload() {
  gridOptions.value.data = [...mockData.value];
}

const drawerVisible = ref(false);
const drawerTitle = ref('');
const drawerMode = ref<'add' | 'edit'>('add');
const currentRecord = ref<IntroductionContent | null>(null);
const formData = ref<Partial<IntroductionContent>>({
  categoryId: 'course_intro',
  subCategoryId: 'default',
  title: '',
  content: '',
  extraData: {},
});

function handleAdd() {
  drawerMode.value = 'add';
  drawerTitle.value = '新增课程介绍';
  currentRecord.value = null;
  formData.value = { categoryId: 'course_intro', subCategoryId: 'default', title: '课程介绍', content: '', extraData: {}, isPublished: false, sortOrder: 0 };
  drawerVisible.value = true;
}

function handleEdit(row: IntroductionContent) {
  drawerMode.value = 'edit';
  drawerTitle.value = '编辑课程介绍';
  currentRecord.value = row;
  formData.value = { ...row };
  drawerVisible.value = true;
}

function handleSave() {
  loading.value = true;
  setTimeout(() => {
    if (drawerMode.value === 'add') {
      const newId = Math.max(...mockData.value.map((item) => item.id), 0) + 1;
      mockData.value.push({ ...formData.value, id: newId, createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN') } as IntroductionContent);
      message.success('新增成功');
    } else {
      const index = mockData.value.findIndex((item) => item.id === currentRecord.value?.id);
      if (index !== -1) {
        mockData.value[index] = { ...formData.value, updateTime: new Date().toLocaleString('zh-CN') } as IntroductionContent;
      }
      message.success('更新成功');
    }
    drawerVisible.value = false;
    reload();
    loading.value = false;
  }, 600);
}

function handleDelete(row: IntroductionContent) {
  loading.value = true;
  setTimeout(() => {
    const index = mockData.value.findIndex((item) => item.id === row.id);
    if (index !== -1) mockData.value.splice(index, 1);
    message.success('删除成功');
    reload();
    loading.value = false;
  }, 600);
}

function handlePublish(row: IntroductionContent) {
  loading.value = true;
  setTimeout(() => {
    mockData.value.forEach((item) => {
      if (item.categoryId === 'course_intro' && item.isPublished) {
        item.isPublished = false;
        item.publishTime = undefined;
      }
    });
    row.isPublished = true;
    row.publishTime = new Date().toLocaleString('zh-CN');
    message.success('发布成功！');
    reload();
    loading.value = false;
  }, 600);
}

function handleUnpublish(row: IntroductionContent) {
  loading.value = true;
  setTimeout(() => {
    row.isPublished = false;
    row.publishTime = undefined;
    message.success('已取消发布');
    reload();
    loading.value = false;
  }, 600);
}

onMounted(() => {
  gridOptions.value.data = [...mockData.value];
});
</script>

<template>
  <div class="course-intro-page h-full p-4">
    <div class="mb-4">
      <h2 class="text-xl font-semibold">课程介绍管理</h2>
      <p class="text-gray-500 text-sm">管理课程中心展示的介绍信息</p>
    </div>

    <div class="mb-4 flex justify-end">
      <a-button type="primary" @click="handleAdd">新增课程介绍</a-button>
    </div>

    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <template #status="{ row }">
        <a-tag v-if="row.isPublished" color="success">已发布</a-tag>
        <a-tag v-else color="default">草稿</a-tag>
      </template>
      <template #action="{ row }">
        <a-space>
          <a-button v-if="!row.isPublished" type="link" size="small" @click="handlePublish(row)">发布</a-button>
          <a-button v-else type="link" size="small" danger @click="handleUnpublish(row)">取消发布</a-button>
          <a-button type="link" size="small" @click="handleEdit(row)">编辑</a-button>
          <a-popconfirm title="确定要删除这条内容吗？" @confirm="handleDelete(row)">
            <a-button type="link" size="small" danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </vxe-grid>

    <a-drawer v-model:open="drawerVisible" :title="drawerTitle" :width="800" :mask-closable="false">
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="标题" required>
          <a-input v-model:value="formData.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="封面图">
          <a-input v-model:value="formData.coverImage" placeholder="请输入封面图URL" />
        </a-form-item>
        <a-form-item label="课程介绍">
          <a-textarea v-model:value="formData.content" :rows="12" placeholder="请输入课程介绍（支持HTML）" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button type="primary" :loading="loading" @click="handleSave">保存</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<style scoped>
.course-intro-page {
  background: #fff;
  border-radius: 8px;
}
</style>
