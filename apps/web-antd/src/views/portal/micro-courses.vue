<script lang="ts" setup>
import { ref } from 'vue';

// 微课程数据
interface MicroCourseItem {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	videoUrl: string;
	duration: number;
	price: number;
	tags: string[];
	ageRange: string;
	status: 'draft' | 'published' | 'offline';
}

const microCourses = ref<MicroCourseItem[]>([
	{
		id: 'm1',
		title: '3分钟学会用ChatGPT',
		description: '快速掌握ChatGPT的基本使用方法',
		coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
		videoUrl: 'https://example.com/video/m1.mp4',
		duration: 180,
		price: 990,
		tags: ['成人', '人工智能'],
		ageRange: '成人',
		status: 'published',
	},
]);

// 切换状态
function toggleStatus(id: string) {
	const course = microCourses.value.find((c) => c.id === id);
	if (course) {
		course.status = course.status === 'published' ? 'offline' : 'published';
	}
}

// 删除
function handleDelete(id: string) {
	if (confirm('确定删除此课程吗？')) {
		microCourses.value = microCourses.value.filter((c) => c.id !== id);
	}
}
</script>

<template>
  <div class="micro-courses-page min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">微课程管理</h1>
        <p class="mt-1 text-gray-600">3-10分钟的短视频课程</p>
      </div>

      <!-- 课程列表 -->
      <div class="rounded-lg bg-white shadow-sm">
        <table class="w-full">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">封面</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">标题</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">价格</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">时长</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="course in microCourses"
              :key="course.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3">
                <img
                  :src="course.coverImage"
                  alt=""
                  class="h-12 w-20 rounded object-cover"
                />
              </td>
              <td class="px-4 py-3 text-sm text-gray-800">{{ course.title }}</td>
              <td class="px-4 py-3 text-sm text-gray-800">
                <span v-if="course.price === 0">免费</span>
                <span v-else>¥{{ (course.price / 100).toFixed(0) }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ Math.floor(course.duration / 60) }}分钟
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs font-medium"
                  :class="course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                >
                  {{ course.status === 'published' ? '已上架' : '已下架' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button class="text-sm text-blue-600 hover:underline">编辑</button>
                  <button
                    class="text-sm text-gray-600 hover:underline"
                    @click="toggleStatus(course.id)"
                  >
                    {{ course.status === 'published' ? '下架' : '上架' }}
                  </button>
                  <button
                    class="text-sm text-red-600 hover:underline"
                    @click="handleDelete(course.id)"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
