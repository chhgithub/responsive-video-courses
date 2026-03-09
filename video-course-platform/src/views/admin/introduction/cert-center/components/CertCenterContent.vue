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

// 认证项目基本信息表单
const certInfoFormRef = ref();
const certInfoSaving = ref(false);

// 模块表单
const moduleFormRef = ref();
const moduleSaving = ref<string | null>(null);

// 监听props变化
watch(
  () => props.data,
  () => {
    // 数据更新时可以做一些处理
  },
  { deep: true }
);

// 保存认证项目基本信息
async function handleSaveCertInfo() {
  certInfoSaving.value = true;
  try {
    await certInfoFormRef.value?.validate();
    // 基本信息 already updated via @input events
    // 这里只需要触发保存到后端
    emit('updateCert', {});
    ElMessage.success('基本信息保存成功');
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    certInfoSaving.value = false;
  }
}

// 保存模块
async function handleSaveModule(module: CertModule) {
  moduleSaving.value = module.id;
  try {
    await moduleFormRef.value?.validate();
    emit('updateModule', module.id, module);
    ElMessage.success('模块保存成功');
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    moduleSaving.value = null;
  }
}

// 更新认证项目基本信息
function handleUpdateCert(field: string, value: any) {
  emit('updateCert', { [field]: value });
}

// 更新模块数据
function handleUpdateModule(module: CertModule, field: string, value: any) {
  (module as any)[field] = value;
}
</script>

<template>
  <div class="cert-center-content">
    <!-- 认证项目基本信息 -->
    <el-divider content-position="left">认证项目基本信息</el-divider>
    <el-form
      ref="certInfoFormRef"
      label-width="120px"
      class="cert-info-form"
      :model="data"
    >
      <el-form-item label="认证项目名称" prop="certTitle">
        <el-input
          :model-value="data.certTitle"
          @input="handleUpdateCert('certTitle', $event)"
        />
      </el-form-item>

      <el-form-item label="认证项目简介" prop="description">
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

      <el-form-item>
        <el-button type="primary" :loading="certInfoSaving" @click="handleSaveCertInfo">
          保存基本信息
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 模块列表 -->
    <el-divider content-position="left">内容模块管理</el-divider>
    <div class="modules-list">
      <el-card
        v-for="module in data.modules"
        :key="module.id"
        class="module-card"
      >
        <template #header>
          <div class="module-header">
            <div class="module-title">
              <span>{{ moduleTitleMap[module.id] || module.title }}</span>
            </div>
            <el-button type="primary" size="small" :loading="moduleSaving === module.id" @click="handleSaveModule(module)">
              保存
            </el-button>
          </div>
        </template>

        <!-- 模块编辑表单 -->
        <div class="module-edit">
          <el-form :model="module" label-width="100px">
            <el-form-item label="模块标题">
              <el-input
                :model-value="module.title"
                @input="handleUpdateModule(module, 'title', $event)"
              />
            </el-form-item>

            <el-form-item label="内容">
              <WangEditor
                :model-value="module.content"
                @update:model-value="handleUpdateModule(module, 'content', $event)"
                placeholder="请输入内容"
                :height="400"
              />
            </el-form-item>

            <el-form-item label="排序">
              <el-input-number
                :model-value="module.sortOrder"
                @update:model-value="handleUpdateModule(module, 'sortOrder', $event)"
                :min="1"
                :max="999"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.cert-center-content {
  padding: $spacing-large;

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
      .module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .module-title {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .module-edit {
        /* 模块编辑样式 */
      }
    }
  }
}
</style>
