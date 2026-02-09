<script lang="ts" setup>
import { ref } from 'vue';

// 模拟师资数据
const teachers = ref([
  {
    id: 1,
    name: '张老师',
    title: '高级前端架构师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
    specialty: 'Web 前端开发',
    courses: 12,
    students: 2500,
    rating: 4.9,
    bio: '10年前端开发经验，曾任职于多家知名互联网公司',
  },
  {
    id: 2,
    name: '李老师',
    title: '数据科学家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2',
    specialty: 'Python 数据分析',
    courses: 8,
    students: 1800,
    rating: 4.8,
    bio: '统计学博士，专注于数据科学领域研究',
  },
  {
    id: 3,
    name: '王老师',
    title: 'UI/UX 设计专家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3',
    specialty: '界面设计',
    courses: 15,
    students: 3200,
    rating: 4.9,
    bio: '设计行业资深专家，作品曾获多项国际设计大奖',
  },
  {
    id: 4,
    name: '赵老师',
    title: '全栈工程师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher4',
    specialty: '全栈开发',
    courses: 20,
    students: 4500,
    rating: 4.7,
    bio: '全栈开发工程师，精通前后端技术',
  },
]);
</script>

<template>
  <div class="teachers-page">
    <!-- Banner -->
    <section
      class="banner-section bg-gradient-to-r from-blue-500 to-purple-600 py-16"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">师资队伍</h1>
        <p class="text-xl text-gray-100">专业讲师团队，保障教学质量</p>
      </div>
    </section>

    <!-- 教师列表 -->
    <section class="teachers-section py-12">
      <div class="container mx-auto px-4">
        <div class="mb-8">
          <h2 class="mb-4 text-2xl font-bold text-gray-800">金牌讲师</h2>
          <p class="text-gray-600">汇聚行业顶尖专家，为您提供专业指导</p>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="teacher in teachers"
            :key="teacher.id"
            class="teacher-card overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
          >
            <div class="p-6 text-center">
              <img
                :src="teacher.avatar"
                :alt="teacher.name"
                class="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
              />
              <h3 class="mb-1 text-lg font-bold text-gray-800">
                {{ teacher.name }}
              </h3>
              <p class="mb-4 text-sm text-blue-600">{{ teacher.title }}</p>
              <div class="mb-4 text-sm text-gray-600">
                <p class="mb-2">
                  <strong>专长：</strong>{{ teacher.specialty }}
                </p>
                <p class="line-clamp-2">{{ teacher.bio }}</p>
              </div>
              <div class="mb-4 flex justify-center text-sm text-gray-500">
                <div class="mx-4">
                  <div class="font-bold text-blue-600">
                    {{ teacher.courses }}
                  </div>
                  <div>课程</div>
                </div>
                <div class="mx-4">
                  <div class="font-bold text-blue-600">
                    {{ teacher.students }}
                  </div>
                  <div>学员</div>
                </div>
              </div>
              <div class="mb-4 flex items-center justify-center">
                <span class="text-yellow-500">★</span>
                <span class="ml-1 text-gray-700">{{ teacher.rating }}</span>
              </div>
              <button
                class="w-full rounded bg-blue-500 py-2 text-sm text-white transition-colors hover:bg-blue-600"
              >
                查看课程
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 加入我们 -->
    <section class="join-section bg-gray-50 py-12">
      <div class="container mx-auto px-4 text-center">
        <h2 class="mb-4 text-2xl font-bold text-gray-800">成为讲师</h2>
        <p class="mb-8 text-gray-600">
          如果您是行业专家，欢迎加入我们的讲师团队
        </p>
        <button
          class="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
        >
          申请成为讲师
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.teachers-page {
  min-height: calc(100vh - 64px - 300px);
}

.teacher-card {
  transition: transform 0.2s;
}

.teacher-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
