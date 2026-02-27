<script setup lang="ts">
import { ref } from 'vue';

import { getFavorites, removeFavorite, type Favorite } from '@/utils/member-storage';

// 收藏的课程列表
const favorites = ref<Favorite[]>(getFavorites());

// 格式化金额
function formatPrice(price: number): string {
  return price === 0 ? '免费' : `¥${(price / 100).toFixed(2)}`;
}

// 格式化学员数
function formatStudentCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  return count.toString();
}

// 取消收藏
function handleRemoveFavorite(courseId: string, courseTitle: string) {
  if (confirm(`确定要取消收藏《${courseTitle}》吗？`)) {
    removeFavorite(courseId);
    favorites.value = getFavorites();
    ElMessage.success('已取消收藏');
  }
}

// 立即购买
function handleBuyNow(courseId: string) {
  console.log('立即购买:', courseId);
  // TODO: 跳转到购买页面
}

// 开始学习
function handleStartLearning(courseId: string) {
  console.log('开始学习:', courseId);
  // TODO: 跳转到学习页面
}

// 查看详情
function handleViewDetail(courseId: string) {
  console.log('查看详情:', courseId);
  // TODO: 跳转到课程详情页
}
</script>

<template>
  <div class="my-favorites">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的收藏</h2>
      <p class="page-subtitle">共收藏 {{ favorites.length }} 门课程</p>
    </div>

    <!-- 收藏列表 -->
    <div v-if="favorites.length > 0" class="favorites-list">
      <div v-for="favorite in favorites" :key="favorite.id" class="favorite-card">
        <!-- 课程封面 -->
        <div class="course-cover">
          <img :src="favorite.cover" :alt="favorite.title" />
          <div v-if="favorite.originalPrice && favorite.price < favorite.originalPrice" class="discount-badge">
            折扣
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-title">{{ favorite.title }}</h3>
          <p class="course-teacher">讲师：{{ favorite.teacher }}</p>

          <!-- 课程统计 -->
          <div class="course-stats">
            <div class="stat-item">
              <el-icon><User /></el-icon>
              <span>{{ formatStudentCount(favorite.studentCount) }} 人学过</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ favorite.rating }} 分</span>
            </div>
          </div>

          <!-- 价格 -->
          <div class="course-price">
            <span class="current-price">{{ formatPrice(favorite.price) }}</span>
            <span
              v-if="favorite.originalPrice && favorite.price < favorite.originalPrice"
              class="original-price"
            >
              {{ formatPrice(favorite.originalPrice) }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <el-button
              type="primary"
              size="small"
              @click="favorite.price === 0 ? handleStartLearning(favorite.courseId) : handleBuyNow(favorite.courseId)"
            >
              {{ favorite.price === 0 ? '开始学习' : '立即购买' }}
            </el-button>
            <el-button size="small" @click="handleViewDetail(favorite.courseId)">
              查看详情
            </el-button>
            <el-button
              type="danger"
              size="small"
              plain
              @click="handleRemoveFavorite(favorite.courseId, favorite.title)"
            >
              取消收藏
            </el-button>
          </div>

          <!-- 收藏时间 -->
          <div class="favorite-time">
            <el-icon><Clock /></el-icon>
            <span>收藏于 {{ favorite.favoriteTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">⭐</div>
      <p class="empty-text">还没有收藏任何课程</p>
      <router-link to="/portal/courses" class="empty-link">
        <el-button type="primary">去选课</el-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-favorites {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-extra-large 0;
}

.page-header {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: $font-size-extra-large;
    font-weight: bold;
    color: $text-color-primary;
    margin-bottom: $spacing-small;
  }

  .page-subtitle {
    font-size: $font-size-base;
    color: $text-color-secondary;
  }
}

// 收藏列表
.favorites-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-large;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.favorite-card {
  background: #fff;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-card;
  overflow: hidden;
  transition: $transition-base;

  &:hover {
    box-shadow: $box-shadow-hover;
    transform: translateY(-4px);
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
  }

  .discount-badge {
    position: absolute;
    top: $spacing-base;
    left: $spacing-base;
    padding: $spacing-small $spacing-base;
    background: #f56c6c;
    color: #fff;
    font-size: $font-size-small;
    font-weight: 600;
    border-radius: $border-radius-small;
  }
}

.course-info {
  padding: $spacing-large;
  display: flex;
  flex-direction: column;
  gap: $spacing-small;
}

.course-title {
  font-size: $font-size-medium;
  font-weight: 600;
  color: $text-color-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-teacher {
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.course-stats {
  display: flex;
  gap: $spacing-large;
  padding: $spacing-small 0;
  border-top: 1px solid $border-color-lighter;
  border-bottom: 1px solid $border-color-lighter;

  .stat-item {
    display: flex;
    align-items: center;
    gap: $spacing-small;
    font-size: $font-size-small;
    color: $text-color-secondary;

    .el-icon {
      font-size: 16px;
    }
  }
}

.course-price {
  display: flex;
  align-items: baseline;
  gap: $spacing-small;

  .current-price {
    font-size: $font-size-large;
    font-weight: bold;
    color: #f56c6c;
  }

  .original-price {
    font-size: $font-size-small;
    color: $text-color-placeholder;
    text-decoration: line-through;
  }
}

.course-actions {
  display: flex;
  gap: $spacing-small;
  flex-wrap: wrap;
}

.favorite-time {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  font-size: $font-size-small;
  color: $text-color-placeholder;
  padding-top: $spacing-small;
  border-top: 1px solid $border-color-lighter;

  .el-icon {
    font-size: 14px;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: $spacing-extra-extra-large 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: $spacing-large;
  opacity: 0.5;
}

.empty-text {
  font-size: $font-size-medium;
  color: $text-color-secondary;
  margin-bottom: $spacing-large;
}

.empty-link {
  text-decoration: none;
}
</style>
