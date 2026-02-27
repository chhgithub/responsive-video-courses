<script setup lang="ts">
import { ref, onMounted } from 'vue';
import RichTextEditor from '@/components/common/RichTextEditor.vue';
import { getActivities, deleteActivity, toggleActivityStatus, type Activity } from '@/utils/news-storage';

// 数据列表
const activityList = ref<Activity[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 抽屉相关
const drawerVisible = ref(false);
const editingId = ref<string | undefined>();

// 表单数据
const formData = ref({
  title: '',
  startDate: '',
  endDate: '',
  location: '',
  description: '',
  orderNum: 0,
  status: '1',
});

// 表单引用
const formRef = ref();

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应为 2-100 个字符', trigger: 'blur' },
  ],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
};

// 加载数据
function loadData() {
  loading.value = true;
  try {
    activityList.value = getActivities();
    activityList.value.sort((a, b) => a.orderNum - b.orderNum);
  } finally {
    loading.value = false;
  }
}

// 表格选择变化
function handleSelectionChange(selection: Activity[]) {
  selectedIds.value = selection.map((item) => item.id);
}

// 新增
function handleAdd() {
  editingId.value = undefined;
  formData.value = {
    title: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date().toISOString().slice(0, 16),
    location: '',
    description: '',
    orderNum: 0,
    status: '1',
  };
  drawerVisible.value = true;
}

// 编辑
function handleEdit(row: Activity) {
  editingId.value = row.id;
  formData.value = {
    title: row.title,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    description: row.description || '',
    orderNum: row.orderNum,
    status: row.status,
  };
  drawerVisible.value = true;
}

// 删除
function handleDelete(row: Activity) {
  ElMessageBox.confirm(`确认删除活动"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteActivity(row.id);
      ElMessage.success('删除成功');
      loadData();
    })
    .catch(() => {});
}

// 批量删除
function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的记录');
    return;
  }

  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      selectedIds.value.forEach((id) => {
        deleteActivity(id);
      });
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

// 切换状态
function handleToggleStatus(row: Activity) {
  toggleActivityStatus(row.id);
  ElMessage.success(`已${row.status === '1' ? '禁用' : '启用'}`);
  loadData();
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 验证结束时间不能早于开始时间
    if (new Date(formData.value.endDate) < new Date(formData.value.startDate)) {
      ElMessage.error('结束时间不能早于开始时间');
      return;
    }

    loading.value = true;

    const data = {
      title: formData.value.title,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      location: formData.value.location,
      description: formData.value.description,
      orderNum: formData.value.orderNum,
      status: formData.value.status,
    };

    if (editingId.value) {
      // 更新
      const index = activityList.value.findIndex((a) => a.id === editingId.value);
      if (index !== -1) {
        activityList.value[index] = { ...activityList.value[index], ...data };
        localStorage.setItem('portal_activities', JSON.stringify(activityList.value));
      }
      ElMessage.success('更新成功');
    } else {
      // 新增
      const newItem = {
        id: Date.now().toString(),
        ...data,
        createTime: new Date().toISOString(),
      };
      activityList.value.push(newItem);
      localStorage.setItem('portal_activities', JSON.stringify(activityList.value));
      ElMessage.success('新增成功');
    }

    drawerVisible.value = false;
    loadData();
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

// 关闭抽屉
function handleClose() {
  drawerVisible.value = false;
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="activity-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>活动日历</h2>
      <p class="subtitle">管理活动信息</p>
    </div>

    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增活动
        </el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="activityList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="startDate" label="开始时间" width="170" />
        <el-table-column prop="endDate" label="结束时间" width="170" />
        <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === '1' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === '1' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="editingId ? '编辑活动' : '新增活动'"
      size="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <!-- 活动标题 -->
        <el-form-item label="活动标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入活动标题"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 开始时间 -->
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="datetime"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 结束时间 -->
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="datetime"
            placeholder="请选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 地点 -->
        <el-form-item label="地点" prop="location">
          <el-input
            v-model="formData.location"
            placeholder="请输入活动地点"
            maxlength="200"
            clearable
          />
        </el-form-item>

        <!-- 活动描述 -->
        <el-form-item label="活动描述" prop="description">
          <RichTextEditor v-model="formData.description" :height="300" />
        </el-form-item>

        <!-- 排序 -->
        <el-form-item label="排序" prop="orderNum">
          <el-input-number
            v-model="formData.orderNum"
            :min="0"
            :step="1"
            placeholder="数字越小越靠前"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.activity-management {
  padding: $spacing-large;
}

.page-header {
  margin-bottom: $spacing-large;

  h2 {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .subtitle {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

.toolbar-card {
  margin-bottom: $spacing-large;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
}
</style>
