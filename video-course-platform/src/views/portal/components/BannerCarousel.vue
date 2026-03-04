<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

interface Banner {
  id: number;
  pcImage: string;
  mobileImage: string;
  title: string;
  link?: string;
}

interface Props {
  banners: Banner[];
}

const props = defineProps<Props>();
const router = useRouter();

const currentIndex = ref(0);

// 判断是否为移动端
const isMobile = ref(window.innerWidth < 768);

// 根据设备类型获取图片
function getBannerImage(banner: Banner) {
  return isMobile.value ? banner.mobileImage : banner.pcImage;
}

function goToBanner(banner: Banner) {
  if (banner.link) {
    router.push(banner.link);
  }
}

function nextBanner() {
  currentIndex.value = (currentIndex.value + 1) % props.banners.length;
}

function prevBanner() {
  currentIndex.value = currentIndex.value === 0 ? props.banners.length - 1 : currentIndex.value - 1;
}

function goToBannerIndex(index: number) {
  currentIndex.value = index;
}

// 监听窗口大小变化
function handleResize() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="banner-carousel">
    <div class="carousel-container">
      <!-- 轮播图片 -->
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="carousel-item"
        :class="{ active: index === currentIndex }"
        @click="goToBanner(banner)"
      >
        <div
          class="banner-bg"
          :style="{ backgroundImage: `url(${getBannerImage(banner)})` }"
        ></div>
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <h1>{{ banner.title }}</h1>
          <p v-if="banner.id === 1">探索海量优质课程，开启学习之旅</p>
          <p v-else-if="banner.id === 2">专业讲师倾力打造，助您快速成长</p>
          <p v-else>权威认证，提升职业竞争力</p>
          <el-button type="primary" size="large" @click.stop="goToBanner(banner)">
            立即开始学习
          </el-button>
        </div>
      </div>

      <!-- 左右箭头 -->
      <button v-if="banners.length > 1" class="carousel-arrow prev" @click="prevBanner">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button v-if="banners.length > 1" class="carousel-arrow next" @click="nextBanner">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7-7" />
        </svg>
      </button>

      <!-- 指示器 -->
      <div v-if="banners.length > 1" class="carousel-indicators">
        <button
          v-for="(_, index) in banners"
          :key="index"
          class="indicator"
          :class="{ active: index === currentIndex }"
          @click="goToBannerIndex(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.banner-carousel {
  width: 100%;
  position: relative;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;

  @media (min-width: 640px) {
    height: 250px;
  }

  @media (min-width: 768px) {
    height: 300px;
  }

  @media (min-width: 1024px) {
    height: 400px;
  }
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  cursor: pointer;

  &.active {
    opacity: 1;
  }
}

.banner-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.banner-content {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-large;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #fff;

  h1 {
    font-size: 28px;
    margin-bottom: $spacing-base;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    @media (min-width: 768px) {
      font-size: 36px;
    }

    @media (min-width: 1024px) {
      font-size: 48px;
      margin-bottom: $spacing-large;
    }
  }

  p {
    font-size: $font-size-base;
    margin-bottom: $spacing-large;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    @media (min-width: 768px) {
      font-size: $font-size-large;
    }
  }
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;

  svg {
    width: 24px;
    height: 24px;
    color: #fff;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  &.prev {
    left: $spacing-base;
  }

  &.next {
    right: $spacing-base;
  }
}

.carousel-indicators {
  position: absolute;
  bottom: $spacing-large;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: $spacing-small;
  z-index: 10;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    width: 24px;
    border-radius: 4px;
    background: #fff;
  }
}
</style>
