<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { InfoFilled } from '@element-plus/icons-vue';

const router = useRouter();

// 子标签类型
type OrgTab = 'students' | 'codes' | 'progress';
const activeTab = ref<OrgTab>('students');

// 子标签配置
const orgTabs = [
  { key: 'students', label: '学员管理', icon: '👥' },
  { key: 'codes', label: '兑换码管理', icon: '🔑' },
  { key: 'progress', label: '学习进度', icon: '📊' },
];

// 导航到对应的组织管理页面
function navigateToOrgPage(tab: OrgTab) {
  const pathMap: Record<OrgTab, string> = {
    students: '/admin/org/students',
    codes: '/admin/org/codes',
    progress: '/admin/org/progress',
  };
  router.push(pathMap[tab]);
}
</script>

<template>
  <div class="org-info-container">
    <div class="org-header">
      <h2>单位信息管理</h2>
      <p class="subtitle">管理学员信息、兑换码及学习进度</p>
    </div>

    <!-- 子标签导航 -->
    <div class="org-tabs">
      <div
        v-for="tab in orgTabs"
        :key="tab.key"
        class="org-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key; navigateToOrgPage(tab.key as OrgTab)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <!-- 内容提示 -->
    <div class="org-content-hint">
      <el-card shadow="never">
        <div class="hint-content">
          <el-icon :size="48" color="#909399"><InfoFilled /></el-icon>
          <p>请选择上方的管理功能进行操作</p>
          <el-button type="primary" @click="navigateToOrgPage(activeTab)">
            进入{{ orgTabs.find(t => t.key === activeTab)?.label }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.org-info-container {
  min-height: 400px;
}

.org-header {
  margin-bottom: $spacing-large;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .subtitle {
    font-size: $font-size-base;
    color: $text-color-secondary;
    margin: 0;
  }
}

.org-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-base;
  margin-bottom: $spacing-large;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.org-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-small;
  padding: $spacing-large;
  background: #fff;
  border: 2px solid $border-color-light;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: #a0cfff;
    background: $background-color-light;
  }

  &.active {
    border-color: #409eff;
    background: #ecf5ff;

    .tab-label {
      color: #409eff;
      font-weight: 600;
    }
  }

  .tab-icon {
    font-size: 24px;
  }

  .tab-label {
    font-size: $font-size-base;
    color: $text-color-primary;
  }
}

.org-content-hint {
  .hint-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-extra-large 0;
    gap: $spacing-base;

    p {
      font-size: $font-size-base;
      color: $text-color-secondary;
      margin: 0;
    }
  }
}
</style>
