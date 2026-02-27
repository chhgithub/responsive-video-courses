<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminFacultyApi } from '@/api/admin/introduction';
import type { TeacherInfo, FacultyApplication, FacultyConsultation, FacultyApplicationConfig, FacultyConsultationConfig } from '@/types/introduction';
import FacultyDisplay from './components/FacultyDisplay.vue';
import FacultyApplicationTab from './components/FacultyApplication.vue';
import FacultyConsultationTab from './components/FacultyConsultation.vue';

const activeTab = ref<'display' | 'application' | 'consultation'>('display');
const loading = ref(false);

// 讲师数据
const teachers = ref<TeacherInfo[]>([]);

// 申请配置和列表
const applicationConfig = ref<FacultyApplicationConfig | null>(null);
const applications = ref<FacultyApplication[]>([]);

// 咨询配置和列表
const consultationConfig = ref<FacultyConsultationConfig | null>(null);
const consultations = ref<FacultyConsultation[]>([]);

// 加载所有数据
async function loadAllData() {
  loading.value = true;
  try {
    // 并行加载所有数据
    const [teachersData, appConfigData, appListData, consultConfigData, consultListData] = await Promise.all([
      adminFacultyApi.getTeachers(),
      adminFacultyApi.getApplicationConfig(),
      adminFacultyApi.getApplications(),
      adminFacultyApi.getConsultationConfig(),
      adminFacultyApi.getConsultations(),
    ]);

    teachers.value = teachersData;
    applicationConfig.value = appConfigData;
    applications.value = appListData;
    consultationConfig.value = consultConfigData;
    consultations.value = consultListData;
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 刷新讲师列表
async function refreshTeachers() {
  try {
    teachers.value = await adminFacultyApi.getTeachers();
  } catch (error) {
    console.error('刷新讲师列表失败:', error);
  }
}

// 刷新申请列表
async function refreshApplications() {
  try {
    applications.value = await adminFacultyApi.getApplications();
  } catch (error) {
    console.error('刷新申请列表失败:', error);
  }
}

// 刷新咨询列表
async function refreshConsultations() {
  try {
    consultations.value = await adminFacultyApi.getConsultations();
  } catch (error) {
    console.error('刷新咨询列表失败:', error);
  }
}

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="faculty-management">
    <div class="page-header">
      <h2>师资队伍介绍管理</h2>
      <p>管理师资展示、师资申请和师资咨询</p>
    </div>

    <el-card v-loading="loading" class="content-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 师资展示 -->
        <el-tab-pane name="display">
          <template #label>
            <span class="tab-label">
              <el-icon><User /></el-icon>
              师资展示
            </span>
          </template>
          <FacultyDisplay
            v-if="activeTab === 'display'"
            :teachers="teachers"
            @refresh="refreshTeachers"
          />
        </el-tab-pane>

        <!-- 师资申请 -->
        <el-tab-pane name="application">
          <template #label>
            <span class="tab-label">
              <el-icon><DocumentAdd /></el-icon>
              师资申请
              <el-badge v-if="applications.filter(a => a.status === 'pending').length > 0" :value="applications.filter(a => a.status === 'pending').length" class="badge" />
            </span>
          </template>
          <FacultyApplicationTab
            v-if="activeTab === 'application'"
            :config="applicationConfig"
            :applications="applications"
            @refresh="refreshApplications"
          />
        </el-tab-pane>

        <!-- 师资咨询 -->
        <el-tab-pane name="consultation">
          <template #label>
            <span class="tab-label">
              <el-icon><ChatDotRound /></el-icon>
              师资咨询
              <el-badge v-if="consultations.filter(c => c.status === 'pending').length > 0" :value="consultations.filter(c => c.status === 'pending').length" class="badge" />
            </span>
          </template>
          <FacultyConsultationTab
            v-if="activeTab === 'consultation'"
            :config="consultationConfig"
            :consultations="consultations"
            @refresh="refreshConsultations"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.faculty-management {
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

      .badge {
        margin-left: $spacing-small;
      }
    }
  }
}
</style>
