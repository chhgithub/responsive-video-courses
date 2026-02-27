<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface SystemUser {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: string;
  createTime: string;
}

const loading = ref(false);
const userList = ref<SystemUser[]>([]);
const drawerVisible = ref(false);
const formRef = ref();

const formData = ref<Partial<SystemUser>>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: 'active',
});

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
};

function generateMockData(): SystemUser[] {
  return Array.from({ length: 10 }, (_, i) => ({
    userId: i + 1,
    username: `user${i + 1}`,
    nickname: `用户${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `138${String(i).padStart(8, '0')}`,
    status: i % 3 === 0 ? 'inactive' : 'active',
    createTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
}

function loadList() {
  loading.value = true;
  setTimeout(() => { userList.value = generateMockData(); loading.value = false; }, 300);
}

function handleAdd() {
  formData.value = { username: '', nickname: '', email: '', phone: '', status: 'active' };
  drawerVisible.value = true;
}

function handleEdit(row: SystemUser) {
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

function handleDelete(row: SystemUser) {
  ElMessageBox.confirm(`确认删除用户"${row.nickname}"吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => { ElMessage.success('删除成功'); loadList(); })
    .catch(() => {});
}

onMounted(() => { loadList(); });
</script>

<template>
  <div class="user-management">
    <div class="page-header"><h2>用户管理</h2><p>管理系统用户账号</p></div>
    <el-card class="toolbar-card" shadow="never">
      <el-input placeholder="搜索用户名或昵称" style="width: 200px; margin-right: 12px" clearable />
      <el-button type="primary">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </el-card>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="userList" stripe>
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '正常' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" size="small">重置密码</el-button>
            <el-popconfirm title="确认删除该用户吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <template #reference><el-button link type="danger" size="small">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-drawer v-model="drawerVisible" :title="formData.userId ? '编辑用户' : '新增用户'" direction="rtl" size="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username"><el-input v-model="formData.username" placeholder="请输入用户名" /></el-form-item>
        <el-form-item label="昵称" prop="nickname"><el-input v-model="formData.nickname" placeholder="请输入昵称" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="formData.email" placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="formData.phone" placeholder="请输入手机号" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status"><el-radio value="active">正常</el-radio><el-radio value="inactive">禁用</el-radio></el-radio-group>
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
.user-management { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.toolbar-card, .table-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.drawer-footer { display: flex; justify-content: flex-end; gap: $spacing-base; }
</style>
