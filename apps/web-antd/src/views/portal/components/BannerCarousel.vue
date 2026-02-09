<script lang="ts" setup>
import { ref } from 'vue';

import { Carousel } from 'ant-design-vue';

interface Banner {
  id: number;
  image: string;
  title: string;
  link?: string;
}

interface Props {
  banners: Banner[];
}

defineProps<Props>();

const emit = defineEmits<{
  click: [banner: Banner];
}>();

const carouselRef = ref();

function handleBannerClick(banner: Banner) {
  emit('click', banner);
}
</script>

<template>
  <Carousel
    ref="carouselRef"
    autoplay
    dots-class="custom-dots"
    :after-change="() => {}"
  >
    <div
      v-for="banner in banners"
      :key="banner.id"
      class="banner-item"
      @click="handleBannerClick(banner)"
    >
      <div class="banner-content">
        <img :src="banner.image" :alt="banner.title" class="banner-image" />
        <div class="banner-overlay">
          <h2 class="banner-title">{{ banner.title }}</h2>
        </div>
      </div>
    </div>
  </Carousel>
</template>

<style scoped>
.banner-item {
  cursor: pointer;
  position: relative;
  width: 100%;
}

.banner-content {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

@media (min-width: 640px) {
  .banner-image {
    height: 250px;
  }
}

@media (min-width: 768px) {
  .banner-image {
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .banner-image {
    height: 400px;
  }
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 2rem 2rem 1.5rem;
}

.banner-title {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

@media (min-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }
}

:deep(.custom-dots li button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

:deep(.custom-dots li.slick-active button) {
  width: 24px;
  border-radius: 4px;
  background: white;
}
</style>
