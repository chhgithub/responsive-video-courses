<script setup lang="ts">
import { computed, ref } from 'vue';

interface GeneralCourse {
  id: string;
  title: string;
  category: string;
  image: string;
  students: number;
  duration: string;
  description: string;
}

// Mock 通识课程数据
const generalCourses = ref<GeneralCourse[]>([
  {
    id: '1',
    title: '沟通技巧与职场礼仪',
    category: '职场技能',
    image: 'https://picsum.photos/seed/general1/400/250',
    students: 3500,
    duration: '8 课时',
    description: '提升职场沟通能力和职业素养',
  },
  {
    id: '2',
    title: '时间管理与效率提升',
    category: '个人成长',
    image: 'https://picsum.photos/seed/general2/400/250',
    students: 2800,
    duration: '6 课时',
    description: '学会高效管理时间，提升工作效率',
  },
  {
    id: '3',
    title: '公文写作与商务沟通',
    category: '办公技能',
    image: 'https://picsum.photos/seed/general3/400/250',
    students: 2200,
    duration: '10 课时',
    description: '掌握商务写作规范和沟通技巧',
  },
  {
    id: '4',
    title: '心理健康与压力管理',
    category: '健康生活',
    image: 'https://picsum.photos/seed/general4/400/250',
    students: 4100,
    duration: '8 课时',
    description: '学习心理健康知识，有效管理工作压力',
  },
  {
    id: '5',
    title: '创新思维与问题解决',
    category: '思维能力',
    image: 'https://picsum.photos/seed/general5/400/250',
    students: 3000,
    duration: '12 课时',
    description: '培养创新思维，提升问题解决能力',
  },
  {
    id: '6',
    title: '团队协作与领导力',
    category: '管理能力',
    image: 'https://picsum.photos/seed/general6/400/250',
    students: 2600,
    duration: '10 课时',
    description: '提升团队协作能力和领导力',
  },
  {
    id: '7',
    title: '演讲与口才训练',
    category: '职场技能',
    image: 'https://picsum.photos/seed/general7/400/250',
    students: 3200,
    duration: '8 课时',
    description: '掌握演讲技巧，提升表达能力',
  },
  {
    id: '8',
    title: '商务谈判技巧',
    category: '职场技能',
    image: 'https://picsum.photos/seed/general8/400/250',
    students: 1900,
    duration: '6 课时',
    description: '学习谈判策略，赢得商务合作',
  },
]);

// 分类列表
const categories = ref([
  '全部',
  '职场技能',
  '个人成长',
  '办公技能',
  '健康生活',
  '思维能力',
  '管理能力',
]);

const activeCategory = ref('全部');

// 过滤后的课程
const filteredCourses = computed(() => {
  if (activeCategory.value === '全部') {
    return generalCourses.value;
  }
  return generalCourses.value.filter((c) => c.category === activeCategory.value);
});

// 分类切换
function handleCategoryChange(category: string) {
  activeCategory.value = category;
}

// 跳转课程详情
function goToCourse(courseId: string) {
  // TODO: 跳转到课程详情页
  console.log('查看课程:', courseId);
}
</script>

<template>
  <div class="general-page">
    <!-- Banner -->
    <section class="banner-section">
      <div class="container">
        <h1>通识教育</h1>
        <p>拓宽知识面，提升综合素养</p>
      </div>
    </section>

    <!-- 分类筛选 -->
    <section class="category-section">
      <div class="container">
        <div class="category-nav">
          <button
            v-for="category in categories"
            :key="category"
            class="category-btn"
            :class="{ active: activeCategory === category }"
            @click="handleCategoryChange(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </section>

    <!-- 课程列表 -->
    <section class="courses-section">
      <div class="container">
        <div v-if="filteredCourses.length > 0" class="courses-grid">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-card"
            @click="goToCourse(course.id)"
          >
            <div class="course-cover">
              <img :src="course.image" :alt="course.title" />
              <div class="category-tag">{{ course.category }}</div>
            </div>
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-desc">{{ course.description }}</p>
              <div class="course-meta">
                <span class="duration">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ course.duration }}
                </span>
                <span class="students">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {{ course.students }}人
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>该分类暂无课程</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.general-page {
  min-height: 100vh;
  background: $background-color-base;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Banner区域
.banner-section {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  padding: $spacing-extra-extra-large 0;
  text-align: center;
  color: #fff;

  h1 {
    font-size: $font-size-extra-extra-large;
    font-weight: bold;
    margin-bottom: $spacing-base;

    @media (min-width: 768px) {
      font-size: 48px;
    }
  }

  p {
    font-size: $font-size-large;
    color: rgba(255, 255, 255, 0.9);
  }
}

// 分类筛选
.category-section {
  background: #fff;
  border-bottom: 1px solid $border-color-lighter;
  padding: $spacing-large 0;
}

.category-nav {
  display: flex;
  gap: $spacing-base;
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
    background: #3b82f6;
    color: #fff;
  }
}

// 课程列表
.courses-section {
  padding: $spacing-extra-extra-large 0;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-large;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.course-card {
  background: #fff;
  border-radius: $border-radius-large;
  overflow: hidden;
  box-shadow: $box-shadow-card;
  transition: $transition-base;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-base;
  }
}

.course-cover {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.category-tag {
  position: absolute;
  top: $spacing-base;
  right: $spacing-base;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 12px;
  border-radius: $border-radius-small;
  font-size: $font-size-extra-small;
  backdrop-filter: blur(4px);
}

.course-info {
  padding: $spacing-large;
}

.course-title {
  font-size: $font-size-medium;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: $spacing-small;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-desc {
  font-size: $font-size-small;
  color: $text-color-secondary;
  margin-bottom: $spacing-base;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-meta {
  display: flex;
  gap: $spacing-large;
  font-size: $font-size-small;
  color: $text-color-secondary;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-extra-extra-large 0;
  color: $text-color-secondary;

  svg {
    color: $text-color-placeholder;
    margin-bottom: $spacing-base;
  }

  p {
    font-size: $font-size-base;
  }
}
</style>
