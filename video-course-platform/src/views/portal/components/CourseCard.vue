<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Course {
  courseId: string;
  title: string;
  cover: string;
  teacher: string;
  price: number;
  originalPrice?: number;
  studentCount: number;
  rating: number;
  courseType: string;
  description?: string;
}

interface Props {
  course: Course;
}

const props = defineProps<Props>();
const router = useRouter();

const formattedPrice = computed(() => {
  return props.course.price > 0 ? `¥${props.course.price}` : '免费';
});

const discount = computed(() => {
  if (props.course.originalPrice && props.course.originalPrice > props.course.price) {
    const rate = Math.round((1 - props.course.price / props.course.originalPrice) * 100);
    return rate > 0 ? `${rate}折` : '';
  }
  return '';
});

function goToDetail() {
  router.push(`/portal/course/${props.course.courseId}`);
}
</script>

<template>
  <div class="course-card" @click="goToDetail">
    <div class="course-cover">
      <img :src="course.cover" :alt="course.title" />
      <div v-if="discount" class="discount-badge">{{ discount }}</div>
    </div>
    <div class="course-info">
      <h3 class="course-title">{{ course.title }}</h3>
      <p v-if="course.description" class="course-description">
        {{ course.description }}
      </p>

      <div class="course-meta">
        <span class="teacher">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ course.teacher }}
        </span>
        <span class="students">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {{ course.studentCount }}人
        </span>
      </div>

      <div class="course-rating">
        <el-rate v-model="course.rating" disabled show-score text-color="#ff9900" />
      </div>

      <div class="course-price-row">
        <span class="current-price">{{ formattedPrice }}</span>
        <span v-if="course.originalPrice && course.originalPrice > course.price" class="original-price">
          ¥{{ course.originalPrice }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

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
  height: 160px;
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

.discount-badge {
  position: absolute;
  top: $spacing-base;
  right: $spacing-base;
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
  color: #fff;
  padding: 4px 8px;
  border-radius: $border-radius-small;
  font-size: $font-size-extra-small;
  font-weight: 600;
}

.course-info {
  padding: $spacing-large;
}

.course-title {
  font-size: $font-size-medium;
  font-weight: 500;
  margin-bottom: $spacing-small;
  color: $text-color-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 48px;
}

.course-description {
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
  justify-content: space-between;
  margin-bottom: $spacing-base;
  font-size: $font-size-small;
  color: $text-color-secondary;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.course-rating {
  margin-bottom: $spacing-base;
}

.course-price-row {
  display: flex;
  align-items: baseline;
  gap: $spacing-small;
}

.current-price {
  font-size: $font-size-large;
  color: var(--el-color-danger);
  font-weight: 600;
}

.original-price {
  font-size: $font-size-small;
  color: $text-color-placeholder;
  text-decoration: line-through;
}
</style>
