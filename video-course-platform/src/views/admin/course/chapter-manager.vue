<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Course, Chapter, Lesson } from '@/utils/course-storage';
import { getVideoById, formatDuration } from '@/utils/video-storage';
import { updateLessonFreeStatusByPrice } from '@/utils/course-storage';
import ChapterDrawer from './components/ChapterDrawer.vue';
import LessonDrawer from './components/LessonDrawer.vue';

interface Props {
  course: Course;
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const loading = ref(false);
const chapters = ref<Chapter[]>([]);

// 章节抽屉
const showChapterDrawer = ref(false);
const chapterMode = ref<'add' | 'edit'>('add');
const currentChapterId = ref<string>();

// 课时抽屉
const showLessonDrawer = ref(false);
const lessonMode = ref<'add' | 'edit'>('add');
const currentLessonChapterId = ref<string>();
const currentLessonId = ref<string>();

// 初始化章节数据
function initChapters() {
  // 根据课程价格自动调整课时免费状态
  const updatedCourse = updateLessonFreeStatusByPrice(props.course);
  chapters.value = JSON.parse(JSON.stringify(updatedCourse.chapters || []));
}

// 添加章节
function handleAddChapter() {
  chapterMode.value = 'add';
  currentChapterId.value = undefined;
  showChapterDrawer.value = true;
}

// 编辑章节
function handleEditChapter(chapter: Chapter) {
  chapterMode.value = 'edit';
  currentChapterId.value = chapter.chapterId;
  showChapterDrawer.value = true;
}

// 删除章节
function handleDeleteChapter(chapter: Chapter) {
  ElMessageBox.confirm(
    `确认删除章节"${chapter.chapterName}"及其所有课时吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      chapters.value = chapters.value.filter((ch) => ch.chapterId !== chapter.chapterId);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
}

// 添加课时
function handleAddLesson(chapterId: string) {
  lessonMode.value = 'add';
  currentLessonChapterId.value = chapterId;
  currentLessonId.value = undefined;
  showLessonDrawer.value = true;
}

// 编辑课时
function handleEditLesson(chapterId: string, lesson: Lesson) {
  lessonMode.value = 'edit';
  currentLessonChapterId.value = chapterId;
  currentLessonId.value = lesson.lessonId;
  showLessonDrawer.value = true;
}

// 删除课时
function handleDeleteLesson(chapterId: string, lessonId: string) {
  ElMessageBox.confirm('确认删除该课时吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const chapter = chapters.value.find((ch) => ch.chapterId === chapterId);
      if (chapter) {
        chapter.lessons = chapter.lessons.filter((l) => l.lessonId !== lessonId);
        ElMessage.success('删除成功');
      }
    })
    .catch(() => {});
}

// 切换课时免费状态
function handleToggleFree(chapterId: string, lesson: Lesson) {
  const chapter = chapters.value.find((ch) => ch.chapterId === chapterId);
  if (chapter) {
    const targetLesson = chapter.lessons.find((l) => l.lessonId === lesson.lessonId);
    if (targetLesson) {
      targetLesson.isFree = !targetLesson.isFree;
    }
  }
}

// 批量设置免费
function handleBatchSetFree() {
  const totalLessons = chapters.value.reduce((sum, ch) => sum + ch.lessons.length, 0);
  if (totalLessons === 0) {
    ElMessage.info('暂无课时');
    return;
  }

  ElMessageBox.confirm(
    `确认将所有课时设置为免费吗？`,
    '批量免费',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      chapters.value.forEach(chapter => {
        chapter.lessons.forEach((lesson) => {
          lesson.isFree = true;
        });
      });
      ElMessage.success(`已将${totalLessons}个课时设置为免费`);
    })
    .catch(() => {});
}

// 批量取消免费
function handleBatchCancelFree() {
  const totalLessons = chapters.value.reduce((sum, ch) => sum + ch.lessons.length, 0);
  if (totalLessons === 0) {
    ElMessage.info('暂无课时');
    return;
  }

  // 检查是否有免费课时
  const hasFreeLessons = chapters.value.some(ch => ch.lessons.some(l => l.isFree));
  if (!hasFreeLessons) {
    ElMessage.info('没有免费课时');
    return;
  }

  ElMessageBox.confirm(
    `确认取消所有课时的免费状态吗？`,
    '取消免费',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      chapters.value.forEach(chapter => {
        chapter.lessons.forEach((lesson) => {
          lesson.isFree = false;
        });
      });
      ElMessage.success('已取消所有课时的免费状态');
    })
    .catch(() => {});
}

// 切换课时试听状态
function handleToggleTrial(chapterId: string, lesson: Lesson) {
  const chapter = chapters.value.find((ch) => ch.chapterId === chapterId);
  if (chapter) {
    const targetLesson = chapter.lessons.find((l) => l.lessonId === lesson.lessonId);
    if (targetLesson) {
      targetLesson.isTrial = !targetLesson.isTrial;
    }
  }
}

// 获取课时内容类型标签
function getContentTypeLabel(contentType: string) {
  const labels = {
    video: '视频',
    audio: '音频',
    ppt: 'PPT',
    document: '文档',
    'rich-text': '富文本',
  };
  return labels[contentType] || contentType;
}

// 获取内容类型颜色
function getContentTypeColor(contentType: string) {
  const colors = {
    video: 'primary',
    audio: 'success',
    ppt: 'warning',
    document: 'info',
    'rich-text': 'default',
  };
  return colors[contentType] || 'default';
}

// 章节抽屉成功
function handleChapterSuccess() {
  showChapterDrawer.value = false;
  // 重新加载章节数据
  initChapters();
}

// 课时抽屉成功
function handleLessonSuccess() {
  showLessonDrawer.value = false;
  // 重新加载章节数据
  initChapters();
}

// 保存
async function handleSave() {
  loading.value = true;
  try {
    // TODO: 调用API保存章节和课时
    await new Promise((resolve) => setTimeout(resolve, 500));

    ElMessage.success('保存成功');
    emit('success');
    dialogVisible.value = false;
  } finally {
    loading.value = false;
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      initChapters();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="章节管理"
    width="900px"
    :close-on-click-modal="false"
  >
    <div class="chapter-manager">
      <div class="chapter-header">
        <div class="header-left">
          <el-button type="primary" @click="handleAddChapter">
            <el-icon><Plus /></el-icon>
            添加章节
          </el-button>
          <!-- 仅在付费课程时显示批量操作按钮 -->
          <template v-if="props.course.price > 0">
            <el-button type="success" @click="handleBatchSetFree">
              <el-icon><PriceTag /></el-icon>
              批量免费
            </el-button>
            <el-button type="warning" @click="handleBatchCancelFree">
              <el-icon><Close /></el-icon>
              取消免费
            </el-button>
          </template>
        </div>
        <div class="header-tips">
          <div class="header-tip">
            <el-icon><InfoFilled /></el-icon>
            提示：拖拽章节可调整排序
          </div>
          <div class="header-tip free-tip">
            <el-icon><PriceTag /></el-icon>
            {{ props.course.price === 0 ? '当前为免费课程，所有课时自动免费' : '当前为付费课程，可设置部分课时免费试学' }}
          </div>
        </div>
      </div>

      <div v-loading="loading" class="chapter-list">
        <div
          v-for="(chapter, chapterIndex) in chapters"
          :key="chapter.chapterId"
          class="chapter-item"
        >
          <!-- 章节头部 -->
          <div class="chapter-header-item">
            <div class="chapter-title">
              <span class="chapter-order">第{{ chapterIndex + 1 }}章</span>
              <span class="chapter-name">{{ chapter.chapterName }}</span>
              <el-tag size="small" type="info">{{ chapter.lessons.length }} 课时</el-tag>
            </div>
            <div class="chapter-actions">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleAddLesson(chapter.chapterId)"
              >
                <el-icon><Plus /></el-icon>
                添加课时
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleEditChapter(chapter)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteChapter(chapter)"
              >
                删除
              </el-button>
            </div>
          </div>

          <!-- 课时列表 -->
          <div v-if="chapter.lessons.length > 0" class="lesson-list">
            <div
              v-for="lesson in chapter.lessons"
              :key="lesson.lessonId"
              class="lesson-item"
            >
              <div class="lesson-info">
                <span class="lesson-order">{{ lesson.lessonOrder }}.</span>
                <span class="lesson-name">{{ lesson.lessonName }}</span>
                <el-tag :type="getContentTypeColor(lesson.contentType)" size="small">
                  {{ getContentTypeLabel(lesson.contentType) }}
                </el-tag>
                <span v-if="lesson.duration > 0" class="lesson-duration">
                  {{ formatDuration(lesson.duration) }}
                </span>
                <el-tag v-if="lesson.isFree" type="success" size="small">免费</el-tag>
                <el-tag v-if="lesson.isTrial" type="warning" size="small">可试听</el-tag>
              </div>
              <div class="lesson-actions">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleToggleFree(chapter.chapterId, lesson)"
                >
                  {{ lesson.isFree ? '取消免费' : '设为免费' }}
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleToggleTrial(chapter.chapterId, lesson)"
                >
                  {{ lesson.isTrial ? '取消试听' : '设为试听' }}
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleEditLesson(chapter.chapterId, lesson)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleDeleteLesson(chapter.chapterId, lesson.lessonId)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
          <div v-else class="empty-lessons">
            <el-empty description="暂无课时，请添加" :image-size="60" />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="chapters.length === 0" class="empty-state">
          <el-empty description="暂无章节，请添加章节">
            <el-button type="primary" @click="handleAddChapter">添加第一章</el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>

  <!-- 章节编辑抽屉 -->
  <ChapterDrawer
    v-if="showChapterDrawer"
    :id="currentChapterId"
    :visible="showChapterDrawer"
    @success="handleChapterSuccess"
    @close="showChapterDrawer = false"
  />

  <!-- 课时编辑抽屉 -->
  <LessonDrawer
    v-if="showLessonDrawer"
    :chapter-id="currentLessonChapterId"
    :lesson-id="currentLessonId"
    :visible="showLessonDrawer"
    @success="handleLessonSuccess"
    @close="showLessonDrawer = false"
  />
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.chapter-manager {
  .chapter-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-base;
    border-bottom: 1px solid $border-color-lighter;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-base;
    }

    .header-tips {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }

    .header-tip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-small;
      color: $text-color-secondary;

      &.free-tip {
        color: #67c23a;
        font-weight: 500;
      }
    }
  }

  .chapter-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .chapter-item {
    margin-bottom: $spacing-large;
    background: $background-color-base;
    border-radius: $border-radius-base;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .chapter-header-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base $spacing-large;
    background: #fff;
    border-bottom: 1px solid $border-color-lighter;

    .chapter-title {
      display: flex;
      align-items: center;
      gap: $spacing-base;

      .chapter-order {
        font-weight: 600;
        color: $text-color-primary;
      }

      .chapter-name {
        font-size: $font-size-medium;
        font-weight: 500;
        color: $text-color-primary;
      }
    }

    .chapter-actions {
      display: flex;
      gap: $spacing-small;
    }
  }

  .lesson-list {
    padding: $spacing-base;
  }

  .lesson-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-small $spacing-base;
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-small;
    margin-bottom: $spacing-small;
    transition: $transition-base;

    &:hover {
      box-shadow: $box-shadow-base;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .lesson-info {
      display: flex;
      align-items: center;
      gap: $spacing-small;
      flex: 1;

      .lesson-order {
        font-size: $font-size-small;
        color: $text-color-secondary;
        min-width: 30px;
      }

      .lesson-name {
        font-size: $font-size-base;
        color: $text-color-primary;
      }

      .lesson-duration {
        font-size: $font-size-extra-small;
        color: $text-color-secondary;
      }
    }

    .lesson-actions {
      display: flex;
      gap: 4px;
    }
  }

  .empty-lessons {
    padding: $spacing-large;
    text-align: center;
  }

  .empty-state {
    padding: $spacing-extra-extra-large 0;
  }
}
</style>
