<script lang="ts" setup>
import type { Course } from '#/api/course/model';

import { computed, onMounted, ref } from 'vue';

import { courseList } from '#/api/course';

import BannerCarousel from './components/BannerCarousel.vue';
import ConsultationForm from './components/ConsultationForm.vue';
import CourseCard from './components/CourseCard.vue';
import CourseStatsChart from './components/CourseStatsChart.vue';
import HotTopics from './components/HotTopics.vue';
import NewsSection from './components/NewsSection.vue';

// Banner数据
const banners = ref([
  {
    id: 1,
    image: 'https://picsum.photos/seed/banner1/1200/400',
    title: '春季新课首发',
    link: '/portal/courses',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/banner2/1200/400',
    title: '限时优惠活动',
    link: '/portal/courses',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/banner3/1200/400',
    title: '名师精品课程',
    link: '/portal/courses',
  },
]);

// 精选课程
const featuredCourses = ref<Course[]>([]);

// 课程分类（简化版）
const courseCategories = [
  { label: '全部', value: 'all' },
  { label: '微课程', value: 'micro' },
  { label: '付费课程', value: 'paid' },
  { label: '科研赋能', value: 'research' },
  { label: 'K12集训', value: 'k12' },
];

const activeCategory = ref('all');

// 过滤后的课程
const filteredCourses = computed(() => {
  if (activeCategory.value === 'all') {
    return featuredCourses.value;
  }
  return featuredCourses.value.filter(
    (course) => course.courseType === activeCategory.value,
  );
});

// 分类切换
function handleCategoryChange(category: string) {
  activeCategory.value = category;
}

// 资讯公告
const newsList = ref([
  {
    id: 1,
    title: '平台升级通知',
    date: '2025-01-20',
    content: '系统将于1月25日进行升级维护',
  },
  {
    id: 2,
    title: '新课上线预告',
    date: '2025-01-18',
    content: '多门精品课程即将上线',
  },
  {
    id: 3,
    title: '会员权益说明',
    date: '2025-01-15',
    content: 'VIP会员可享全部课程',
  },
]);

// 活动日历
const calendarEvents = ref([
  { id: 1, title: '直播讲座：Vue3实战', date: '2025-02-15', time: '19:00' },
  { id: 2, title: 'Python数据分析工作坊', date: '2025-02-20', time: '14:00' },
  { id: 3, title: 'React技术分享会', date: '2025-02-25', time: '15:30' },
]);

// 热点话题
const hotTopics = ref([
  { id: 1, title: 'AI编程助手使用指南', hot: 9999 },
  { id: 2, title: 'Vue3 Composition API最佳实践', hot: 8526 },
  { id: 3, title: 'TypeScript进阶技巧', hot: 7234 },
  { id: 4, title: '前端性能优化策略', hot: 6891 },
  { id: 5, title: 'React Hooks深度解析', hot: 5678 },
]);

// 课程统计数据
const courseStats = ref([
  { category: '前端开发', count: 128, totalDuration: 25_600 },
  { category: '后端开发', count: 86, totalDuration: 18_900 },
  { category: '移动开发', count: 64, totalDuration: 12_300 },
  { category: '人工智能', count: 45, totalDuration: 9800 },
  { category: '数据科学', count: 52, totalDuration: 11_500 },
]);

// 当前激活的tab
const activeTab = ref('news');

// Tab选项
const tabs = [
  { key: 'news', label: '资讯公告' },
  { key: 'calendar', label: '活动日历' },
  { key: 'hot', label: '热点聚合' },
];

// 加载精选课程
async function loadFeaturedCourses() {
  const data = await courseList({ pageSize: 8 });
  featuredCourses.value = data.rows.slice(0, 8);
}

// 咨询提交
function handleConsultSubmit(data: unknown) {
  console.log('咨询提交:', data);
  console.log('咨询已提交，我们会尽快回复您！');
}

onMounted(() => {
  loadFeaturedCourses();
});
</script>

<template>
  <div class="portal-home">
    <!-- Banner轮播图区域 -->
    <section class="banner-section">
      <BannerCarousel :banners="banners" />
    </section>

    <!-- 精选课程区域 -->
    <section class="featured-courses bg-white px-4 py-12">
      <div class="container mx-auto">
        <!-- 标题和副标题 -->
        <div
          class="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-start"
        >
          <div>
            <h2 class="text-2xl font-bold text-gray-800 md:text-3xl">
              精选课程
            </h2>
            <p class="mt-2 text-sm text-gray-600 md:text-base">
              严选好课，系统学习
            </p>
          </div>
          <router-link
            to="/portal/courses"
            class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 sm:mt-3"
          >
            查看更多 →
          </router-link>
        </div>

        <!-- 分类导航 -->
        <div class="mb-8 overflow-x-auto pb-2">
          <div class="flex gap-2">
            <button
              v-for="category in courseCategories"
              :key="category.value"
              class="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              :class="
                activeCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="handleCategoryChange(category.value)"
            >
              {{ category.label }}
            </button>
          </div>
        </div>

        <!-- 课程列表 -->
        <div
          v-if="filteredCourses.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.courseId"
            :course="course"
          />
        </div>
        <div v-else class="py-12 text-center text-gray-500">
          {{ activeCategory === 'all' ? '暂无课程' : '该分类暂无课程' }}
        </div>
      </div>
    </section>

    <!-- 资讯公告/活动日历/热点聚合 -->
    <section class="info-tabs bg-gray-50 px-4 py-12">
      <div class="container mx-auto">
        <!-- 自定义Tab组件 -->
        <div class="mx-auto max-w-4xl">
          <!-- Tab Headers -->
          <div class="mb-6 flex justify-center border-b border-gray-200">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="border-b-2 px-6 py-3 text-sm font-medium transition-colors"
              :class="
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Contents -->
          <div class="min-h-[300px]">
            <div v-show="activeTab === 'news'" class="tab-content">
              <NewsSection :news-list="newsList" />
            </div>
            <div v-show="activeTab === 'calendar'" class="tab-content">
              <div class="mx-auto rounded-lg bg-white p-6 shadow-sm">
                <div
                  v-for="event in calendarEvents"
                  :key="event.id"
                  class="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
                >
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">
                      {{ event.title }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      <span class="mr-4">{{ event.date }}</span>
                      <span>{{ event.time }}</span>
                    </p>
                  </div>
                  <button
                    class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    报名
                  </button>
                </div>
              </div>
            </div>
            <div v-show="activeTab === 'hot'" class="tab-content">
              <HotTopics :topics="hotTopics" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程统计气泡图 -->
    <section class="course-stats bg-white px-4 py-12">
      <div class="container mx-auto">
        <h2
          class="mb-8 text-center text-2xl font-bold text-gray-800 md:text-3xl"
        >
          课程数据统计
        </h2>
        <CourseStatsChart :stats="courseStats" />
      </div>
    </section>

    <!-- 在线咨询表单 -->
    <section
      class="consultation bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12"
    >
      <div class="container mx-auto max-w-2xl">
        <h2
          class="mb-4 text-center text-2xl font-bold text-gray-800 md:text-3xl"
        >
          在线咨询
        </h2>
        <p class="mb-8 text-center text-gray-600">
          有任何问题？请填写以下表单，我们会尽快回复您
        </p>
        <ConsultationForm @submit="handleConsultSubmit" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.portal-home {
  min-height: 100vh;
}

.banner-section {
  width: 100%;
}

.banner-section :deep(.carousel) {
  width: 100%;
}

.banner-section :deep(.carousel img) {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

@media (min-width: 640px) {
  .banner-section :deep(.carousel img) {
    height: 250px;
  }
}

@media (min-width: 768px) {
  .banner-section :deep(.carousel img) {
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .banner-section :deep(.carousel img) {
    height: 400px;
  }
}

.tab-content {
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
