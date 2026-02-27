<script setup lang="ts">
import { ref, watch } from 'vue';
import WangEditor from '@/components/WangEditor.vue';
import type { CertInfo, CertType, CertModule } from '@/types/introduction';

interface Props {
  data: CertInfo;
  certType: CertType;
  moduleTitleMap: Record<string, string>;
}

interface Emits {
  (e: 'updateCert', data: Partial<CertInfo>): void;
  (e: 'updateModule', moduleId: string, moduleData: CertModule): void;
  (e: 'toggleModulePublish', moduleId: string): void;
  (e: 'toggleCertPublish'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const editingModule = ref<CertModule | null>(null);
const moduleFormRef = ref();

// 监听props变化
watch(
  () => props.data,
  () => {
    // 数据更新时可以做一些处理
  },
  { deep: true }
);

// 编辑模块
function handleEditModule(module: CertModule) {
  editingModule.value = { ...module };
}

// 取消编辑
function handleCancelEdit() {
  editingModule.value = null;
}

// 保存模块
async function handleSaveModule() {
  if (!editingModule.value) return;

  emit('updateModule', editingModule.value.id, editingModule.value);
  editingModule.value = null;
}

// 切换模块发布状态
function handleTogglePublish(module: CertModule) {
  emit('toggleModulePublish', module.id);
}

// 切换认证项目发布状态
function handleToggleCertPublish() {
  emit('toggleCertPublish');
}

// 更新认证项目基本信息
function handleUpdateCert(field: string, value: any) {
  emit('updateCert', { [field]: value });
}
</script>

<template>
  <div class="cert-center-content">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h3>{{ data.certTitle }}内容管理</h3>
      </div>
      <div class="toolbar-right">
        <el-tag :type="data.isPublished ? 'success' : 'info'" size="large">
          {{ data.isPublished ? '已发布' : '草稿' }}
        </el-tag>
        <el-button
          :type="data.isPublished ? 'warning' : 'success'"
          @click="handleToggleCertPublish"
        >
          {{ data.isPublished ? '取消发布' : '发布' }}
        </el-button>
      </div>
    </div>

    <!-- 认证项目基本信息 -->
    <el-divider content-position="left">认证项目基本信息</el-divider>
    <el-form label-width="120px" class="cert-info-form">
      <el-form-item label="认证项目名称">
        <el-input :model-value="data.certTitle" @input="handleUpdateCert('certTitle', $event)" />
      </el-form-item>

      <el-form-item label="认证项目简介">
        <WangEditor
          :model-value="data.description"
          @update:model-value="handleUpdateCert('description', $event)"
          placeholder="请输入认证项目简介"
          :height="200"
        />
      </el-form-item>

      <el-form-item label="封面图片">
        <div class="image-uploader">
          <div v-if="data.coverImage" class="image-preview">
            <img :src="data.coverImage" alt="封面" />
            <el-button type="danger" size="small" @click="handleUpdateCert('coverImage', '')">
              删除
            </el-button>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon><Plus /></el-icon>
            <div>点击上传封面图片</div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <!-- 模块列表 -->
    <el-divider content-position="left">内容模块管理</el-divider>
    <div class="modules-list">
      <el-card
        v-for="module in data.modules"
        :key="module.id"
        class="module-card"
        :class="{ 'is-editing': editingModule?.id === module.id }"
      >
        <template #header>
          <div class="module-header">
            <div class="module-title">
              <el-tag :type="module.isPublished ? 'success' : 'info'" size="small">
                {{ module.isPublished ? '已发布' : '草稿' }}
              </el-tag>
              <span>{{ moduleTitleMap[module.id] || module.title }}</span>
            </div>
            <div class="module-actions">
              <el-button
                link
                :type="module.isPublished ? 'warning' : 'success'"
                size="small"
                @click="handleTogglePublish(module)"
              >
                {{ module.isPublished ? '取消发布' : '发布' }}
              </el-button>
              <el-button link type="primary" size="small" @click="handleEditModule(module)">
                {{ editingModule?.id === module.id ? '收起' : '编辑' }}
              </el-button>
            </div>
          </div>
        </template>

        <!-- 模块编辑表单 -->
        <div v-if="editingModule?.id === module.id" class="module-edit">
          <el-form ref="moduleFormRef" :model="editingModule" label-width="100px">
            <el-form-item label="模块标题">
              <el-input v-model="editingModule.title" />
            </el-form-item>

            <el-form-item label="封面图片">
              <div class="image-uploader">
                <div v-if="editingModule.coverImage" class="image-preview-small">
                  <img :src="editingModule.coverImage" alt="封面" />
                  <el-button
                    type="danger"
                    size="small"
                    @click="editingModule.coverImage = ''"
                  >
                    删除
                  </el-button>
                </div>
                <div v-else class="upload-placeholder-small">
                  <el-icon><Plus /></el-icon>
                  <div>上传配图</div>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="内容">
              <WangEditor
                v-model="editingModule.content"
                placeholder="请输入内容"
                :height="400"
              />
            </el-form-item>

            <el-form-item label="排序">
              <el-input-number v-model="editingModule.sortOrder" :min="1" :max="999" />
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button @click="handleCancelEdit">取消</el-button>
            <el-button type="primary" @click="handleSaveModule">保存</el-button>
          </div>
        </div>

        <!-- 模块预览 -->
        <div v-else class="module-preview">
          <div v-if="module.coverImage" class="preview-cover">
            <img :src="module.coverImage" alt="封面" />
          </div>
          <div v-if="module.content" class="preview-content" v-html="module.content"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.cert-center-content {
  padding: $spacing-large;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-light;

    .toolbar-left {
      h3 {
        margin: 0;
        font-size: 18px;
        color: $text-color-primary;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: $spacing-base;
    }
  }

  .cert-info-form {
    max-width: 800px;
    margin-bottom: $spacing-large;

    .image-uploader {
      .image-preview {
        position: relative;
        width: 400px;
        height: 200px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: $border-radius-base;
        }

        .el-button {
          position: absolute;
          bottom: $spacing-small;
          right: $spacing-small;
        }
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 400px;
        height: 200px;
        border: 2px dashed $border-color-base;
        border-radius: $border-radius-base;
        background-color: $background-color-base;
        cursor: pointer;
        transition: $transition-base;

        &:hover {
          border-color: $--el-color-primary;
          background-color: mix($--el-color-primary, $background-color-base, 5%);
        }

        .el-icon {
          font-size: 36px;
          color: $text-color-secondary;
        }
      }
    }
  }

  .modules-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-large;

    .module-card {
      &.is-editing {
        border-color: $primary-color;
      }

      .module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .module-title {
          display: flex;
          align-items: center;
          gap: $spacing-small;
          font-size: 16px;
          font-weight: 500;
        }

        .module-actions {
          display: flex;
          gap: $spacing-small;
        }
      }

      .module-edit {
        .image-uploader {
          .image-preview-small {
            position: relative;
            width: 200px;
            height: 120px;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: $border-radius-base;
            }

            .el-button {
              position: absolute;
              bottom: $spacing-small;
              right: $spacing-small;
            }
          }

          .upload-placeholder-small {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 200px;
            height: 120px;
            border: 2px dashed $border-color;
            border-radius: $border-radius-base;
            background-color: $background-color-light;
            cursor: pointer;

            .el-icon {
              font-size: 24px;
              color: $text-color-secondary;
            }
          }
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: $spacing-small;
          padding-top: $spacing-base;
          border-top: 1px solid $border-color-light;
        }
      }

      .module-preview {
        .preview-cover {
          width: 100%;
          height: 250px;
          margin-bottom: $spacing-base;
          border-radius: $border-radius-base;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .preview-content {
          line-height: 1.8;
          color: $text-color-primary;

          :deep(p) {
            margin-bottom: $spacing-small;
          }

          :deep(img) {
            max-width: 100%;
            height: auto;
          }
        }
      }
    }
  }
}
</style>
