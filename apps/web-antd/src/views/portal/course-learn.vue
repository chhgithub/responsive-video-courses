<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

import {
	mockCourses,
	type Course,
	type Chapter,
	type Lesson,
} from '#/mock/course-center';

const route = useRoute();
const router = useRouter();

// 课程ID和课时ID
const courseId = route.params.id as string;
const lessonId = route.query.lessonId as string;

// 课程数据
const course = ref<Course | null>(null);
const loading = ref(true);

// 当前章节和课时
const currentChapter = ref<Chapter | null>(null);
const currentLesson = ref<Lesson | null>(null);

// 当前播放位置（秒）
const currentTime = ref(0);
// 视频总时长（秒）
const duration = ref(0);
// 播放状态
const isPlaying = ref(false);

// 章节展开状态
const expandedChapters = ref<Set<string>>(new Set());

// Tab
const activeTab = ref('catalog');

// 笔记内容
const noteContent = ref('');

// ========== 讨论功能 ==========
// 讨论数据类型
interface Discussion {
	id: string;
	courseId: string;
	lessonId?: string;
	userId: string;
	userName: string;
	userAvatar: string;
	content: string;
	createdAt: string;
	replies?: Discussion[];
}

// 讨论列表
const discussions = ref<Discussion[]>([]);
// 发表讨论弹窗显示状态
const showDiscussionModal = ref(false);
// 新讨论内容
const newDiscussionContent = ref('');

// 获取当前登录用户
function getCurrentUser() {
	try {
		const state = localStorage.getItem('portal_login_state');
		if (!state) return null;
		const loginState = JSON.parse(state);
		return loginState.user;
	} catch {
		return null;
	}
}

// 保存讨论到 localStorage
function saveDiscussions() {
	const key = `discussions_${courseId}`;
	localStorage.setItem(key, JSON.stringify(discussions.value));
}

// 加载讨论列表
function loadDiscussions() {
	const key = `discussions_${courseId}`;
	const data = localStorage.getItem(key);
	if (data) {
		try {
			discussions.value = JSON.parse(data);
		} catch {
			discussions.value = [];
		}
	}
}

// 打开发表讨论弹窗
function openDiscussionModal() {
	console.log('=== openDiscussionModal 被调用 ===');
	const user = getCurrentUser();
	console.log('当前用户:', user);
	if (!user) {
		console.log('用户未登录，跳转到登录页');
		message.warning('请先登录');
		router.push('/portal/login');
		return;
	}
	console.log('用户已登录，准备打开弹窗');
	newDiscussionContent.value = '';
	showDiscussionModal.value = true;
	console.log('弹窗状态已设置为:', showDiscussionModal.value);
}

// 提交讨论
function submitDiscussion() {
	if (!newDiscussionContent.value.trim()) {
		message.warning('请输入讨论内容');
		return;
	}

	const user = getCurrentUser();
	if (!user) {
		message.warning('请先登录');
		return;
	}

	const newDiscussion: Discussion = {
		id: `d_${Date.now()}`,
		courseId: courseId,
		lessonId: currentLesson.value?.id,
		userId: user.id,
		userName: user.nickname || user.username || '学员',
		userAvatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
		content: newDiscussionContent.value.trim(),
		createdAt: new Date().toLocaleString('zh-CN'),
	};

	discussions.value.unshift(newDiscussion);
	saveDiscussions();
	showDiscussionModal.value = false;
	message.success('发表成功');
}

// 格式化时间显示
function formatTime(timeStr: string): string {
	const date = new Date(timeStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return '刚刚';
	if (minutes < 60) return `${minutes}分钟前`;
	if (hours < 24) return `${hours}小时前`;
	if (days < 7) return `${days}天前`;
	return timeStr.split(' ')[0];
}

// 加载课程详情
function loadCourseDetail() {
	loading.value = true;
	setTimeout(() => {
		const found = mockCourses.find((c) => c.id === courseId);
		if (found) {
			course.value = found;
			// 默认展开所有章节
			course.value.chapters.forEach((chapter) => {
				expandedChapters.value.add(chapter.id);
			});
			// 如果有lessonId，定位到对应课时
			if (lessonId) {
				findAndSetLesson(lessonId);
			} else if (course.value.chapters.length > 0 && course.value.chapters[0].lessons.length > 0) {
				// 默认选择第一章第一课
				setCurrentLesson(course.value.chapters[0].lessons[0]);
			}
		}
		loading.value = false;
	}, 300);
}

// 查找并设置课时
function findAndSetLesson(id: string) {
	if (!course.value) return;
	for (const chapter of course.value.chapters) {
		const lesson = chapter.lessons.find((l) => l.id === id);
		if (lesson) {
			setCurrentLesson(lesson);
			return;
		}
	}
}

// 设置当前课时
function setCurrentLesson(lesson: Lesson) {
	currentLesson.value = lesson;
	if (!course.value) return;
	currentChapter.value = course.value.chapters.find((c) => c.id === lesson.chapterId) || null;
}

// 切换章节展开状态
function toggleChapter(chapterId: string) {
	if (expandedChapters.value.has(chapterId)) {
		expandedChapters.value.delete(chapterId);
	} else {
		expandedChapters.value.add(chapterId);
	}
}

// 播放上一节
function playPrevLesson() {
	if (!course.value || !currentLesson.value) return;
	const allLessons = course.value.chapters.flatMap((ch) => ch.lessons);
	const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.value?.id);
	if (currentIndex > 0) {
		setCurrentLesson(allLessons[currentIndex - 1]);
	}
}

// 播放下一节
function playNextLesson() {
	if (!course.value || !currentLesson.value) return;
	const allLessons = course.value.chapters.flatMap((ch) => ch.lessons);
	const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.value?.id);
	if (currentIndex < allLessons.length - 1) {
		setCurrentLesson(allLessons[currentIndex + 1]);
	}
}

// 检查是否有上一节
const hasPrevLesson = computed(() => {
	if (!course.value || !currentLesson.value) return false;
	const allLessons = course.value.chapters.flatMap((ch) => ch.lessons);
	const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.value?.id);
	return currentIndex > 0;
});

// 检查是否有下一节
const hasNextLesson = computed(() => {
	if (!course.value || !currentLesson.value) return false;
	const allLessons = course.value.chapters.flatMap((ch) => ch.lessons);
	const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.value?.id);
	return currentIndex < allLessons.length - 1;
});

// 格式化时长
function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);
	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
	return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// 计算课程进度
const courseProgress = computed(() => {
	if (!course.value) return 0;
	const totalLessons = course.value.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
	// 假设已完成3课时
	return Math.floor((3 / totalLessons) * 100);
});

// 返回课程列表
function handleBack() {
	router.push('/portal/courses');
}

onMounted(() => {
	loadCourseDetail();
	loadDiscussions();
});
</script>

<template>
  <div v-if="loading" class="flex min-h-screen items-center justify-center">
    <div
      class="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
    ></div>
  </div>

  <div v-else-if="!course" class="min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <div class="rounded-lg bg-white p-12 text-center shadow-sm">
        <p class="text-gray-500">课程不存在</p>
        <button
          class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          @click="handleBack"
        >
          返回课程列表
        </button>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6">
      <!-- 面包屑 -->
      <div class="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <button class="hover:text-blue-600" @click="handleBack">课程中心</button>
        <span>/</span>
        <span class="text-gray-800">{{ course.title }}</span>
        <span>/</span>
        <span class="text-gray-800">{{ currentLesson?.title }}</span>
      </div>

      <!-- 主内容区 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- 左侧：视频播放区 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 视频播放器 -->
          <div class="rounded-lg bg-black shadow-lg">
            <div class="aspect-video flex items-center justify-center bg-gray-900">
              <!-- 模拟视频播放器 -->
              <div class="text-center text-white">
                <div class="mb-4 text-6xl">▶️</div>
                <p class="text-lg">{{ currentLesson?.title }}</p>
                <p class="mt-2 text-sm text-gray-400">视频播放器占位</p>
              </div>
            </div>

            <!-- 播放控制条 -->
            <div class="bg-gray-800 px-4 py-3">
              <div class="mb-2 flex items-center gap-3">
                <button
                  class="text-white hover:text-blue-400"
                  @click="isPlaying = !isPlaying"
                >
                  {{ isPlaying ? '⏸' : '▶️' }}
                </button>
                <div class="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500"
                    :style="{ width: (currentTime / duration * 100) + '%' }"
                  ></div>
                </div>
                <span class="text-sm text-gray-300">
                  {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
                </span>
                <button class="text-white hover:text-blue-400">🔊</button>
                <button class="text-white hover:text-blue-400">⛶</button>
              </div>
            </div>
          </div>

          <!-- 课时切换按钮 -->
          <div class="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
            <button
              :disabled="!hasPrevLesson"
              class="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              @click="playPrevLesson"
            >
              ⏮ 上一节
            </button>
            <div class="text-center">
              <p class="text-sm text-gray-500">学习进度</p>
              <p class="text-lg font-medium text-blue-600">{{ courseProgress }}%</p>
            </div>
            <button
              :disabled="!hasNextLesson"
              class="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              @click="playNextLesson"
            >
              下一节 ⏭
            </button>
          </div>

          <!-- Tab内容 -->
          <div class="rounded-lg bg-white shadow-sm">
            <!-- Tab切换 -->
            <div class="flex border-b border-gray-200">
              <button
                class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
                :class="
                  activeTab === 'catalog'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                "
                @click="activeTab = 'catalog'"
              >
                📚 课程目录
              </button>
              <button
                class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
                :class="
                  activeTab === 'discussion'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                "
                @click="activeTab = 'discussion'"
              >
                💬 课程讨论
              </button>
              <button
                class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
                :class="
                  activeTab === 'notes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                "
                @click="activeTab = 'notes'"
              >
                📝 课程笔记
              </button>
            </div>

            <!-- 课程目录 -->
            <div v-if="activeTab === 'catalog'" class="p-4">
              <div class="space-y-3">
                <div
                  v-for="chapter in course.chapters"
                  :key="chapter.id"
                  class="rounded-lg border border-gray-200"
                >
                  <!-- 章节标题 -->
                  <div
                    class="flex cursor-pointer items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3"
                    @click="toggleChapter(chapter.id)"
                  >
                    <h3 class="font-medium text-gray-800">
                      {{ chapter.title }}
                    </h3>
                    <svg
                      class="h-4 w-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': expandedChapters.has(chapter.id) }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <!-- 课时列表 -->
                  <div
                    v-show="expandedChapters.has(chapter.id)"
                    class="divide-y divide-gray-100"
                  >
                    <div
                      v-for="lesson in chapter.lessons"
                      :key="lesson.id"
                      class="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-blue-50"
                      :class="{
                        'bg-blue-50': currentLesson?.id === lesson.id,
                      }"
                      @click="setCurrentLesson(lesson)"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-lg">
                          {{
                            lesson.type === 'video'
                              ? '🎬'
                              : lesson.type === 'audio'
                                ? '🎵'
                                : lesson.type === 'document'
                                  ? '📄'
                                  : '📝'
                          }}
                        </span>
                        <div>
                          <p class="font-medium text-gray-800">{{ lesson.title }}</p>
                          <p class="text-xs text-gray-500">
                            <span v-if="lesson.videoDuration">
                              {{ formatDuration(lesson.videoDuration) }}
                            </span>
                            <span v-if="lesson.isTrial" class="ml-2 text-green-600">
                              🔊 试听
                            </span>
                          </p>
                        </div>
                      </div>
                      <div class="text-sm">
                        <span
                          v-if="currentLesson?.id === lesson.id"
                          class="text-blue-600"
                        >
                          播放中
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 课程讨论 -->
            <div v-if="activeTab === 'discussion'" class="p-4">
              <div class="mb-4">
                <button
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  @click="openDiscussionModal"
                >
                  发表讨论
                </button>
              </div>

              <!-- 讨论列表 -->
              <div v-if="discussions.length > 0" class="space-y-4">
                <div
                  v-for="discussion in discussions"
                  :key="discussion.id"
                  class="border-b border-gray-100 pb-4"
                  :class="{ 'pb-4': discussions.indexOf(discussion) < discussions.length - 1 }"
                >
                  <div class="mb-2 flex items-center gap-3">
                    <img
                      :src="discussion.userAvatar"
                      alt=""
                      class="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ discussion.userName }}</p>
                      <p class="text-xs text-gray-500">{{ formatTime(discussion.createdAt) }}</p>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600">{{ discussion.content }}</p>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="py-8 text-center text-gray-500">
                <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="mt-2 text-sm">还没有讨论，快来发表第一条吧！</p>
              </div>
            </div>

            <!-- 课程笔记 -->
            <div v-if="activeTab === 'notes'" class="p-4">
              <div class="mb-4">
                <textarea
                  v-model="noteContent"
                  class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  rows="6"
                  placeholder="记录学习笔记..."
                ></textarea>
                <button
                  class="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  保存笔记
                </button>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <p class="mb-3 text-sm font-medium text-gray-700">我的笔记</p>
                <div class="space-y-3">
                  <div class="rounded-lg bg-gray-50 p-3">
                    <p class="mb-2 text-xs text-gray-500">2025-02-20 14:30</p>
                    <p class="text-sm text-gray-600">Python安装需要注意添加到环境变量...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：课程信息 -->
        <div class="space-y-6">
          <!-- 当前课时信息 -->
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <h3 class="mb-2 text-lg font-semibold text-gray-800">
              {{ currentChapter?.title }}
            </h3>
            <p class="text-sm text-gray-600">{{ currentLesson?.title }}</p>
            <div class="mt-3 text-xs text-gray-500">
              <span v-if="currentLesson?.videoDuration">
                时长：{{ formatDuration(currentLesson.videoDuration || 0) }}
              </span>
            </div>
          </div>

          <!-- 课程介绍 -->
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <h3 class="mb-3 font-semibold text-gray-800">课程介绍</h3>
            <p class="text-sm text-gray-600 line-clamp-3">
              {{ course.description }}
            </p>
            <button
              class="mt-2 text-sm text-blue-600 hover:underline"
              @click="router.push(`/portal/course-detail/${courseId}`)"
            >
              查看完整介绍 →
            </button>
          </div>

          <!-- 讲师信息 -->
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <h3 class="mb-3 font-semibold text-gray-800">讲师</h3>
            <div class="flex items-center gap-3">
              <img
                :src="course.teacher.avatar"
                alt=""
                class="h-12 w-12 rounded-full"
              />
              <div>
                <p class="font-medium text-gray-800">{{ course.teacher.name }}</p>
                <p class="text-xs text-gray-500">{{ course.teacher.bio }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发表讨论弹窗 -->
    <a-modal
      v-model:open="showDiscussionModal"
      title="发表讨论"
      :ok-text="'发表'"
      :cancel-text="'取消'"
      @ok="submitDiscussion"
    >
      <div class="py-4">
        <a-textarea
          v-model:value="newDiscussionContent"
          :rows="6"
          placeholder="请输入您的讨论内容..."
          :max-length="500"
          show-count
        />
      </div>
    </a-modal>
  </div>
</template>
