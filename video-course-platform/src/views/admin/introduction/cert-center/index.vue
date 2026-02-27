<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface IntroductionContent {
  id: number;
  categoryId: string;
  subCategoryId: string;
  title: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  sortOrder: number;
  createTime: string;
  updateTime?: string;
  publishTime?: string;
}

const loading = ref(false);
const introList = ref<IntroductionContent[]>([]);
const drawerVisible = ref(false);
const drawerTitle = ref('');
const drawerMode = ref<'add' | 'edit'>('add');
const currentRecord = ref<IntroductionContent | null>(null);
const formRef = ref();

const formData = ref<Partial<IntroductionContent>>({
  categoryId: 'cert_center',
  subCategoryId: 'default',
  title: '认证中心介绍',
  content: '',
  coverImage: '',
  isPublished: false,
  sortOrder: 0,
});

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

function generateMockData(): IntroductionContent[] {
  return [{
    id: 1,
    categoryId: 'cert_center',
    subCategoryId: 'default',
    title: '认证中心介绍',
    content: '<p>我们提供专业的职业技能认证服务，帮助学员提升职业竞争力。</p>',
    isPublished: false,
    sortOrder: 1,
    createTime: '2025-02-01 10:00:00',
    updateTime: '2025-02-01 10:00:00',
  }];
}

function loadList() {
  loading.value = true;
  setTimeout(() => {
    introList.value = generateMockData();
    loading.value = false;
  }, 300);
}

function handleAdd() {
  drawerMode.value = 'add';
  drawerTitle.value = '新增认证介绍';
  currentRecord.value = null;
  formData.value = { categoryId: 'cert_center', subCategoryId: 'default', title: '认证中心介绍', content: '', coverImage: '', isPublished: false, sortOrder: 0 };
  drawerVisible.value = true;
}

function handleEdit(row: IntroductionContent) {
  drawerMode.value = 'edit';
  drawerTitle.value = '编辑认证介绍';
  currentRecord.value = row;
  formData.value = { ...row };
  drawerVisible.value = true;
}

async function handleSave() {
  try {
    await formRef.value?.validate();
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 600));
    if (drawerMode.value === 'add') {
      const newId = Math.max(...introList.value.map((item) => item.id), 0) + 1;
      introList.value.push({ ...formData.value, id: newId, createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN') } as IntroductionContent);
      ElMessage.success('新增成功');
    } else {
      const index = introList.value.findIndex((item) => item.id === currentRecord.value?.id);
      if (index !== -1) introList.value[index] = { ...formData.value, updateTime: new Date().toLocaleString('zh-CN') } as IntroductionContent;
      ElMessage.success('更新成功');
    }
    drawerVisible.value = false;
    loadList();
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

function handleDelete(row: IntroductionContent) {
  ElMessageBox.confirm('确定要删除这条内容吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      const index = introList.value.findIndex((item) => item.id === row.id);
      if (index !== -1) introList.value.splice(index, 1);
      ElMessage.success('删除成功');
      loadList();
    })
    .catch(() => {});
}

function handlePublish(row: IntroductionContent) {
  loading.value = true;
  setTimeout(() => {
    introList.value.forEach((item) => { if (item.categoryId === 'cert_center' && item.isPublished) { item.isPublished = false; item.publishTime = undefined; } });
    row.isPublished = true;
    row.publishTime = new Date().toLocaleString('zh-CN');
    ElMessage.success('发布成功！');
    loadList();
    loading.value = false;
  }, 600);
}

function handleUnpublish(row: IntroductionContent) {
  loading.value = true;
  setTimeout(() => {
    row.isPublished = false;
    row.publishTime = undefined;
    ElMessage.success('已取消发布');
    loadList();
    loading.value = false;
  }, 600);
}

function handleDrawerClosed() {
  formRef.value?.resetFields();
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="intro-management">
    <div class="page-header">
      <h2>认证中心介绍管理</h2>
      <p>管理认证中心展示的介绍信息</p>
    </div>

    <el-card class="toolbar-card" shadow="never">
      <el-button type="primary" @click="handleAdd">新增认证介绍</el-button>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="introList" stripe>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPublished ? 'success' : 'info'">{{ row.isPublished ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.isPublished" link type="success" size="small" @click="handlePublish(row)">发布</el-button>
            <el-button v-else link type="warning" size="small" @click="handleUnpublish(row)">取消发布</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除这条内容吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <template #reference><el-button link type="danger" size="small">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="drawerVisible" :title="drawerTitle" direction="rtl" size="800px" @closed="handleDrawerClosed">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title"><el-input v-model="formData.title" placeholder="请输入标题" /></el-form-item>
        <el-form-item label="封面图"><el-input v-model="formData.coverImage" placeholder="请输入封面图URL" /></el-form-item>
        <el-form-item label="认证介绍" prop="content"><el-input v-model="formData.content" type="textarea" :rows="12" placeholder="请输入认证介绍（支持HTML）" /></el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.intro-management { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.toolbar-card, .table-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.drawer-footer { display: flex; justify-content: flex-end; gap: $spacing-base; }
</style>
