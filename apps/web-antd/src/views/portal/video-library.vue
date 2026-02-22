<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// 视频数据
interface VideoItem {
	id: string;
	title: string;
	description: string;
	videoUrl: string;
	videoSource: 'local' | 'aliyun' | 'tencent' | 'polyv';
	duration: number;
	size: number;
	format: string;
	coverImage?: string;
	categoryId?: string;
	createdAt: string;
}

const router = useRouter();

// 视频列表
const videoList = ref<VideoItem[]>([]);
const loading = ref(false);

// 筛选条件
const searchKeyword = ref('');
const selectedCategory = ref('all');
const selectedSource = ref('all');

// 上传弹窗
const showUploadModal = ref(false);
const uploading = ref(false);

// 上传表单
const uploadForm = ref({
	title: '',
	description: '',
	videoUrl: '',
	videoSource: 'local' as 'local' | 'aliyun' | 'tencent' | 'polyv',
	category: '',
});

// 分类列表
const categories = [
	{ id: 'cat1', name: '编程' },
	{ id: 'cat2', name: '美术' },
	{ id: 'cat3', name: '音乐' },
];

// 加载视频列表
function loadVideos() {
	loading.value = true;
	setTimeout(() => {
		// 模拟数据
		videoList.value = [
			{
				id: 'v1',
				title: 'Python安装教程',
				description: 'Python 3.12版本安装步骤详解',
				videoUrl: 'https://example.com/video/v1.mp4',
				videoSource: 'local',
				duration: 930,
				size: 157286400,
				format: 'mp4',
				coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
				categoryId: 'cat1',
				createdAt: '2025-02-20',
			},
			{
				id: 'v2',
				title: '色彩理论基础',
				description: '色彩搭配与运用技巧',
				videoUrl: 'https://example.com/video/v2.mp4',
				videoSource: 'aliyun',
				duration: 1260,
				size: 209715200,
				format: 'mp4',
				coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
				categoryId: 'cat2',
				createdAt: '2025-02-18',
			},
			{
				id: 'v3',
				title: '钢琴指法练习',
				description: '基础指法与练习方法',
				videoUrl: 'https://example.com/video/v3.mp4',
				videoSource: 'tencent',
				duration: 840,
				size: 136314880,
				format: 'mp4',
				coverImage: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=400',
				categoryId: 'cat3',
				createdAt: '2025-02-15',
			},
		];
		loading.value = false;
	}, 300);
}

// 过滤视频列表
const filteredVideos = computed(() => {
	return videoList.value.filter((video) => {
		const matchKeyword =
			!searchKeyword.value ||
			video.title.toLowerCase().includes(searchKeyword.value.toLowerCase());
		const matchCategory =
			selectedCategory.value === 'all' || video.categoryId === selectedCategory.value;
		const matchSource =
			selectedSource.value === 'all' || video.videoSource === selectedSource.value;
		return matchKeyword && matchCategory && matchSource;
	});
});

// 格式化文件大小
function formatFileSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	if (mb >= 1024) {
		return `${(mb / 1024).toFixed(2)}GB`;
	}
	return `${mb.toFixed(2)}MB`;
}

// 格式化时长
function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	if (minutes >= 60) {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
	return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// 打开上传弹窗
function openUploadModal() {
	uploadForm.value = {
		title: '',
		description: '',
		videoUrl: '',
		videoSource: 'local',
		category: '',
	};
	showUploadModal.value = true;
}

// 处理文件上传
function handleFileUpload(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) return;

	uploading.value = true;

	// 模拟上传
	setTimeout(() => {
		uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '');
		uploadForm.value.videoUrl = URL.createObjectURL(file);
		uploading.value = false;
	}, 1000);
}

// 保存视频
function handleSaveVideo() {
	if (!uploadForm.value.title) {
		alert('请输入视频标题');
		return;
	}

	// 模拟保存
	const newVideo: VideoItem = {
		id: `v_${Date.now()}`,
		...uploadForm.value,
		duration: Math.floor(Math.random() * 3600),
		size: Math.floor(Math.random() * 500 * 1024 * 1024),
		format: 'mp4',
		createdAt: new Date().toISOString().split('T')[0],
	};

	videoList.value.unshift(newVideo);
	showUploadModal.value = false;
	alert('上传成功');
}

// 删除视频
function handleDeleteVideo(id: string) {
	if (confirm('确定删除此视频吗？')) {
		videoList.value = videoList.value.filter((v) => v.id !== id);
	}
}

// 选择视频（用于课程添加）
function handleSelectVideo(video: VideoItem) {
	// 将选中的视频URL复制到剪贴板
	navigator.clipboard.writeText(video.videoUrl);
	alert('视频链接已复制，可在课程编辑时粘贴使用');
}

onMounted(() => {
	loadVideos();
});
</script>

<template>
  <div class="video-library-page min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">视频库管理</h1>
          <p class="mt-1 text-gray-600">管理您的视频资源，方便添加课程时选择</p>
        </div>
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="openUploadModal"
        >
          + 上传视频
        </button>
      </div>

      <!-- 筛选搜索 -->
      <div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <!-- 搜索框 -->
          <div>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索视频标题..."
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <!-- 分类筛选 -->
          <div>
            <select
              v-model="selectedCategory"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">全部分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- 视频来源筛选 -->
          <div>
            <select
              v-model="selectedSource"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">全部来源</option>
              <option value="local">本地上传</option>
              <option value="aliyun">阿里云OSS</option>
              <option value="tencent">腾讯云</option>
              <option value="polyv">保利威</option>
            </select>
          </div>

          <!-- 统计信息 -->
          <div class="flex items-center justify-center text-sm text-gray-600">
            共 <span class="font-semibold text-blue-600">{{ filteredVideos.length }}</span> 个视频
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
      </div>

      <!-- 视频列表 -->
      <div v-else>
        <div
          v-if="filteredVideos.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="video in filteredVideos"
            :key="video.id"
            class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <!-- 视频封面 -->
            <div class="relative group cursor-pointer" @click="handleSelectVideo(video)">
              <img
                :src="video.coverImage || 'https://via.placeholder.com/400x225'"
                :alt="video.title"
                class="h-40 w-full object-cover"
              />
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-40">
                <div class="text-4xl text-white opacity-0 transition-opacity group-hover:opacity-100">
                  ▶
                </div>
              </div>
              <!-- 视频时长 -->
              <div class="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
                {{ formatDuration(video.duration) }}
              </div>
              <!-- 视频来源标签 -->
              <div class="absolute left-2 top-2 rounded px-2 py-1 text-xs text-white"
                   :class="video.videoSource === 'local' ? 'bg-blue-600' : 'bg-green-600'">
                {{ video.videoSource === 'local' ? '本地' : video.videoSource === 'aliyun' ? '阿里云' : video.videoSource === 'tencent' ? '腾讯云' : '保利威' }}
              </div>
            </div>

            <!-- 视频信息 -->
            <div class="p-4">
              <h3 class="mb-1 truncate text-sm font-medium text-gray-800">
                {{ video.title }}
              </h3>
              <p class="mb-3 text-xs text-gray-500 line-clamp-2">
                {{ video.description }}
              </p>

              <!-- 视频信息 -->
              <div class="mb-3 space-y-1 text-xs text-gray-500">
                <div class="flex items-center justify-between">
                  <span>大小</span>
                  <span>{{ formatFileSize(video.size) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>格式</span>
                  <span>{{ video.format.toUpperCase() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>上传时间</span>
                  <span>{{ video.createdAt }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2">
                <button
                  class="flex-1 rounded-lg border border-blue-600 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
                  @click.stop="handleSelectVideo(video)"
                >
                  复制链接
                </button>
                <button
                  class="flex-1 rounded-lg border border-red-500 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  @click.stop="handleDeleteVideo(video.id)"
                >
                  删除
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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p class="mt-4 text-gray-500">暂无视频</p>
          <button
            class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            @click="openUploadModal"
          >
            立即上传
          </button>
        </div>
      </div>
    </div>

    <!-- 上传视频弹窗 -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">上传视频</h3>

        <div class="space-y-4">
          <!-- 视频文件 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              视频文件 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                type="file"
                accept="video/*"
                class="flex-1 text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                @change="handleFileUpload"
              />
              <span
                v-if="uploading"
                class="flex items-center text-sm text-blue-600"
              >
                上传中...
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-500">支持 mp4、avi、mov 等格式，单个文件最大 2GB</p>
          </div>

          <!-- 视频标题 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              视频标题 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="uploadForm.title"
              type="text"
              placeholder="请输入视频标题"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <!-- 视频描述 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              视频描述
            </label>
            <textarea
              v-model="uploadForm.description"
              rows="3"
              placeholder="请输入视频描述"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            ></textarea>
          </div>

          <!-- 第三方视频链接 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              或使用第三方云视频
            </label>
            <div class="space-y-2">
              <select
                v-model="uploadForm.videoSource"
                class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="local">本地上传</option>
                <option value="aliyun">阿里云OSS</option>
                <option value="tencent">腾讯云</option>
                <option value="polyv">保利威</option>
              </select>
              <input
                v-if="uploadForm.videoSource !== 'local'"
                v-model="uploadForm.videoUrl"
                type="text"
                placeholder="请输入第三方视频链接"
                class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <!-- 分类 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              分类
            </label>
            <select
              v-model="uploadForm.category"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            @click="showUploadModal = false"
          >
            取消
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            @click="handleSaveVideo"
          >
            确认上传
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
