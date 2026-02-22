<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getOverallStatistics, type OverallStatistics } from '#/utils/teacher-statistics-storage';
import { getTeacherCourses } from '#/utils/teacher-course-storage';
import { getCourseStudents } from '#/utils/student-data-storage';

defineOptions({ name: 'TeacherDashboard' });

const router = useRouter();

// 统计数据
const statistics = ref<OverallStatistics>({
	totalCourses: 0,
	publishedCourses: 0,
	totalStudents: 0,
	todayNewStudents: 0,
	totalViews: 0,
	todayViews: 0,
	avgCompletionRate: 0,
	topCourses: [],
});

const loading = ref(true);

// 最新课程
const recentCourses = ref<any[]>([]);

// 最新学员动态
const recentStudents = ref<any[]>([]);

// 当前讲师ID
const teacherId = ref('');

// 加载数据
function loadData() {
	loading.value = true;

	// 获取当前用户
	const state = localStorage.getItem('portal_login_state');
	if (!state) {
		loading.value = false;
		return;
	}
	const loginState = JSON.parse(state);
	teacherId.value = loginState.user.id;

	// 加载统计数据
	const stats = getOverallStatistics(teacherId.value);
	statistics.value = stats;

	// 加载最新课程（最多5个）
	const courses = getTeacherCourses();
	recentCourses.value = courses
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
		.slice(0, 5);

	// 加载最新学员动态（从第一个课程获取）
	if (courses.length > 0) {
		const students = getCourseStudents(courses[0].id);
		recentStudents.value = students.slice(0, 5);
	}

	loading.value = false;
}

// 快捷操作
function goToCreateCourse() {
	router.push('/portal/teacher/courses/create');
}

function goToCourses() {
	router.push('/portal/teacher/courses');
}

function goToStudents() {
	router.push('/portal/teacher/students');
}

function goToStatistics() {
	router.push('/portal/teacher/statistics');
}

// 跳转到课程编辑
function editCourse(courseId: string) {
	router.push(`/portal/teacher/courses/edit/${courseId}`);
}

onMounted(() => {
	loadData();
});
</script>

<template>
	<div class="teacher-dashboard min-h-screen bg-gray-50 p-6">
		<div class="container mx-auto">
			<!-- 页面标题 -->
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-800">讲师中心</h1>
					<p class="text-sm text-gray-500">欢迎回来，开始管理您的课程</p>
				</div>
				<button
					class="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700"
					@click="goToCreateCourse"
				>
					+ 创建课程
				</button>
			</div>

			<div v-if="loading" class="py-16 text-center">
				<div
					class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
				></div>
			</div>

			<div v-else class="space-y-6">
				<!-- 数据概览卡片 -->
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-500">总课程数</p>
								<p class="mt-2 text-3xl font-bold text-gray-800">
									{{ statistics.totalCourses }}
								</p>
								<p class="mt-1 text-xs text-gray-500">
									已发布 {{ statistics.publishedCourses }} 门
								</p>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
								<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
								</svg>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-500">总学员数</p>
								<p class="mt-2 text-3xl font-bold text-gray-800">
									{{ statistics.totalStudents }}
								</p>
								<p class="mt-1 text-xs text-green-600">
									+{{ statistics.todayNewStudents }} 今日新增
								</p>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
								<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-500">总浏览量</p>
								<p class="mt-2 text-3xl font-bold text-gray-800">
									{{ statistics.totalViews }}
								</p>
								<p class="mt-1 text-xs text-blue-600">
									{{ statistics.todayViews }} 今日浏览
								</p>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
								<svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-500">平均完课率</p>
								<p class="mt-2 text-3xl font-bold text-gray-800">
									{{ statistics.avgCompletionRate }}%
								</p>
								<p class="mt-1 text-xs text-gray-500">
									学员学习效果
								</p>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
								<svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				<!-- 快捷入口 -->
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<button
						class="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
						@click="goToCourses"
					>
						<div class="flex items-center gap-4">
							<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
								<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold text-gray-800">课程管理</p>
								<p class="text-sm text-gray-500">管理我的课程</p>
							</div>
						</div>
					</button>

					<button
						class="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
						@click="goToStudents"
					>
						<div class="flex items-center gap-4">
							<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
								<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold text-gray-800">学员管理</p>
								<p class="text-sm text-gray-500">查看学员进度</p>
							</div>
						</div>
					</button>

					<button
						class="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
						@click="goToStatistics"
					>
						<div class="flex items-center gap-4">
							<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
								<svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<div class="text-left">
								<p class="font-semibold text-gray-800">数据统计</p>
								<p class="text-sm text-gray-500">查看详细数据</p>
							</div>
						</div>
					</button>
				</div>

				<!-- 最新课程和学员动态 -->
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<!-- 最新课程 -->
					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-lg font-semibold text-gray-800">最新课程</h2>
							<button
								class="text-sm text-blue-600 hover:underline"
								@click="goToCourses"
							>
								查看全部
							</button>
						</div>

						<div v-if="recentCourses.length === 0" class="py-8 text-center text-gray-500">
							暂无课程，快去创建吧
						</div>

						<div v-else class="space-y-4">
							<div
								v-for="course in recentCourses"
								:key="course.id"
								class="flex cursor-pointer items-center gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
								@click="editCourse(course.id)"
							>
								<img
									:src="course.coverImage"
									:alt="course.title"
									class="h-16 w-24 rounded-lg object-cover"
								/>
								<div class="flex-1">
									<h3 class="font-medium text-gray-800 line-clamp-1">
										{{ course.title }}
									</h3>
									<div class="mt-1 flex items-center gap-4 text-xs text-gray-500">
										<span>{{ course.studentCount || 0 }} 学员</span>
										<span>{{ course.viewCount || 0 }} 浏览</span>
										<span
											class="rounded px-2 py-0.5"
											:class="course.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
										>
											{{ course.status === 'published' ? '已发布' : '草稿' }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 最新学员动态 -->
					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-lg font-semibold text-gray-800">学员动态</h2>
							<button
								class="text-sm text-blue-600 hover:underline"
								@click="goToStudents"
							>
								查看全部
							</button>
						</div>

						<div v-if="recentStudents.length === 0" class="py-8 text-center text-gray-500">
							暂无学员数据
						</div>

						<div v-else class="space-y-4">
							<div
								v-for="student in recentStudents"
								:key="student.userId"
								class="flex items-center gap-3"
							>
								<img
									:src="student.avatar"
									:alt="student.nickname"
									class="h-10 w-10 rounded-full"
								/>
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-800">
										{{ student.nickname }}
									</p>
									<p class="text-xs text-gray-500">
										学习进度 {{ student.progress }}%
									</p>
								</div>
								<span class="text-xs text-gray-400">
									{{ student.lastStudyAt }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- 热门课程排行 -->
				<div v-if="statistics.topCourses.length > 0" class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold text-gray-800">热门课程排行</h2>
					<div class="space-y-3">
						<div
							v-for="(course, index) in statistics.topCourses"
							:key="course.courseId"
							class="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
						>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
								:class="{
									'bg-yellow-100 text-yellow-600': index === 0,
									'bg-gray-100 text-gray-600': index === 1,
									'bg-orange-100 text-orange-600': index === 2,
									'bg-blue-50 text-blue-600': index > 2,
								}"
							>
								{{ index + 1 }}
							</div>
							<div class="flex-1">
								<p class="font-medium text-gray-800">{{ course.courseTitle }}</p>
							</div>
							<div class="text-right">
								<p class="text-sm font-semibold text-gray-800">
									{{ course.studentCount }} 学员
								</p>
								<p class="text-xs text-gray-500">
									{{ course.viewCount }} 浏览
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
