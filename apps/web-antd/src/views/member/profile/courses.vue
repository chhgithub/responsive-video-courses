<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import type { Course } from '#/mock/course-center';
import { mockCourses } from '#/mock/course-center';
import { getUserOrders } from '#/utils/order-storage';
import { getCourseProgress } from '#/utils/learning-storage';

const router = useRouter();

// 我的课程列表
const myCourses = ref<any[]>([]);
const loading = ref(false);

// 加载我的课程
async function loadMyCourses() {
	loading.value = true;

	try {
		// 获取当前用户
		const state = localStorage.getItem('portal_login_state');
		if (!state) {
			message.warning('请先登录');
			router.push('/portal/login');
			return;
		}
		const loginState = JSON.parse(state);
		const userId = loginState.user.id;

		// 获取用户订单（已购买的课程）
		const orders = getUserOrders().filter(order => order.userId === userId && order.status === 'paid');

		if (orders.length === 0) {
			myCourses.value = [];
			loading.value = false;
			return;
		}

		// 关联课程详情数据
		const courses = orders.map(order => {
			// 从 mockCourses 中查找课程详情
			const courseDetail = mockCourses.find(c => c.id === order.courseId);

			// 获取学习进度
			const progressInfo = getCourseProgress(userId, order.courseId);

			return {
				...order,
				...courseDetail,
				progress: progressInfo.progress,
				completedLessons: progressInfo.completedLessons,
				totalLessons: progressInfo.totalLessons,
				lastStudyAt: progressInfo.lastStudyAt,
			};
		});

		myCourses.value = courses;
	} finally {
		loading.value = false;
	}
}

// 继续学习
function continueLearning(course: any) {
	// 跳转到课程学习页
	router.push(`/portal/learn/${course.id}`);
}

// 查看课程详情
function viewCourseDetail(courseId: string) {
	router.push(`/portal/course-detail/${courseId}`);
}

onMounted(() => {
	loadMyCourses();
});
</script>

<template>
  <div class="my-courses">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">我的课程</h2>
      <p class="text-sm text-gray-500">继续学习您购买的课程</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-500">加载中...</p>
    </div>

    <!-- 课程列表 -->
    <div v-else>
      <div
        v-if="myCourses.length > 0"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="course in myCourses"
          :key="course.id"
          class="course-card overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- 课程封面 -->
          <div class="relative overflow-hidden">
            <img
              :src="course.coverImage"
              :alt="course.title"
              class="aspect-video w-full object-cover"
            />
            <!-- 学习进度遮罩 -->
            <div
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3"
            >
              <div class="flex items-center gap-2 text-white">
                <div class="flex-1 overflow-hidden">
                  <div class="mb-1 flex justify-between text-xs">
                    <span>学习进度</span>
                    <span>{{ course.progress || 0 }}%</span>
                  </div>
                  <div
                    class="h-1.5 w-full overflow-hidden rounded-full bg-white/30"
                  >
                    <div
                      class="h-full bg-white transition-all duration-300"
                      :style="{ width: `${course.progress || 0}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 课程信息 -->
          <div class="p-4">
            <h3 class="mb-2 line-clamp-2 font-semibold text-gray-800">
              {{ course.title }}
            </h3>
            <p class="mb-4 line-clamp-2 text-sm text-gray-500">
              {{ course.description }}
            </p>

            <!-- 学习统计 -->
            <div class="mb-3 flex items-center justify-between text-xs text-gray-500">
              <span>{{ course.completedLessons || 0 }}/{{ course.totalLessons || 0 }} 课时</span>
              <span v-if="course.lastStudyAt !== '-'">{{ course.lastStudyAt }}</span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                @click="continueLearning(course)"
                class="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                继续学习
              </button>
              <button
                @click="viewCourseDetail(course.id)"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-16 text-center">
        <svg
          class="mx-auto h-24 w-24 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253"
          />
        </svg>
        <p class="mt-4 text-gray-500">您还没有购买任何课程</p>
        <router-link
          to="/portal/courses"
          class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          去选课
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.course-card:hover {
  box-shadow: 0 20px 40px rgb(0 0 0 / 10%);
  transform: translateY(-4px);
}
</style>
