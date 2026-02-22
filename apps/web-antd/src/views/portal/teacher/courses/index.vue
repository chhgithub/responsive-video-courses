<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';

import type { Course } from '#/mock/course-center';
import {
	getTeacherCourses,
	deleteCourse,
	batchDeleteCourses,
	publishCourse,
	unpublishCourse,
	batchUpdateCourseStatus,
} from '#/utils/teacher-course-storage';

defineOptions({ name: 'TeacherCourses' });

const router = useRouter();

// 课程列表
const courses = ref<Course[]>([]);
const loading = ref(false);

// 搜索关键词
const searchKeyword = ref('');

// 状态筛选
const statusFilter = ref<'all' | 'published' | 'draft'>('all');

// 选中的课程ID
const selectedCourseIds = ref<string[]>([]);
const selectAll = ref(false);

// 加载课程列表
function loadCourses() {
	loading.value = true;
	setTimeout(() => {
		const allCourses = getTeacherCourses();
		courses.value = allCourses;
		loading.value = false;
	}, 300);
}

// 筛选后的课程列表
const filteredCourses = computed(() => {
	let filtered = courses.value;

	// 状态筛选
	if (statusFilter.value !== 'all') {
		filtered = filtered.filter(c => c.status === statusFilter.value);
	}

	// 搜索筛选
	if (searchKeyword.value.trim()) {
		const keyword = searchKeyword.value.toLowerCase();
		filtered = filtered.filter(c =>
			c.title.toLowerCase().includes(keyword) ||
			c.description.toLowerCase().includes(keyword)
		);
	}

	return filtered;
});

// 全选/取消全选
function toggleSelectAll() {
	if (selectAll.value) {
		selectedCourseIds.value = filteredCourses.value.map(c => c.id);
	} else {
		selectedCourseIds.value = [];
	}
}

// 单个课程选择状态
const isCourseSelected = (courseId: string) => {
	return selectedCourseIds.value.includes(courseId);
};

// 切换课程选择
function toggleCourseSelection(courseId: string) {
	const index = selectedCourseIds.value.indexOf(courseId);
	if (index >= 0) {
		selectedCourseIds.value.splice(index, 1);
	} else {
		selectedCourseIds.value.push(courseId);
	}
}

// 创建课程
function handleCreate() {
	router.push('/portal/teacher/courses/create');
}

// 编辑课程
function handleEdit(courseId: string) {
	router.push(`/portal/teacher/courses/edit/${courseId}`);
}

// 管理章节
function handleManageChapters(courseId: string) {
	router.push(`/portal/teacher/courses/chapters/${courseId}`);
}

// 查看学员
function handleViewStudents(courseId: string) {
	router.push(`/portal/teacher/students?courseId=${courseId}`);
}

// 上架课程
function handlePublish(courseId: string) {
	publishCourse(courseId);
	message.success('课程已上架');
	loadCourses();
}

// 下架课程
function handleUnpublish(courseId: string) {
	unpublishCourse(courseId);
	message.success('课程已下架');
	loadCourses();
}

// 删除课程
function handleDelete(courseId: string) {
	Modal.confirm({
		title: '确认删除',
		content: '确定要删除这个课程吗？删除后无法恢复。',
		okText: '确定',
		cancelText: '取消',
		onOk: () => {
			deleteCourse(courseId);
			message.success('课程已删除');
			loadCourses();
		},
	});
}

// 批量删除
function handleBatchDelete() {
	if (selectedCourseIds.value.length === 0) {
		message.warning('请先选择要删除的课程');
		return;
	}

	Modal.confirm({
		title: '确认批量删除',
		content: `确定要删除选中的 ${selectedCourseIds.value.length} 个课程吗？`,
		okText: '确定',
		cancelText: '取消',
		onOk: () => {
			batchDeleteCourses(selectedCourseIds.value);
			message.success('批量删除成功');
			selectedCourseIds.value = [];
			loadCourses();
		},
	});
}

// 批量上架
function handleBatchPublish() {
	if (selectedCourseIds.value.length === 0) {
		message.warning('请先选择要上架的课程');
		return;
	}

	batchUpdateCourseStatus(selectedCourseIds.value, 'published');
	message.success(`已上架 ${selectedCourseIds.value.length} 个课程`);
	selectedCourseIds.value = [];
	loadCourses();
}

// 批量下架
function handleBatchUnpublish() {
	if (selectedCourseIds.value.length === 0) {
		message.warning('请先选择要下架的课程');
		return;
	}

	batchUpdateCourseStatus(selectedCourseIds.value, 'draft');
	message.success(`已下架 ${selectedCourseIds.value.length} 个课程`);
	selectedCourseIds.value = [];
	loadCourses();
}

// 返回讲师中心
function handleBack() {
	router.push('/portal/teacher');
}

onMounted(() => {
	loadCourses();
});
</script>

<template>
	<div class="teacher-courses-page min-h-screen bg-gray-50 p-6">
		<div class="container mx-auto">
			<!-- 面包屑 -->
			<div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
				<button class="hover:text-blue-600" @click="handleBack">讲师中心</button>
				<span>/</span>
				<span class="text-gray-800">课程管理</span>
			</div>

			<!-- 页面标题 -->
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-800">课程管理</h1>
				<button
					class="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700"
					@click="handleCreate"
				>
					+ 创建课程
				</button>
			</div>

			<!-- 筛选和搜索 -->
			<div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
				<div class="flex flex-wrap items-center gap-4">
					<!-- 状态筛选 -->
					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-600">状态：</span>
						<button
							v-for="status in [
								{ value: 'all', label: '全部' },
								{ value: 'published', label: '已发布' },
								{ value: 'draft', label: '草稿' },
							]"
							:key="status.value"
							class="rounded-lg px-4 py-2 text-sm transition-colors"
							:class="
								statusFilter === status.value
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
							"
							@click="statusFilter = status.value"
						>
							{{ status.label }}
						</button>
					</div>

					<!-- 搜索框 -->
					<div class="flex-1">
						<input
							v-model="searchKeyword"
							type="text"
							placeholder="搜索课程标题或描述"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
						/>
					</div>
				</div>

				<!-- 批量操作 -->
				<div
					v-if="selectedCourseIds.length > 0"
					class="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4"
				>
					<span class="text-sm text-gray-600">
						已选择 {{ selectedCourseIds.length }} 个课程
					</span>
					<button
						class="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
						@click="handleBatchPublish"
					>
						批量上架
					</button>
					<button
						class="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
						@click="handleBatchUnpublish"
					>
						批量下架
					</button>
					<button
						class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
						@click="handleBatchDelete"
					>
						批量删除
					</button>
					<button
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
						@click="selectedCourseIds = []"
					>
						取消选择
					</button>
				</div>
			</div>

			<!-- 课程列表 -->
			<div v-if="loading" class="py-16 text-center">
				<div
					class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
				></div>
			</div>

			<div v-else-if="filteredCourses.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
				<p class="text-gray-500">暂无课程</p>
				<button
					class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
					@click="handleCreate"
				>
					创建第一个课程
				</button>
			</div>

			<div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div
					v-for="course in filteredCourses"
					:key="course.id"
					class="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
				>
					<!-- 选择框 -->
					<div class="relative">
						<input
							type="checkbox"
							class="absolute left-4 top-4 z-10 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							:checked="isCourseSelected(course.id)"
							@click.stop="toggleCourseSelection(course.id)"
						/>
						<img
							:src="course.coverImage"
							:alt="course.title"
							class="h-48 w-full object-cover"
						/>
						<span
							class="absolute right-4 top-4 rounded px-3 py-1 text-xs font-medium"
							:class="
								course.status === 'published'
									? 'bg-green-500 text-white'
									: 'bg-gray-500 text-white'
							"
						>
							{{ course.status === 'published' ? '已发布' : '草稿' }}
						</span>
					</div>

					<div class="p-4">
						<h3 class="mb-2 text-lg font-semibold text-gray-800 line-clamp-2">
							{{ course.title }}
						</h3>
						<p class="mb-3 text-sm text-gray-600 line-clamp-2">
							{{ course.description }}
						</p>

						<div class="mb-3 flex flex-wrap gap-2">
							<span
								v-for="tag in course.tags?.slice(0, 3)"
								:key="tag"
								class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
							>
								{{ tag }}
							</span>
						</div>

						<div class="mb-4 flex items-center justify-between text-sm text-gray-500">
							<span>¥{{ (course.price / 100).toFixed(2) }}</span>
							<div class="flex gap-4">
								<span>{{ course.studentCount || 0 }} 学员</span>
								<span>{{ course.viewCount || 0 }} 浏览</span>
							</div>
						</div>

						<div class="flex gap-2">
							<button
								class="flex-1 rounded-lg border border-blue-600 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
								@click="handleEdit(course.id)"
							>
								编辑
							</button>
							<button
								class="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
								@click="handleManageChapters(course.id)"
							>
								章节
							</button>
							<button
								v-if="course.status === 'published'"
								class="rounded-lg border border-orange-600 px-3 py-2 text-sm text-orange-600 transition-colors hover:bg-orange-50"
								@click="handleUnpublish(course.id)"
							>
								下架
							</button>
							<button
								v-else
								class="rounded-lg border border-green-600 px-3 py-2 text-sm text-green-600 transition-colors hover:bg-green-50"
								@click="handlePublish(course.id)"
							>
								上架
							</button>
							<button
								class="rounded-lg border border-red-600 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
								@click="handleDelete(course.id)"
							>
								删除
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
