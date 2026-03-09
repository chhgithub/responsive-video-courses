<script setup lang="ts">
import { ref, watch } from 'vue';
import WangEditor from '@/components/WangEditor.vue';
import type { AboutUsInfo, ContactInfo } from '@/types/introduction';

interface Props {
  data: AboutUsInfo;
  saving: boolean;
}

interface Emits {
  (e: 'save', data: AboutUsInfo): void;
  (e: 'togglePublish'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = ref<AboutUsInfo>({ ...props.data });
const contactInfo = ref<ContactInfo>(props.data.contactInfo || {});
const formRef = ref();

// 监听props变化，更新表单数据
watch(
  () => props.data,
  (newData) => {
    formData.value = { ...newData };
    contactInfo.value = newData.contactInfo || {};
  },
  { deep: true }
);

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

// 保存
async function handleSave() {
  try {
    await formRef.value?.validate();
    // 将联系信息合并到formData中
    formData.value.contactInfo = contactInfo.value;
    emit('save', formData.value);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 切换发布状态（不再使用）
// function handleTogglePublish() {
//   emit('togglePublish');
// }
</script>

<template>
  <div class="contact-us-content">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h3>联系我们信息编辑</h3>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <el-divider content-position="left">基本信息</el-divider>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="content-form">
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="页面欢迎语" prop="content">
        <WangEditor
          v-model="formData.content"
          placeholder="请输入页面顶部的欢迎语或简介文字"
          :height="300"
        />
        <div class="field-tip">
          <el-text type="info" size="small">
            此内容将显示在联系我们页面顶部，可用于介绍公司、服务理念等
          </el-text>
        </div>
      </el-form-item>
    </el-form>

    <!-- 联系方式配置 -->
    <el-divider content-position="left">联系方式配置</el-divider>
    <el-form label-width="140px" class="contact-form">
      <el-form-item label="联系电话">
        <el-input v-model="contactInfo.phone" placeholder="请输入联系电话，如：010-12345678" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="contactInfo.email" placeholder="请输入邮箱地址，如：contact@example.com" />
      </el-form-item>

      <el-form-item label="地址">
        <el-input
          v-model="contactInfo.address"
          type="textarea"
          :rows="3"
          placeholder="请输入详细地址"
        />
      </el-form-item>

      <el-form-item label="工作时间">
        <el-input v-model="contactInfo.workingHours" placeholder="请输入工作时间，如：周一至周五 9:00-18:00" />
      </el-form-item>

      <el-form-item label="微信公众号">
        <el-input v-model="contactInfo.wechatAccount" placeholder="请输入微信公众号名称" />
      </el-form-item>

      <!-- <el-form-item label="地图坐标">
        <el-input v-model="contactInfo.coordinates" placeholder="请输入地图坐标，格式：经度,纬度，如：116.404,39.915" />
        <div class="field-tip">
          <el-text type="info" size="small">
            可在地图应用中获取精确坐标，用于在前台展示地图位置
          </el-text>
        </div>
      </el-form-item> -->

      <!-- <el-form-item label="二维码">
        <div class="qr-code-uploader">
          <div v-if="contactInfo.qrCode" class="qr-preview">
            <img :src="contactInfo.qrCode" alt="二维码" />
            <div class="qr-actions">
              <el-button type="danger" size="small" @click="contactInfo.qrCode = ''">
                删除
              </el-button>
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon><Plus /></el-icon>
            <div class="upload-text">上传二维码图片</div>
            <div class="upload-hint">建议上传微信或公众号二维码</div>
          </div>
        </div>
        <div class="field-tip">
          <el-text type="info" size="small">建议尺寸：200x200px，支持JPG、PNG格式</el-text>
        </div>
      </el-form-item> -->

      <el-form-item label="排序">
        <el-input-number v-model="formData.sortOrder" :min="1" :max="999" />
        <div class="field-tip">
          <el-text type="info" size="small">数字越小排序越靠前</el-text>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.contact-us-content {
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

  .content-form,
  .contact-form {
    max-width: 800px;

    .field-tip {
      margin-top: $spacing-small;
    }
  }

  .qr-code-uploader {
    width: 200px;

    .qr-preview {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: $border-radius-base;
      overflow: hidden;
      border: 1px solid $border-color-base;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .qr-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: $spacing-small;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
      }
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      border: 2px dashed $border-color;
      border-radius: $border-radius-base;
      background-color: $background-color-light;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: $primary-color;
        background-color: $primary-color-light;
      }

      .el-icon {
        font-size: 36px;
        color: $text-color-secondary;
      }

      .upload-text {
        margin-top: $spacing-small;
        font-size: $font-size-base;
        color: $text-color-primary;
      }

      .upload-hint {
        margin-top: $spacing-small;
        font-size: $font-size-small;
        color: $text-color-secondary;
      }
    }
  }
}
</style>
