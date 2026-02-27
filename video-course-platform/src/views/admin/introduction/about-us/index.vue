<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { adminAboutUsApi } from '@/api/admin/introduction';
import type { AboutUsInfo } from '@/types/introduction';
import AboutUsContent from './components/AboutUsContent.vue';
import ContactUsContent from './components/ContactUsContent.vue';

const activeTab = ref('research');
const loading = ref(false);
const saving = ref(false);

// 存储各个Tab的数据
const tabData = ref<Record<string, AboutUsInfo | null>>({
  research: null,
  digital: null,
  education: null,
  contact: null,
});

// 当前Tab的数据
const currentData = ref<AboutUsInfo | null>(null);

// 加载指定Tab的数据
async function loadTabData(tab: string) {
  loading.value = true;
  try {
    const data = await adminAboutUsApi.getDetail(tab);
    tabData.value[tab] = data;
    currentData.value = data;
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 加载所有Tab的数据
async function loadAllData() {
  loading.value = true;
  try {
    const tabs = ['research', 'digital', 'education', 'contact'];
    await Promise.all(tabs.map(tab => loadTabData(tab)));
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

// 保存数据
async function handleSave(data: AboutUsInfo) {
  saving.value = true;
  try {
    await adminAboutUsApi.update(data);
    tabData.value[activeTab.value] = data;
    currentData.value = data;
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
}

// 切换发布状态
async function handleTogglePublish() {
  if (!currentData.value) return;

  try {
    const result = await adminAboutUsApi.togglePublish(activeTab.value);
    if (result && currentData.value) {
      currentData.value.isPublished = !currentData.value.isPublished;
      tabData.value[activeTab.value] = currentData.value;
      ElMessage.success(currentData.value.isPublished ? '已发布' : '已取消发布');
    }
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
  <div class="about-us-management">
    <div class="page-header">
      <h2>关于我们介绍管理</h2>
      <p>管理关于我们页面的介绍信息，包括研究院、数字创新中心、教育培训中心和联系方式</p>
    </div>

    <el-card v-loading="loading" class="content-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 关于研究院 -->
        <el-tab-pane label="关于研究院" name="research">
          <template #label>
            <span class="tab-label">
              <el-icon><OfficeBuilding /></el-icon>
              关于研究院
            </span>
          </template>
          <AboutUsContent
            v-if="currentData && activeTab === 'research'"
            :data="currentData"
            sub-category="research"
            :saving="saving"
            @save="handleSave"
            @toggle-publish="handleTogglePublish"
          />
        </el-tab-pane>

        <!-- 关于数字创新中心 -->
        <el-tab-pane label="关于数字创新中心" name="digital">
          <template #label>
            <span class="tab-label">
              <el-icon><Monitor /></el-icon>
              关于数字创新中心
            </span>
          </template>
          <AboutUsContent
            v-if="currentData && activeTab === 'digital'"
            :data="currentData"
            sub-category="digital"
            :saving="saving"
            @save="handleSave"
            @toggle-publish="handleTogglePublish"
          />
        </el-tab-pane>

        <!-- 关于教育培训中心 -->
        <el-tab-pane label="关于教育培训中心" name="education">
          <template #label>
            <span class="tab-label">
              <el-icon><Reading /></el-icon>
              关于教育培训中心
            </span>
          </template>
          <AboutUsContent
            v-if="currentData && activeTab === 'education'"
            :data="currentData"
            sub-category="education"
            :saving="saving"
            @save="handleSave"
            @toggle-publish="handleTogglePublish"
          />
        </el-tab-pane>

        <!-- 联系我们 -->
        <el-tab-pane label="联系我们" name="contact">
          <template #label>
            <span class="tab-label">
              <el-icon><Phone /></el-icon>
              联系我们
            </span>
          </template>
          <ContactUsContent
            v-if="currentData && activeTab === 'contact'"
            :data="currentData"
            :saving="saving"
            @save="handleSave"
            @toggle-publish="handleTogglePublish"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.about-us-management {
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
