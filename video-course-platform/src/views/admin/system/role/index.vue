<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Role {
  roleId: number;
  roleName: string;
  roleCode: string;
  description: string;
  isSystem: boolean;
  createTime: string;
}

const loading = ref(false);
const roleList = ref<Role[]>([]);
const drawerVisible = ref(false);
const formRef = ref();

const formData = ref<Partial<Role>>({
  roleName: '',
  roleCode: '',
  description: '',
  isSystem: false,
});

const formRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
};

function generateMockData(): Role[] {
  return [
    { roleId: 1, roleName: '超级管理员', roleCode: 'super_admin', description: '拥有系统所有权限', isSystem: true, createTime: '2025-01-01' },
    { roleId: 2, roleName: '管理员', roleCode: 'admin', description: '拥有后台管理权限', isSystem: true, createTime: '2025-01-01' },
    { roleId: 3, roleName: '单位管理员', roleCode: 'org_admin', description: '单位管理员，管理本单位学员和课程', isSystem: true, createTime: '2025-01-01' },
    { roleId: 4, roleName: '教师', roleCode: 'teacher', description: '教师账号', isSystem: false, createTime: '2025-01-02' },
    { roleId: 5, roleName: '学员', roleCode: 'student', description: '前台学员账号', isSystem: false, createTime: '2025-01-02' },
  ];
}

function loadList() {
  loading.value = true;
  setTimeout(() => { roleList.value = generateMockData(); loading.value = false; }, 300);
}

function handleAdd() {
  formData.value = { roleName: '', roleCode: '', description: '', isSystem: false };
  drawerVisible.value = true;
}

function handleEdit(row: Role) {
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

function handleDelete(row: Role) {
  if (row.isSystem) {
    ElMessage.warning('系统角色不能删除');
    return;
  }
  ElMessageBox.confirm(`确认删除角色"${row.roleName}"吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { ElMessage.success('删除成功'); loadList(); })
    .catch(() => {});
}

function handleAuth(role: Role) {
  ElMessage.info(`配置角色"${role.roleName}"的权限`);
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="role-management">
    <div class="page-header"><h2>角色管理</h2><p>管理系统角色和权限</p></div>
    <el-card class="toolbar-card" shadow="never">
      <el-input placeholder="搜索角色名称" style="width: 200px; margin-right: 12px" clearable />
      <el-button type="primary">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </el-card>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="roleList" stripe>
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleCode" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="系统角色" width="100">
          <template #default="{ row }"><el-tag :type="row.isSystem ? 'warning' : 'info'">{{ row.isSystem ? '是' : '否' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAuth(row)">配置权限</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)" :disabled="row.isSystem">编辑</el-button>
            <el-popconfirm title="确认删除该角色吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <template #reference><el-button link type="danger" size="small" :disabled="row.isSystem">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-drawer v-model="drawerVisible" :title="formData.roleId ? '编辑角色' : '新增角色'" direction="rtl" size="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName"><el-input v-model="formData.roleName" placeholder="请输入角色名称" /></el-form-item>
        <el-form-item label="角色编码" prop="roleCode"><el-input v-model="formData.roleCode" placeholder="请输入角色编码" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" /></el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer"><el-button @click="drawerVisible = false">取消</el-button><el-button type="primary" :loading="loading" @click="handleSave">保存</el-button></div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.role-management { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.toolbar-card, .table-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.drawer-footer { display: flex; justify-content: flex-end; gap: $spacing-base; }
</style>
