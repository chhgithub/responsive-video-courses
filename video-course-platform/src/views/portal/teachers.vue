<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface Teacher {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialties: string[];
  intro: string;
  courses: number;
  students: number;
  rating: number;
}

const teachers = ref<Teacher[]>([]);
const loading = ref(false);
const searchKeyword = ref('');
const selectedSpecialty = ref('全部');

const specialties = computed(() => ['全部', '前端开发', '后端开发', '人工智能', '数据分析', '产品设计']);

function generateMockTeachers(): Teacher[] {
  return [
    {
      id: '1',
      name: '张老师',
      title: '高级前端架构师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
      specialties: ['前端开发', 'Vue3'],
      intro: '10年前端开发经验，曾在阿里、腾讯担任技术专家，专注于 Vue3 生态系统研究',
      courses: 15,
      students: 12500,
      rating: 4.9,
    },
    {
      id: '2',
      name: '李老师',
      title: '资深后端工程师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2',
      specialties: ['后端开发', 'Node.js'],
      intro: '8年后端开发经验，前滴滴出行技术专家，精通微服务架构设计',
      courses: 12,
      students: 8900,
      rating: 4.8,
    },
    {
      id: '3',
      name: '王老师',
      title: '人工智能专家',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3',
      specialties: ['人工智能', '机器学习'],
      intro: '清华大学博士，5年 AI 算法研究经验，发表顶级会议论文 20 余篇',
      courses: 8,
      students: 5600,
      rating: 4.9,
    },
    {
      id: '4',
      name: '赵老师',
      title: '数据分析师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher4',
      specialties: ['数据分析', 'Python'],
      intro: '前字节跳动数据分析师，擅长使用 Python 进行大数据分析和可视化',
      courses: 10,
      students: 7200,
      rating: 4.7,
    },
    {
      id: '5',
      name: '刘老师',
      title: 'UI/UX 设计师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher5',
      specialties: ['产品设计', '用户体验'],
      intro: '10年产品设计经验，曾主导多个千万级用户产品的设计工作',
      courses: 6,
      students: 4300,
      rating: 4.8,
    },
    {
      id: '6',
      name: '陈老师',
      title: '全栈工程师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher6',
      specialties: ['前端开发', '后端开发'],
      intro: '全栈开发专家，精通前后端技术栈，擅长大型 Web 应用架构设计',
      courses: 18,
      students: 15800,
      rating: 4.9,
    },
  ];
}

function loadTeachers() {
  loading.value = true;
  setTimeout(() => {
    teachers.value = generateMockTeachers();
    loading.value = false;
  }, 300);
}

const filteredTeachers = computed(() => {
  let filtered = teachers.value;

  if (searchKeyword.value) {
    filtered = filtered.filter((t) =>
      t.name.includes(searchKeyword.value) ||
      t.intro.includes(searchKeyword.value)
    );
  }

  if (selectedSpecialty.value !== '全部') {
    filtered = filtered.filter((t) =>
      t.specialties.includes(selectedSpecialty.value)
    );
  }

  return filtered;
});

onMounted(() => {
  loadTeachers();
});
</script>

<template>
  <div class="teachers-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>师资队伍</h1>
        <p>专业讲师团队，助您快速成长</p>
      </div>

      <!-- 搜索和筛选 -->
      <el-card class="filter-card" shadow="never">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索讲师姓名或简介..."
          clearable
          size="large"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-card>

      <el-card class="specialty-card" shadow="never">
        <div class="specialty-filter">
          <span class="filter-label">专业领域：</span>
          <el-button
            v-for="spec in specialties"
            :key="spec"
            :type="selectedSpecialty === spec ? 'primary' : 'default'"
            round
            size="small"
            @click="selectedSpecialty = spec"
          >
            {{ spec }}
          </el-button>
        </div>
      </el-card>

      <!-- 讲师列表 -->
      <div v-loading="loading" class="teachers-grid">
        <el-card
          v-for="teacher in filteredTeachers"
          :key="teacher.id"
          class="teacher-card"
          shadow="hover"
        >
          <div class="teacher-header">
            <el-avatar :size="80" :src="teacher.avatar" />
            <div class="teacher-basic">
              <h3>{{ teacher.name }}</h3>
              <p class="title">{{ teacher.title }}</p>
            </div>
            <div class="teacher-rating">
              <el-rate
                v-model="teacher.rating"
                disabled
                show-score
                text-color="#ff9900"
              />
            </div>
          </div>

          <el-divider />

          <div class="teacher-specialties">
            <el-tag
              v-for="spec in teacher.specialties"
              :key="spec"
              type="primary"
              size="small"
              round
            >
              {{ spec }}
            </el-tag>
          </div>

          <div class="teacher-intro">
            <p>{{ teacher.intro }}</p>
          </div>

          <el-divider />

          <div class="teacher-stats">
            <div class="stat-item">
              <span class="stat-label">课程数</span>
              <span class="stat-value">{{ teacher.courses }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">学员数</span>
              <span class="stat-value">{{ teacher.students.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">评分</span>
              <span class="stat-value">{{ teacher.rating }}</span>
            </div>
          </div>

          <div class="teacher-actions">
            <el-button type="primary" plain>查看详情</el-button>
            <el-button type="primary">查看课程</el-button>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredTeachers.length === 0"
        description="暂无讲师数据"
        :image-size="200"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.teachers-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
  padding: $spacing-extra-large 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.page-header {
  text-align: center;
  margin-bottom: $spacing-extra-large;

  h1 {
    font-size: 36px;
    margin-bottom: $spacing-base;
    color: $text-color-primary;
  }

  p {
    font-size: $font-size-medium;
    color: $text-color-secondary;
  }
}

.filter-card {
  margin-bottom: $spacing-large;
}

.specialty-card {
  margin-bottom: $spacing-extra-large;

  .specialty-filter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-base;

    .filter-label {
      font-size: $font-size-base;
      font-weight: 500;
      color: $text-color-primary;
      min-width: 80px;
    }
  }
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: $spacing-large;
  margin-bottom: $spacing-extra-large;

  @include respond-to($breakpoint-lg) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  @include respond-to($breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.teacher-card {
  .teacher-header {
    display: flex;
    gap: $spacing-large;
    align-items: center;

    @include respond-to($breakpoint-sm) {
      flex-direction: column;
      text-align: center;
    }

    .teacher-basic {
      flex: 1;

      h3 {
        font-size: $font-size-large;
        font-weight: 600;
        margin-bottom: $spacing-small;
        color: $text-color-primary;
      }

      .title {
        margin: 0;
        font-size: $font-size-base;
        color: $text-color-secondary;
      }
    }

    .teacher-rating {
      flex-shrink: 0;

      @include respond-to($breakpoint-sm) {
        width: 100%;
      }
    }
  }

  .teacher-specialties {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-small;
    margin-bottom: $spacing-large;
  }

  .teacher-intro {
    margin-bottom: $spacing-large;

    p {
      font-size: $font-size-base;
      color: $text-color-regular;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .teacher-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: $spacing-large;
    padding: $spacing-base 0;
    background: #f9fafc;
    border-radius: $border-radius-base;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: $font-size-small;
        color: $text-color-secondary;
        margin-bottom: $spacing-small;
      }

      .stat-value {
        font-size: $font-size-large;
        font-weight: 600;
        color: $--el-color-primary;
      }
    }
  }

  .teacher-actions {
    display: flex;
    gap: $spacing-base;

    button {
      flex: 1;
    }
  }
}
</style>
