<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface IntroductionContent {
  id: number;
  categoryId: string;
  subCategoryId: string;
  title: string;
  content: string;
  isPublished: boolean;
  createTime: string;
}

const loading = ref(false);
const introList = ref<IntroductionContent[]>([]);
const drawerVisible = ref(false);
const currentRecord = ref<IntroductionContent | null>(null);
const formRef = ref();

const formData = ref<Partial<IntroductionContent>>({
  categoryId: 'about_us',
  subCategoryId: 'research',
  title: '',
  content: '',
});

const subCategories = [
  { label: '关于研究院', value: 'research' },
  { label: '数字创新中心', value: 'digital' },
  { label: '教育培训中心', value: 'education' },
  { label: '联系我们', value: 'contact' },
];

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  subCategoryId: [{ required: true, message: '请选择类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

function generateMockData(): IntroductionContent[] {
  return [
    { id: 1, categoryId: 'about_us', subCategoryId: 'research', title: '关于研究院', content: '<p>研究院简介...</p>', isPublished: false, createTime: '2025-02-01 10:00:00' },
    { id: 2, categoryId: 'about_us', subCategoryId: 'digital', title: '数字创新中心', content: '<p>数字创新中心简介...</p>', isPublished: false, createTime: '2025-02-01 10:00:00' },
    { id: 3, categoryId: 'about_us', subCategoryId: 'education', title: '教育培训中心', content: '<p>教育培训中心简介...</p>', isPublished: false, createTime: '2025-02-01 10:00:00' },
    { id: 4, categoryId: 'about_us', subCategoryId: 'contact', title: '联系我们', content: '<p>联系方式...</p>', isPublished: false, createTime: '2025-02-01 10:00:00' },
  ];
}

function loadList() {
  loading.value = true;
  setTimeout(() => { introList.value = generateMockData(); loading.value = false; }, 300);
}

function handleAdd() {
  currentRecord.value = null;
  formData.value = { categoryId: 'about_us', subCategoryId: 'research', title: '', content: '' };
  drawerVisible.value = true;
}

function handleEdit(row: IntroductionContent) {
  currentRecord.value = row;
  formData.value = { ...row };
  drawerVisible.value = true;
}

async function handleSave() {
  try {
    await formRef.value?.validate();
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 600));
    ElMessage.success('保存成功');
    drawerVisible.value = false;
    loadList();
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

function handlePublish(row: IntroductionContent) {
  row.isPublished = true;
  ElMessage.success('发布成功');
  loadList();
}

function handleUnpublish(row: IntroductionContent) {
  row.isPublished = false;
  ElMessage.success('已取消发布');
  loadList();
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="intro-management">
    <div class="page-header"><h2>关于我们介绍管理</h2><p>管理关于我们页面的介绍信息</p></div>
    <el-card class="toolbar-card" shadow="never"><el-button type="primary" @click="handleAdd">新增介绍</el-button></el-card>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="introList" stripe>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="类型" width="150">
          <template #default="{ row }">
            {{ subCategories.find(c => c.value === row.subCategoryId)?.label || row.subCategoryId }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.isPublished ? 'success' : 'info'">{{ row.isPublished ? '已发布' : '草稿' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.isPublished" link type="success" size="small" @click="handlePublish(row)">发布</el-button>
            <el-button v-else link type="warning" size="small" @click="handleUnpublish(row)">取消</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-drawer v-model="drawerVisible" title="编辑介绍" direction="rtl" size="800px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="类型" prop="subCategoryId">
          <el-select v-model="formData.subCategoryId" placeholder="请选择类型" style="width: 100%">
            <el-option v-for="cat in subCategories" :key="cat.value" :label="cat.label" :value="cat.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title"><el-input v-model="formData.title" placeholder="请输入标题" /></el-form-item>
        <el-form-item label="内容" prop="content"><el-input v-model="formData.content" type="textarea" :rows="12" placeholder="请输入内容（支持HTML）" /></el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer"><el-button @click="drawerVisible = false">取消</el-button><el-button type="primary" :loading="loading" @click="handleSave">保存</el-button></div>
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
