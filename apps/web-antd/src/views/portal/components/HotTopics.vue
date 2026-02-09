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
  <div class="max-w-4xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
              index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-200 text-gray-600',
            ]"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800">{{ topic.title }}</h3>
            <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span>🔥</span>
              <span>{{ topic.hot.toLocaleString() }} 热度</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
