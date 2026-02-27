<script setup lang="ts">
interface HotTopic {
  id: string;
  title: string;
  hot: number;
  link: string;
  coverImage?: string;
}

interface Props {
  topics: HotTopic[];
}

defineProps<Props>();
</script>

<template>
  <div class="hot-topics">
    <div v-if="topics.length > 0" class="topics-grid">
      <a
        v-for="(topic, index) in topics"
        :key="topic.id"
        :href="topic.link"
        class="topic-card"
        :class="`rank-${index + 1}`"
      >
        <div class="topic-rank">{{ index + 1 }}</div>
        <div class="topic-content">
          <h4 class="topic-title">{{ topic.title }}</h4>
          <div class="topic-hot">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            {{ topic.hot }}°C
          </div>
        </div>
      </a>
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

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-base;
}

.topic-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding: $spacing-base;
  background: #fff;
  border-radius: $border-radius-base;
  border: 2px solid transparent;
  text-decoration: none;
  transition: $transition-base;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $box-shadow-card;
  }

  &.rank-1 {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fff9e6, #fff);
  }

  &.rank-2 {
    border-color: #c0c0c0;
    background: linear-gradient(135deg, #f8f8f8, #fff);
  }

  &.rank-3 {
    border-color: #cd7f32;
    background: linear-gradient(135deg, #fff4e6, #fff);
  }
}

.topic-rank {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-large;
  font-weight: bold;
  color: $text-color-secondary;
  background: $background-color-base;
  border-radius: 50%;

  .topic-card.rank-1 & {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #fff;
  }

  .topic-card.rank-2 & {
    background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
    color: #fff;
  }

  .topic-card.rank-3 & {
    background: linear-gradient(135deg, #cd7f32, #e6a36e);
    color: #fff;
  }
}

.topic-content {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-hot {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-small;
  color: #f56c6c;

  svg {
    flex-shrink: 0;
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
