<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface DictType {
  dictId: number;
  dictCode: string;
  dictName: string;
  description: string;
  status: string;
}

const loading = ref(false);
const dictList = ref<DictType[]>([]);
const drawerVisible = ref(false);
const formRef = ref();

const formData = ref<Partial<DictType>>({
  dictCode: '',
  dictName: '',
  description: '',
  status: 'active',
});

const formRules = {
  dictCode: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
};

function generateMockData(): DictType[] {
  return [
    { dictId: 1, dictCode: 'course_type', dictName: '课程类型', description: '课程分类类型', status: 'active' },
    { dictId: 2, dictCode: 'difficulty', dictName: '难度等级', description: '课程难度等级', status: 'active' },
    { dictId: 3, dictCode: 'age_group', dictName: '年龄阶段', description: '适用年龄阶段', status: 'active' },
  ];
}

function loadList() {
  loading.value = true;
  setTimeout(() => { dictList.value = generateMockData(); loading.value = false; }, 300);
}

function handleAdd() {
  formData.value = { dictCode: '', dictName: '', description: '', status: 'active' };
  drawerVisible.value = true;
}

function handleEdit(row: DictType) {
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
  } finally {
    loading.value = false;
  }
}

function handleDelete(row: DictType) {
  ElMessageBox.confirm(`确认删除字典"${row.dictName}"吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { ElMessage.success('删除成功'); loadList(); })
    .catch(() => {});
}

function handleData(row: DictType) {
  ElMessage.info(`管理字典"${row.dictName}"的数据项`);
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="dict-management">
    <div class="page-header"><h2>字典管理</h2><p>管理系统字典类型</p></div>
    <el-card class="toolbar-card" shadow="never">
      <el-input placeholder="搜索字典名称" style="width: 200px; margin-right: 12px" clearable />
      <el-button type="primary">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增字典</el-button>
    </el-card>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="dictList" stripe>
        <el-table-column prop="dictCode" label="字典编码" width="150" />
        <el-table-column prop="dictName" label="字典名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleData(row)">字典数据</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该字典吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <template #reference><el-button link type="danger" size="small">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-drawer v-model="drawerVisible" :title="formData.dictId ? '编辑字典' : '新增字典'" direction="rtl" size="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="字典编码" prop="dictCode"><el-input v-model="formData.dictCode" placeholder="请输入字典编码" /></el-form-item>
        <el-form-item label="字典名称" prop="dictName"><el-input v-model="formData.dictName" placeholder="请输入字典名称" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status"><el-radio value="active">启用</el-radio><el-radio value="inactive">禁用</el-radio></el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer"><el-button @click="drawerVisible = false">取消</el-button><el-button type="primary" :loading="loading" @click="handleSave">保存</el-button></div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.dict-management { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.toolbar-card, .table-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.drawer-footer { display: flex; justify-content: flex-end; gap: $spacing-base; }
</style>
