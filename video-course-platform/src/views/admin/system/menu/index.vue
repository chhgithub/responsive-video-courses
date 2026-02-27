<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Menu {
  menuId: number;
  parentId: number;
  menuName: string;
  menuType: string;
  path: string;
  icon: string;
  sortOrder: number;
  status: string;
}

const loading = ref(false);
const menuList = ref<Menu[]>([]);
const drawerVisible = ref(false);
const formRef = ref();

const formData = ref<Partial<Menu>>({
  parentId: 0,
  menuName: '',
  menuType: 'menu',
  path: '',
  icon: '',
  sortOrder: 0,
  status: 'active',
});

const formRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
};

function generateMockData(): Menu[] {
  return [
    { menuId: 1, parentId: 0, menuName: '系统管理', menuType: 'directory', path: '/system', icon: 'Setting', sortOrder: 1, status: 'active' },
    { menuId: 2, parentId: 1, menuName: '用户管理', menuType: 'menu', path: '/system/user', icon: 'User', sortOrder: 1, status: 'active' },
    { menuId: 3, parentId: 1, menuName: '角色管理', menuType: 'menu', path: '/system/role', icon: 'UserFilled', sortOrder: 2, status: 'active' },
    { menuId: 4, parentId: 1, menuName: '菜单管理', menuType: 'menu', path: '/system/menu', icon: 'Menu', sortOrder: 3, status: 'active' },
    { menuId: 5, parentId: 1, menuName: '字典管理', menuType: 'menu', path: '/system/dict', icon: 'Notebook', sortOrder: 4, status: 'active' },
  ];
}

function loadList() {
  loading.value = true;
  setTimeout(() => { menuList.value = generateMockData(); loading.value = false; }, 300);
}

function handleAdd() {
  formData.value = { parentId: 0, menuName: '', menuType: 'menu', path: '', icon: '', sortOrder: 0, status: 'active' };
  drawerVisible.value = true;
}

function handleEdit(row: Menu) {
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

function handleDelete(row: Menu) {
  ElMessageBox.confirm(`确认删除菜单"${row.menuName}"吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { ElMessage.success('删除成功'); loadList(); })
    .catch(() => {});
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="menu-management">
    <div class="page-header"><h2>菜单管理</h2><p>管理系统菜单结构</p></div>
    <el-card class="toolbar-card" shadow="never">
      <el-button type="primary" @click="handleAdd">新增菜单</el-button>
    </el-card>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="menuList" stripe row-key="menuId" default-expand-all>
        <el-table-column prop="menuName" label="菜单名称" width="200" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.menuType === 'directory'" type="warning">目录</el-tag>
            <el-tag v-else-if="row.menuType === 'menu'" type="success">菜单</el-tag>
            <el-tag v-else type="info">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="200" />
        <el-table-column prop="icon" label="图标" width="120" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该菜单吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <template #reference><el-button link type="danger" size="small">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-drawer v-model="drawerVisible" :title="formData.menuId ? '编辑菜单' : '新增菜单'" direction="rtl" size="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="菜单名称" prop="menuName"><el-input v-model="formData.menuName" placeholder="请输入菜单名称" /></el-form-item>
        <el-form-item label="菜单类型">
          <el-radio-group v-model="formData.menuType"><el-radio value="directory">目录</el-radio><el-radio value="menu">菜单</el-radio><el-radio value="button">按钮</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="路由路径" prop="path"><el-input v-model="formData.path" placeholder="请输入路由路径" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="formData.icon" placeholder="请输入图标名称" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" /></el-form-item>
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
.menu-management { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.toolbar-card, .table-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.drawer-footer { display: flex; justify-content: flex-end; gap: $spacing-base; }
</style>
