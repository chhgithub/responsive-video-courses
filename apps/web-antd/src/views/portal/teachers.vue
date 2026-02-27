<script lang="ts" setup>
import { computed } from 'vue';

// Mock 数据
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

// 师资申请表单
const applicationForm = ref({
  name: '',
  phone: '',
  email: '',
  specialty: '',
  experience: '',
  introduction: '',
});

// 师资咨询表单
const consultationForm = ref({
  name: '',
  phone: '',
  email: '',
  question: '',
});

function handleApply() {
  alert('申请已提交，我们会尽快联系您！');
  applicationForm.value = {
    name: '',
    phone: '',
    email: '',
    specialty: '',
    experience: '',
    introduction: '',
  };
}

function handleConsult() {
  alert('咨询已提交，我们会尽快回复您！');
  consultationForm.value = {
    name: '',
    phone: '',
    email: '',
    question: '',
  };
}
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

    <!-- 内容区域 -->
    <section class="content-section px-4 py-12">
      <div class="container mx-auto">
        <a-tabs centered size="large">
          <!-- 师资展示 -->
          <a-tab-pane key="showcase" tab="师资展示">
            <div class="faculty-content">
              <!-- 介绍内容 -->
              <div class="mx-auto mb-12 max-w-4xl text-center">
                <h2 class="mb-4 text-2xl font-bold text-gray-800">金牌讲师</h2>
                <p class="text-gray-600">
                  汇聚行业顶尖专家，为您提供专业指导
                </p>
              </div>

              <!-- 教师列表 -->
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
          </a-tab-pane>

          <!-- 师资申请 -->
          <a-tab-pane key="application" tab="师资申请">
            <div class="faculty-content">
              <!-- 介绍内容 -->
              <div class="mx-auto mb-8 max-w-3xl text-center">
                <h3 class="mb-4 text-2xl font-bold text-gray-900">
                  成为讲师
                </h3>
                <p class="text-gray-600">
                  如果您是行业专家，欢迎加入我们的讲师团队
                </p>
              </div>

              <!-- 申请表单 -->
              <div class="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
                <h3 class="mb-6 text-2xl font-bold text-gray-900">
                  申请成为讲师
                </h3>
                <form @submit.prevent="handleApply" class="space-y-6">
                  <div class="grid gap-6 md:grid-cols-2">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">
                        姓名 <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="applicationForm.name"
                        type="text"
                        required
                        placeholder="请输入您的姓名"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">
                        联系电话 <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="applicationForm.phone"
                        type="tel"
                        required
                        placeholder="请输入您的联系电话"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      电子邮箱 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="applicationForm.email"
                      type="email"
                      required
                      placeholder="请输入您的邮箱"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      专业领域 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="applicationForm.specialty"
                      type="text"
                      required
                      placeholder="请输入您的专业领域"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      工作经验
                    </label>
                    <textarea
                      v-model="applicationForm.experience"
                      :rows="3"
                      placeholder="请简述您的工作经验"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    ></textarea>
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      个人介绍
                    </label>
                    <textarea
                      v-model="applicationForm.introduction"
                      :rows="5"
                      placeholder="请介绍一下您的专业背景和教学经验"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    提交申请
                  </button>
                </form>
              </div>
            </div>
          </a-tab-pane>

          <!-- 师资咨询 -->
          <a-tab-pane key="consultation" tab="师资咨询">
            <div class="faculty-content">
              <!-- 介绍内容 -->
              <div class="mx-auto mb-12 max-w-4xl text-center">
                <h3 class="mb-4 text-2xl font-bold text-gray-900">
                  师资咨询
                </h3>
                <p class="text-gray-600">
                  如果您有任何关于师资的问题，欢迎咨询
                </p>
              </div>

              <!-- 咨询表单 -->
              <div class="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
                <h3 class="mb-6 text-2xl font-bold text-gray-900">
                  师资咨询
                </h3>
                <form @submit.prevent="handleConsult" class="space-y-6">
                  <div class="grid gap-6 md:grid-cols-2">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">
                        姓名 <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="consultationForm.name"
                        type="text"
                        required
                        placeholder="请输入您的姓名"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-gray-700">
                        联系电话 <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="consultationForm.phone"
                        type="tel"
                        required
                        placeholder="请输入您的联系电话"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      电子邮箱 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="consultationForm.email"
                      type="email"
                      required
                      placeholder="请输入您的邮箱"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      咨询问题 <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      v-model="consultationForm.question"
                      required
                      :rows="5"
                      placeholder="请描述您的咨询问题"
                      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    提交咨询
                  </button>
                </form>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
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

.faculty-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
