<script lang="ts" setup>
import { ref } from 'vue';

const courses = ref([
  {
    id: 1,
    title: '科研方法与实践',
    instructor: '王教授',
    description: '系统讲解科学研究的基本方法和实践技巧',
    cover: 'https://picsum.photos/seed/research1/400/250',
    tags: ['科研方法', '学术写作'],
  },
  {
    id: 2,
    title: '论文写作与发表',
    instructor: '李教授',
    description: '从选题到发表的全程指导',
    cover: 'https://picsum.photos/seed/research2/400/250',
    tags: ['论文写作', '期刊发表'],
  },
]);

function handleEnroll(course: any) {
  alert(`已报名：${course.title}`);
}
</script>

<template>
  <div class="page-container min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">科研赋能</h1>
        <p class="mt-2 text-gray-600">提升科研能力，助力学术发展</p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="course in courses"
          :key="course.id"
          class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <img :src="course.cover" class="h-48 w-full object-cover" />
          <div class="p-6">
            <h3 class="mb-2 text-xl font-bold text-gray-800">
              {{ course.title }}
            </h3>
            <p class="mb-4 text-gray-600">{{ course.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500"
                >讲师：{{ course.instructor }}</span
              >
              <a-button
                type="primary"
                size="small"
                @click="handleEnroll(course)"
              >
                立即报名
              </a-button>
            </div>
            <div class="mt-4 flex gap-2">
              <a-tag v-for="tag in course.tags" :key="tag" color="blue">
                {{ tag }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 咨询表单 -->
      <div class="mx-auto mt-12 max-w-2xl rounded-lg bg-white p-8 shadow-sm">
        <h2 class="mb-4 text-center text-2xl font-bold text-gray-800">
          课程咨询
        </h2>
        <a-form layout="vertical">
          <a-form-item label="您的姓名">
            <a-input placeholder="请输入姓名" />
          </a-form-item>
          <a-form-item label="联系电话">
            <a-input placeholder="请输入手机号" />
          </a-form-item>
          <a-form-item label="咨询内容">
            <a-textarea placeholder="请描述您的问题" :rows="4" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" block size="large">
              提交咨询
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>
