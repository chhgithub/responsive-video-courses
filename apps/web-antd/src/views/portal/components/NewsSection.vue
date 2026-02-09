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
  <div class="mx-auto max-w-4xl">
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <div
        v-for="news in newsList"
        :key="news.id"
        class="-mx-6 border-b px-6 py-4 transition-colors last:rounded-b-lg last:border-0 hover:bg-gray-50"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="mb-2 text-lg font-semibold text-gray-800">
              {{ news.title }}
            </h3>
            <p class="text-sm text-gray-600">{{ news.content }}</p>
          </div>
          <span class="ml-4 whitespace-nowrap text-sm text-gray-400">{{
            news.date
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
