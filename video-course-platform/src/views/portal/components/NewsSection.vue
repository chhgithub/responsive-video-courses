<script setup lang="ts">
interface News {
  id: string;
  title: string;
  date: string;
  content: string;
  category: string;
}

interface Props {
  newsList: News[];
}

defineProps<Props>();
</script>

<template>
  <div class="news-section">
    <div v-if="newsList.length > 0" class="news-list">
      <div v-for="news in newsList" :key="news.id" class="news-item">
        <div class="news-header">
          <span class="news-category">{{ news.category }}</span>
          <span class="news-date">{{ news.date }}</span>
        </div>
        <h3 class="news-title">{{ news.title }}</h3>
        <p class="news-content">{{ news.content }}</p>
      </div>
    </div>
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <p>暂无资讯</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.news-section {
  width: 100%;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}

.news-item {
  background: #fff;
  border-radius: $border-radius-base;
  padding: $spacing-large;
  border: 1px solid $border-color-lighter;
  transition: $transition-base;

  &:hover {
    box-shadow: $box-shadow-card;
    border-color: $border-color-light;
  }
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-base;
}

.news-category {
  display: inline-block;
  padding: 4px 12px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: $border-radius-small;
  font-size: $font-size-extra-small;
  font-weight: 500;
}

.news-date {
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.news-title {
  font-size: $font-size-medium;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: $spacing-small;
}

.news-content {
  font-size: $font-size-base;
  color: $text-color-regular;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
