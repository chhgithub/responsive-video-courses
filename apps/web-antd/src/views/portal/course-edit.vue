<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
	mockCourses,
	mockCategories,
	getCurrentUserRole,
	type Course,
	type Chapter,
	type Lesson,
} from '#/mock/course-center';

const route = useRoute();
const router = useRouter();

// 课程ID（新建时为空）
const courseId = route.params.id as string;
const isEditMode = computed(() => !!courseId);

// 表单数据
const formData = ref({
	title: '',
	description: '',
	coverImage: '',
	categoryId: '',
	price: 0,
	originalPrice: 0,
	isFree: false,
	tags: [] as string[],
	ageRange: '',
	level: '',
	validDays: 0,
	validType: 'permanent' as 'permanent' | 'days' | 'date_range',
	trialLessonId: '',
	status: 'draft' as 'draft' | 'published' | 'offline',
});

// 章节数据
const chapters = ref<Chapter[]>([]);

// 上传的封面图预览
const coverPreview = ref('');

// 当前编辑的章节
const editingChapter = ref<Chapter | null>(null);
const editingChapterIndex = ref(-1);

// 当前编辑的课时
const editingLesson = ref<Lesson | null>(null);
const editingLessonIndex = ref(-1);

// 显示章节编辑弹窗
const showChapterModal = ref(false);

// 显示课时编辑弹窗
const showLessonModal = ref(false);

// 新章节数据
const newChapterData = ref({
	title: '',
	description: '',
});

// 新课时数据
const newLessonData = ref({
	title: '',
	type: 'video' as 'video' | 'audio' | 'document' | 'text',
	videoUrl: '',
	videoSource: 'local' as 'local' | 'aliyun' | 'tencent' | 'polyv',
	videoDuration: 0,
	content: '',
	isTrial: false,
	isFree: false,
});

// 选项
const ageRangeOptions = ['3-6岁', '7-12岁', '13-18岁', '成人'];
const levelOptions = ['入门', '初级', '中级', '高级'];
const categoryOptions = computed(() => mockCategories);

// 加载课程详情（编辑模式）
function loadCourseDetail() {
	if (!courseId) return;

	const found = mockCourses.find((c) => c.id === courseId);
	if (found) {
		formData.value = {
			title: found.title,
			description: found.description,
			coverImage: found.coverImage,
			categoryId: found.categoryId,
			price: found.price,
			originalPrice: found.originalPrice || 0,
			isFree: found.isFree,
			tags: found.tags,
			ageRange: found.ageRange,
			level: found.level || '',
			validDays: found.validDays,
			validType: found.validType,
			trialLessonId: found.trialLessonId || '',
			status: found.status,
		};
		coverPreview.value = found.coverImage;
		chapters.value = [...found.chapters];
	}
}

// 封面图片上传
function handleCoverUpload(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) return;

	// 模拟上传
	const reader = new FileReader();
	reader.onload = (e) => {
		coverPreview.value = e.target?.result as string;
		formData.value.coverImage = e.target?.result as string;
	};
	reader.readAsDataURL(file);
}

// 添加章节
function handleAddChapter() {
	editingChapter.value = null;
	editingChapterIndex.value = -1;
	newChapterData.value = { title: '', description: '' };
	showChapterModal.value = true;
}

// 编辑章节
function handleEditChapter(index: number) {
	const chapter = chapters.value[index];
	editingChapter.value = chapter;
	editingChapterIndex.value = index;
	newChapterData.value = {
		title: chapter.title,
		description: chapter.description || '',
	};
	showChapterModal.value = true;
}

// 保存章节
function handleSaveChapter() {
	const chapterData = {
		...newChapterData.value,
		sortOrder: chapters.value.length,
		lessons: [],
	};

	if (editingChapterIndex.value >= 0) {
		// 编辑现有章节
		chapters.value[editingChapterIndex.value] = {
			...chapters.value[editingChapterIndex.value],
			...newChapterData.value,
		};
	} else {
		// 添加新章节
		chapters.value.push({
			id: `ch_${Date.now()}`,
			courseId: courseId || 'new',
			...chapterData,
			createdAt: new Date().toISOString(),
		} as Chapter);
	}

	showChapterModal.value = false;
}

// 删除章节
function handleDeleteChapter(index: number) {
	if (confirm('确定删除此章节吗？')) {
		chapters.value.splice(index, 1);
	}
}

// 添加课时
function handleAddLesson(chapterIndex: number) {
	const chapter = chapters.value[chapterIndex];
	editingLesson.value = null;
	editingLessonIndex.value = -1;
	newLessonData.value = {
		title: '',
		type: 'video',
		videoUrl: '',
		videoSource: 'local',
		videoDuration: 0,
		content: '',
		isTrial: false,
		isFree: false,
	};

	// 记录当前所属章节
	(editingLesson.value as any) = { chapterIndex };
	editingLessonIndex.value = -1;
	showLessonModal.value = true;
}

// 编辑课时
function handleEditLesson(chapterIndex: number, lessonIndex: number) {
	const lesson = chapters.value[chapterIndex].lessons[lessonIndex];
	editingLesson.value = lesson;
	editingLessonIndex.value = lessonIndex;
	newLessonData.value = {
		title: lesson.title,
		type: lesson.type,
		videoUrl: lesson.videoUrl || '',
		videoSource: lesson.videoSource || 'local',
		videoDuration: lesson.videoDuration || 0,
		content: lesson.content || '',
		isTrial: lesson.isTrial,
		isFree: lesson.isFree,
	};

	// 记录当前所属章节
	(editingLesson.value as any) = { chapterIndex };
	showLessonModal.value = true;
}

// 保存课时
function handleSaveLesson() {
	// 获取章节索引
	const chapterIndex = (editingLesson.value as any)?.chapterIndex || 0;

	const lessonData = {
		...newLessonData.value,
		sortOrder: chapters.value[chapterIndex].lessons.length,
	};

	if (editingLessonIndex.value >= 0) {
		// 编辑现有课时
		chapters.value[chapterIndex].lessons[editingLessonIndex.value] = {
			...chapters.value[chapterIndex].lessons[editingLessonIndex.value],
			...lessonData,
		};
	} else {
		// 添加新课时
		chapters.value[chapterIndex].lessons.push({
			id: `l_${Date.now()}`,
			chapterId: chapters.value[chapterIndex].id,
			courseId: courseId || 'new',
			...lessonData,
			createdAt: new Date().toISOString(),
		} as Lesson);
	}

	showLessonModal.value = false;
}

// 删除课时
function handleDeleteLesson(chapterIndex: number, lessonIndex: number) {
	if (confirm('确定删除此时时吗？')) {
		chapters.value[chapterIndex].lessons.splice(lessonIndex, 1);
	}
}

// 上移/下移章节
function moveChapter(index: number, direction: 'up' | 'down') {
	const newIndex = direction === 'up' ? index - 1 : index + 1;
	if (newIndex < 0 || newIndex >= chapters.value.length) return;

	const temp = chapters.value[index];
	chapters.value[index] = chapters.value[newIndex];
	chapters.value[newIndex] = temp;
}

// 上移/下移课时
function moveLesson(chapterIndex: number, lessonIndex: number, direction: 'up' | 'down') {
	const lessons = chapters.value[chapterIndex].lessons;
	const newIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
	if (newIndex < 0 || newIndex >= lessons.length) return;

	const temp = lessons[lessonIndex];
	lessons[lessonIndex] = lessons[newIndex];
	lessons[newIndex] = temp;
}

// 保存课程
function handleSave() {
	// 验证
	if (!formData.value.title) {
		alert('请输入课程标题');
		return;
	}

	// TODO: 调用API保存
	alert('保存成功（演示）');
}

// 发布课程
function handlePublish() {
	formData.value.status = 'published';
	handleSave();
}

// 取消编辑
function handleCancel() {
	router.push('/portal/courses');
}

onMounted(() => {
	if (courseId) {
		loadCourseDetail();
	}
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 面包屑 -->
      <div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <button class="hover:text-blue-600" @click="handleCancel">课程中心</button>
        <span>/</span>
        <span class="text-gray-800">{{ isEditMode ? '编辑课程' : '新建课程' }}</span>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- 左侧：表单 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 基本信息 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-gray-800">基本信息</h2>

            <div class="space-y-4">
              <!-- 封面上传 -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  课程封面 <span class="text-red-500">*</span>
                </label>
                <div class="flex items-start gap-4">
                  <div class="relative h-40 w-64 overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      v-if="coverPreview"
                      :src="coverPreview"
                      alt="封面预览"
                      class="h-full w-full object-cover"
                    />
                    <div v-else class="flex h-full items-center justify-center">
                      <span class="text-gray-400">暂无封面</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      id="cover-upload"
                      @change="handleCoverUpload"
                    />
                    <label
                      for="cover-upload"
                      class="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      选择图片
                    </label>
                    <p class="mt-1 text-xs text-gray-500">支持 jpg、png 格式，建议尺寸 800x450</p>
                  </div>
                </div>
              </div>

              <!-- 标题 -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  课程标题 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  placeholder="请输入课程标题"
                  class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <!-- 简介 -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  课程简介 <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.description"
                  rows="4"
                  placeholder="请输入课程简介"
                  class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <!-- 分类 -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  课程分类 <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.categoryId"
                  class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="">请选择分类</option>
                  <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <!-- 价格 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700">
                    价格（元）
                  </label>
                  <input
                    v-model.number="formData.price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700">
                    原价（元）
                  </label>
                  <input
                    v-model.number="formData.originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <!-- 年龄和难度 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700">
                    适用年龄
                  </label>
                  <select
                    v-model="formData.ageRange"
                    class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option v-for="age in ageRangeOptions" :key="age" :value="age">
                      {{ age }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700">
                    难度级别
                  </label>
                  <select
                    v-model="formData.level"
                    class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option v-for="level in levelOptions" :key="level" :value="level">
                      {{ level }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 有效期 -->
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  有效期类型
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input
                      v-model="formData.validType"
                      type="radio"
                      value="permanent"
                      class="mr-2"
                    />
                    永久有效
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="formData.validType"
                      type="radio"
                      value="days"
                      class="mr-2"
                    />
                    按天数
                  </label>
                </div>
                <div v-if="formData.validType === 'days'" class="mt-2">
                  <input
                    v-model.number="formData.validDays"
                    type="number"
                    min="1"
                    placeholder="请输入天数"
                    class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 章节管理 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">章节管理</h2>
              <button
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                @click="handleAddChapter"
              >
                + 添加章节
              </button>
            </div>

            <div v-if="chapters.length === 0" class="py-8 text-center text-gray-500">
              暂无章节，请添加
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(chapter, chapterIndex) in chapters"
                :key="chapter.id"
                class="rounded-lg border border-gray-200"
              >
                <!-- 章节标题 -->
                <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span class="font-medium text-gray-800">第{{ chapterIndex + 1 }}章</span>
                    <span class="text-gray-700">{{ chapter.title }}</span>
                    <span class="text-sm text-gray-500">({{ chapter.lessons.length }}课时)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      class="text-sm text-gray-500 hover:text-blue-600"
                      @click="moveChapter(chapterIndex, 'up')"
                      :disabled="chapterIndex === 0"
                    >
                      ↑
                    </button>
                    <button
                      class="text-sm text-gray-500 hover:text-blue-600"
                      @click="moveChapter(chapterIndex, 'down')"
                      :disabled="chapterIndex === chapters.length - 1"
                    >
                      ↓
                    </button>
                    <button
                      class="text-sm text-blue-600 hover:underline"
                      @click="handleEditChapter(chapterIndex)"
                    >
                      编辑
                    </button>
                    <button
                      class="text-sm text-red-600 hover:underline"
                      @click="handleDeleteChapter(chapterIndex)"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <!-- 课时列表 -->
                <div class="divide-y divide-gray-100">
                  <div
                    v-for="(lesson, lessonIndex) in chapter.lessons"
                    :key="lesson.id"
                    class="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-gray-400">{{ lessonIndex + 1 }}.</span>
                      <span class="text-gray-700">{{ lesson.title }}</span>
                      <span class="text-xs text-gray-500">
                        {{ lesson.type === 'video' ? '🎬' : '' }}
                        {{ lesson.isTrial ? '试听' : '' }}
                        {{ lesson.isFree ? '免费' : '' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        class="text-sm text-gray-500 hover:text-blue-600"
                        @click="moveLesson(chapterIndex, lessonIndex, 'up')"
                        :disabled="lessonIndex === 0"
                      >
                        ↑
                      </button>
                      <button
                        class="text-sm text-gray-500 hover:text-blue-600"
                        @click="moveLesson(chapterIndex, lessonIndex, 'down')"
                        :disabled="lessonIndex === chapter.lessons.length - 1"
                      >
                        ↓
                      </button>
                      <button
                        class="text-sm text-blue-600 hover:underline"
                        @click="handleEditLesson(chapterIndex, lessonIndex)"
                      >
                        编辑
                      </button>
                      <button
                        class="text-sm text-red-600 hover:underline"
                        @click="handleDeleteLesson(chapterIndex, lessonIndex)"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <!-- 添加课时按钮 -->
                  <div class="px-4 py-3">
                    <button
                      class="text-sm text-blue-600 hover:underline"
                      @click="handleAddLesson(chapterIndex)"
                    >
                      + 添加课时
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：其他设置 -->
        <div class="space-y-6">
          <!-- 试听设置 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-gray-800">试听设置</h2>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                选择试听课
              </label>
              <select
                v-model="formData.trialLessonId"
                class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="">不设置试听</option>
                <template v-for="chapter in chapters" :key="chapter.id">
                  <option
                    v-for="lesson in chapter.lessons"
                    :key="lesson.id"
                    :value="lesson.id"
                  >
                    {{ chapter.title }} - {{ lesson.title }}
                  </option>
                </template>
              </select>
              <p class="mt-1 text-xs text-gray-500">设置后学员可免费观看此课时</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="rounded-lg bg-white p-6 shadow-sm">
            <div class="space-y-3">
              <button
                class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                @click="handleCancel"
              >
                取消
              </button>
              <button
                class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                @click="handleSave"
              >
                保存草稿
              </button>
              <button
                class="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                @click="handlePublish"
              >
                发布课程
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 章节编辑弹窗 -->
    <div
      v-if="showChapterModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ editingChapterIndex >= 0 ? '编辑章节' : '添加章节' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              章节标题 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="newChapterData.title"
              type="text"
              placeholder="请输入章节标题"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              章节描述
            </label>
            <textarea
              v-model="newChapterData.description"
              rows="3"
              placeholder="请输入章节描述（可选）"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            ></textarea>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            @click="showChapterModal = false"
          >
            取消
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="handleSaveChapter"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 课时编辑弹窗 -->
    <div
      v-if="showLessonModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ editingLessonIndex >= 0 ? '编辑课时' : '添加课时' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              课时标题 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="newLessonData.title"
              type="text"
              placeholder="请输入课时标题"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              课时类型 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input
                  v-model="newLessonData.type"
                  type="radio"
                  value="video"
                  class="mr-2"
                />
                视频
              </label>
              <label class="flex items-center">
                <input
                  v-model="newLessonData.type"
                  type="radio"
                  value="audio"
                  class="mr-2"
                />
                音频
              </label>
              <label class="flex items-center">
                <input
                  v-model="newLessonData.type"
                  type="radio"
                  value="document"
                  class="mr-2"
                />
                文档
              </label>
              <label class="flex items-center">
                <input
                  v-model="newLessonData.type"
                  type="radio"
                  value="text"
                  class="mr-2"
                />
                图文
              </label>
            </div>
          </div>

          <div v-if="newLessonData.type === 'video' || newLessonData.type === 'audio'">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              {{ newLessonData.type === 'video' ? '视频' : '音频' }}URL
            </label>
            <input
              v-model="newLessonData.videoUrl"
              type="text"
              placeholder="请输入URL或从视频库选择"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div v-if="newLessonData.type === 'document'">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              上传文档
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              class="w-full text-sm text-gray-500"
            />
          </div>

          <div v-if="newLessonData.type === 'text'">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              图文内容
            </label>
            <textarea
              v-model="newLessonData.content"
              rows="6"
              placeholder="请输入图文内容"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              时长（秒）
            </label>
            <input
              v-model.number="newLessonData.videoDuration"
              type="number"
              min="0"
              placeholder="0"
              class="w-full rounded-lg border border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div class="flex gap-6">
            <label class="flex items-center">
              <input
                v-model="newLessonData.isTrial"
                type="checkbox"
                class="mr-2"
              />
              设为试听课
            </label>
            <label class="flex items-center">
              <input
                v-model="newLessonData.isFree"
                type="checkbox"
                class="mr-2"
              />
              免费观看
            </label>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            @click="showLessonModal = false"
          >
            取消
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="handleSaveLesson"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
