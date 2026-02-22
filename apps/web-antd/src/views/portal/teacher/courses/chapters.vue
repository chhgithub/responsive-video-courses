<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';

import type { Chapter, Lesson } from '#/mock/course-center';
import { getCourseById, updateCourse } from '#/utils/teacher-course-storage';

defineOptions({ name: 'TeacherCourseChapters' });

const route = useRoute();
const router = useRouter();

// 课程ID
const courseId = route.params.id as string;

// 课程数据
const course = ref<any>(null);
const loading = ref(false);

// 展开的章节
const expandedChapters = ref<Set<string>>(new Set());

// 拖拽状态
const draggingLesson = ref<{ chapterId: string; lessonId: string } | null>(null);

// 加载课程数据
function loadCourseData() {
	loading.value = true;
	const data = getCourseById(courseId);
	if (data) {
		course.value = data;
		// 默认展开所有章节
		if (data.chapters) {
			expandedChapters.value = new Set(data.chapters.map((c: Chapter) => c.id));
		}
	} else {
		message.error('课程不存在');
		router.push('/portal/teacher/courses');
	}
	loading.value = false;
}

// 切换章节展开状态
function toggleChapter(chapterId: string) {
	if (expandedChapters.value.has(chapterId)) {
		expandedChapters.value.delete(chapterId);
	} else {
		expandedChapters.value.add(chapterId);
	}
	// 触发响应式更新
	expandedChapters.value = new Set(expandedChapters.value);
}

// 添加章节
function addChapter() {
	if (!course.value.chapters) {
		course.value.chapters = [];
	}

	const newChapter: Chapter = {
		id: `chapter_${Date.now()}`,
		title: `第${course.value.chapters.length + 1}章`,
		lessons: [],
	};

	course.value.chapters.push(newChapter);
	expandedChapters.value.add(newChapter.id);
	saveChanges();
}

// 删除章节
function handleDeleteChapter(chapterId: string) {
	Modal.confirm({
		title: '确认删除',
		content: '确定要删除这个章节吗？章节下的所有课时也会被删除。',
		okText: '确定',
		cancelText: '取消',
		onOk: () => {
			course.value.chapters = course.value.chapters.filter((c: Chapter) => c.id !== chapterId);
			expandedChapters.value.delete(chapterId);
			saveChanges();
			message.success('章节已删除');
		},
	});
}

// 更新章节标题
function updateChapterTitle(chapterId: string, title: string) {
	const chapter = course.value.chapters?.find((c: Chapter) => c.id === chapterId);
	if (chapter) {
		chapter.title = title;
		saveChanges();
	}
}

// 添加课时
function addLesson(chapterId: string) {
	const chapter = course.value.chapters?.find((c: Chapter) => c.id === chapterId);
	if (!chapter) return;

	if (!chapter.lessons) {
		chapter.lessons = [];
	}

	const newLesson: Lesson = {
		id: `lesson_${Date.now()}`,
		title: `课时${chapter.lessons.length + 1}`,
		duration: 0,
		videoUrl: '',
		isTrial: false,
		isFree: false,
	};

	chapter.lessons.push(newLesson);
	saveChanges();
}

// 删除课时
function handleDeleteLesson(chapterId: string, lessonId: string) {
	Modal.confirm({
		title: '确认删除',
		content: '确定要删除这个课时吗？',
		okText: '确定',
		cancelText: '取消',
		onOk: () => {
			const chapter = course.value.chapters?.find((c: Chapter) => c.id === chapterId);
			if (chapter?.lessons) {
				chapter.lessons = chapter.lessons.filter((l: Lesson) => l.id !== lessonId);
				saveChanges();
				message.success('课时已删除');
			}
		},
	});
}

// 更新课时信息
function updateLesson(chapterId: string, lessonId: string, field: keyof Lesson, value: any) {
	const chapter = course.value.chapters?.find((c: Chapter) => c.id === chapterId);
	const lesson = chapter?.lessons?.find((l: Lesson) => l.id === lessonId);
	if (lesson) {
		lesson[field] = value;
		saveChanges();
	}
}

// 上移课时
function moveLessonUp(chapterId: string, lessonIndex: number) {
	const chapter = course.value.chapters?.find((c: Chapter) => c.id === chapterId);
	if (!chapter?.lessons) return;

	if (lessonIndex > 0) {
		const temp = chapter.lessons[lessonIndex];
		chapter.lessons[lessonIndex] = chapter.lessons[lessonIndex - 1];
		chapter.lessons[lessonIndex - 1] = temp;
		saveChanges();
	}
}

// 下移课时
function moveLessonDown(chapterId: string, lessonIndex: number) {
	const chapter = course.value.chapters?.find((c: Chapter) => c.id === chapterId);
	if (!chapter?.lessons) return;

	if (lessonIndex < chapter.lessons.length - 1) {
		const temp = chapter.lessons[lessonIndex];
		chapter.lessons[lessonIndex] = chapter.lessons[lessonIndex + 1];
		chapter.lessons[lessonIndex + 1] = temp;
		saveChanges();
	}
}

// 保存更改
function saveChanges() {
	updateCourse(courseId, {
		chapters: course.value.chapters,
	});
}

// 返回课程列表
function handleBack() {
	router.push('/portal/teacher/courses');
}

// 跳转到课程编辑
function handleEditCourse() {
	router.push(`/portal/teacher/courses/edit/${courseId}`);
}

onMounted(() => {
	loadCourseData();
});
</script>

<template>
	<div class="chapter-management-page min-h-screen bg-gray-50 p-6">
		<div class="container mx-auto">
			<!-- 面包屑 -->
			<div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
				<button class="hover:text-blue-600" @click="handleBack">讲师中心</button>
				<span>/</span>
				<button class="hover:text-blue-600" @click="handleBack">课程管理</button>
				<span>/</span>
				<span class="text-gray-800">章节管理</span>
			</div>

			<!-- 页面标题 -->
			<div v-if="course" class="mb-6">
				<h1 class="text-2xl font-bold text-gray-800">{{ course.title }} - 章节管理</h1>
			</div>

			<!-- 操作按钮 -->
			<div class="mb-6 flex items-center gap-3">
				<button
					class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					@click="addChapter"
				>
					+ 添加章节
				</button>
				<button
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
					@click="handleEditCourse"
				>
					编辑课程信息
				</button>
				<button
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
					@click="handleBack"
				>
					返回课程列表
				</button>
			</div>

			<!-- 章节列表 -->
			<div v-if="loading" class="py-16 text-center">
				<div
					class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
				></div>
			</div>

			<div v-else-if="!course || !course.chapters || course.chapters.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
				<p class="text-gray-500 mb-4">暂无章节</p>
				<button
					class="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
					@click="addChapter"
				>
					添加第一个章节
				</button>
			</div>

			<div v-else class="space-y-4">
				<div
					v-for="(chapter, chapterIndex) in course.chapters"
					:key="chapter.id"
					class="rounded-lg bg-white shadow-sm"
				>
					<!-- 章节标题 -->
					<div
						class="flex cursor-pointer items-center justify-between border-b border-gray-200 p-4 transition-colors hover:bg-gray-50"
						@click="toggleChapter(chapter.id)"
					>
						<div class="flex items-center gap-3">
							<svg
								class="h-5 w-5 text-gray-400 transition-transform"
								:class="expandedChapters.has(chapter.id) ? 'rotate-90' : ''"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
							<span class="text-sm font-medium text-gray-500">章节 {{ chapterIndex + 1 }}</span>
							<input
								:value="chapter.title"
								type="text"
								class="text-lg font-semibold text-gray-800 focus:border-blue-500 focus:outline-none"
								placeholder="章节标题"
								@click.stop
								@change="updateChapterTitle(chapter.id, ($event.target as HTMLInputElement).value)"
							/>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm text-gray-500">
								{{ chapter.lessons?.length || 0 }} 个课时
							</span>
							<button
								class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
								@click.stop="addLesson(chapter.id)"
							>
								+ 添加课时
							</button>
							<button
								class="rounded-lg border border-red-600 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
								@click.stop="handleDeleteChapter(chapter.id)"
							>
								删除章节
							</button>
						</div>
					</div>

					<!-- 课时列表 -->
					<div
						v-if="expandedChapters.has(chapter.id)"
						class="border-b border-gray-200 p-4"
					>
						<div v-if="!chapter.lessons || chapter.lessons.length === 0" class="py-8 text-center text-gray-500">
							暂无课时，点击右上角添加课时
						</div>

						<div v-else class="space-y-3">
							<div
								v-for="(lesson, lessonIndex) in chapter.lessons"
								:key="lesson.id"
								class="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
							>
								<div class="mt-2 text-sm text-gray-400">
									{{ lessonIndex + 1 }}
								</div>

								<div class="flex-1 space-y-3">
									<!-- 课时标题 -->
									<div>
										<label class="mb-1 block text-xs text-gray-500">课时标题</label>
										<input
											:value="lesson.title"
											type="text"
											class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
											placeholder="请输入课时标题"
											@change="updateLesson(chapter.id, lesson.id, 'title', ($event.target as HTMLInputElement).value)"
										/>
									</div>

									<!-- 视频地址 -->
									<div>
										<label class="mb-1 block text-xs text-gray-500">视频地址</label>
										<input
											:value="lesson.videoUrl"
											type="text"
											class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
											placeholder="请输入视频URL"
											@change="updateLesson(chapter.id, lesson.id, 'videoUrl', ($event.target as HTMLInputElement).value)"
										/>
									</div>

									<!-- 时长和选项 -->
									<div class="flex flex-wrap items-center gap-4">
										<div class="flex-1 min-w-[200px]">
											<label class="mb-1 block text-xs text-gray-500">时长（分钟）</label>
											<input
												:value="lesson.duration"
												type="number"
												min="0"
												class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
												placeholder="0"
												@change="updateLesson(chapter.id, lesson.id, 'duration', parseInt(($event.target as HTMLInputElement).value) || 0)"
											/>
										</div>

										<div class="flex gap-4">
											<label class="flex cursor-pointer items-center gap-2">
												<input
													type="checkbox"
													:checked="lesson.isTrial"
													class="h-4 w-4 rounded border-gray-300 text-blue-600"
													@change="updateLesson(chapter.id, lesson.id, 'isTrial', ($event.target as HTMLInputElement).checked)"
												/>
												<span class="text-sm text-gray-700">试听</span>
											</label>

											<label class="flex cursor-pointer items-center gap-2">
												<input
													type="checkbox"
													:checked="lesson.isFree"
													class="h-4 w-4 rounded border-gray-300 text-blue-600"
													@change="updateLesson(chapter.id, lesson.id, 'isFree', ($event.target as HTMLInputElement).checked)"
												/>
												<span class="text-sm text-gray-700">免费</span>
											</label>
										</div>
									</div>
								</div>

								<!-- 操作按钮 -->
								<div class="flex flex-col gap-2">
									<button
										class="rounded border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
										:disabled="lessonIndex === 0"
										:title="上移"
										@click="moveLessonUp(chapter.id, lessonIndex)"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
										</svg>
									</button>
									<button
										class="rounded border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
										:disabled="!chapter.lessons || lessonIndex >= chapter.lessons.length - 1"
										:title="下移"
										@click="moveLessonDown(chapter.id, lessonIndex)"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
										</svg>
									</button>
									<button
										class="rounded border border-red-600 p-1.5 text-red-600 transition-colors hover:bg-red-50"
										title="删除"
										@click="handleDeleteLesson(chapter.id, lesson.id)"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
