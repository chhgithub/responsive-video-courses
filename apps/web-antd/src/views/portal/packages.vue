<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// 课程套餐数据
interface CoursePackage {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	courseIds: string[];
	price: number;
	originalPrice: number;
	validDays: number;
	status: 'draft' | 'published' | 'offline';
	createdAt: string;
}

const router = useRouter();

// 套餐列表
const packages = ref<CoursePackage[]>([]);
const loading = ref(false);

// 加载套餐列表
function loadPackages() {
	loading.value = true;
	setTimeout(() => {
		packages.value = [
			{
				id: 'p1',
				title: 'Python全栈开发套餐',
				description: '从入门到精通，包含Python基础、Web开发、数据分析三门课程',
				coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
				courseIds: ['c1'],
				price: 49900,
				originalPrice: 89700,
				validDays: 365,
				status: 'published',
				createdAt: '2025-01-25',
			},
		];
		loading.value = false;
	}, 300);
}

// 创建新套餐
function handleCreate() {
	router.push('/portal/packages/create');
}

// 编辑套餐
function handleEdit(id: string) {
	router.push(`/portal/packages/${id}/edit`);
}

// 删除套餐
function handleDelete(id: string) {
	if (confirm('确定删除此套餐吗？')) {
		packages.value = packages.value.filter((p) => p.id !== id);
	}
}

// 切换状态
function toggleStatus(id: string) {
	const pkg = packages.value.find((p) => p.id === id);
	if (pkg) {
		pkg.status = pkg.status === 'published' ? 'offline' : 'published';
	}
}

onMounted(() => {
	loadPackages();
});
</script>

<template>
  <div class="packages-page min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">课程套餐管理</h1>
          <p class="mt-1 text-gray-600">将多个课程组合成套餐，提供优惠价格</p>
        </div>
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="handleCreate"
        >
          + 新建套餐
        </button>
      </div>

      <!-- 套餐列表 -->
      <div v-if="loading" class="py-16 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        ></div>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <!-- 套餐封面 -->
          <div class="relative h-48">
            <img
              :src="pkg.coverImage"
              :alt="pkg.title"
              class="h-full w-full object-cover"
            />
            <div
              class="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium"
              :class="pkg.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'"
            >
              {{ pkg.status === 'published' ? '已上架' : '已下架' }}
            </div>
          </div>

          <!-- 套餐信息 -->
          <div class="p-4">
            <h3 class="mb-2 text-lg font-semibold text-gray-800">
              {{ pkg.title }}
            </h3>
            <p class="mb-3 text-sm text-gray-600 line-clamp-2">
              {{ pkg.description }}
            </p>

            <!-- 包含课程 -->
            <div class="mb-3">
              <p class="text-xs text-gray-500 mb-1">包含课程：</p>
              <div class="flex flex-wrap gap-1">
                <span class="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                  {{ pkg.courseIds.length }} 门课程
                </span>
              </div>
            </div>

            <!-- 价格 -->
            <div class="mb-3">
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-bold text-red-500">
                  ¥{{ (pkg.price / 100).toFixed(0) }}
                </span>
                <span class="text-sm text-gray-400 line-through">
                  ¥{{ (pkg.originalPrice / 100).toFixed(0) }}
                </span>
              </div>
              <p class="text-xs text-gray-500">
                有效期：{{ pkg.validDays }}天
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                class="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                @click="handleEdit(pkg.id)"
              >
                编辑
              </button>
              <button
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                @click="toggleStatus(pkg.id)"
              >
                {{ pkg.status === 'published' ? '下架' : '上架' }}
              </button>
              <button
                class="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                @click="handleDelete(pkg.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="packages.length === 0"
          class="col-span-full py-16 text-center"
        >
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
              d="M20 7l-8-4m8 4l-8 4m8-4v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-4h.01"
            />
          </svg>
          <p class="mt-4 text-gray-500">暂无套餐</p>
        </div>
      </div>
    </div>
  </div>
</template>
