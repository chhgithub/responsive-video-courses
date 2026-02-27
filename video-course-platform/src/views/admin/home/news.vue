<script setup lang="ts">
import { ref, onMounted } from 'vue';
import RichTextEditor from '@/components/common/RichTextEditor.vue';
import { getNews, deleteNews, toggleNewsStatus, type News } from '@/utils/news-storage';

// 数据列表
const newsList = ref<News[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 抽屉相关
const drawerVisible = ref(false);
const editingId = ref<string | undefined>();

// 表单数据
const formData = ref({
  title: '',
  category: '新闻',
  content: '',
  publishTime: '',
  orderNum: 0,
  status: '1',
});

// 表单引用
const formRef = ref();

// 富文本编辑器引用
const editorRef = ref();

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应为 2-100 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  publishTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
};

// 分类选项
const categoryOptions = ['新闻', '公告', '通知', '活动'];

// 加载数据
function loadData() {
  loading.value = true;
  try {
    newsList.value = getNews();
    newsList.value.sort((a, b) => a.orderNum - b.orderNum);
  } finally {
    loading.value = false;
  }
}

// 表格选择变化
function handleSelectionChange(selection: News[]) {
  selectedIds.value = selection.map((item) => item.id);
}

// 新增
function handleAdd() {
  editingId.value = undefined;
  formData.value = {
    title: '',
    category: '新闻',
    content: '',
    publishTime: new Date().toISOString().slice(0, 16),
    orderNum: 0,
    status: '1',
  };
  drawerVisible.value = true;
}

// 编辑
function handleEdit(row: News) {
  editingId.value = row.id;
  formData.value = {
    title: row.title,
    category: row.category,
    content: row.content,
    publishTime: row.publishTime,
    orderNum: row.orderNum,
    status: row.status,
  };
  drawerVisible.value = true;
}

// 删除
function handleDelete(row: News) {
  ElMessageBox.confirm(`确认删除资讯"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteNews(row.id);
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
        deleteNews(id);
      });
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

// 切换状态
function handleToggleStatus(row: News) {
  toggleNewsStatus(row.id);
  ElMessage.success(`已${row.status === '1' ? '禁用' : '启用'}`);
  loadData();
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    loading.value = true;

    const data = {
      title: formData.value.title,
      category: formData.value.category,
      content: formData.value.content,
      publishTime: formData.value.publishTime,
      orderNum: formData.value.orderNum,
      status: formData.value.status,
    };

    if (editingId.value) {
      // 更新
      const index = newsList.value.findIndex((n) => n.id === editingId.value);
      if (index !== -1) {
        newsList.value[index] = { ...newsList.value[index], ...data };
        localStorage.setItem('portal_news', JSON.stringify(newsList.value));
      }
      ElMessage.success('更新成功');
    } else {
      // 新增
      const newItem = {
        id: Date.now().toString(),
        ...data,
        createTime: new Date().toISOString(),
      };
      newsList.value.push(newItem);
      localStorage.setItem('portal_news', JSON.stringify(newsList.value));
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
  <div class="news-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>资讯公告</h2>
      <p class="subtitle">管理新闻公告信息</p>
    </div>

    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增资讯
        </el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="newsList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
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
      :title="editingId ? '编辑资讯' : '新增资讯'"
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
        <!-- 标题 -->
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入标题"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 分类 -->
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>

        <!-- 发布时间 -->
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="formData.publishTime"
            type="datetime"
            placeholder="请选择发布时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 内容 -->
        <el-form-item label="内容" prop="content">
          <RichTextEditor v-model="formData.content" :height="300" />
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

.news-management {
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
