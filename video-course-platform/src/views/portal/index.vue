<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { getActiveBanners } from '@/utils/banner-storage';
import {
  getActiveNews,
  getActiveActivities,
  getActiveHotTopics,
} from '@/utils/news-storage';
import { getPublishedCourses } from '@/utils/portal-course-adapter';
import type { PortalCourse } from '@/utils/portal-course-adapter';

import BannerCarousel from './components/BannerCarousel.vue';
import ConsultationForm from './components/ConsultationForm.vue';
import CourseCard from './components/CourseCard.vue';
import CourseStatsChart from './components/CourseStatsChart.vue';
import HotTopics from './components/HotTopics.vue';
import NewsSection from './components/NewsSection.vue';

// Banner数据
const banners = ref(
  getActiveBanners().map((b) => ({
    id: Number.parseInt(b.id),
    image: b.imageUrl,
    title: b.title,
    link: b.link,
  })),
);

// 精选课程数据
const featuredCourses = ref<PortalCourse[]>([]);

// 课程分类（动态获取）
const courseCategories = ref<{ label: string; value: string }[]>([
  { label: '全部', value: 'all' },
]);

const activeCategory = ref('all');

// 过滤后的课程
const filteredCourses = computed(() => {
  if (activeCategory.value === 'all') {
    return featuredCourses.value;
  }
  return featuredCourses.value.filter(
    (course) => course.category === activeCategory.value,
  );
});

// 分类切换
function handleCategoryChange(category: string) {
  activeCategory.value = category;
}

// 资讯公告
const newsList = ref(
  getActiveNews()
    .sort((a, b) => b.orderNum - a.orderNum)
    .slice(0, 3)
    .map((news) => ({
      id: news.id,
      title: news.title,
      date: news.publishTime,
      content: news.content,
      category: news.category,
    })),
);

// 活动日历
const calendarEvents = ref(
  getActiveActivities()
    .sort((a, b) => a.orderNum - b.orderNum)
    .slice(0, 3)
    .map((activity) => ({
      id: activity.id,
      title: activity.title,
      date: activity.startDate,
      time: '待定',
      location: activity.location,
    })),
);

// 热点话题
const hotTopics = ref(
  getActiveHotTopics()
    .sort((a, b) => a.orderNum - b.orderNum)
    .slice(0, 5)
    .map((hot) => ({
      id: hot.id,
      title: hot.title,
      content: hot.content,
      createdAt: hot.createdAt,
      orderNum: hot.orderNum,
    })),
);

// 课程统计数据
const courseStats = ref([
  { category: '前端开发', count: 128, totalDuration: 25_600, purchaseCount: 3580 },
  { category: '后端开发', count: 86, totalDuration: 18_900, purchaseCount: 2650 },
  { category: '移动开发', count: 64, totalDuration: 12_300, purchaseCount: 1890 },
  { category: '人工智能', count: 45, totalDuration: 9800, purchaseCount: 2340 },
  { category: '数据科学', count: 52, totalDuration: 11_500, purchaseCount: 1680 },
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
  try {
    // 从后台获取已发布的课程
    const publishedCourses = getPublishedCourses();

    // 映射为 CourseCard 组件需要的格式
    featuredCourses.value = publishedCourses.slice(0, 8).map(course => ({
      courseId: course.id,
      title: course.title,
      cover: course.coverImage,
      teacher: course.teacher.name,
      price: course.price,
      originalPrice: course.originalPrice,
      studentCount: course.studentCount,
      rating: course.rating,
      courseType: course.courseType,
      description: course.courseIntro?.substring(0, 50) + '...' || '',
    }));

    // 动态生成分类选项
    const categories = new Set(publishedCourses.map(c => c.category));
    courseCategories.value = [
      { label: '全部', value: 'all' },
      ...Array.from(categories).map(cat => ({ label: cat, value: cat }))
    ];

    console.log('加载到', featuredCourses.value.length, '门精选课程');
    console.log('课程列表:', featuredCourses.value);
  } catch (error) {
    console.error('加载课程失败:', error);
    featuredCourses.value = [];
  }
}

// 咨询提交
function handleConsultSubmit(data: unknown) {
  console.log('咨询提交:', data);
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
    <section class="featured-courses">
      <div class="container">
        <!-- 标题和副标题 -->
        <div class="section-header">
          <div class="header-left">
            <h2>精选课程</h2>
            <p>严选好课，系统学习</p>
          </div>
          <router-link to="/portal/courses" class="view-more">
            查看更多 →
          </router-link>
        </div>

        <!-- 分类导航 -->
        <div class="category-nav">
          <button
            v-for="category in courseCategories"
            :key="category.value"
            class="category-btn"
            :class="{ active: activeCategory === category.value }"
            @click="handleCategoryChange(category.value)"
          >
            {{ category.label }}
          </button>
        </div>

        <!-- 课程列表 -->
        <div v-if="filteredCourses.length > 0" class="courses-grid">
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.courseId"
            :course="course"
          />
        </div>
        <div v-else class="empty-state">
          {{ activeCategory === 'all' ? '暂无课程' : '该分类暂无课程' }}
        </div>
      </div>
    </section>

    <!-- 资讯公告/活动日历/热点聚合 -->
    <section class="info-tabs">
      <div class="container">
        <div class="tabs-wrapper">
          <!-- Tab Headers -->
          <div class="tab-headers">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Contents -->
          <div class="tab-contents">
            <div v-show="activeTab === 'news'" class="tab-content">
              <NewsSection :news-list="newsList" />
            </div>
            <div v-show="activeTab === 'calendar'" class="tab-content">
              <div class="calendar-events">
                <div
                  v-for="event in calendarEvents"
                  :key="event.id"
                  class="event-item"
                >
                  <div class="event-info">
                    <h3>{{ event.title }}</h3>
                    <p>
                      <span>{{ event.date }}</span>
                      <span>{{ event.time }}</span>
                    </p>
                  </div>
                  <!-- <el-button type="primary" size="small">报名</el-button> -->
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
    <section class="course-stats">
      <div class="container">
        <h2>课程数据统计</h2>
        <CourseStatsChart :stats="courseStats" />
      </div>
    </section>

    <!-- 在线咨询表单 -->
    <section class="consultation">
      <div class="container">
        <h2>在线咨询</h2>
        <p>有任何问题？请填写以下表单，我们会尽快回复您</p>
        <ConsultationForm @submit="handleConsultSubmit" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.portal-home {
  min-height: 100vh;
}

// 通用容器
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Banner区域
.banner-section {
  width: 100%;
}

// 精选课程区域
.featured-courses {
  background: #fff;
  padding: $spacing-extra-extra-large 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-extra-large;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: $spacing-small;
  }
}

.header-left {
  h2 {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-small;

    @media (min-width: 768px) {
      font-size: 32px;
    }
  }

  p {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

.view-more {
  color: #409eff;
  text-decoration: none;
  font-size: $font-size-base;
  font-weight: 500;

  &:hover {
    color: #66b1ff;
  }
}

.category-nav {
  display: flex;
  gap: $spacing-base;
  margin-bottom: $spacing-large;
  overflow-x: auto;
  padding-bottom: $spacing-small;
}

.category-btn {
  padding: $spacing-small $spacing-large;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: $transition-base;
  white-space: nowrap;
  background: $background-color-base;
  color: $text-color-primary;

  &:hover {
    background: darken($background-color-base, 5%);
  }

  &.active {
    background: #409eff;
    color: #fff;
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: $spacing-large;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-extra-extra-large 0;
  color: $text-color-secondary;
}

// Tab区域
.info-tabs {
  background: $background-color-base;
  padding: $spacing-extra-extra-large 0;
}

.tabs-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.tab-headers {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid $border-color-lighter;
  margin-bottom: $spacing-extra-large;
}

.tab-btn {
  padding: $spacing-base $spacing-large;
  font-size: $font-size-base;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  color: $text-color-secondary;
  border-bottom: 2px solid transparent;
  transition: $transition-base;

  &:hover {
    color: $text-color-primary;
  }

  &.active {
    color: #409eff;
    border-bottom-color: #409eff;
  }
}

.tab-contents {
  min-height: 300px;
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

.calendar-events {
  background: #fff;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-card;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-large;
  border-bottom: 1px solid $border-color-lighter;

  &:last-child {
    border-bottom: none;
  }
}

.event-info {
  h3 {
    font-size: $font-size-medium;
    font-weight: 500;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  p {
    font-size: $font-size-small;
    color: $text-color-secondary;

    span {
      margin-right: $spacing-base;
    }
  }
}

// 统计图表区域
.course-stats {
  background: #fff;
  padding: $spacing-extra-extra-large 0;

  h2 {
    text-align: center;
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-extra-large;

    @media (min-width: 768px) {
      font-size: 32px;
    }
  }
}

// 咨询表单区域
.consultation {
  background: linear-gradient(135deg, #dbeafe 0%, #f3e8ff 100%);
  padding: $spacing-extra-extra-large 0;
}

.consultation {
  h2 {
    text-align: center;
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-base;

    @media (min-width: 768px) {
      font-size: 32px;
    }
  }

  p {
    text-align: center;
    font-size: $font-size-base;
    color: $text-color-secondary;
    margin-bottom: $spacing-extra-large;
  }

  .container {
    max-width: 700px;
  }
}
</style>
