<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Video } from '@/utils/video-storage';

interface Props {
  modelValue: boolean;
  video?: Video;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const videoPlayer = ref<HTMLVideoElement>();

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (!val) {
      // 关闭时停止播放
      if (videoPlayer.value) {
        videoPlayer.value.pause();
      }
    }
  },
);

watch(dialogVisible, (val) => {
  emit('update:modelValue', val);
});

function handleClose() {
  dialogVisible.value = false;
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="视频预览"
    width="800px"
    :before-close="handleClose"
  >
    <div v-if="video" class="video-player-container">
      <!-- 视频信息 -->
      <div class="video-info">
        <h3 class="video-title">{{ video.title }}</h3>
        <p class="video-description">{{ video.description }}</p>
        <div class="video-meta">
          <span class="meta-item">
            <el-icon><Folder /></el-icon>
            {{ video.category }}
          </span>
          <span class="meta-item">
            <el-icon><VideoCamera /></el-icon>
            {{ video.videoType === 'upload' ? '本地上传' : '第三方视频' }}
          </span>
          <span class="meta-item">
            <el-icon><Clock /></el-icon>
            {{ Math.floor(video.duration / 60) }} 分钟
          </span>
        </div>
      </div>

      <!-- 视频播放器 -->
      <div class="player-wrapper">
        <video
          ref="videoPlayer"
          class="video-player"
          controls
          preload="metadata"
          :poster="video.thumbnailUrl"
        >
          <source :src="video.videoUrl" :type="`video/${video.format}`" />
          您的浏览器不支持视频播放。
        </video>
      </div>

      <!-- 视频URL -->
      <div class="video-url">
        <span class="url-label">视频地址：</span>
        <el-link :href="video.videoUrl" target="_blank" type="primary">
          {{ video.videoUrl }}
        </el-link>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.video-player-container {
  .video-info {
    margin-bottom: $spacing-large;
    padding-bottom: $spacing-large;
    border-bottom: 1px solid $border-color-lighter;
  }

  .video-title {
    font-size: $font-size-large;
    font-weight: 600;
    color: $text-color-primary;
    margin: 0 0 $spacing-small 0;
  }

  .video-description {
    font-size: $font-size-base;
    color: $text-color-secondary;
    margin: 0 0 $spacing-base 0;
  }

  .video-meta {
    display: flex;
    gap: $spacing-large;
    flex-wrap: wrap;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-small;
      color: $text-color-secondary;
    }
  }

  .player-wrapper {
    background: #000;
    border-radius: $border-radius-base;
    overflow: hidden;
    margin-bottom: $spacing-base;
  }

  .video-player {
    width: 100%;
    height: auto;
    display: block;
  }

  .video-url {
    padding: $spacing-base;
    background: $background-color-base;
    border-radius: $border-radius-base;
    font-size: $font-size-small;

    .url-label {
      color: $text-color-secondary;
      margin-right: $spacing-small;
    }
  }
}
</style>
