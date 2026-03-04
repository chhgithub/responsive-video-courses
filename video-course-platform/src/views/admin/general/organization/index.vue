<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAllOrganizations,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
  type Organization,
} from '@/utils/general-education-storage';

const loading = ref(false);
const organizations = ref<Organization[]>([]);

// 对话框
const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const currentOrg = ref<Organization | null>(null);

// 表单数据
const formData = ref({
  name: '',
  code: '',
  type: 'family' as 'family' | 'school',
  contactPerson: '',
  contactPhone: '',
  description: '',
});

const formRules = {
  name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入单位编码', trigger: 'blur' }],
  // type: [{ required: true, message: '请选择单位类型', trigger: 'change' }],
};

const formRef = ref();

// 加载单位列表
async function loadData() {
  loading.value = true;
  try {
    organizations.value = getAllOrganizations();
  } catch (error) {
    console.error('加载失败:', error);
    ElMessage.error('加载单位列表失败');
  } finally {
    loading.value = false;
  }
}

// 添加单位
function handleAdd() {
  dialogMode.value = 'add';
  currentOrg.value = null;
  formData.value = {
    name: '',
    code: '',
    type: 'family',
    contactPerson: '',
    contactPhone: '',
    description: '',
  };
  dialogVisible.value = true;
}

// 编辑单位
function handleEdit(org: Organization) {
  dialogMode.value = 'edit';
  currentOrg.value = org;
  formData.value = { ...org };
  dialogVisible.value = true;
}

// 删除单位
async function handleDelete(org: Organization) {
  try {
    await ElMessageBox.confirm(`确认删除单位"${org.name}"吗？`, '确认删除', {
      type: 'warning',
    });

    const success = deleteOrganization(org.id);
    if (success) {
      ElMessage.success('删除成功');
      await loadData();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    // 用户取消
  }
}

// 查看统计
function handleViewStats(org: Organization) {
  const stats = getOrganizationStats(org.id);
  ElMessageBox.alert(
    `总兑换码：${stats.totalCodes}个\n未使用：${stats.unusedCodes}个\n已使用：${stats.usedCodes}个\n已过期：${stats.expiredCodes}个\n\n总兑换次数：${stats.totalRedemptions}次`,
    `${org.name}统计`,
    {
      type: 'info',
    },
  );
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();

    if (dialogMode.value === 'add') {
      addOrganization(formData.value);
      ElMessage.success('添加成功');
    } else {
      updateOrganization(currentOrg.value!.id, formData.value);
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    await loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

// 类型映射
const typeMap = {
  family: '家庭教育',
  school: '校园教育',
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="organization-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>单位管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加单位
      </el-button>
    </div>

    <!-- 单位列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="organizations"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="单位名称" width="200" />
        <el-table-column prop="code" label="单位编码" width="150" />
        <!-- <el-table-column prop="type" label="单位类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'family' ? 'success' : 'primary'">
              {{ typeMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="contactPerson" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ new Date(row.createTime).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewStats(row)">
              统计
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && organizations.length === 0" description="暂无单位数据">
        <el-button type="primary" @click="handleAdd">添加第一个单位</el-button>
      </el-empty>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '添加单位' : '编辑单位'"
      width="600px"
      @close="formRef?.resetFields()"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="单位名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入单位名称" />
        </el-form-item>

        <el-form-item label="单位编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入单位编码（唯一标识）"
            :disabled="dialogMode === 'edit'"
          />
          <div class="field-tip">用于生成兑换码前缀，建议使用英文或拼音</div>
        </el-form-item>

        <!-- <el-form-item label="单位类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="family">家庭教育</el-radio>
            <el-radio label="school">校园教育</el-radio>
          </el-radio-group>
        </el-form-item> -->

        <el-form-item label="联系人">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="单位描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入单位描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.organization-page {
  padding: $spacing-large;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;

    h2 {
      font-size: 24px;
      color: $text-color-primary;
      margin: 0;
    }
  }

  .table-card {
    .field-tip {
      margin-top: $spacing-small;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}
</style>
