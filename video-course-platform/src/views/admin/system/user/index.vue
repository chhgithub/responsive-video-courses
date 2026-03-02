<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAllTags,
  getUserTags,
  tagUser,
  untagUser,
  type UserTag,
} from '@/utils/user-tag-storage';

interface SystemUser {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  role?: string;
  organizationId?: string;
  status: string;
  createTime: string;
  tags?: UserTag[];
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

// 角色名称映射
function getRoleName(role: string): string {
  const roleMap: Record<string, string> = {
    'admin': '管理员',
    'org_admin': '单位管理员',
    'teacher': '教师',
    'student': '学员',
  };
  return roleMap[role] || role;
}

// 角色标签类型
function getRoleTagType(role: string): string {
  const typeMap: Record<string, string> = {
    'admin': 'danger',
    'org_admin': 'warning',
    'teacher': 'success',
    'student': 'info',
  };
  return typeMap[role] || 'info';
}

// 标签相关
const tagOptions = ref<UserTag[]>([]);
const tagDialogVisible = ref(false);
const tagDialogUserId = ref<number>();
const selectedTags = ref<number[]>([]);

// 加载标签选项
async function loadTagOptions() {
  tagOptions.value = getAllTags();
}

// 打开标签管理对话框
function openTagDialog(userId: number) {
  tagDialogUserId.value = userId;
  selectedTags.value = getUserTags(userId.toString()).map(t => t.tagId);
  tagDialogVisible.value = true;
}

// 关闭标签对话框
function closeTagDialog() {
  tagDialogVisible.value = false;
  selectedTags.value = [];
  tagDialogUserId.value = undefined;
}

// 保存用户标签
async function saveUserTags() {
  const userId = tagDialogUserId.value;
  if (!userId) return;

  const currentTags = getUserTags(userId.toString());
  const currentTagIds = currentTags.map(t => t.tagId);

  // 计算新增的标签
  const addedTagIds = selectedTags.value.filter(id => !currentTagIds.includes(id));

  // 计算移除的标签
  const removedTagIds = currentTagIds.filter(id => !selectedTags.value.includes(id));

  try {
    // 添加新标签
    addedTagIds.forEach(tagId => {
      tagUser(userId.toString(), tagId, '管理员');
    });

    // 移除旧标签
    removedTagIds.forEach(tagId => {
      untagUser(userId.toString(), tagId);
    });

    ElMessage.success('标签保存成功');
    closeTagDialog();
    loadList();
  } catch (error) {
    console.error('保存标签失败:', error);
    ElMessage.error('保存标签失败');
  }
}

function generateMockData(): SystemUser[] {
  // 系统用户
  const systemUsers: SystemUser[] = [
    {
      userId: 1001,
      username: 'admin',
      nickname: '总管理员',
      email: 'admin@example.com',
      phone: '13900139000',
      role: 'admin',
      status: 'active',
      createTime: '2024-01-01',
      tags: [{ tagId: 'tag_1', tagName: 'VIP用户', tagColor: '#ff4757' }],
    },
    {
      userId: 1002,
      username: 'org_admin',
      nickname: '单位管理员',
      email: 'org_admin@example.com',
      phone: '13900240000',
      role: 'org_admin',
      organizationId: 'test-org-001',
      status: 'active',
      createTime: '2024-01-02',
      tags: [{ tagId: 'tag_2', tagName: '单位管理员', tagColor: '#67c23a' }],
    },
    {
      userId: 1003,
      username: 'teacher',
      nickname: '教师账号',
      email: 'teacher@example.com',
      phone: '13900350000',
      role: 'teacher',
      status: 'active',
      createTime: '2024-01-03',
    },
  ];

  // 普通用户
  const regularUsers = Array.from({ length: 7 }, (_, i) => ({
    userId: i + 1,
    username: `user${i + 1}`,
    nickname: `用户${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `138${String(i).padStart(8, '0')}`,
    status: i % 3 === 0 ? 'inactive' : 'active',
    createTime: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: i <= 2 ? [{ tagId: `tag_${i % 3 + 1}`, tagName: i % 3 === 1 ? 'VIP用户' : '活跃用户', tagColor: '#ff4757' }] : [],
  }));

  return [...systemUsers, ...regularUsers];
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

onMounted(() => {
  loadList();
  loadTagOptions();
});
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
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.role" :type="getRoleTagType(row.role)" size="small">
              {{ getRoleName(row.role) }}
            </el-tag>
            <el-tag v-else type="info" size="small">学员</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="标签" width="180">
          <template #default="{ row }">
            <div v-if="row.tags && row.tags.length > 0" class="user-tags">
              <el-tag
                v-for="tag in row.tags"
                :key="tag.tagId"
                :style="{ background: tag.tagColor + '20', borderColor: tag.tagColor }"
                size="small"
              >
                {{ tag.tagName }}
              </el-tag>
            </div>
            <el-tag v-else type="info" size="small">暂无标签</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="info" size="small" @click="openTagDialog(row.userId)">标签</el-button>
            <el-button link type="warning" size="small">重置密码</el-button>
            <el-popconfirm title="确认删除该用户吗？" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)">
              <el-button link type="danger" size="small">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户编辑抽屉 -->
    <el-drawer v-model="drawerVisible" title="编辑用户" direction="rtl" size="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 标签管理对话框 -->
    <el-dialog v-model="tagDialogVisible" title="管理用户标签" width="500px">
      <el-form label-position="top">
        <el-form-item label="选择标签">
          <el-select
            v-model="selectedTags"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag.tagId"
              :label="tag.tagName"
              :value="tag.tagId"
            >
              <span>{{ tag.tagName }}</span>
              <span class="user-count">({{ tag.userCount }}人)</span>
            </el-option>
          </el-select>
        </el-form-item>

        <div class="tag-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>提示：该用户将被添加到选中的标签中，可以从标签管理创建新标签</span>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeTagDialog">取消</el-button>
          <el-button type="primary" @click="saveUserTags">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.user-management {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-large;

    h2 {
      margin: 0 0 $spacing-small 0;
      font-size: 24px;
      font-weight: 600;
      color: $text-color-primary;
    }

    p {
      margin: 0;
      font-size: $font-size-base;
      color: $text-color-secondary;
    }
  }

  .toolbar-card,
  .table-card {
    margin-bottom: $spacing-large;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .user-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-small;

    .el-tag {
      border: none;
    }
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-base;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-base;
  }

  .tag-hint {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    padding: $spacing-base;
    background: #ecf5ff;
    border-radius: $border-radius-base;
    color: #409eff;

    .el-icon {
      margin-right: 4px;
    }
  }
}
</style>
