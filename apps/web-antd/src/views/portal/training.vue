<script lang="ts" setup>
import { ref } from 'vue';

const activeTab = ref('k12');

const k12Plans = ref([
  {
    id: 1,
    title: '暑期数学集训营',
    ageRange: '12-15岁',
    duration: '2周',
    price: 2999,
    originalPrice: 3999,
    cover: 'https://picsum.photos/seed/k12math/400/250',
    features: ['名师授课', '小班教学', '个性化辅导'],
  },
  {
    id: 2,
    title: '英语提升集训班',
    ageRange: '10-14岁',
    duration: '3周',
    price: 3499,
    originalPrice: 4499,
    cover: 'https://picsum.photos/seed/k12english/400/250',
    features: ['沉浸式教学', '外教互动', '情景演练'],
  },
]);

const adultPlans = ref([
  {
    id: 3,
    title: 'Python全栈开发集训',
    ageRange: '18岁以上',
    duration: '4周',
    price: 5999,
    originalPrice: 7999,
    cover: 'https://picsum.photos/seed/adultpython/400/250',
    features: ['实战项目', '就业指导', '终身答疑'],
  },
  {
    id: 4,
    title: '数据分析与可视化集训',
    ageRange: '18岁以上',
    duration: '3周',
    price: 4999,
    originalPrice: 6999,
    cover: 'https://picsum.photos/seed/adultdata/400/250',
    features: ['真实案例', '工具培训', '证书认证'],
  },
]);

function handleEnroll(plan: any) {
  console.log(`已报名：${plan.title}`);
}
</script>

<template>
  <div class="page-container min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">集训计划</h1>
        <p class="mt-2 text-gray-600">系统化培训，快速提升技能</p>
      </div>

      <!-- 分类切换 -->
      <div class="mb-8 flex justify-center">
        <a-radio-group
          v-model:value="activeTab"
          button-style="solid"
          size="large"
        >
          <a-radio-button value="k12">K12集训</a-radio-button>
          <a-radio-button value="adult">成人集训</a-radio-button>
        </a-radio-group>
      </div>

      <!-- K12集训 -->
      <div
        v-if="activeTab === 'k12'"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="plan in k12Plans"
          :key="plan.id"
          class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <img :src="plan.cover" class="h-48 w-full object-cover" />
          <div class="p-6">
            <h3 class="mb-2 text-xl font-bold text-gray-800">
              {{ plan.title }}
            </h3>
            <div class="mb-4 flex items-center gap-4 text-sm text-gray-500">
              <span>📅 {{ plan.duration }}</span>
              <span>👤 {{ plan.ageRange }}</span>
            </div>
            <div class="mb-4 flex flex-wrap gap-2">
              <a-tag
                v-for="feature in plan.features"
                :key="feature"
                color="green"
              >{{ feature }}</a-tag>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-2xl font-bold text-red-500"
                  >¥{{ plan.price }}</span
                >
                <span class="ml-2 text-gray-400 line-through"
                  >¥{{ plan.originalPrice }}</span
                >
              </div>
              <a-button type="primary" @click="handleEnroll(plan)">
                立即报名
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 成人集训 -->
      <div
        v-if="activeTab === 'adult'"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="plan in adultPlans"
          :key="plan.id"
          class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <img :src="plan.cover" class="h-48 w-full object-cover" />
          <div class="p-6">
            <h3 class="mb-2 text-xl font-bold text-gray-800">
              {{ plan.title }}
            </h3>
            <div class="mb-4 flex items-center gap-4 text-sm text-gray-500">
              <span>📅 {{ plan.duration }}</span>
              <span>👤 {{ plan.ageRange }}</span>
            </div>
            <div class="mb-4 flex flex-wrap gap-2">
              <a-tag
                v-for="feature in plan.features"
                :key="feature"
                color="blue"
              >{{ feature }}</a-tag>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-2xl font-bold text-red-500"
                  >¥{{ plan.price }}</span
                >
                <span class="ml-2 text-gray-400 line-through"
                  >¥{{ plan.originalPrice }}</span
                >
              </div>
              <a-button type="primary" @click="handleEnroll(plan)">
                立即报名
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
