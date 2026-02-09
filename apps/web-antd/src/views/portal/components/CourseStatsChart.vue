<script lang="ts" setup>
import { computed } from 'vue';

interface CourseStat {
  category: string;
  count: number;
  totalDuration: number;
}

interface Props {
  stats: CourseStat[];
}

const props = defineProps<Props>();

// 格式化时长
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 10_000) {
    return `${(hours / 10_000).toFixed(1)}万小时`;
  }
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}千小时`;
  }
  return `${hours}小时`;
}

// 计算气泡大小（基于课程数量）
function getBubbleSize(count: number): number {
  const minSize = 60;
  const maxSize = 120;
  const maxCount = Math.max(...props.stats.map((s) => s.count));
  const minCount = Math.min(...props.stats.map((s) => s.count));
  if (maxCount === minCount) return maxSize;
  return (
    minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize)
  );
}

// 生成随机位置（模拟气泡图效果）
function getPosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI;
  const radius = 40 + Math.random() * 20;
  return {
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius,
  };
}

const bubbles = computed(() => {
  return props.stats.map((stat, index) => ({
    ...stat,
    size: getBubbleSize(stat.count),
    position: getPosition(index, props.stats.length),
  }));
});
</script>

<template>
  <div
    class="course-stats-chart relative h-[400px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-8"
  >
    <!-- 中心标题 -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="text-5xl font-bold text-blue-600">
          {{ stats.reduce((sum, s) => sum + s.count, 0) }}
        </div>
        <div class="mt-2 text-gray-600">课程总数</div>
      </div>
    </div>

    <!-- 气泡 -->
    <div
      v-for="(bubble, index) in bubbles"
      :key="index"
      class="bubble-item absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer transition-transform hover:scale-110"
      :style="{
        left: `${bubble.position.left}%`,
        top: `${bubble.position.top}%`,
        width: `${bubble.size}px`,
        height: `${bubble.size}px`,
      }"
    >
      <div
        class="flex h-full w-full flex-col items-center justify-center rounded-full text-white shadow-lg"
        :style="{
          background: `linear-gradient(135deg, hsl(${index * 60}, 70%, 50%), hsl(${index * 60 + 40}, 70%, 60%))`,
        }"
      >
        <div class="text-lg font-bold">{{ bubble.count }}</div>
        <div class="text-xs opacity-90">{{ bubble.category }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bubble-item {
  animation: float 3s ease-in-out infinite;
}

.bubble-item:nth-child(2n) {
  animation-delay: 0.5s;
}

.bubble-item:nth-child(3n) {
  animation-delay: 1s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}
</style>
