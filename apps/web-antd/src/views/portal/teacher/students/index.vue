<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import type { Course } from '#/mock/course-center';
import {
	getCourseStudents,
	getStudentProgress,
	type StudentInfo,
} from '#/utils/student-data-storage';
import { getTeacherCourses } from '#/utils/teacher-course-storage';

defineOptions({ name: 'TeacherStudents' });

const route = useRoute();
const router = useRouter();

// 讲师的课程列表
const courses = ref<Course[]>([]);

// 选中的课程ID
const selectedCourseId = ref('');

// 学员列表
const students = ref<StudentInfo[]>([]);

// 加载状态
const loading = ref(false);

// 搜索关键词
const searchKeyword = ref('');

// 学员详情弹窗
const showDetailModal = ref(false);
const selectedStudent = ref<StudentInfo | null>(null);
const studentProgress = ref<any>(null);

// 筛选后的学员列表
const filteredStudents = computed(() => {
	if (!searchKeyword.value.trim()) return students.value;

	const keyword = searchKeyword.value.toLowerCase();
	return students.value.filter(s =>
		s.nickname.toLowerCase().includes(keyword) ||
		s.username.toLowerCase().includes(keyword) ||
		s.phone.includes(keyword)
	);
});

// 加载讲师的课程列表
function loadCourses() {
	const teacherCourses = getTeacherCourses();
	courses.value = teacherCourses;

	// 从URL获取课程ID
	const urlCourseId = route.query.courseId as string;
	if (urlCourseId && teacherCourses.find(c => c.id === urlCourseId)) {
		selectedCourseId.value = urlCourseId;
	} else if (teacherCourses.length > 0) {
		selectedCourseId.value = teacherCourses[0].id;
	}
}

// 加载学员列表
function loadStudents() {
	if (!selectedCourseId.value) return;

	loading.value = true;
	setTimeout(() => {
		students.value = getCourseStudents(selectedCourseId.value);
		loading.value = false;
	}, 300);
}

// 课程选择改变
function handleCourseChange() {
	loadStudents();
}

// 查看学员详情
function viewStudentDetail(student: StudentInfo) {
	selectedStudent.value = student;
	studentProgress.value = getStudentProgress(student.userId, selectedCourseId.value);
	showDetailModal.value = true;
}

// 导出学员数据
function handleExport() {
	if (!selectedCourseId.value) {
		message.warning('请先选择课程');
		return;
	}

	const csvContent = getCourseStudents(selectedCourseId.value).map(s => [
		s.username,
		s.nickname,
		s.phone,
		s.enrolledAt,
		s.lastStudyAt,
		`${s.progress}%`,
		s.completedLessons.toString(),
		s.totalLessons.toString(),
	]).map(row => row.join(',')).join('\n');

	const headers = ['用户名,昵称,手机号,报名时间,最后学习时间,学习进度,已完成课时,总课时数'];
	const fullContent = headers.concat(csvContent).join('\n');

	const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = `学员数据_${new Date().toLocaleDateString('zh-CN')}.csv`;
	link.click();
	message.success('导出成功');
}

// 返回讲师中心
function handleBack() {
	router.push('/portal/teacher');
}

// 获取进度条颜色
function getProgressColor(progress: number) {
	if (progress >= 80) return 'bg-green-500';
	if (progress >= 50) return 'bg-blue-500';
	if (progress >= 20) return 'bg-yellow-500';
	return 'bg-red-500';
}

onMounted(() => {
	loadCourses();
	loadStudents();
});
</script>

<template>
	<div class="teacher-students-page min-h-screen bg-gray-50 p-6">
		<div class="container mx-auto">
			<!-- 面包屑 -->
			<div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
				<button class="hover:text-blue-600" @click="handleBack">讲师中心</button>
				<span>/</span>
				<span class="text-gray-800">学员管理</span>
			</div>

			<!-- 页面标题 -->
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-800">学员管理</h1>
			</div>

			<!-- 筛选栏 -->
			<div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
				<div class="flex flex-wrap items-center gap-4">
					<!-- 课程选择 -->
					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-600">选择课程：</span>
						<select
							v-model="selectedCourseId"
							class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
							@change="handleCourseChange"
						>
							<option value="">请选择课程</option>
							<option v-for="course in courses" :key="course.id" :value="course.id">
								{{ course.title }}
							</option>
						</select>
					</div>

					<!-- 搜索框 -->
					<div class="flex-1">
						<input
							v-model="searchKeyword"
							type="text"
							placeholder="搜索学员昵称、用户名或手机号"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<!-- 导出按钮 -->
					<!-- <button
						class="rounded-lg border border-green-600 px-4 py-2 text-green-600 transition-colors hover:bg-green-50"
						@click="handleExport"
					>
						导出数据
					</button> -->
				</div>
			</div>

			<!-- 学员列表 -->
			<div v-if="!selectedCourseId" class="rounded-lg bg-white p-12 text-center shadow-sm">
				<p class="text-gray-500">请先选择课程</p>
			</div>

			<div v-else-if="loading" class="py-16 text-center">
				<div
					class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
				></div>
			</div>

			<div v-else-if="filteredStudents.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
				<p class="text-gray-500">该课程暂无学员</p>
			</div>

			<div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学员</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">报名时间</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学习进度</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后学习</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						<tr
							v-for="student in filteredStudents"
							:key="student.userId"
							class="transition-colors hover:bg-gray-50"
						>
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<img
										:src="student.avatar"
										:alt="student.nickname"
										class="h-10 w-10 rounded-full"
									/>
									<div>
										<p class="text-sm font-medium text-gray-800">{{ student.nickname }}</p>
										<p class="text-xs text-gray-500">{{ student.username }}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
								{{ student.enrolledAt }}
							</td>
							<td class="px-6 py-4">
								<div class="max-w-[200px]">
									<div class="mb-1 flex items-center justify-between text-xs">
										<span class="text-gray-600">{{ student.completedLessons }}/{{ student.totalLessons }} 课时</span>
										<span class="font-medium" :class="{
											'text-green-600': student.progress >= 80,
											'text-blue-600': student.progress >= 50 && student.progress < 80,
											'text-yellow-600': student.progress >= 20 && student.progress < 50,
											'text-red-600': student.progress < 20,
										}">
											{{ student.progress }}%
										</span>
									</div>
									<div class="h-2 w-full rounded-full bg-gray-200">
										<div
											class="h-2 rounded-full transition-all"
											:class="getProgressColor(student.progress)"
											:style="{ width: `${student.progress}%` }"
										></div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
								{{ student.lastStudyAt }}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<button
									class="rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50"
									@click="viewStudentDetail(student)"
								>
									查看详情
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- 学员详情弹窗 -->
			<div
				v-if="showDetailModal"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
				@click="showDetailModal = false"
			>
				<div
					class="mx-4 max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl"
					@click.stop
				>
					<!-- 弹窗标题 -->
					<div class="flex items-center justify-between border-b border-gray-200 p-6">
						<h2 class="text-xl font-semibold text-gray-800">学员学习详情</h2>
						<button
							class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
							@click="showDetailModal = false"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<!-- 弹窗内容 -->
					<div v-if="selectedStudent && studentProgress" class="p-6">
						<!-- 学员基本信息 -->
						<div class="mb-6 flex items-center gap-4 border-b border-gray-200 pb-6">
							<img
								:src="selectedStudent.avatar"
								:alt="selectedStudent.nickname"
								class="h-16 w-16 rounded-full"
							/>
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-gray-800">{{ selectedStudent.nickname }}</h3>
								<p class="text-sm text-gray-500">{{ selectedStudent.username }}</p>
								<p class="text-sm text-gray-500">{{ selectedStudent.phone }}</p>
							</div>
							<div class="text-right">
								<p class="text-2xl font-bold text-blue-600">{{ selectedStudent.progress }}%</p>
								<p class="text-sm text-gray-500">学习进度</p>
							</div>
						</div>

						<!-- 学习统计 -->
						<div class="mb-6 grid grid-cols-3 gap-4">
							<div class="rounded-lg bg-gray-50 p-4 text-center">
								<p class="text-2xl font-bold text-gray-800">{{ studentProgress.totalLessons }}</p>
								<p class="text-sm text-gray-500">总课时数</p>
							</div>
							<div class="rounded-lg bg-gray-50 p-4 text-center">
								<p class="text-2xl font-bold text-green-600">{{ studentProgress.completedLessons }}</p>
								<p class="text-sm text-gray-500">已完成</p>
							</div>
							<div class="rounded-lg bg-gray-50 p-4 text-center">
								<p class="text-2xl font-bold text-orange-600">{{ studentProgress.totalLessons - studentProgress.completedLessons }}</p>
								<p class="text-sm text-gray-500">待学习</p>
							</div>
						</div>

						<!-- 课时学习记录 -->
						<div>
							<h4 class="mb-4 text-lg font-semibold text-gray-800">课时学习记录</h4>
							<div class="max-h-[300px] overflow-y-auto">
								<div
									v-for="(record, index) in studentProgress.records"
									:key="record.lessonId"
									class="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0"
								>
									<span class="text-sm text-gray-400">{{ index + 1 }}</span>
									<div class="flex-1">
										<p class="text-sm font-medium text-gray-800">{{ record.lessonTitle }}</p>
										<p class="text-xs text-gray-500">{{ record.chapterTitle }}</p>
									</div>
									<div class="flex items-center gap-3">
										<div class="w-24">
											<div class="mb-1 flex items-center justify-between text-xs">
												<span class="text-gray-500">进度</span>
												<span class="font-medium" :class="{
													'text-green-600': record.progress >= 100,
													'text-blue-600': record.progress >= 50 && record.progress < 100,
													'text-yellow-600': record.progress < 50,
												}">
													{{ record.progress }}%
												</span>
											</div>
											<div class="h-1.5 w-full rounded-full bg-gray-200">
												<div
													class="h-1.5 rounded-full transition-all"
													:class="record.progress >= 100 ? 'bg-green-500' : record.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'"
													:style="{ width: `${Math.min(record.progress, 100)}%` }"
												></div>
											</div>
										</div>
										<span
											class="rounded px-2 py-1 text-xs"
											:class="record.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'"
										>
											{{ record.completed ? '已完成' : '学习中' }}
										</span>
										<span class="text-xs text-gray-400">{{ record.lastStudyAt }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
