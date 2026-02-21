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
  position: relative;
  width: 100%;
  cursor: pointer;
}

.banner-content {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.banner-image {
  display: block;
  width: 100%;
  height: 200px;
  object-fit: cover;
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
    height: 734px;
  }
}

.banner-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(to top, rgb(0 0 0 / 70%), transparent);
}

.banner-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

@media (min-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }
}

:deep(.custom-dots li button) {
  width: 8px;
  height: 8px;
  background: rgb(255 255 255 / 50%);
  border-radius: 50%;
}

:deep(.custom-dots li.slick-active button) {
  width: 24px;
  background: white;
  border-radius: 4px;
}
</style>
