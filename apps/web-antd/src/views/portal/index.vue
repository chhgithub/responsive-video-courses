<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import type { Course } from '#/api/course/model';

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
    link: '/portal/public',
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

// 资讯公告
const newsList = ref([
  { id: 1, title: '平台升级通知', date: '2025-01-20', content: '系统将于1月25日进行升级维护' },
  { id: 2, title: '新课上线预告', date: '2025-01-18', content: '多门精品课程即将上线' },
  { id: 3, title: '会员权益说明', date: '2025-01-15', content: 'VIP会员可享全部课程' },
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
  { category: '前端开发', count: 128, totalDuration: 25600 },
  { category: '后端开发', count: 86, totalDuration: 18900 },
  { category: '移动开发', count: 64, totalDuration: 12300 },
  { category: '人工智能', count: 45, totalDuration: 9800 },
  { category: '数据科学', count: 52, totalDuration: 11500 },
]);

// 当前激活的tab
const activeTab = ref('news');

// 加载精选课程
async function loadFeaturedCourses() {
  const data = await courseList({ pageSize: 8 });
  featuredCourses.value = data.rows.slice(0, 8);
}

// 咨询提交
function handleConsultSubmit(data: any) {
  console.log('咨询提交:', data);
  alert('咨询已提交，我们会尽快回复您！');
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
    <section class="featured-courses py-12 px-4 bg-white">
      <div class="container mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800">精选课程</h2>
          <router-link to="/portal/courses" class="text-blue-600 hover:text-blue-700">
            查看更多 →
          </router-link>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CourseCard
            v-for="course in featuredCourses"
            :key="course.courseId"
            :course="course"
          />
        </div>
      </div>
    </section>

    <!-- 资讯公告/活动日历/热点聚合 -->
    <section class="info-tabs py-12 px-4 bg-gray-50">
      <div class="container mx-auto">
        <a-tabs v-model:activeKey="activeTab" centered size="large">
          <a-tab-pane key="news" tab="资讯公告">
            <NewsSection :news-list="newsList" />
          </a-tab-pane>
          <a-tab-pane key="calendar" tab="活动日历">
            <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
              <div
                v-for="event in calendarEvents"
                :key="event.id"
                class="flex items-center justify-between py-4 border-b last:border-0"
              >
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">{{ event.title }}</h3>
                  <p class="text-gray-500 mt-1">
                    <span class="mr-4">{{ event.date }}</span>
                    <span>{{ event.time }}</span>
                  </p>
                </div>
                <a-button type="primary" size="small">报名</a-button>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="hot" tab="热点聚合">
            <HotTopics :topics="hotTopics" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </section>

    <!-- 课程统计气泡图 -->
    <section class="course-stats py-12 px-4 bg-white">
      <div class="container mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">课程数据统计</h2>
        <CourseStatsChart :stats="courseStats" />
      </div>
    </section>

    <!-- 在线咨询表单 -->
    <section class="consultation py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div class="container mx-auto max-w-2xl">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">在线咨询</h2>
        <p class="text-gray-600 text-center mb-8">有任何问题？请填写以下表单，我们会尽快回复您</p>
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
</style>
