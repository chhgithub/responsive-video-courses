<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  getAllVideos,
  deleteVideo,
  batchDeleteVideos,
  getVideoCategories,
  getVideosByCategory,
  getVideosByType,
  searchVideos,
  formatFileSize,
  formatDuration,
  type Video,
} from '@/utils/video-storage';
import VideoDrawer from '../components/VideoDrawer.vue';
import VideoPlayerDialog from '../components/VideoPlayerDialog.vue';

const loading = ref(false);
const videos = ref<Video[]>([]);
const selectedIds = ref<string[]>([]);

// 搜索表单
const searchForm = ref({
  keyword: '',
  category: '',
  type: '' as 'upload' | 'third-party' | '',
});

// 分页
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
});

// 分类选项
const categoryOptions = computed(() => {
  const categories = getVideoCategories();
  return categories.map((c) => ({ label: c, value: c }));
});

// 视频抽屉
const showDrawer = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const currentVideoId = ref<string>();

// 视频预览
const showPlayer = ref(false);
const currentVideo = ref<Video>();

// 加载视频数据
async function loadVideos() {
  loading.value = true;
  try {
    let filtered = getAllVideos();

    // 搜索筛选
    if (searchForm.value.keyword) {
      filtered = searchVideos(searchForm.value.keyword);
    }

    // 分类筛选
    if (searchForm.value.category) {
      filtered = filtered.filter((v) => v.category === searchForm.value.category);
    }

    // 类型筛选
    if (searchForm.value.type) {
      filtered = getVideosByType(searchForm.value.type);
    }

    // 按上传时间倒序
    filtered.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());

    pagination.value.total = filtered.length;

    // 分页
    const start = (pagination.value.page - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    videos.value = filtered.slice(start, end);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.value.page = 1;
  loadVideos();
}

function handleReset() {
  searchForm.value = {
    keyword: '',
    category: '',
    type: '',
  };
  pagination.value.page = 1;
  loadVideos();
}

function handleAdd() {
  drawerMode.value = 'add';
  currentVideoId.value = undefined;
  showDrawer.value = true;
}

function handleEdit(row: Video) {
  drawerMode.value = 'edit';
  currentVideoId.value = row.id;
  showDrawer.value = true;
}

function handleDelete(row: Video) {
  ElMessageBox.confirm(`确认删除视频"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteVideo(row.id);
      ElMessage.success('删除成功');
      loadVideos();
    })
    .catch(() => {});
}

function handleSelectionChange(selection: Video[]) {
  selectedIds.value = selection.map((v) => v.id);
}

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
      batchDeleteVideos(selectedIds.value);
      ElMessage.success('删除成功');
      selectedIds.value = [];
      loadVideos();
    })
    .catch(() => {});
}

// 处理单选
function handleSelectChange(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id);
    }
  } else {
    selectedIds.value = selectedIds.value.filter(item => item !== id);
  }
}

// 全选/反选
function handleToggleSelectAll() {
  if (selectedIds.value.length === videos.value.length) {
    // 当前全选，执行反选
    selectedIds.value = [];
  } else {
    // 执行全选
    selectedIds.value = videos.value.map(video => video.id);
  }
}

function handlePreview(row: Video) {
  currentVideo.value = row;
  showPlayer.value = true;
}

function handleDrawerSuccess() {
  showDrawer.value = false;
  loadVideos();
}

function handlePageChange(page: number) {
  pagination.value.page = page;
  loadVideos();
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  loadVideos();
}

onMounted(() => {
  loadVideos();
});
</script>

<template>
  <div class="video-library">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>视频库管理</h2>
      <p class="subtitle">管理课程视频资源，支持本地上传和第三方加速</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="视频标题">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入视频标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="视频类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option label="本地上传" value="upload" />
            <el-option label="第三方视频" value="third-party" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar-left">
        <el-button
          v-if="selectedIds.length > 0"
          link
          type="primary"
          @click="handleToggleSelectAll"
        >
          {{ selectedIds.length === videos.length ? '反选' : '全选' }}
        </el-button>
        <span v-if="selectedIds.length > 0" class="selected-count">
          已选 {{ selectedIds.length }} 项
        </span>
      </div>
      <div class="toolbar-right">
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加视频
        </el-button>
      </div>
    </el-card>

    <!-- 视频列表（卡片式） -->
    <el-card class="video-list-card" shadow="never">
      <div v-loading="loading" class="video-grid">
        <div
          v-for="video in videos"
          :key="video.id"
          class="video-card"
          :class="{ selected: selectedIds.includes(video.id) }"
        >
          <!-- 左上角选择框 -->
          <div class="card-checkbox">
            <el-checkbox
              :model-value="selectedIds.includes(video.id)"
              @change="handleSelectChange(video.id, $event)"
            />
          </div>

          <!-- 封面 -->
          <div class="video-cover">
            <el-image
              :src="video.thumbnailUrl"
              fit="cover"
              class="cover-image"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><VideoCamera /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="video-duration">{{ formatDuration(video.duration) }}</div>
            <div class="video-type" :class="video.videoType">
              {{ video.videoType === 'upload' ? '本地上传' : '第三方' }}
            </div>
            <!-- 悬停操作按钮 -->
            <div class="video-actions">
              <el-button
                type="primary"
                size="small"
                circle
                @click="handlePreview(video)"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="video-info">
            <h3 class="video-title" :title="video.title">{{ video.title }}</h3>
            <p class="video-description">{{ video.description }}</p>
            <div class="video-meta">
              <span class="meta-item">
                <el-icon><Folder /></el-icon>
                {{ video.category }}
              </span>
              <span v-if="video.fileSize" class="meta-item">
                <el-icon><Document /></el-icon>
                {{ formatFileSize(video.fileSize) }}
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ video.uploadTime }}
              </span>
            </div>
            <div class="video-operations">
              <el-button link type="primary" size="small" @click="handleEdit(video)">
                编辑
              </el-button>
              <el-popconfirm
                title="确认删除该视频吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDelete(video)"
              >
                <template #reference>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="videos.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无视频数据" />
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 视频编辑抽屉 -->
    <VideoDrawer
      v-if="showDrawer"
      :id="currentVideoId"
      :visible="showDrawer"
      @success="handleDrawerSuccess"
      @close="showDrawer = false"
    />

    <!-- 视频预览弹窗 -->
    <VideoPlayerDialog
      v-model="showPlayer"
      :video="currentVideo"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.video-library {
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

.search-card,
.toolbar-card,
.video-list-card {
  margin-bottom: $spacing-large;

  &:last-child {
    margin-bottom: 0;
  }
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: $spacing-base;

    .selected-count {
      color: $text-color-secondary;
      font-size: $font-size-small;
    }
  }

  .toolbar-right {
    display: flex;
    gap: $spacing-base;
  }
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-large;
  min-height: 200px;
}

.video-card {
  background: #fff;
  border: 1px solid $border-color-lighter;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition: $transition-base;
  position: relative;

  &:hover {
    box-shadow: $box-shadow-card;
    border-color: $border-color-light;
  }

  &.selected {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .card-checkbox {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
  }
}

.video-cover {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f5f7fa;

  .cover-image {
    width: 100%;
    height: 100%;
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: $text-color-placeholder;
    font-size: 48px;
  }

  .video-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: $font-size-extra-small;
    border-radius: $border-radius-small;
  }

  .video-type {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 8px;
    font-size: $font-size-extra-small;
    border-radius: $border-radius-small;
    color: #fff;

    &.upload {
      background: #67c23a;
    }

    &.third-party {
      background: #409eff;
    }
  }

  .video-actions {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .video-actions {
    opacity: 1;
  }
}

.video-info {
  padding: $spacing-base;
}

.video-title {
  font-size: $font-size-medium;
  font-weight: 500;
  color: $text-color-primary;
  margin: 0 0 $spacing-small 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-description {
  font-size: $font-size-small;
  color: $text-color-secondary;
  margin: 0 0 $spacing-base 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-small;
  margin-bottom: $spacing-base;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-extra-small;
    color: $text-color-secondary;
  }
}

.video-operations {
  display: flex;
  gap: $spacing-base;
  padding-top: $spacing-small;
  border-top: 1px solid $border-color-lighter;
}

.empty-state {
  grid-column: 1 / -1;
  padding: $spacing-extra-extra-large 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-large;
}
</style>
