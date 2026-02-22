<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import type { Course, Chapter, Lesson } from '#/mock/course-center';
import {
	getCourseById,
	createCourse,
	updateCourse,
} from '#/utils/teacher-course-storage';

defineOptions({ name: 'TeacherCourseEdit' });

const route = useRoute();
const router = useRouter();

// 课程ID（编辑模式）
const courseId = route.params.id as string;
const isEditMode = computed(() => !!courseId);

// 当前步骤
const currentStep = ref(1);

// 加载状态
const loading = ref(false);
const saving = ref(false);

// 表单数据
const formData = ref<Partial<Course>>({
	title: '',
	description: '',
	coverImage: '',
	price: 0,
	originalPrice: 0,
	isFree: false,
	category: '',
	tags: [],
	difficulty: 'beginner',
	targetAudience: '',
	status: 'draft',
	chapters: [],
});

// 验证错误
const errors = ref<Record<string, string>>({});

// 是否可以进入下一步
const canGoNext = computed(() => {
	switch (currentStep.value) {
		case 1:
			return formData.value.title?.trim() &&
				formData.value.description?.trim() &&
				formData.value.coverImage?.trim();
		case 2:
			return true;
		case 3:
			return formData.value.chapters && formData.value.chapters.length > 0;
		default:
			return true;
	}
});

// 加载课程数据（编辑模式）
function loadCourseData() {
	if (!courseId) return;

	loading.value = true;
	const course = getCourseById(courseId);
	if (course) {
		formData.value = { ...course };
	} else {
		message.error('课程不存在');
		router.push('/portal/teacher/courses');
	}
	loading.value = false;
}

// Step 1: 基础信息验证
function validateStep1(): boolean {
	errors.value = {};

	if (!formData.value.title?.trim()) {
		errors.value.title = '请输入课程标题';
	}
	if (!formData.value.description?.trim()) {
		errors.value.description = '请输入课程简介';
	}
	if (!formData.value.coverImage?.trim()) {
		errors.value.coverImage = '请上传课程封面';
	}

	return Object.keys(errors.value).length === 0;
}

// Step 2: 价格验证
function validateStep2(): boolean {
	errors.value = {};

	if (!formData.value.isFree && (!formData.value.price || formData.value.price <= 0)) {
		errors.value.price = '请设置课程价格';
	}

	return Object.keys(errors.value).length === 0;
}

// Step 3: 大纲验证
function validateStep3(): boolean {
	errors.value = {};

	if (!formData.value.chapters || formData.value.chapters.length === 0) {
		errors.value.chapters = '请至少添加一个章节';
	}

	return Object.keys(errors.value).length === 0;
}

// 下一步
function nextStep() {
	if (currentStep.value === 1 && !validateStep1()) return;
	if (currentStep.value === 2 && !validateStep2()) return;

	if (currentStep.value < 4) {
		currentStep.value++;
	}
}

// 上一步
function prevStep() {
	if (currentStep.value > 1) {
		currentStep.value--;
	}
}

// 添加章节
function addChapter() {
	if (!formData.value.chapters) {
		formData.value.chapters = [];
	}

	const newChapter: Chapter = {
		id: `chapter_${Date.now()}`,
		title: `第${formData.value.chapters.length + 1}章`,
		lessons: [],
	};

	formData.value.chapters.push(newChapter);
}

// 删除章节
function removeChapter(chapterId: string) {
	if (!formData.value.chapters) return;
	formData.value.chapters = formData.value.chapters.filter(c => c.id !== chapterId);
}

// 更新章节标题
function updateChapterTitle(chapterId: string, title: string) {
	if (!formData.value.chapters) return;
	const chapter = formData.value.chapters.find(c => c.id === chapterId);
	if (chapter) {
		chapter.title = title;
	}
}

// 添加课时
function addLesson(chapterId: string) {
	if (!formData.value.chapters) return;
	const chapter = formData.value.chapters.find(c => c.id === chapterId);
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
}

// 删除课时
function removeLesson(chapterId: string, lessonId: string) {
	if (!formData.value.chapters) return;
	const chapter = formData.value.chapters.find(c => c.id === chapterId);
	if (!chapter?.lessons) return;

	chapter.lessons = chapter.lessons.filter(l => l.id !== lessonId);
}

// 更新课时信息
function updateLesson(chapterId: string, lessonId: string, updates: Partial<Lesson>) {
	if (!formData.value.chapters) return;
	const chapter = formData.value.chapters.find(c => c.id === chapterId);
	if (!chapter?.lessons) return;

	const lesson = chapter.lessons.find(l => l.id === lessonId);
	if (lesson) {
		Object.assign(lesson, updates);
	}
}

// 保存草稿
async function saveDraft() {
	saving.value = true;
	try {
		const courseData = {
			...formData.value,
			status: 'draft' as const,
		};

		if (isEditMode.value) {
			updateCourse(courseId, courseData);
			message.success('草稿已保存');
		} else {
			const newCourse = createCourse(courseData as any);
			message.success('草稿已保存');
			router.replace(`/portal/teacher/courses/edit/${newCourse.id}`);
		}
	} catch (error: any) {
		message.error(error.message || '保存失败');
	} finally {
		saving.value = false;
	}
}

// 发布课程
async function publishCourse() {
	if (!validateStep1() || !validateStep2() || !validateStep3()) {
		message.warning('请完善课程信息');
		return;
	}

	saving.value = true;
	try {
		const courseData = {
			...formData.value,
			status: 'published' as const,
		};

		if (isEditMode.value) {
			updateCourse(courseId, courseData);
			message.success('课程已发布');
		} else {
			const newCourse = createCourse(courseData as any);
			message.success('课程已发布');
		}

		router.push('/portal/teacher/courses');
	} catch (error: any) {
		message.error(error.message || '发布失败');
	} finally {
		saving.value = false;
	}
}

// 取消编辑
function handleCancel() {
	router.push('/portal/teacher/courses');
}

onMounted(() => {
	if (isEditMode.value) {
		loadCourseData();
	}
});
</script>

<template>
	<div class="course-edit-page min-h-screen bg-gray-50 p-6">
		<div class="container mx-auto">
			<!-- 面包屑 -->
			<div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
				<button class="hover:text-blue-600" @click="handleCancel">讲师中心</button>
				<span>/</span>
				<button class="hover:text-blue-600" @click="handleCancel">课程管理</button>
				<span>/</span>
				<span class="text-gray-800">{{ isEditMode ? '编辑课程' : '创建课程' }}</span>
			</div>

			<!-- 页面标题 -->
			<div class="mb-6">
				<h1 class="text-2xl font-bold text-gray-800">
					{{ isEditMode ? '编辑课程' : '创建课程' }}
				</h1>
			</div>

			<!-- 进度步骤 -->
			<div class="mb-8">
				<div class="flex items-center justify-center">
					<div
						v-for="step in [
							{ num: 1, label: '基础信息' },
							{ num: 2, label: '价格设置' },
							{ num: 3, label: '课程大纲' },
							{ num: 4, label: '预览发布' },
						]"
						:key="step.num"
						class="flex items-center"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors"
							:class="
								currentStep >= step.num
									? 'border-blue-600 bg-blue-600 text-white'
									: 'border-gray-300 bg-white text-gray-400'
							"
						>
							{{ step.num }}
						</div>
						<span
							class="ml-2 text-sm font-medium transition-colors"
							:class="currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'"
						>
							{{ step.label }}
						</span>
						<div
							v-if="step.num < 4"
							class="mx-4 h-0.5 w-20 transition-colors"
							:class="currentStep > step.num ? 'bg-blue-600' : 'bg-gray-300'"
						></div>
					</div>
				</div>
			</div>

			<!-- 表单内容 -->
			<div class="mx-auto max-w-4xl">
				<div class="rounded-lg bg-white p-8 shadow-sm">
					<!-- Step 1: 基础信息 -->
					<div v-if="currentStep === 1" class="space-y-6">
						<h2 class="text-xl font-semibold text-gray-800">基础信息</h2>

						<!-- 课程标题 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">
								课程标题 <span class="text-red-500">*</span>
							</label>
							<input
								v-model="formData.title"
								type="text"
								placeholder="请输入课程标题"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
							/>
							<p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
						</div>

						<!-- 课程简介 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">
								课程简介 <span class="text-red-500">*</span>
							</label>
							<textarea
								v-model="formData.description"
								rows="4"
								placeholder="请输入课程简介，介绍课程内容和学习目标"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
							></textarea>
							<p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
						</div>

						<!-- 课程封面 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">
								课程封面 <span class="text-red-500">*</span>
							</label>
							<div class="flex gap-4">
								<div class="h-40 w-64 overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
									<img
										v-if="formData.coverImage"
										:src="formData.coverImage"
										alt="封面预览"
										class="h-full w-full object-cover"
									/>
									<div v-else class="flex h-full items-center justify-center text-gray-400">
										暂无封面
									</div>
								</div>
								<div class="flex-1">
									<input
										v-model="formData.coverImage"
										type="text"
										placeholder="请输入封面图片URL"
										class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
									/>
									<p class="mt-2 text-sm text-gray-500">
										建议尺寸：16:9，分辨率不低于 1280x720
									</p>
									<p v-if="errors.coverImage" class="mt-1 text-sm text-red-500">{{ errors.coverImage }}</p>
								</div>
							</div>
						</div>

						<!-- 课程分类 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">课程分类</label>
							<select
								v-model="formData.category"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
							>
								<option value="">请选择分类</option>
								<option value="programming">编程开发</option>
								<option value="design">设计创作</option>
								<option value="marketing">市场营销</option>
								<option value="business">商业管理</option>
								<option value="language">语言学习</option>
								<option value="other">其他</option>
							</select>
						</div>

						<!-- 课程标签 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">课程标签</label>
							<input
								v-model="formData.tags"
								type="text"
								placeholder="请输入标签，用逗号分隔，如：Java, Spring Boot, 后端"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
							/>
							<p class="mt-1 text-sm text-gray-500">标签有助于学员快速找到课程</p>
						</div>

						<!-- 难度等级 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">难度等级</label>
							<div class="flex gap-4">
								<label class="flex cursor-pointer items-center gap-2">
									<input
										v-model="formData.difficulty"
										type="radio"
										value="beginner"
										class="h-4 w-4 text-blue-600"
									/>
									<span>入门</span>
								</label>
								<label class="flex cursor-pointer items-center gap-2">
									<input
										v-model="formData.difficulty"
										type="radio"
										value="intermediate"
										class="h-4 w-4 text-blue-600"
									/>
									<span>进阶</span>
								</label>
								<label class="flex cursor-pointer items-center gap-2">
									<input
										v-model="formData.difficulty"
										type="radio"
										value="advanced"
										class="h-4 w-4 text-blue-600"
									/>
									<span>高级</span>
								</label>
							</div>
						</div>

						<!-- 适合人群 -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700">适合人群</label>
							<textarea
								v-model="formData.targetAudience"
								rows="2"
								placeholder="请描述适合哪些人群学习这门课程"
								class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
							></textarea>
						</div>
					</div>

					<!-- Step 2: 价格设置 -->
					<div v-if="currentStep === 2" class="space-y-6">
						<h2 class="text-xl font-semibold text-gray-800">价格设置</h2>

						<!-- 是否免费 -->
						<div>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									v-model="formData.isFree"
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-blue-600"
								/>
								<span class="text-sm font-medium text-gray-700">免费课程</span>
							</label>
						</div>

						<div v-if="!formData.isFree" class="space-y-6">
							<!-- 原价 -->
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700">
									原价（元）
								</label>
								<input
									v-model.number="formData.originalPrice"
									type="number"
									min="0"
									step="0.01"
									placeholder="请输入原价"
									class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
								/>
							</div>

							<!-- 优惠价 -->
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700">
									优惠价（元） <span class="text-red-500">*</span>
								</label>
								<input
									v-model.number="formData.price"
									type="number"
									min="0"
									step="0.01"
									placeholder="请输入优惠价"
									class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
								/>
								<p v-if="errors.price" class="mt-1 text-sm text-red-500">{{ errors.price }}</p>
							</div>
						</div>
					</div>

					<!-- Step 3: 课程大纲 -->
					<div v-if="currentStep === 3" class="space-y-6">
						<div class="flex items-center justify-between">
							<h2 class="text-xl font-semibold text-gray-800">课程大纲</h2>
							<button
								class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
								@click="addChapter"
							>
								+ 添加章节
							</button>
						</div>

						<p v-if="errors.chapters" class="text-sm text-red-500">{{ errors.chapters }}</p>

						<div v-if="!formData.chapters || formData.chapters.length === 0" class="py-12 text-center text-gray-500">
							暂无章节，点击右上角添加章节
						</div>

						<div v-else class="space-y-4">
							<div
								v-for="(chapter, chapterIndex) in formData.chapters"
								:key="chapter.id"
								class="rounded-lg border border-gray-200 p-4"
							>
								<div class="mb-3 flex items-center gap-3">
									<span class="text-sm font-medium text-gray-500">章节 {{ chapterIndex + 1 }}</span>
									<input
										:value="chapter.title"
										type="text"
										class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
										@input="updateChapterTitle(chapter.id, ($event.target as HTMLInputElement).value)"
									/>
									<button
										class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700"
										@click="addLesson(chapter.id)"
									>
										+ 添加课时
									</button>
									<button
										class="rounded-lg border border-red-600 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
										@click="removeChapter(chapter.id)"
									>
										删除章节
									</button>
								</div>

								<div v-if="!chapter.lessons || chapter.lessons.length === 0" class="py-4 text-center text-sm text-gray-400">
									暂无课时
								</div>

								<div v-else class="space-y-2">
									<div
										v-for="(lesson, lessonIndex) in chapter.lessons"
										:key="lesson.id"
										class="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
									>
										<span class="text-xs text-gray-400">课时 {{ lessonIndex + 1 }}</span>
										<input
											:value="lesson.title"
											type="text"
											class="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
											@input="updateLesson(chapter.id, lesson.id, { title: ($event.target as HTMLInputElement).value })"
										/>
										<label class="flex cursor-pointer items-center gap-1">
											<input
												type="checkbox"
												:checked="lesson.isTrial"
												class="h-4 w-4 rounded border-gray-300 text-blue-600"
												@change="updateLesson(chapter.id, lesson.id, { isTrial: ($event.target as HTMLInputElement).checked })"
											/>
											<span class="text-xs text-gray-600">试听</span>
										</label>
										<button
											class="rounded-lg border border-red-600 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
											@click="removeLesson(chapter.id, lesson.id)"
										>
											删除
										</button>
									</div>
								</div>
							</div>
						</div>

						<p class="text-sm text-gray-500">
							提示：完整的课时管理（上传视频、设置时长等）请在课程发布后，在"章节管理"页面进行
						</p>
					</div>

					<!-- Step 4: 预览发布 -->
					<div v-if="currentStep === 4" class="space-y-6">
						<h2 class="text-xl font-semibold text-gray-800">预览发布</h2>

						<!-- 课程预览 -->
						<div class="rounded-lg border border-gray-200 p-6">
							<img
								:src="formData.coverImage"
								:alt="formData.title"
								class="mb-4 h-64 w-full rounded-lg object-cover"
							/>
							<h3 class="mb-2 text-2xl font-bold text-gray-800">{{ formData.title }}</h3>
							<p class="mb-4 text-gray-600">{{ formData.description }}</p>

							<div class="mb-4 flex flex-wrap gap-2">
								<span
									v-for="tag in (Array.isArray(formData.tags) ? formData.tags : formData.tags?.split(',').map((t: string) => t.trim()))"
									:key="tag"
									class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600"
								>
									{{ tag }}
								</span>
							</div>

							<div class="flex items-center gap-4 border-t border-gray-200 pt-4">
								<span v-if="formData.isFree" class="text-2xl font-bold text-green-600">免费</span>
								<div v-else class="flex items-center gap-2">
									<span v-if="formData.originalPrice && formData.originalPrice > formData.price" class="text-lg text-gray-400 line-through">
										¥{{ ((formData.originalPrice || 0) / 100).toFixed(2) }}
									</span>
									<span class="text-2xl font-bold text-red-500">
										¥{{ ((formData.price || 0) / 100).toFixed(2) }}
									</span>
								</div>
							</div>

							<div class="mt-4 border-t border-gray-200 pt-4">
								<p class="text-sm text-gray-600">
									<strong>适合人群：</strong>{{ formData.targetAudience || '暂无描述' }}
								</p>
								<p class="mt-2 text-sm text-gray-600">
									<strong>难度等级：</strong>
									<span v-if="formData.difficulty === 'beginner'">入门</span>
									<span v-else-if="formData.difficulty === 'intermediate'">进阶</span>
									<span v-else-if="formData.difficulty === 'advanced'">高级</span>
								</p>
								<p class="mt-2 text-sm text-gray-600">
									<strong>章节数：</strong>{{ formData.chapters?.length || 0 }} 章
								</p>
							</div>
						</div>
					</div>

					<!-- 操作按钮 -->
					<div class="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
						<div class="flex gap-3">
							<button
								v-if="currentStep > 1"
								class="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
								@click="prevStep"
							>
								上一步
							</button>
							<button
								v-if="currentStep < 4"
								class="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
								:disabled="!canGoNext"
								@click="nextStep"
							>
								下一步
							</button>
						</div>

						<div class="flex gap-3">
							<button
								class="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
								@click="handleCancel"
							>
								取消
							</button>
							<button
								v-if="currentStep === 4"
								class="rounded-lg border border-blue-600 px-6 py-2.5 text-blue-600 transition-colors hover:bg-blue-50"
								:disabled="saving"
								@click="saveDraft"
							>
								{{ saving ? '保存中...' : '保存草稿' }}
							</button>
							<button
								v-if="currentStep === 4"
								class="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
								:disabled="saving"
								@click="publishCourse"
							>
								{{ saving ? '发布中...' : '发布课程' }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
