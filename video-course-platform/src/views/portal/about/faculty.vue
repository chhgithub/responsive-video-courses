<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { publicFacultyApi } from '@/api/public/introduction';
import type { TeacherInfo, FacultyApplicationConfig, FacultyConsultationConfig } from '@/types/introduction';

const loading = ref(false);

// 师资展示
const teachers = ref<TeacherInfo[]>([]);
const selectedTeacher = ref<TeacherInfo | null>(null);
const teacherDialogVisible = ref(false);

// 师资申请
const applicationConfig = ref<FacultyApplicationConfig | null>(null);
const applicationForm = ref({
  applicantName: '',
  phone: '',
  email: '',
  currentTitle: '',
  institution: '',
  specialties: [] as string[],
  achievements: '',
});
const applicationSubmitting = ref(false);

// 师资咨询
const consultationConfig = ref<FacultyConsultationConfig | null>(null);
const consultationForm = ref({
  consultantName: '',
  phone: '',
  email: '',
  topic: '',
  message: '',
});
const consultationSubmitting = ref(false);

// 选项卡
const activeTab = ref('display');

onMounted(async () => {
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    // 加载讲师列表
    teachers.value = await publicFacultyApi.getTeachers();

    // 加载配置
    applicationConfig.value = await publicFacultyApi.getApplicationConfig();
    consultationConfig.value = await publicFacultyApi.getConsultationConfig();
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
}

// 查看讲师详情
function viewTeacherDetail(teacher: TeacherInfo) {
  selectedTeacher.value = teacher;
  teacherDialogVisible.value = true;
}

// 处理专业领域输入
function handleSpecialtiesInput(value: string) {
  applicationForm.value.specialties = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
}

// 提交申请
async function handleSubmitApplication() {
  // 简单验证
  if (!applicationForm.value.applicantName) {
    ElMessage.warning('请输入申请人姓名');
    return;
  }
  if (!applicationForm.value.phone) {
    ElMessage.warning('请输入联系电话');
    return;
  }
  if (!applicationForm.value.email) {
    ElMessage.warning('请输入电子邮箱');
    return;
  }
  if (applicationForm.value.specialties.length === 0) {
    ElMessage.warning('请输入专业领域');
    return;
  }

  applicationSubmitting.value = true;
  try {
    await publicFacultyApi.submitApplication({
      applicantName: applicationForm.value.applicantName,
      phone: applicationForm.value.phone,
      email: applicationForm.value.email,
      currentTitle: applicationForm.value.currentTitle,
      institution: applicationForm.value.institution,
      specialties: applicationForm.value.specialties,
      achievements: applicationForm.value.achievements,
    });

    // 重置表单
    applicationForm.value = {
      applicantName: '',
      phone: '',
      email: '',
      currentTitle: '',
      institution: '',
      specialties: [],
      achievements: '',
    };
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    applicationSubmitting.value = false;
  }
}

// 提交咨询
async function handleSubmitConsultation() {
  // 简单验证
  if (!consultationForm.value.consultantName) {
    ElMessage.warning('请输入咨询人姓名');
    return;
  }
  if (!consultationForm.value.phone) {
    ElMessage.warning('请输入联系电话');
    return;
  }
  if (!consultationForm.value.topic) {
    ElMessage.warning('请输入咨询主题');
    return;
  }
  if (!consultationForm.value.message) {
    ElMessage.warning('请输入咨询内容');
    return;
  }

  consultationSubmitting.value = true;
  try {
    await publicFacultyApi.submitConsultation({
      consultantName: consultationForm.value.consultantName,
      phone: consultationForm.value.phone,
      email: consultationForm.value.email,
      topic: consultationForm.value.topic,
      message: consultationForm.value.message,
    });

    // 重置表单
    consultationForm.value = {
      consultantName: '',
      phone: '',
      email: '',
      topic: '',
      message: '',
    };
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    consultationSubmitting.value = false;
  }
}
</script>

<template>
  <div v-loading="loading" class="faculty-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">师资队伍</h1>
            <p class="hero-subtitle">汇聚行业顶尖专家，培养卓越技术人才</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section">
      <div class="container">
        <div class="content-wrapper">
          <!-- 选项卡 -->
          <el-tabs v-model="activeTab" class="faculty-tabs">
            <!-- 师资展示 -->
            <el-tab-pane label="师资展示" name="display">
              <div class="teachers-grid">
                <el-card
                  v-for="teacher in teachers"
                  :key="teacher.id"
                  class="teacher-card"
                  shadow="hover"
                >
                  <div class="teacher-avatar">
                    <el-avatar :size="120" :src="teacher.avatar" />
                  </div>
                  <div class="teacher-info">
                    <h3 class="teacher-name">{{ teacher.name }}</h3>
                    <p class="teacher-title">{{ teacher.title }}</p>
                    <div class="teacher-specialties">
                      <el-tag
                        v-for="spec in teacher.specialties"
                        :key="spec"
                        size="small"
                        type="primary"
                      >
                        {{ spec }}
                      </el-tag>
                    </div>
                    <div class="teacher-intro" v-html="teacher.intro.substring(0, 100) + '...'"></div>
                    <el-button type="primary" link @click="viewTeacherDetail(teacher)">
                      查看详情
                    </el-button>
                  </div>
                </el-card>
              </div>

              <el-empty v-if="teachers.length === 0" description="暂无师资信息" />
            </el-tab-pane>

            <!-- 师资申请 -->
            <el-tab-pane label="师资申请" name="application">
              <el-card v-if="applicationConfig" class="config-card" shadow="never">
                <div class="config-content" v-html="applicationConfig.description"></div>
              </el-card>

              <el-card v-if="applicationConfig" class="form-card" shadow="hover">
                <template #header>
                  <h2 class="card-title">在线申请</h2>
                </template>

                <el-form :model="applicationForm" label-width="120px" class="application-form">
                  <el-form-item label="申请人姓名" required>
                    <el-input v-model="applicationForm.applicantName" placeholder="请输入您的姓名" />
                  </el-form-item>

                  <el-form-item label="联系电话" required>
                    <el-input v-model="applicationForm.phone" placeholder="请输入您的联系电话" />
                  </el-form-item>

                  <el-form-item label="电子邮箱" required>
                    <el-input v-model="applicationForm.email" placeholder="请输入您的邮箱" />
                  </el-form-item>

                  <el-form-item label="当前职称">
                    <el-input v-model="applicationForm.currentTitle" placeholder="请输入您的当前职称" />
                  </el-form-item>

                  <el-form-item label="所属机构">
                    <el-input v-model="applicationForm.institution" placeholder="请输入您的所属机构" />
                  </el-form-item>

                  <el-form-item label="专业领域" required>
                    <el-input
                      :model-value="applicationForm.specialties.join(', ')"
                      placeholder="多个领域用逗号分隔"
                      @input="handleSpecialtiesInput"
                    />
                    <div class="preview-tags">
                      <el-tag
                        v-for="spec in applicationForm.specialties"
                        :key="spec"
                        size="small"
                        closable
                        @close="applicationForm.specialties = applicationForm.specialties.filter(s => s !== spec)"
                      >
                        {{ spec }}
                      </el-tag>
                    </div>
                  </el-form-item>

                  <el-form-item label="成就描述">
                    <el-input
                      v-model="applicationForm.achievements"
                      type="textarea"
                      :rows="4"
                      placeholder="请描述您的主要成就和荣誉"
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      size="large"
                      :loading="applicationSubmitting"
                      @click="handleSubmitApplication"
                    >
                      提交申请
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-tab-pane>

            <!-- 师资咨询 -->
            <el-tab-pane label="师资咨询" name="consultation">
              <el-card v-if="consultationConfig" class="config-card" shadow="never">
                <div class="config-content" v-html="consultationConfig.description"></div>
              </el-card>

              <el-card class="form-card" shadow="hover">
                <template #header>
                  <h2 class="card-title">在线咨询</h2>
                </template>

                <el-form :model="consultationForm" label-width="120px" class="consultation-form">
                  <el-form-item label="咨询人姓名" required>
                    <el-input v-model="consultationForm.consultantName" placeholder="请输入您的姓名" />
                  </el-form-item>

                  <el-form-item label="联系电话" required>
                    <el-input v-model="consultationForm.phone" placeholder="请输入您的联系电话" />
                  </el-form-item>

                  <el-form-item label="电子邮箱">
                    <el-input v-model="consultationForm.email" placeholder="请输入您的邮箱（可选）" />
                  </el-form-item>

                  <el-form-item label="咨询主题" required>
                    <el-input v-model="consultationForm.topic" placeholder="请输入咨询主题" />
                  </el-form-item>

                  <el-form-item label="咨询内容" required>
                    <el-input
                      v-model="consultationForm.message"
                      type="textarea"
                      :rows="6"
                      placeholder="请详细描述您的问题"
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      size="large"
                      :loading="consultationSubmitting"
                      @click="handleSubmitConsultation"
                    >
                      提交咨询
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </section>

    <!-- 讲师详情对话框 -->
    <el-dialog v-model="teacherDialogVisible" :title="selectedTeacher?.name" width="700px">
      <div v-if="selectedTeacher" class="teacher-detail">
        <div class="detail-header">
          <el-avatar :size="100" :src="selectedTeacher.avatar" />
          <div class="header-info">
            <h2>{{ selectedTeacher.name }}</h2>
            <p class="title">{{ selectedTeacher.title }}</p>
          </div>
        </div>

        <el-divider />

        <div class="detail-section">
          <h3>专业领域</h3>
          <div class="specialties-tags">
            <el-tag v-for="spec in selectedTeacher.specialties" :key="spec" type="primary">
              {{ spec }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section">
          <h3>个人简介</h3>
          <div class="intro-content" v-html="selectedTeacher.intro"></div>
        </div>

        <div v-if="selectedTeacher.achievements && selectedTeacher.achievements.length > 0" class="detail-section">
          <h3>成就荣誉</h3>
          <ul class="achievements-list">
            <li v-for="(achievement, index) in selectedTeacher.achievements" :key="index">
              {{ achievement }}
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <el-button @click="teacherDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.faculty-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Hero Section
.hero-section {
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: #667eea;
  margin-bottom: $spacing-extra-large;

  .hero-overlay {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
    padding: $spacing-extra-extra-large 0;

    .hero-content {
      text-align: center;
      color: #fff;
      animation: fadeInUp 0.8s ease-out;

      .hero-title {
        font-size: 48px;
        font-weight: bold;
        margin: 0 0 $spacing-base 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

        @media (max-width: 768px) {
          font-size: 32px;
        }
      }

      .hero-subtitle {
        font-size: $font-size-large;
        opacity: 0.95;
        margin: 0;

        @media (max-width: 768px) {
          font-size: $font-size-base;
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Content Section
.content-section {
  padding-bottom: $spacing-extra-extra-large;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.faculty-tabs {
  .teachers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: $spacing-large;
    margin-bottom: $spacing-extra-large;

    .teacher-card {
      text-align: center;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .teacher-avatar {
        margin-bottom: $spacing-base;
      }

      .teacher-info {
        .teacher-name {
          font-size: 22px;
          color: $text-color-primary;
          margin: 0 0 $spacing-small 0;
        }

        .teacher-title {
          font-size: $font-size-base;
          color: $primary-color;
          margin: 0 0 $spacing-base 0;
          font-weight: 600;
        }

        .teacher-specialties {
          display: flex;
          flex-wrap: wrap;
          gap: $spacing-small;
          justify-content: center;
          margin-bottom: $spacing-base;
        }

        .teacher-intro {
          font-size: $font-size-small;
          color: $text-color-secondary;
          line-height: 1.6;
          margin-bottom: $spacing-base;
          min-height: 60px;
        }
      }
    }
  }

  .config-card {
    margin-bottom: $spacing-large;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

    .config-content {
      :deep(h2) {
        font-size: 24px;
        color: $text-color-primary;
        margin-bottom: $spacing-base;
      }

      :deep(p) {
        font-size: $font-size-base;
        line-height: 1.8;
        color: $text-color-regular;
        margin-bottom: $spacing-small;
      }

      :deep(ul),
      :deep(ol) {
        margin-left: $spacing-large;
        margin-bottom: $spacing-base;

        li {
          line-height: 1.8;
          margin-bottom: $spacing-small / 2;
        }
      }
    }
  }

  .form-card {
    margin-bottom: $spacing-large;

    .card-title {
      font-size: 20px;
      color: $text-color-primary;
      margin: 0;
    }

    .application-form,
    .consultation-form {
      max-width: 700px;
    }

    .preview-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-small;
      margin-top: $spacing-small;
    }

    .field-tip {
      margin-top: $spacing-small;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }
}

// Teacher Detail Dialog
.teacher-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: $spacing-large;
    margin-bottom: $spacing-base;

    .header-info {
      flex: 1;

      h2 {
        font-size: 28px;
        color: $text-color-primary;
        margin: 0 0 $spacing-small 0;
      }

      .title {
        font-size: $font-size-large;
        color: $primary-color;
        margin: 0;
        font-weight: 600;
      }
    }
  }

  .detail-section {
    margin-bottom: $spacing-large;

    h3 {
      font-size: 18px;
      color: $text-color-primary;
      margin-bottom: $spacing-base;
    }

    .specialties-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-small;
    }

    .intro-content {
      font-size: $font-size-base;
      line-height: 1.8;
      color: $text-color-regular;

      :deep(p) {
        margin-bottom: $spacing-base;
      }
    }

    .achievements-list {
      list-style: none;
      padding-left: 0;
      margin: 0;

      li {
        position: relative;
        padding-left: $spacing-large + $spacing-small;
        margin-bottom: $spacing-small;
        line-height: 1.8;
        color: $text-color-regular;

        &::before {
          content: '🏆';
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
  }
}
</style>
