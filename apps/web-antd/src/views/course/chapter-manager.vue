<script setup lang="ts">
import type { CourseChapter } from '#/api/course/model';

import { computed, ref, watch } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { chapterAdd, chapterRemove } from '#/api/course';

interface Props {
  courseId: number;
  chapters: CourseChapter[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  reload: [];
}>();

const expandedKeys = ref<number[]>([]);
const selectedKeys = ref<number[]>([]);

const chapterTree = computed(() => {
  return props.chapters.map((chapter) => ({
    key: chapter.chapterId,
    title: chapter.chapterName,
    ...chapter,
  }));
});

// 展开所有章节
watch(
  () => props.chapters,
  (chapters) => {
    expandedKeys.value = chapters.map((c) => c.chapterId);
  },
  { immediate: true },
);

function handleAddChapter() {
  Modal.confirm({
    title: '添加章节',
    content: '请输入章节名称',
    input: true,
    inputPlaceholder: '章节名称',
    onOk: async (chapterName: string) => {
      if (!chapterName?.trim()) {
        message.warning('请输入章节名称');
        return;
      }
      try {
        await chapterAdd({
          courseId: props.courseId,
          chapterName: chapterName.trim(),
          chapterType: 'video',
          videoUrl: '',
          duration: 0,
          isFree: false,
          sortOrder: props.chapters.length + 1,
        });
        message.success('添加成功');
        emit('reload');
      } catch {
        message.error('添加失败');
      }
    },
  });
}

async function handleDeleteChapter(chapterId: number) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该章节吗？',
    onOk: async () => {
      try {
        await chapterRemove([chapterId]);
        message.success('删除成功');
        emit('reload');
      } catch {
        message.error('删除失败');
      }
    },
  });
}

async function handleToggleFree(chapter: CourseChapter) {
  try {
    await chapterAdd({
      ...chapter,
      isFree: !chapter.isFree,
    });
    message.success('更新成功');
    emit('reload');
  } catch {
    message.error('更新失败');
  }
}
</script>

<template>
  <div class="chapter-manager">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold">章节管理</h3>
      <a-button type="primary" size="small" @click="handleAddChapter">
        添加章节
      </a-button>
    </div>

    <div class="space-y-2">
      <div
        v-for="chapter in chapters"
        :key="chapter.chapterId"
        class="flex items-center justify-between rounded-lg border bg-white p-3 transition-shadow hover:shadow-sm"
      >
        <div class="flex flex-1 items-center gap-3">
          <span class="w-6 text-gray-400">{{ chapter.sortOrder }}</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ chapter.chapterName }}</span>
              <a-tag v-if="chapter.isFree" color="green" size="small">
                免费
              </a-tag>
              <a-tag v-else color="default" size="small">收费</a-tag>
            </div>
            <div class="mt-1 text-xs text-gray-400">
              时长: {{ Math.floor(chapter.duration / 60) }}分钟
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a-switch
            :checked="chapter.isFree"
            size="small"
            @change="handleToggleFree(chapter)"
          />
          <a-button
            type="text"
            size="small"
            danger
            @click="handleDeleteChapter(chapter.chapterId)"
          >
            删除
          </a-button>
        </div>
      </div>
    </div>

    <a-empty v-if="chapters.length === 0" description="暂无章节" class="py-8" />
  </div>
</template>
