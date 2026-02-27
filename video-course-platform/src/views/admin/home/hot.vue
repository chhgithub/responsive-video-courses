<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHotTopics, deleteHotTopic, toggleHotTopicStatus, type HotTopic } from '@/utils/news-storage';

// 数据列表
const hotList = ref<HotTopic[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 抽屉相关
const drawerVisible = ref(false);
const editingId = ref<string | undefined>();

// 表单数据
const formData = ref({
  title: '',
  link: '',
  coverImage: '',
  orderNum: 0,
  status: '1',
});

// 表单引用
const formRef = ref();

// 上传的图片URL
const uploadedImageUrl = ref('');

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入热点标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应为 2-100 个字符', trigger: 'blur' },
  ],
  link: [
    { required: true, message: '请输入链接', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' },
  ],
  orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
};

// 加载数据
function loadData() {
  loading.value = true;
  try {
    hotList.value = getHotTopics();
    hotList.value.sort((a, b) => a.orderNum - b.orderNum);
  } finally {
    loading.value = false;
  }
}

// 表格选择变化
function handleSelectionChange(selection: HotTopic[]) {
  selectedIds.value = selection.map((item) => item.id);
}

// 新增
function handleAdd() {
  editingId.value = undefined;
  formData.value = {
    title: '',
    link: '',
    coverImage: '',
    orderNum: 0,
    status: '1',
  };
  uploadedImageUrl.value = '';
  drawerVisible.value = true;
}

// 编辑
function handleEdit(row: HotTopic) {
  editingId.value = row.id;
  formData.value = {
    title: row.title,
    link: row.link,
    coverImage: row.coverImage || '',
    orderNum: row.orderNum,
    status: row.status,
  };
  uploadedImageUrl.value = row.coverImage || '';
  drawerVisible.value = true;
}

// 删除
function handleDelete(row: HotTopic) {
  ElMessageBox.confirm(`确认删除热点"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteHotTopic(row.id);
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
        deleteHotTopic(id);
      });
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadData();
    })
    .catch(() => {});
}

// 切换状态
function handleToggleStatus(row: HotTopic) {
  toggleHotTopicStatus(row.id);
  ElMessage.success(`已${row.status === '1' ? '禁用' : '启用'}`);
  loadData();
}

// 图片上传前验证
function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return false;
  }

  return true;
}

// 自定义上传处理（转换为base64）
function handleUpload(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageUrl.value = e.target?.result as string;
    ElMessage.success('图片上传成功');
  };
  reader.onerror = () => {
    ElMessage.error('图片上传失败');
  };
  reader.readAsDataURL(file);
  return false; // 阻止自动上传
}

// 删除图片
function handleRemoveImage() {
  uploadedImageUrl.value = '';
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    loading.value = true;

    const data = {
      title: formData.value.title,
      link: formData.value.link,
      coverImage: uploadedImageUrl.value,
      orderNum: formData.value.orderNum,
      status: formData.value.status,
    };

    if (editingId.value) {
      // 更新
      const index = hotList.value.findIndex((h) => h.id === editingId.value);
      if (index !== -1) {
        hotList.value[index] = { ...hotList.value[index], ...data };
        localStorage.setItem('portal_hot_topics', JSON.stringify(hotList.value));
      }
      ElMessage.success('更新成功');
    } else {
      // 新增
      const newItem = {
        id: Date.now().toString(),
        ...data,
        createTime: new Date().toISOString(),
      };
      hotList.value.push(newItem);
      localStorage.setItem('portal_hot_topics', JSON.stringify(hotList.value));
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
  <div class="hot-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>热点话题</h2>
      <p class="subtitle">管理热点话题信息</p>
    </div>

    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增热点
        </el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="hotList"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column label="封面图" width="150">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              :preview-src-list="[row.coverImage]"
              fit="cover"
              style="width: 120px; height: 80px; border-radius: 4px"
              preview-teleported
            />
            <span v-else class="text-placeholder">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="热点标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="link" label="链接" min-width="200" show-overflow-tooltip />
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
      :title="editingId ? '编辑热点' : '新增热点'"
      size="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <!-- 热点标题 -->
        <el-form-item label="热点标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入热点标题"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 链接 -->
        <el-form-item label="链接" prop="link">
          <el-input
            v-model="formData.link"
            placeholder="请输入链接地址"
            clearable
          >
            <template #prepend>https://</template>
          </el-input>
        </el-form-item>

        <!-- 封面图 -->
        <el-form-item label="封面图">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="({ file }) => handleUpload(file as File)"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            drag
          >
            <div v-if="!uploadedImageUrl" class="upload-placeholder">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                <p>拖拽图片到此处或<em>点击上传</em></p>
                <p class="upload-hint">支持 jpg、png、gif 格式，大小不超过 5MB</p>
              </div>
            </div>
            <div v-else class="uploaded-image">
              <img :src="uploadedImageUrl" alt="封面图预览" />
              <div class="image-mask">
                <el-icon @click.stop="handleRemoveImage"><Delete /></el-icon>
              </div>
            </div>
          </el-upload>
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

.hot-management {
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

.text-placeholder {
  color: $text-color-placeholder;
  font-size: $font-size-small;
}

.upload-placeholder {
  padding: $spacing-extra-large;
  text-align: center;

  .upload-icon {
    font-size: 48px;
    color: $text-color-placeholder;
    margin-bottom: $spacing-base;
  }

  .upload-text {
    p {
      margin: $spacing-small 0;
      font-size: $font-size-base;
      color: $text-color-primary;

      em {
        color: #409eff;
        font-style: normal;
      }
    }

    .upload-hint {
      font-size: $font-size-small;
      color: $text-color-placeholder;
    }
  }
}

.uploaded-image {
  position: relative;
  width: 100%;
  height: 200px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: $border-radius-base;
  }

  .image-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: $transition-base;
    border-radius: $border-radius-base;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    .el-icon {
      font-size: 32px;
      color: #fff;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
}

:deep(.el-upload-dragger) {
  padding: 0;
  width: 100%;
  height: 200px;
  border: 1px dashed $border-color-base;
  border-radius: $border-radius-base;

  &:hover {
    border-color: #409eff;
  }
}
</style>
