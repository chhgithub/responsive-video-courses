<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import WangEditor from '@/components/WangEditor.vue';
import {
  getAllIntros,
  addIntro,
  updateIntro,
  initializeSampleIntros,
  initializeDefaultOrganizations,
} from '@/utils/general-education-storage';
import { GeneralCategory, GeneralContentType } from '@/types/general-education.d';

type TabType = 'family' | 'school';

const loading = ref(false);
const activeTab = ref<TabType>('family');
const saving = ref(false);

// 存储各个类别的数据
const tabData = ref<Record<TabType, any | null>>({
  family: null,
  school: null,
});

// 当前Tab的数据
const currentData = ref<any>(null);

// Tab配置
const tabConfigs = [
  { key: 'family' as TabType, label: '家庭教育介绍', icon: 'House' },
  { key: 'school' as TabType, label: '校园教育介绍', icon: 'School' },
];

// 加载指定类别的数据
async function loadTabData(category: GeneralCategory) {
  loading.value = true;
  try {
    const all = getAllIntros();
    const filtered = all.filter(
      i => i.category === category && i.type === GeneralContentType.INTRO
    );

    const tabKey = category === GeneralCategory.FAMILY ? 'family' : 'school';

    // 取第一条数据，如果没有则创建默认数据
    if (filtered.length > 0) {
      tabData.value[tabKey] = filtered[0];
    } else {
      // 创建默认数据
      const defaultData = {
        title: category === GeneralCategory.FAMILY ? '家庭教育介绍' : '校园教育介绍',
        content: '',
        isPublished: false,
        sortOrder: 0,
      };
      const created = addIntro({
        ...defaultData,
        category,
        type: GeneralContentType.INTRO,
      });
      tabData.value[tabKey] = created;
    }

    if (activeTab.value === tabKey) {
      currentData.value = tabData.value[tabKey];
    }
  } catch (error) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
}

// 切换Tab时加载数据
watch(activeTab, (newTab) => {
  currentData.value = tabData.value[newTab];
  if (!currentData.value) {
    const category = newTab === 'family' ? GeneralCategory.FAMILY : GeneralCategory.SCHOOL;
    loadTabData(category);
  }
});

// 更新数据
async function handleUpdate(field: string, value: any) {
  if (!currentData.value) return;

  try {
    currentData.value[field] = value;
    await updateIntro(currentData.value.id, {
      [field]: value,
    });
    ElMessage.success('保存成功');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
    // 回滚数据
    loadTabData(
      activeTab.value === 'family' ? GeneralCategory.FAMILY : GeneralCategory.SCHOOL
    );
  }
}

// 切换发布状态
async function handleTogglePublish() {
  if (!currentData.value) return;

  try {
    const newStatus = !currentData.value.isPublished;
    await updateIntro(currentData.value.id, {
      isPublished: newStatus,
    });
    currentData.value.isPublished = newStatus;
    ElMessage.success(newStatus ? '发布成功' : '已取消发布');
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

// 保存所有更改
async function handleSave() {
  if (!currentData.value) return;

  if (!currentData.value.title) {
    ElMessage.warning('请输入标题');
    return;
  }
  if (!currentData.value.content) {
    ElMessage.warning('请输入内容');
    return;
  }

  saving.value = true;
  try {
    await updateIntro(currentData.value.id, {
      title: currentData.value.title,
      content: currentData.value.content,
    });
    ElMessage.success('保存成功');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  // 初始化示例数据（如果不存在）
  initializeSampleIntros();
  // 初始化默认单位数据（如果不存在）
  initializeDefaultOrganizations();
  // 加载数据
  loadTabData(GeneralCategory.FAMILY);
  loadTabData(GeneralCategory.SCHOOL);
});
</script>

<template>
  <div class="general-intro-management">
    <div class="page-header">
      <h2>通识教育介绍管理</h2>
      <p>管理家庭教育和校园教育的介绍内容，发布后的内容将在前台网站展示</p>
    </div>

    <el-card v-loading="loading" class="content-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 家庭教育介绍 -->
        <el-tab-pane name="family">
          <template #label>
            <span class="tab-label">
              <el-icon><House /></el-icon>
              家庭教育介绍
            </span>
          </template>

          <div v-if="currentData && activeTab === 'family'" class="tab-content">
            <!-- 操作栏 -->
            <div class="toolbar">
              <div class="toolbar-left">
                <h3>家庭教育介绍内容管理</h3>
              </div>
              <div class="toolbar-right">
                <el-tag :type="currentData.isPublished ? 'success' : 'info'" size="large">
                  {{ currentData.isPublished ? '已发布' : '草稿' }}
                </el-tag>
                <el-button
                  :type="currentData.isPublished ? 'warning' : 'success'"
                  @click="handleTogglePublish"
                >
                  {{ currentData.isPublished ? '取消发布' : '发布' }}
                </el-button>
              </div>
            </div>

            <!-- 基本信息 -->
            <el-divider content-position="left">基本信息</el-divider>
            <el-form label-width="120px" class="intro-form">
              <el-form-item label="标题" required>
                <el-input
                  :model-value="currentData.title"
                  @input="handleUpdate('title', $event)"
                  placeholder="请输入标题"
                />
              </el-form-item>

              <el-form-item label="内容" required>
                <WangEditor
                  :model-value="currentData.content"
                  @update:model-value="handleUpdate('content', $event)"
                  placeholder="请输入介绍内容"
                  :height="400"
                />
              </el-form-item>
            </el-form>

            <!-- 保存按钮 -->
            <div class="save-actions">
              <el-button type="primary" :loading="saving" @click="handleSave">
                <el-icon><DocumentChecked /></el-icon>
                保存更改
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 校园教育介绍 -->
        <el-tab-pane name="school">
          <template #label>
            <span class="tab-label">
              <el-icon><School /></el-icon>
              校园教育介绍
            </span>
          </template>

          <div v-if="currentData && activeTab === 'school'" class="tab-content">
            <!-- 操作栏 -->
            <div class="toolbar">
              <div class="toolbar-left">
                <h3>校园教育介绍内容管理</h3>
              </div>
              <div class="toolbar-right">
                <el-tag :type="currentData.isPublished ? 'success' : 'info'" size="large">
                  {{ currentData.isPublished ? '已发布' : '草稿' }}
                </el-tag>
                <el-button
                  :type="currentData.isPublished ? 'warning' : 'success'"
                  @click="handleTogglePublish"
                >
                  {{ currentData.isPublished ? '取消发布' : '发布' }}
                </el-button>
              </div>
            </div>

            <!-- 基本信息 -->
            <el-divider content-position="left">基本信息</el-divider>
            <el-form label-width="120px" class="intro-form">
              <el-form-item label="标题" required>
                <el-input
                  :model-value="currentData.title"
                  @input="handleUpdate('title', $event)"
                  placeholder="请输入标题"
                />
              </el-form-item>

              <el-form-item label="内容" required>
                <WangEditor
                  :model-value="currentData.content"
                  @update:model-value="handleUpdate('content', $event)"
                  placeholder="请输入介绍内容"
                  :height="400"
                />
              </el-form-item>
            </el-form>

            <!-- 保存按钮 -->
            <div class="save-actions">
              <el-button type="primary" :loading="saving" @click="handleSave">
                <el-icon><DocumentChecked /></el-icon>
                保存更改
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/styles/variables.scss";

.general-intro-management {
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
      font-size: $font-size-base;
    }

    .tab-content {
      padding: $spacing-large 0;

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-large;
        padding: $spacing-large;
        background: $background-color-base;
        border-radius: $border-radius-base;

        .toolbar-left {
          h3 {
            font-size: $font-size-large;
            color: $text-color-primary;
            margin: 0;
          }
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: $spacing-base;
        }
      }

      .intro-form {
        margin-bottom: $spacing-extra-large;

        :deep(.el-form-item__label) {
          font-weight: 600;
        }
      }

      .save-actions {
        display: flex;
        justify-content: center;
        padding: $spacing-extra-large 0;
        border-top: 1px solid $border-color-lighter;

        .el-button {
          min-width: 150px;
        }
      }
    }
  }
}
</style>
