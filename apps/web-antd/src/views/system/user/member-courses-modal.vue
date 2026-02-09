<script setup lang="ts">
import type { Course } from '#/api/course/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Image, Tag } from 'ant-design-vue';

interface Props {
  userId?: number;
  userName?: string;
}

const props = defineProps<Props>();

const [Modal, modalApi] = useVbenModal({
  title: '会员已购课程',
  fullscreen: false,
  width: 800,
  onOpened: () => {
    loadUserCourses();
  },
});

// 模拟用户已购课程数据
const userCourses = ref<Course[]>([]);
const loading = ref(false);

// 计算会员等级
const memberLevel = computed(() => {
  // 模拟根据用户ID返回会员等级
  const levels = ['注册用户', 'VIP会员', 'SVIP会员'];
  return levels[(props.userId || 1) % 3];
});

// 计算会员状态颜色
const memberLevelColor = computed(() => {
  const colors: Record<string, string> = {
    注册用户: 'default',
    VIP会员: 'blue',
    SVIP会员: 'gold',
  };
  return colors[memberLevel.value] || 'default';
});

// 加载用户已购课程
async function loadUserCourses() {
  loading.value = true;
  // 模拟加载
  setTimeout(() => {
    userCourses.value = [
      {
        courseId: 1,
        courseName: 'Vue3 从入门到精通',
        courseCover: 'https://picsum.photos/seed/vue/200/120',
        courseIntro: '本课程全面讲解Vue3的核心概念和实战技巧',
        price: 199,
        originalPrice: 299,
        isFree: false,
        status: 'published',
        sortOrder: 1,
        viewCount: 125,
        enrollCount: 86,
        createTime: '2025-01-15 10:00:00',
        // 学习进度
        progress: 75,
      },
      {
        courseId: 2,
        courseName: 'React 实战开发',
        courseCover: 'https://picsum.photos/seed/react/200/120',
        courseIntro: '深入React生态系统，掌握现代前端开发',
        price: 299,
        originalPrice: 399,
        isFree: false,
        status: 'published',
        sortOrder: 2,
        viewCount: 89,
        enrollCount: 52,
        createTime: '2025-01-20 14:30:00',
        progress: 30,
      },
    ];
    loading.value = false;
  }, 500);
}

// 暴露方法
defineExpose({
  open: (userId: number, userName: string) => {
    modalApi.setData({ userId, userName });
    modalApi.open();
  },
});
</script>

<template>
  <Modal>
    <div class="space-y-6">
      <!-- 会员信息 -->
      <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <div class="text-lg font-semibold">{{ props.userName }}</div>
          <div class="mt-1 text-gray-500">用户ID: {{ props.userId }}</div>
        </div>
        <div>
          <Tag :color="memberLevelColor" class="px-4 py-1 text-lg">
            {{ memberLevel }}
          </Tag>
        </div>
      </div>

      <!-- 课程列表 -->
      <a-spin :spinning="loading">
        <div v-if="userCourses.length > 0" class="space-y-4">
          <div
            v-for="course in userCourses"
            :key="course.courseId"
            class="flex gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm"
          >
            <Image
              :src="course.courseCover"
              :width="120"
              :height="80"
              fit="cover"
              class="rounded"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800">
                {{ course.courseName }}
              </h3>
              <p class="mt-1 line-clamp-2 text-sm text-gray-500">
                {{ course.courseIntro }}
              </p>
              <div class="mt-3 flex items-center gap-4">
                <div class="flex-1">
                  <div class="mb-1 text-xs text-gray-500">学习进度</div>
                  <a-progress
                    :percent="course.progress || 0"
                    size="small"
                    :stroke-color="
                      course.progress === 100 ? '#52c41a' : undefined
                    "
                  />
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">购买价格</div>
                  <div class="font-bold text-red-500">
                    {{ course.isFree ? '免费' : `¥${course.price}` }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a-empty v-else description="该用户暂无已购课程" class="py-8" />
      </a-spin>

      <!-- 统计信息 -->
      <div
        v-if="userCourses.length > 0"
        class="grid grid-cols-3 gap-4 border-t pt-4"
      >
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ userCourses.length }}
          </div>
          <div class="text-sm text-gray-500">已购课程</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ userCourses.filter((c) => c.progress === 100).length }}
          </div>
          <div class="text-sm text-gray-500">已完成</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {{
              Math.round(
                userCourses.reduce((sum, c) => sum + (c.progress || 0), 0) /
                  userCourses.length,
              )
            }}%
          </div>
          <div class="text-sm text-gray-500">平均进度</div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
