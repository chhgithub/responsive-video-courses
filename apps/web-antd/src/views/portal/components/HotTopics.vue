<script lang="ts" setup>
interface Topic {
  id: number;
  title: string;
  hot: number;
}

interface Props {
  topics: Topic[];
}

defineProps<Props>();
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
            :class="[
              index < 3
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                : 'bg-gray-200 text-gray-600',
            ]"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800">{{ topic.title }}</h3>
            <div class="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span>🔥</span>
              <span>{{ topic.hot.toLocaleString() }} 热度</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
