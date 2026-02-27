<script setup lang="ts">
interface HotTopic {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  orderNum: number;
}

interface Props {
  topics: HotTopic[];
}

defineProps<Props>();

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return dateStr;
}
</script>

<template>
  <div class="hot-topics">
    <div v-if="topics.length > 0" class="topics-list">
      <div v-for="(topic, index) in topics" :key="topic.id" class="topic-item">
        <div class="topic-header">
          <span class="topic-rank" :class="`rank-${Math.min(index + 1, 3)}`">
            {{ index + 1 }}
          </span>
          <span class="topic-date">{{ formatDate(topic.createdAt) }}</span>
        </div>
        <h3 class="topic-title">{{ topic.title }}</h3>
        <p class="topic-content">{{ topic.content }}</p>
      </div>
    </div>
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <p>暂无热点话题</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.hot-topics {
  width: 100%;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-large;
}

.topic-item {
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

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-base;
}

.topic-rank {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f0f0;
  color: #666;
  border-radius: $border-radius-small;
  font-size: $font-size-extra-small;
  font-weight: 600;

  &.rank-1 {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.rank-2 {
    background: #f0f0f0;
    color: #8c8c8c;
  }

  &.rank-3 {
    background: #fff0e6;
    color: #fa541c;
  }
}

.topic-date {
  font-size: $font-size-small;
  color: $text-color-secondary;
}

.topic-title {
  font-size: $font-size-medium;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: $spacing-small;
}

.topic-content {
  font-size: $font-size-base;
  color: $text-color-regular;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
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
    margin: 0;
  }
}
</style>
