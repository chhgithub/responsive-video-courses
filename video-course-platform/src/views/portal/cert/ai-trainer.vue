<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { publicCertCenterApi } from '@/api/public/introduction';
import type { CertInfo } from '@/types/introduction';

const route = useRoute();
const loading = ref(false);
const certInfo = ref<CertInfo | null>(null);
const activeModule = ref('');

// 从路由动态获取认证类型
const certType = computed(() => {
  const path = route.path;
  if (path.includes('/cert/ai-trainer')) return 'ai_trainer';
  if (path.includes('/cert/ai-engineer')) return 'ai_engineer';
  if (path.includes('/cert/drone')) return 'drone';
  if (path.includes('/cert/tech-broker')) return 'tech_broker';
  if (path.includes('/cert/other')) return 'other';
  return 'ai_trainer'; // 默认
});

// 页面标题
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    ai_trainer: '人工智能训练师',
    ai_engineer: '人工智能工程技术人员',
    drone: 'CAAC无人机执照',
    tech_broker: '技术经纪人',
    other: '其他认证项目',
  };
  return titles[certType.value] || '认证项目';
});

onMounted(async () => {
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const data = await publicCertCenterApi.getCertDetail(certType.value as any);

    if (data) {
      // 检查认证项目是否发布
      if (!data.isPublished) {
        certInfo.value = null;
        return;
      }

      certInfo.value = data;

      // 过滤出已发布的模块
      const publishedModules = data.modules.filter(m => m.isPublished);

      if (publishedModules.length === 0) {
        // 没有已发布的模块，不设置activeModule
        return;
      }

      // 设置默认激活第一个已发布的模块
      activeModule.value = publishedModules[0].id;
    }
  } catch (error) {
    console.error('加载失败:', error);
    ElMessage.error('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

function handleModuleChange(moduleId: string) {
  activeModule.value = moduleId;
}

// 获取已发布的模块
const publishedModules = computed(() => {
  if (!certInfo.value) return [];
  return certInfo.value.modules.filter(m => m.isPublished);
});

// 是否有已发布的模块
const hasPublishedModules = computed(() => {
  return publishedModules.value.length > 0;
});
</script>

<template>
  <div v-loading="loading" class="cert-page">
    <!-- 未发布提示 -->
    <el-empty v-if="!certInfo && !loading" description="该认证项目暂未发布">
      <el-button type="primary" @click="$router.push('/portal')">
        返回首页
      </el-button>
    </el-empty>

    <!-- 有认证项目但没有已发布的模块 -->
    <el-empty v-else-if="certInfo && !hasPublishedModules" description="该认证项目暂无可查看的内容">
      <template #image>
        <el-icon :size="100" color="#909399"><Document /></el-icon>
      </template>
      <p>管理员还未发布任何内容</p>
    </el-empty>

    <template v-else-if="certInfo && hasPublishedModules">
      <!-- Banner区域 -->
      <section class="banner-section" :style="{ backgroundImage: certInfo.coverImage ? `url(${certInfo.coverImage})` : '' }">
        <div class="banner-overlay">
          <div class="container">
            <h1>{{ pageTitle }}</h1>
            <p v-if="certInfo.description">{{ certInfo.description }}</p>
          </div>
        </div>
      </section>

      <!-- 模块切换Tab (只在有多个模块时显示) -->
      <section v-if="publishedModules.length > 1" class="modules-section">
        <div class="container">
          <div class="module-tabs">
            <button
              v-for="module in publishedModules"
              :key="module.id"
              class="module-tab"
              :class="{ active: activeModule === module.id }"
              @click="handleModuleChange(module.id)"
            >
              <el-icon><Document /></el-icon>
              {{ module.title }}
            </button>
          </div>
        </div>
      </section>

      <!-- 内容展示 -->
      <section class="content-section">
        <div class="container">
          <div
            v-for="module in publishedModules"
            :key="module.id"
            class="module-content"
            :class="{ show: activeModule === module.id }"
          >
            <!-- 封面图 -->
            <div v-if="module.coverImage && activeModule === module.id" class="module-cover">
              <img :src="module.coverImage" :alt="module.title" />
            </div>

            <!-- 内容卡片 -->
            <el-card class="content-card" shadow="never">
              <!-- 模块标题 -->
              <h2 class="module-title">{{ module.title }}</h2>

              <!-- HTML内容 -->
              <div class="module-text" v-html="module.content"></div>

              <!-- 图片列表 -->
              <div v-if="module.images && module.images.length" class="module-images">
                <h3>相关图片</h3>
                <div class="image-gallery">
                  <el-image
                    v-for="(img, index) in module.images"
                    :key="index"
                    :src="img"
                    :alt="`图片${index + 1}`"
                    fit="cover"
                    class="gallery-image"
                  />
                </div>
              </div>
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

// Banner区域
.banner-section {
  position: relative;
  background-size: cover;
  background-position: center;
  margin-bottom: $spacing-large;

  .banner-overlay {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
    padding: $spacing-extra-extra-large 0;
    text-align: center;
    color: #fff;

    h1 {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: $spacing-base;

      @media (min-width: 768px) { font-size: 48px; }
    }

    p { font-size: $font-size-large; color: rgba(255, 255, 255, 0.9); }
  }
}

// 模块切换
.modules-section {
  background: #fff;
  border-bottom: 1px solid $border-color-light;
  padding: $spacing-base 0;
  margin-bottom: $spacing-large;
  position: sticky;
  top: 0;
  z-index: 10;
}

.module-tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-small;
  overflow-x: auto;
  padding: 0 $spacing-large;

  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: $border-color-light; border-radius: 2px; }
}

.module-tab {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  padding: $spacing-base $spacing-large;
  font-size: $font-size-base;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  color: $text-color-secondary;
  border-radius: $border-radius-large;
  transition: $transition-base;
  white-space: nowrap;

  &:hover { color: $text-color-primary; background: $background-color-base; }

  &.active {
    color: #fff;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    font-weight: 600;
    box-shadow: $box-shadow-base;
  }
}

// 内容区域
.content-section { padding-bottom: $spacing-extra-extra-large; }

.module-content {
  display: none;
  animation: fade-in 0.3s ease-in-out;

  &.show { display: block; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.module-cover {
  margin-bottom: $spacing-large;
  text-align: center;

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

  .module-images { margin-top: $spacing-extra-large;
    h3 { font-size: $font-size-large; color: $text-color-primary; margin-bottom: $spacing-base; }
    .image-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: $spacing-base;
      .gallery-image { width: 100%; height: 200px; border-radius: $border-radius-base; overflow: hidden;
        :deep(img) { width: 100%; height: 100%; object-fit: cover; }
      }
    }
  }
}
</style>
