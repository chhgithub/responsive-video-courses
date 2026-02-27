<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Mock 数据类型
interface Course {
  id: string;
  title: string;
  coverImage: string;
  teacher: { name: string };
  category: string;
  tags: string[];
  rating: number;
  studentCount: number;
  price: number;
  isFree: boolean;
  trialLessonId?: string;
  ageRange?: string;
}

interface ResearchProgram {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  category: string;
  tags: string[];
  requirements: string;
  enrolledCount: number;
  capacity: number;
  enrollmentDeadline: string;
}

interface TrainingPlan {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  type: 'K12' | '成人';
  tags: string[];
  location: string;
  startDate: string;
  endDate: string;
  enrolledCount: number;
  capacity: number;
  price: number;
}

const route = useRoute();
const router = useRouter();

// 筛选条件
const searchKeyword = ref('');
const selectedAge = ref('全部');
const selectedCategory = ref('全部');
const selectedPayment = ref('全部');

// 当前Tab
const activeTab = ref('all');

// Tab配置
const tabs = [
  { key: 'all', label: '全部课程' },
  { key: 'micro', label: '微课程' },
  { key: 'public', label: '公益课程' },
  { key: 'paid', label: '付费课程' },
  { key: 'research', label: '科研赋能' },
  { key: 'training', label: '集训计划' },
];

// 数据列表
const courses = ref<Course[]>([]);
const researchPrograms = ref<ResearchProgram[]>([]);
const trainingPlans = ref<TrainingPlan[]>([]);
const loading = ref(false);

// 分页
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
});

// 标签选项
const ageTags = computed(() => ['全部', '3-6岁', '7-12岁', '13-18岁', '成人']);
const categoryTags = computed(() => ['全部', '编程', '美术', '音乐', '数学', '人工智能']);
const paymentTags = computed(() => ['全部', '免费', '付费']);

// Mock 数据生成
function generateMockCourses(): Course[] {
  const mockCourses: Course[] = [];
  const categories = ['编程', '美术', '音乐', '数学', '人工智能'];
  const ages = ['3-6岁', '7-12岁', '13-18岁', '成人'];
  const teachers = ['张老师', '李老师', '王老师', '赵老师'];

  for (let i = 1; i <= 20; i++) {
    mockCourses.push({
      id: `course-${i}`,
      title: `${categories[i % categories.length]}基础课程 ${i}`,
      coverImage: `https://picsum.photos/seed/course${i}/300/200`,
      teacher: { name: teachers[i % teachers.length] },
      category: categories[i % categories.length],
      tags: [ages[i % ages.length], '热门', '推荐'],
      rating: 4.5 + (i % 5) * 0.1,
      studentCount: 1000 + i * 100,
      price: i % 3 === 0 ? 0 : 19900 + i * 100,
      isFree: i % 3 === 0,
      trialLessonId: i % 4 === 0 ? `trial-${i}` : undefined,
      ageRange: ages[i % ages.length],
    });
  }

  return mockCourses;
}

function generateMockResearchPrograms(): ResearchProgram[] {
  return [
    {
      id: 'research-1',
      title: '人工智能与机器学习研究',
      coverImage: 'https://picsum.photos/seed/research1/300/200',
      description: '深入研究AI和ML的最新技术，培养科研能力',
      category: '人工智能',
      tags: ['科研', 'AI', '机器学习'],
      requirements: '具备Python基础',
      enrolledCount: 25,
      capacity: 30,
      enrollmentDeadline: '2025-06-30',
    },
    {
      id: 'research-2',
      title: '量子计算前沿探索',
      coverImage: 'https://picsum.photos/seed/research2/300/200',
      description: '探索量子计算的原理和应用',
      category: '物理',
      tags: ['量子计算', '前沿'],
      requirements: '物理专业背景',
      enrolledCount: 15,
      capacity: 20,
      enrollmentDeadline: '2025-07-31',
    },
  ];
}

function generateMockTrainingPlans(): TrainingPlan[] {
  return [
    {
      id: 'training-1',
      title: 'K12编程集训营',
      coverImage: 'https://picsum.photos/seed/training1/300/200',
      description: '面向中小学生的编程集训计划',
      type: 'K12',
      tags: ['编程', 'K12', '集训'],
      location: '北京',
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      enrolledCount: 45,
      capacity: 50,
      price: 59900,
    },
    {
      id: 'training-2',
      title: '成人职业提升训练营',
      coverImage: 'https://picsum.photos/seed/training2/300/200',
      description: '帮助职场人士提升技能',
      type: '成人',
      tags: ['职业', '成人', '集训'],
      location: '上海',
      startDate: '2025-08-01',
      endDate: '2025-08-07',
      enrolledCount: 28,
      capacity: 30,
      price: 39900,
    },
  ];
}

// 加载课程数据
async function loadCourses() {
  loading.value = true;

  try {
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 根据筛选条件过滤课程
    let filtered = generateMockCourses();

    if (searchKeyword.value) {
      filtered = filtered.filter((c) =>
        c.title.includes(searchKeyword.value) ||
        c.teacher.name.includes(searchKeyword.value)
      );
    }

    if (selectedCategory.value !== '全部') {
      filtered = filtered.filter((c) => c.category === selectedCategory.value);
    }

    if (selectedAge.value !== '全部') {
      filtered = filtered.filter((c) => c.ageRange === selectedAge.value);
    }

    if (selectedPayment.value === '免费') {
      filtered = filtered.filter((c) => c.isFree);
    } else if (selectedPayment.value === '付费') {
      filtered = filtered.filter((c) => !c.isFree);
    }

    // 分页
    pagination.value.total = filtered.length;
    const start = (pagination.value.page - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    courses.value = filtered.slice(start, end);

    // 加载其他类型数据
    researchPrograms.value = generateMockResearchPrograms();
    trainingPlans.value = generateMockTrainingPlans();
  } catch (error) {
    console.error('加载课程失败:', error);
  } finally {
    loading.value = false;
  }
}

// Tab切换
function handleTabChange(tab: string) {
  activeTab.value = tab;
  pagination.value.page = 1;
  loadCourses();
}

// 筛选条件变化
function handleFilterChange() {
  pagination.value.page = 1;
  loadCourses();
}

// 执行搜索
function handleSearch() {
  pagination.value.page = 1;
  loadCourses();
}

// 分页变化
function handlePageChange(page: number) {
  pagination.value.page = page;
  loadCourses();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 跳转到课程详情
function goToCourseDetail(courseId: string) {
  router.push(`/portal/course/${courseId}`);
}

// 从路由查询参数中获取搜索关键字
if (route.query.keyword) {
  searchKeyword.value = route.query.keyword as string;
}

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchKeyword.value = (newKeyword as string) || '';
    handleSearch();
  }
);

onMounted(() => {
  loadCourses();
});
</script>

<template>
  <div class="portal-courses">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>课程中心</h1>
        <p>精选优质课程，助力您快速成长</p>
      </div>

      <!-- 搜索框 -->
      <el-card class="search-card">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程标题、讲师..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button :icon="Search" type="primary" @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>
      </el-card>

      <!-- 标签筛选 -->
      <el-card class="filter-card">
        <!-- 年龄标签 -->
        <div class="filter-group">
          <span class="filter-label">年龄：</span>
          <el-button
            v-for="tag in ageTags"
            :key="tag"
            :type="selectedAge === tag ? 'primary' : 'default'"
            round
            size="small"
            @click="selectedAge = tag; handleFilterChange()"
          >
            {{ tag }}
          </el-button>
        </div>

        <!-- 分类标签 -->
        <div class="filter-group">
          <span class="filter-label">分类：</span>
          <el-button
            v-for="tag in categoryTags"
            :key="tag"
            :type="selectedCategory === tag ? 'primary' : 'default'"
            round
            size="small"
            @click="selectedCategory = tag; handleFilterChange()"
          >
            {{ tag }}
          </el-button>
        </div>

        <!-- 付费标签 -->
        <div class="filter-group">
          <span class="filter-label">付费：</span>
          <el-button
            v-for="tag in paymentTags"
            :key="tag"
            :type="selectedPayment === tag ? 'primary' : 'default'"
            round
            size="small"
            @click="selectedPayment = tag; handleFilterChange()"
          >
            {{ tag }}
          </el-button>
        </div>
      </el-card>

      <!-- 课程类型Tab -->
      <el-card class="tabs-card">
        <el-radio-group v-model="activeTab" @change="handleTabChange">
          <el-radio-button
            v-for="tab in tabs"
            :key="tab.key"
            :label="tab.key"
          >
            {{ tab.label }}
          </el-radio-button>
        </el-radio-group>
      </el-card>

      <!-- 全部课程 / 微课程 / 公益课程 / 付费课程 -->
      <div v-if="['all', 'micro', 'public', 'paid'].includes(activeTab)">
        <div v-loading="loading" class="courses-grid">
          <!-- 课程卡片 -->
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            @click="goToCourseDetail(course.id)"
          >
            <el-card :body-style="{ padding: '0px' }" shadow="hover">
              <div class="course-cover">
                <img :src="course.coverImage" :alt="course.title" />
                <div v-if="course.trialLessonId" class="badge badge-trial">
                  试听
                </div>
                <div v-if="course.isFree" class="badge badge-free">
                  免费
                </div>
              </div>
              <div class="course-content">
                <h3 class="course-title" :title="course.title">
                  {{ course.title }}
                </h3>
                <div class="course-meta">
                  <span>{{ course.teacher.name }}</span>
                  <span>·</span>
                  <span>{{ course.category }}</span>
                </div>
                <div class="course-tags">
                  <el-tag
                    v-for="tag in course.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="course-stats">
                  <el-rate
                    v-model="course.rating"
                    disabled
                    show-score
                    score-template="{value}"
                  />
                  <span>{{ course.studentCount }}人学习</span>
                </div>
                <div class="course-footer" @click.stop>
                  <div class="course-price">
                    <span v-if="course.isFree" class="free-price">免费</span>
                    <span v-else class="paid-price">
                      ¥{{ (course.price / 100).toFixed(0) }}
                    </span>
                  </div>
                  <el-button
                    :type="course.isFree ? 'success' : 'primary'"
                    size="small"
                    @click="goToCourseDetail(course.id)"
                  >
                    {{ course.isFree ? '开始学习' : '查看详情' }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handlePageChange"
          />
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && courses.length === 0"
          description="暂无课程数据"
          :image-size="200"
        />
      </div>

      <!-- 科研赋能 -->
      <div v-if="activeTab === 'research'" class="programs-grid">
        <div
          v-for="program in researchPrograms"
          :key="program.id"
          class="program-card"
        >
          <el-card :body-style="{ padding: '0px' }" shadow="hover">
            <div class="program-cover">
              <img :src="program.coverImage" :alt="program.title" />
              <div class="badge badge-category">🔬 {{ program.category }}</div>
            </div>
            <div class="program-content">
              <h3 class="program-title">{{ program.title }}</h3>
              <p class="program-description">{{ program.description }}</p>
              <div class="program-tags">
                <el-tag
                  v-for="tag in program.tags"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="program-info">
                <p>📋 报名要求：{{ program.requirements }}</p>
                <p>👥 已报名：{{ program.enrolledCount }}/{{ program.capacity }}</p>
                <p>📅 截止日期：{{ program.enrollmentDeadline }}</p>
              </div>
              <div class="program-actions">
                <el-button plain>在线咨询</el-button>
                <el-button type="primary">立即报名</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 集训计划 -->
      <div v-if="activeTab === 'training'">
        <div class="training-filters">
          <el-radio-group v-model="selectedAge" @change="handleFilterChange">
            <el-radio-button label="K12">K12集训计划</el-radio-button>
            <el-radio-button label="成人">成人集训计划</el-radio-button>
          </el-radio-group>
        </div>

        <div class="programs-grid">
          <div
            v-for="plan in trainingPlans"
            :key="plan.id"
            class="program-card"
          >
            <el-card :body-style="{ padding: '0px' }" shadow="hover">
              <div class="program-cover">
                <img :src="plan.coverImage" :alt="plan.title" />
                <div
                  class="badge"
                  :class="plan.type === 'K12' ? 'badge-k12' : 'badge-adult'"
                >
                  {{ plan.type === 'K12' ? 'K12' : '成人' }}
                </div>
              </div>
              <div class="program-content">
                <h3 class="program-title">{{ plan.title }}</h3>
                <p class="program-description">{{ plan.description }}</p>
                <div class="program-tags">
                  <el-tag
                    v-for="tag in plan.tags"
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="program-info">
                  <p>📍 {{ plan.location }}</p>
                  <p>📅 {{ plan.startDate }} - {{ plan.endDate }}</p>
                  <p>👥 已报名：{{ plan.enrolledCount }}/{{ plan.capacity }}</p>
                </div>
                <div class="program-footer">
                  <div class="program-price">
                    ¥{{ (plan.price / 100).toFixed(0) }}
                  </div>
                  <el-button
                    type="primary"
                    :disabled="plan.enrolledCount >= plan.capacity"
                  >
                    {{ plan.enrolledCount >= plan.capacity ? '名额已满' : '立即报名' }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.portal-courses {
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

.search-card {
  margin-bottom: $spacing-large;
}

.filter-card {
  margin-bottom: $spacing-large;

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-base;
    margin-bottom: $spacing-large;

    &:last-child {
      margin-bottom: 0;
    }

    .filter-label {
      font-size: $font-size-base;
      font-weight: 500;
      color: $text-color-primary;
      min-width: 50px;
    }
  }
}

.tabs-card {
  margin-bottom: $spacing-large;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-large;
  margin-bottom: $spacing-extra-large;
}

.course-card {
  cursor: pointer;

  .course-cover {
    position: relative;
    width: 100%;
    height: 160px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: $font-size-small;
      font-weight: 500;
      color: #fff;

      &.badge-trial {
        left: $spacing-base;
        top: $spacing-base;
        background: #67c23a;
      }

      &.badge-free {
        right: $spacing-base;
        top: $spacing-base;
        background: #67c23a;
      }
    }
  }

  .course-content {
    padding: $spacing-large;

    .course-title {
      font-size: $font-size-medium;
      font-weight: 600;
      margin-bottom: $spacing-base;
      @include text-ellipsis(2);
      min-height: 48px;
      color: $text-color-primary;
    }

    .course-meta {
      display: flex;
      align-items: center;
      gap: $spacing-small;
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-base;
    }

    .course-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-small;
      margin-bottom: $spacing-base;
    }

    .course-stats {
      display: flex;
      align-items: center;
      gap: $spacing-medium;
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-base;
    }

    .course-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .course-price {
        .free-price {
          font-size: $font-size-large;
          font-weight: 600;
          color: $--el-color-success;
        }

        .paid-price {
          font-size: $font-size-large;
          font-weight: 600;
          color: $--el-color-danger;
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: $spacing-extra-large 0;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-large;
}

.program-card {
  .program-cover {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      left: $spacing-base;
      top: $spacing-base;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: $font-size-small;
      font-weight: 500;
      color: #fff;

      &.badge-category {
        background: $--el-color-primary;
      }

      &.badge-k12 {
        background: $--el-color-primary;
      }

      &.badge-adult {
        background: #9c27b0;
      }
    }
  }

  .program-content {
    padding: $spacing-large;

    .program-title {
      font-size: $font-size-medium;
      font-weight: 600;
      margin-bottom: $spacing-base;
      @include text-ellipsis(2);
      min-height: 48px;
      color: $text-color-primary;
    }

    .program-description {
      font-size: $font-size-base;
      color: $text-color-secondary;
      margin-bottom: $spacing-base;
      @include text-ellipsis(2);
      min-height: 44px;
    }

    .program-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-small;
      margin-bottom: $spacing-base;
    }

    .program-info {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-large;

      p {
        margin-bottom: $spacing-small;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .program-actions {
      display: flex;
      gap: $spacing-base;

      button {
        flex: 1;
      }
    }

    .program-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .program-price {
        font-size: $font-size-extra-large;
        font-weight: 600;
        color: $--el-color-danger;
      }
    }
  }
}

.training-filters {
  margin-bottom: $spacing-large;
}

// 响应式
@include respond-to($breakpoint-lg) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@include respond-to($breakpoint-md) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $spacing-base;
  }

  .programs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
