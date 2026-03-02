<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getUsersByTag,
  type UserTag,
} from '@/utils/user-tag-storage';

const loading = ref(false);
const tags = ref<UserTag[]>([]);

// 标签表单
const tagFormVisible = ref(false);
const tagForm = ref({
  tagId: '',
  tagName: '',
  tagColor: '#409eff',
  description: '',
});
const formMode = ref<'add' | 'edit'>('add');

// 标签颜色选项
const tagColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
  '#909399', '#ff4757', '#1890ff', '#722ed1',
  '#ff4757', '#13ce66', '#52c41a', '#faad14',
  '#ffb800', '#a0d911', '#1890ff', '#c3a1b1',
];

// 加载标签列表
async function loadTags() {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    tags.value = getAllTags();
  } finally {
    loading.value = false;
  }
}

// 打开新增标签对话框
function handleAdd() {
  formMode.value = 'add';
  tagForm.value = {
    tagId: '',
    tagName: '',
    tagColor: '#409eff',
    description: '',
  };
  tagFormVisible.value = true;
}

// 打开编辑标签对话框
function handleEdit(tag: UserTag) {
  formMode.value = 'edit';
  tagForm.value = {
    tagId: tag.tagId,
    tagName: tag.tagName,
    tagColor: tag.tagColor,
    description: tag.description || '',
  };
  tagFormVisible.value = true;
}

// 提交标签
async function handleSubmit() {
  if (!tagForm.value.tagName.trim()) {
    ElMessage.warning('请输入标签名称');
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (formMode.value === 'add') {
      createTag({
        tagName: tagForm.value.tagName,
        tagColor: tagForm.value.tagColor,
        description: tagForm.value.description,
      });
      ElMessage.success('标签创建成功');
    } else {
      updateTag(tagForm.value.tagId, {
        tagName: tagForm.value.tagName,
        tagColor: tagForm.value.tagColor,
        description: tagForm.value.description,
      });
      ElMessage.success('标签更新成功');
    }

    tagFormVisible.value = false;
    loadTags();
  } catch (error) {
    console.error('提交标签失败:', error);
    ElMessage.error('操作失败');
  }
}

// 删除标签
function handleDelete(tag: UserTag) {
  ElMessageBox.confirm(
    `确定删除标签"${tag.tagName}"吗？删除后用户将失去该标签。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      deleteTag(tag.tagId);
      ElMessage.success('删除成功');
      loadTags();
    })
    .catch(() => {});
}

// 查看标签用户
function handleViewUsers(tag: UserTag) {
  const userIds = getUsersByTag(tag.tagId);
  ElMessageBox.alert(
    `标签"${tag.tagName}"下共有 ${userIds.length} 个用户`,
    '用户列表',
    {
      confirmButtonText: '确定',
      type: 'info',
    }
  );
}

// 关闭对话框
function handleClose() {
  tagFormVisible.value = false;
}

onMounted(() => {
  loadTags();
});
</script>

<template>
  <div class="tag-management">
    <el-card>
      <template #header>
        <div class="header">
          <h2>用户标签管理</h2>
          <el-button type="primary" @click="handleAdd">
            新增标签
          </el-button>
        </div>
      </template>

      <!-- 标签列表 -->
      <div v-loading="loading" class="tag-list">
        <div
          v-for="tag in tags"
          :key="tag.tagId"
          class="tag-item"
        >
          <div class="tag-color-dot" :style="{ background: tag.tagColor }"></div>
          <div class="tag-info">
            <div class="tag-name">{{ tag.tagName }}</div>
            <div class="tag-meta">
              <span class="user-count">{{ tag.userCount }} 人</span>
              <span class="description">{{ tag.description || '暂无描述' }}</span>
            </div>
            <div class="tag-actions">
              <el-button link type="primary" size="small" @click="handleEdit(tag)">
                编辑
              </el-button>
              <el-button link type="info" size="small" @click="handleViewUsers(tag)">
                查看用户
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(tag)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="tags.length === 0 && !loading" description="暂无标签" />
      </div>
    </el-card>

    <!-- 标签表单对话框 -->
    <el-dialog
      v-model="tagFormVisible"
      :title="formMode === 'add' ? '新增标签' : '编辑标签'"
      width="500px"
      @close="handleClose"
    >
      <el-form :model="tagForm" label-width="100px">
        <el-form-item label="标签名称" required>
          <el-input v-model="tagForm.tagName" placeholder="请输入标签名称" maxlength="20" show-word-limit />
        </el-form-item>

        <el-form-item label="标签颜色" required>
          <div class="color-picker">
            <div
              v-for="color in tagColors"
              :key="color"
              class="color-option"
              :class="{ active: tagForm.tagColor === color }"
              @click="tagForm.tagColor = color"
            >
              <div class="color-dot" :style="{ background: color }"></div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="标签描述">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.tag-management {
  padding: $spacing-large;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: $font-size-extra-large;
      font-weight: 500;
    }
  }

  .tag-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-large;
    min-height: 400px;
  }

  .tag-item {
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-base;
    padding: $spacing-base;
    display: flex;
    gap: $spacing-base;
    transition: all 0.3s;

    &:hover {
      border-color: $--el-color-primary;
      box-shadow: $box-shadow-base;
    }

    .tag-color-dot {
      flex-shrink: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 4px;
    }

    .tag-info {
      flex: 1;
      min-width: 0;

      .tag-name {
        font-size: $font-size-large;
        font-weight: 500;
        color: $text-color-primary;
        margin-bottom: $spacing-small;
      }

      .tag-meta {
        display: flex;
        align-items: center;
        gap: $spacing-base;
        margin-bottom: $spacing-small;
        flex-wrap: wrap;

        .user-count {
          font-size: $font-size-small;
          color: $--el-color-primary;
          padding: 2px 8px;
          background: #f0f7ff;
          border-radius: $border-radius-small;
        }

        .description {
          font-size: $font-size-small;
          color: $text-color-secondary;
        }
      }

      .tag-actions {
        display: flex;
        gap: $spacing-small;
      }
    }
  }
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: $spacing-base;

  .color-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: $spacing-small;
    border-radius: $border-radius-base;
    transition: all 0.2s;

    &:hover {
      background: $background-color-base;
    }

    &.active {
      background: #f0f7ff;
      border: 1px solid $--el-color-primary;

      .color-dot {
        transform: scale(1.2);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      }
    }

    .color-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-base;
}
</style>
