<script lang="ts" setup>
interface News {
  id: number;
  title: string;
  date: string;
  content: string;
}

interface Props {
  newsList: News[];
}

defineProps<Props>();
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div
        v-for="news in newsList"
        :key="news.id"
        class="py-4 border-b last:border-0 hover:bg-gray-50 transition-colors -mx-6 px-6 last:rounded-b-lg"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ news.title }}</h3>
            <p class="text-gray-600 text-sm">{{ news.content }}</p>
          </div>
          <span class="text-gray-400 text-sm whitespace-nowrap ml-4">{{ news.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
