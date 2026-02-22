<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getOverallStatistics, type OverallStatistics } from '#/utils/teacher-statistics-storage';
import { getStudentGrowthTrend } from '#/utils/teacher-statistics-storage';
import { getTeacherCourses } from '#/utils/teacher-course-storage';
import { getCourseStatistics } from '#/utils/teacher-statistics-storage';

defineOptions({ name: 'TeacherStatistics' });

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

// 学员增长趋势
const studentGrowthTrend = ref<Array<{ date: string; count: number }>>([]);

// 课程统计数据
const courseStatistics = ref<any[]>([]);

// 加载状态
const loading = ref(true);

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

	// 加载整体统计数据
	const stats = getOverallStatistics(teacherId.value);
	statistics.value = stats;

	// 加载学员增长趋势（最近30天）
	const growthTrend = getStudentGrowthTrend(undefined, 30);
	studentGrowthTrend.value = growthTrend;

	// 加载课程统计数据
	const courses = getTeacherCourses();
	courseStatistics.value = courses
		.map(course => getCourseStatistics(course.id))
		.filter(stat => stat !== null);

	loading.value = false;
}

// 获取图表最大值（用于Y轴缩放）
const maxGrowthCount = ref(0);

// 返回讲师中心
function handleBack() {
	router.push('/portal/teacher');
}

onMounted(() => {
	loadData();

	// 计算最大值
	setTimeout(() => {
		if (studentGrowthTrend.value.length > 0) {
			maxGrowthCount.value = Math.max(...studentGrowthTrend.value.map(d => d.count));
		}
	}, 500);
});
</script>

<template>
	<div class="teacher-statistics-page min-h-screen bg-gray-50 p-6">
		<div class="container mx-auto">
			<!-- 面包屑 -->
			<div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
				<button class="hover:text-blue-600" @click="handleBack">讲师中心</button>
				<span>/</span>
				<span class="text-gray-800">数据统计</span>
			</div>

			<!-- 页面标题 -->
			<div class="mb-6">
				<h1 class="text-2xl font-bold text-gray-800">数据统计</h1>
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

				<!-- 学员增长趋势图 -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold text-gray-800">学员增长趋势（最近30天）</h2>
					<div class="h-[300px]">
						<div v-if="studentGrowthTrend.length === 0" class="flex h-full items-center justify-center text-gray-500">
							暂无数据
						</div>
						<div v-else class="flex h-full items-end justify-between gap-1">
							<div
								v-for="(item, index) in studentGrowthTrend"
								:key="index"
								class="group relative flex-1"
							>
								<!-- 柱状条 -->
								<div
									class="mx-auto w-full max-w-[30px] rounded-t bg-blue-500 transition-all hover:bg-blue-600"
									:style="{
										height: maxGrowthCount > 0 ? `${(item.count / maxGrowthCount) * 100}%` : '0%',
										minHeight: item.count > 0 ? '4px' : '0',
									}"
								></div>
								<!-- 日期标签 -->
								<p class="mt-2 text-xs text-gray-400">
									{{ item.date.slice(5) }}
								</p>
								<!-- 数值提示 -->
								<div class="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-lg bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
									{{ item.count }} 人
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 课程统计列表 -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold text-gray-800">课程详细统计</h2>
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
									<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">浏览量</th>
									<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">学员数</th>
									<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">完课率</th>
									<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">平均进度</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200">
								<tr
									v-for="courseStat in courseStatistics"
									:key="courseStat.courseId"
									class="transition-colors hover:bg-gray-50"
								>
									<td class="px-4 py-4">
										<div class="flex items-center gap-3">
											<img
												:src="courseStat.courseCover"
												:alt="courseStat.courseTitle"
												class="h-12 w-20 rounded object-cover"
											/>
											<p class="text-sm font-medium text-gray-800 line-clamp-1">
												{{ courseStat.courseTitle }}
											</p>
										</div>
									</td>
									<td class="px-4 py-4 text-center">
										<p class="text-sm font-semibold text-gray-800">{{ courseStat.viewCount }}</p>
										<p class="text-xs text-gray-500">今日 {{ courseStat.todayViews }}</p>
									</td>
									<td class="px-4 py-4 text-center">
										<p class="text-sm font-semibold text-gray-800">{{ courseStat.studentCount }}</p>
										<p class="text-xs text-green-600">今日 +{{ courseStat.todayEnrollments }}</p>
									</td>
									<td class="px-4 py-4 text-center">
										<p class="text-sm font-semibold" :class="{
											'text-green-600': courseStat.completionRate >= 80,
											'text-blue-600': courseStat.completionRate >= 50 && courseStat.completionRate < 80,
											'text-yellow-600': courseStat.completionRate < 50,
										}">
											{{ courseStat.completionRate }}%
										</p>
									</td>
									<td class="px-4 py-4">
										<div class="mx-auto max-w-[150px]">
											<div class="mb-1 flex items-center justify-center text-xs">
												<span class="font-medium text-gray-800">{{ courseStat.avgProgress }}%</span>
											</div>
											<div class="h-2 w-full rounded-full bg-gray-200">
												<div
													class="h-2 rounded-full transition-all"
													:class="courseStat.avgProgress >= 80 ? 'bg-green-500' : courseStat.avgProgress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'"
													:style="{ width: `${courseStat.avgProgress}%` }"
												></div>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- 热门课程排行 -->
				<div v-if="statistics.topCourses.length > 0" class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold text-gray-800">热门课程排行</h2>
					<div class="space-y-3">
						<div
							v-for="(course, index) in statistics.topCourses"
							:key="course.courseId"
							class="flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
						>
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold"
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
							<div class="flex items-center gap-6">
								<div class="text-center">
									<p class="text-lg font-semibold text-gray-800">{{ course.studentCount }}</p>
									<p class="text-xs text-gray-500">学员</p>
								</div>
								<div class="text-center">
									<p class="text-lg font-semibold text-gray-800">{{ course.viewCount }}</p>
									<p class="text-xs text-gray-500">浏览</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
