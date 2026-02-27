<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { publicCertCenterApi } from '@/api/public/introduction';
import type { CertInfo } from '@/types/introduction';

const loading = ref(false);
const certInfo = ref<CertInfo | null>(null);
const activeModule = ref('');
const certType = ref<'tech_broker'>('tech_broker');

onMounted(async () => {
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await publicCertCenterApi.getCertDetail(certType.value);
    if (data && data.isPublished) {
      certInfo.value = data;
      const firstPublishedModule = data.modules.find(m => m.isPublished);
      if (firstPublishedModule) {
        activeModule.value = firstPublishedModule.id;
      }
    }
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
}

function handleModuleChange(moduleId: string) {
  activeModule.value = moduleId;
}
</script>

<template>
  <div v-loading="loading" class="cert-page">
    <el-empty v-if="!certInfo && !loading" description="暂无内容" />
    <template v-else-if="certInfo">
      <section class="banner-section" :style="{ backgroundImage: certInfo.coverImage ? `url(${certInfo.coverImage})` : '' }">
        <div class="banner-overlay">
          <div class="container">
            <h1>{{ certInfo.certTitle }}</h1>
            <p v-if="certInfo.description">{{ certInfo.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="certInfo.modules.length > 1" class="modules-section">
        <div class="container">
          <div class="module-tabs">
            <button v-for="module in certInfo.modules" :key="module.id" class="module-tab" :class="{ active: activeModule === module.id }" @click="handleModuleChange(module.id)">
              <el-icon><Document /></el-icon>
              {{ module.title }}
            </button>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <div v-for="module in certInfo.modules" :key="module.id" class="module-content" :class="{ show: activeModule === module.id }">
            <div v-if="module.coverImage && activeModule === module.id" class="module-cover">
              <img :src="module.coverImage" :alt="module.title" />
            </div>
            <el-card class="content-card" shadow="never">
              <h2 class="module-title">{{ module.title }}</h2>
              <div class="module-text" v-html="module.content"></div>
            </el-card>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.cert-page { min-height: calc(100vh - $navbar-height - $footer-height); background: $background-color-base; }
.container { max-width: 900px; margin: 0 auto; padding: 0 $spacing-large; }
.banner-section { position: relative; background-size: cover; background-position: center; margin-bottom: $spacing-large;
  .banner-overlay { background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%); padding: $spacing-extra-extra-large 0; text-align: center; color: #fff;
    h1 { font-size: 36px; font-weight: bold; margin-bottom: $spacing-base; @media (min-width: 768px) { font-size: 48px; } }
    p { font-size: $font-size-large; color: rgba(255, 255, 255, 0.9); }
  }
}
.modules-section { background: #fff; border-bottom: 1px solid $border-color-light; padding: $spacing-base 0; margin-bottom: $spacing-large; position: sticky; top: 0; z-index: 10; }
.module-tabs { display: flex; justify-content: center; gap: $spacing-small; overflow-x: auto; padding: 0 $spacing-large;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: $border-color-light; border-radius: 2px; }
}
.module-tab { display: flex; align-items: center; gap: $spacing-small; padding: $spacing-base $spacing-large; font-size: $font-size-base; font-weight: 500; border: none; background: none; cursor: pointer; color: $text-color-secondary; border-radius: $border-radius-large; transition: $transition-base; white-space: nowrap;
  &:hover { color: $text-color-primary; background: $background-color-base; }
  &.active { color: #fff; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); font-weight: 600; box-shadow: $box-shadow-base; }
}
.content-section { padding-bottom: $spacing-extra-extra-large; }
.module-content { display: none; animation: fade-in 0.3s ease-in-out; &.show { display: block; } }
@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.module-cover { margin-bottom: $spacing-large; text-align: center;
  img { max-width: 100%; max-height: 300px; border-radius: $border-radius-large; box-shadow: $box-shadow-card; }
}
.content-card {
  .module-title { font-size: 28px; color: $text-color-primary; margin-bottom: $spacing-large; padding-bottom: $spacing-base; border-bottom: 2px solid $border-color-lighter; }
  .module-text { line-height: 1.8;
    :deep(h2) { font-size: 24px; color: $text-color-primary; margin-top: $spacing-large; margin-bottom: $spacing-base; }
    :deep(h3) { font-size: 20px; color: $text-color-primary; margin-top: $spacing-large; margin-bottom: $spacing-base; }
    :deep(p) { margin-bottom: $spacing-base; color: $text-color-regular; font-size: $font-size-base; }
    :deep(strong) { color: $text-color-primary; font-weight: 600; }
    :deep(ul) { list-style: disc; padding-left: $spacing-large; margin-bottom: $spacing-base; li { margin-bottom: $spacing-small; } }
    :deep(ol) { list-style: decimal; padding-left: $spacing-large; margin-bottom: $spacing-base; li { margin-bottom: $spacing-small; } }
    :deep(a) { color: #3b82f6; text-decoration: none; &:hover { text-decoration: underline; } }
    :deep(img) { max-width: 100%; height: auto; border-radius: $border-radius-base; margin: $spacing-large 0; }
    :deep(table) { width: 100%; border-collapse: collapse; margin: $spacing-large 0;
      th, td { padding: $spacing-base; border: 1px solid $border-color-light; text-align: left; }
      th { background: $background-color-base; font-weight: 600; }
    }
  }
}
</style>
