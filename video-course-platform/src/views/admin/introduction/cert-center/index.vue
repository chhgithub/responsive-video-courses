<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { adminCertCenterApi } from '@/api/admin/introduction';
import type { CertInfo, CertType } from '@/types/introduction';
import CertCenterContent from './components/CertCenterContent.vue';

const activeTab = ref<CertType>('ai_trainer');
const loading = ref(false);

// 存储各个认证项目的数据
const tabData = ref<Record<CertType, CertInfo | null>>({
  ai_trainer: null,
  ai_engineer: null,
  drone: null,
  tech_broker: null,
  other: null,
});

// 当前Tab的数据
const currentData = ref<CertInfo | null>(null);

// 认证项目配置
const certConfigs = [
  { key: 'ai_trainer', label: '人工智能训练师', icon: 'User', modules: ['evalPlan', 'gradePublic', 'register'] },
  { key: 'ai_engineer', label: '人工智能工程技术人员', icon: 'Cpu', modules: ['trainingPlan', 'register'] },
  { key: 'drone', label: 'CAAC无人机执照', icon: 'Notification', modules: ['register', 'trialFlight'] },
  { key: 'tech_broker', label: '技术经纪人', icon: 'Briefcase', modules: ['register', 'classPlan'] },
  { key: 'other', label: '其他', icon: 'MoreFilled', modules: ['pmp', 'npdp'] },
];

// 模块标题映射
const moduleTitleMap: Record<string, string> = {
  evalPlan: '评价计划',
  gradePublic: '成绩公示',
  register: '报名咨询',
  trainingPlan: '培训计划',
  trialFlight: '试飞体验',
  classPlan: '开班计划',
  pmp: 'PMP项目管理',
  npdp: 'NPDP产品管理',
};

// 加载指定认证项目的数据
async function loadTabData(certType: CertType) {
  loading.value = true;
  try {
    const data = await adminCertCenterApi.getDetail(certType);
    tabData.value[certType] = data;
    currentData.value = data;
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 加载所有认证项目的数据
async function loadAllData() {
  loading.value = true;
  try {
    const certTypes: CertType[] = ['ai_trainer', 'ai_engineer', 'drone', 'tech_broker', 'other'];
    await Promise.all(certTypes.map(type => loadTabData(type)));
  } finally {
    loading.value = false;
  }
}

// 切换Tab时加载数据
watch(activeTab, (newTab) => {
  currentData.value = tabData.value[newTab];
  if (!currentData.value) {
    loadTabData(newTab);
  }
});

// 更新认证项目基本信息
async function handleUpdateCert(data: Partial<CertInfo>) {
  try {
    await adminCertCenterApi.updateCert(activeTab.value, data);
    if (currentData.value) {
      Object.assign(currentData.value, data);
    }
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  }
}

// 更新模块
async function handleUpdateModule(moduleId: string, moduleData: any) {
  try {
    await adminCertCenterApi.updateModule(activeTab.value, moduleData);
    if (currentData.value) {
      const index = currentData.value.modules.findIndex(m => m.id === moduleId);
      if (index !== -1) {
        currentData.value.modules[index] = moduleData;
      }
    }
    ElMessage.success('模块保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  }
}

// 切换模块发布状态
async function handleToggleModulePublish(moduleId: string) {
  try {
    await adminCertCenterApi.toggleModulePublish(activeTab.value, moduleId);
    if (currentData.value) {
      const module = currentData.value.modules.find(m => m.id === moduleId);
      if (module) {
        module.isPublished = !module.isPublished;
      }
    }
    ElMessage.success('状态更新成功');
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
}

// 切换认证项目发布状态
async function handleToggleCertPublish() {
  if (!currentData.value) return;

  try {
    await adminCertCenterApi.toggleCertPublish(activeTab.value);
    if (currentData.value) {
      currentData.value.isPublished = !currentData.value.isPublished;
    }
    ElMessage.success(currentData.value.isPublished ? '已发布' : '已取消发布');
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
}

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="cert-center-management">
    <div class="page-header">
      <h2>认证中心介绍管理</h2>
      <p>管理各认证项目的信息，包括人工智能训练师、人工智能工程技术人员、CAAC无人机执照、技术经纪人等</p>
    </div>

    <el-card v-loading="loading" class="content-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 人工智能训练师 -->
        <el-tab-pane name="ai_trainer">
          <template #label>
            <span class="tab-label">
              <el-icon><User /></el-icon>
              人工智能训练师
            </span>
          </template>
          <CertCenterContent
            v-if="currentData && activeTab === 'ai_trainer'"
            :data="currentData"
            :cert-type="activeTab"
            :module-title-map="moduleTitleMap"
            @update-cert="handleUpdateCert"
            @update-module="handleUpdateModule"
            @toggle-module-publish="handleToggleModulePublish"
            @toggle-cert-publish="handleToggleCertPublish"
          />
        </el-tab-pane>

        <!-- 人工智能工程技术人员 -->
        <el-tab-pane name="ai_engineer">
          <template #label>
            <span class="tab-label">
              <el-icon><Cpu /></el-icon>
              人工智能工程技术人员
            </span>
          </template>
          <CertCenterContent
            v-if="currentData && activeTab === 'ai_engineer'"
            :data="currentData"
            :cert-type="activeTab"
            :module-title-map="moduleTitleMap"
            @update-cert="handleUpdateCert"
            @update-module="handleUpdateModule"
            @toggle-module-publish="handleToggleModulePublish"
            @toggle-cert-publish="handleToggleCertPublish"
          />
        </el-tab-pane>

        <!-- CAAC无人机执照 -->
        <el-tab-pane name="drone">
          <template #label>
            <span class="tab-label">
              <el-icon><Notification /></el-icon>
              CAAC无人机执照
            </span>
          </template>
          <CertCenterContent
            v-if="currentData && activeTab === 'drone'"
            :data="currentData"
            :cert-type="activeTab"
            :module-title-map="moduleTitleMap"
            @update-cert="handleUpdateCert"
            @update-module="handleUpdateModule"
            @toggle-module-publish="handleToggleModulePublish"
            @toggle-cert-publish="handleToggleCertPublish"
          />
        </el-tab-pane>

        <!-- 技术经纪人 -->
        <el-tab-pane name="tech_broker">
          <template #label>
            <span class="tab-label">
              <el-icon><Briefcase /></el-icon>
              技术经纪人
            </span>
          </template>
          <CertCenterContent
            v-if="currentData && activeTab === 'tech_broker'"
            :data="currentData"
            :cert-type="activeTab"
            :module-title-map="moduleTitleMap"
            @update-cert="handleUpdateCert"
            @update-module="handleUpdateModule"
            @toggle-module-publish="handleToggleModulePublish"
            @toggle-cert-publish="handleToggleCertPublish"
          />
        </el-tab-pane>

        <!-- 其他 -->
        <el-tab-pane name="other">
          <template #label>
            <span class="tab-label">
              <el-icon><MoreFilled /></el-icon>
              其他
            </span>
          </template>
          <CertCenterContent
            v-if="currentData && activeTab === 'other'"
            :data="currentData"
            :cert-type="activeTab"
            :module-title-map="moduleTitleMap"
            @update-cert="handleUpdateCert"
            @update-module="handleUpdateModule"
            @toggle-module-publish="handleToggleModulePublish"
            @toggle-cert-publish="handleToggleCertPublish"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.cert-center-management {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-large;

    h2 {
      font-size: 24px;
      margin-bottom: $spacing-small;
      color: $text-color-primary;
    }

    p {
      font-size: $font-size-base;
      color: $text-color-secondary;
      margin: 0;
    }
  }

  .content-card {
    .tab-label {
      display: flex;
      align-items: center;
      gap: $spacing-small;
    }
  }
}
</style>
