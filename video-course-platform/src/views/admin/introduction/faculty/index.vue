<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Faculty {
  id: number;
  name: string;
  title: string;
  avatar: string;
  specialties: string[];
  intro: string;
  isPublished: boolean;
  sortOrder: number;
  createTime: string;
}

const loading = ref(false);
const facultyList = ref<Faculty[]>([]);
const drawerVisible = ref(false);
const currentRecord = ref<Faculty | null>(null);
const formRef = ref();

const formData = ref<Partial<Faculty>>({
  name: '',
  title: '',
  avatar: '',
  specialties: [],
  intro: '',
  isPublished: false,
  sortOrder: 0,
});

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入头衔', trigger: 'blur' }],
  intro: [{ required: true, message: '请输入简介', trigger: 'blur' }],
};

function generateMockData(): Faculty[] {
  return [
    { id: 1, name: '张老师', title: '高级前端架构师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1', specialties: ['前端开发', 'Vue3'], intro: '10年前端开发经验', isPublished: true, sortOrder: 1, createTime: '2025-02-01 10:00:00' },
    { id: 2, name: '李老师', title: '资深后端工程师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2', specialties: ['后端开发', 'Node.js'], intro: '8年后端开发经验', isPublished: true, sortOrder: 2, createTime: '2025-02-01 10:00:00' },
  ];
}

function loadList() {
  loading.value = true;
  setTimeout(() => { facultyList.value = generateMockData(); loading.value = false; }, 300);
}

function handleAdd() {
  currentRecord.value = null;
  formData.value = { name: '', title: '', avatar: '', specialties: [], intro: '', isPublished: false, sortOrder: 0 };
  drawerVisible.value = true;
}

function handleEdit(row: Faculty) {
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

function handleDelete(row: Faculty) {
  ElMessageBox.confirm('确定要删除该讲师吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      const index = facultyList.value.findIndex((item) => item.id === row.id);
      if (index !== -1) facultyList.value.splice(index, 1);
      ElMessage.success('删除成功');
      loadList();
    })
    .catch(() => {});
}

function handleTogglePublish(row: Faculty) {
  row.isPublished = !row.isPublished;
  ElMessage.success(row.isPublished ? '发布成功' : '已取消发布');
  loadList();
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="faculty-management">
    <div class="page-header"><h2>师资介绍管理</h2><p>管理师资队伍展示的讲师信息</p></div>
    <el-card class="toolbar-card" shadow="never"><el-button type="primary" @click="handleAdd">新增讲师</el-button></el-card>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="facultyList" stripe>
        <el-table-column label="头像" width="100">
          <template #default="{ row }"><el-avatar :size="60" :src="row.avatar" /></template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="title" label="头衔" width="150" />
        <el-table-column label="专业领域" width="200">
          <template #default="{ row }">
            <el-tag v-for="spec in row.specialties" :key="spec" size="small" class="mr-1">{{ spec }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="intro" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.isPublished ? 'success' : 'info'">{{ row.isPublished ? '已发布' : '草稿' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleTogglePublish(row)">
              {{ row.isPublished ? '取消发布' : '发布' }}
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除该讲师吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <template #reference><el-button link type="danger" size="small">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-drawer v-model="drawerVisible" :title="currentRecord ? '编辑讲师' : '新增讲师'" direction="rtl" size="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="姓名" prop="name"><el-input v-model="formData.name" placeholder="请输入姓名" /></el-form-item>
        <el-form-item label="头衔" prop="title"><el-input v-model="formData.title" placeholder="请输入头衔" /></el-form-item>
        <el-form-item label="头像"><el-input v-model="formData.avatar" placeholder="请输入头像URL" /></el-form-item>
        <el-form-item label="专业领域"><el-input v-model="formData.specialties" placeholder="多个领域用逗号分隔" /></el-form-item>
        <el-form-item label="简介" prop="intro"><el-input v-model="formData.intro" type="textarea" :rows="4" placeholder="请输入简介" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer"><el-button @click="drawerVisible = false">取消</el-button><el-button type="primary" :loading="loading" @click="handleSave">保存</el-button></div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.faculty-management { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.toolbar-card, .table-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.drawer-footer { display: flex; justify-content: flex-end; gap: $spacing-base; }
.mr-1 { margin-right: 4px; }
</style>
