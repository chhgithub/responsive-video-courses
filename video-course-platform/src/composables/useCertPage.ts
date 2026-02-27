/**
 * 认证项目页面通用逻辑
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { publicCertCenterApi } from '@/api/public/introduction';
import type { CertInfo, CertModule } from '@/types/introduction';

export function useCertPage() {
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
    return 'ai_trainer';
  });

  // 页面标题映射
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

  // 获取已发布的模块
  const publishedModules = computed(() => {
    if (!certInfo.value) return [];
    return certInfo.value.modules.filter(m => m.isPublished);
  });

  // 是否有已发布的模块
  const hasPublishedModules = computed(() => {
    return publishedModules.value.length > 0;
  });

  // 加载数据
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
        const publishedModulesList = data.modules.filter(m => m.isPublished);

        if (publishedModulesList.length === 0) {
          // 没有已发布的模块，不设置activeModule
          return;
        }

        // 设置默认激活第一个已发布的模块
        activeModule.value = publishedModulesList[0].id;
      }
    } catch (error) {
      console.error('加载失败:', error);
      ElMessage.error('加载失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  }

  // 切换模块
  function handleModuleChange(moduleId: string) {
    activeModule.value = moduleId;
  }

  onMounted(() => {
    loadData();
  });

  return {
    loading,
    certInfo,
    activeModule,
    certType,
    pageTitle,
    publishedModules,
    hasPublishedModules,
    handleModuleChange,
  };
}
