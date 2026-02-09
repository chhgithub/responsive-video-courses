<script setup lang="ts" setup>
import { computed, onMounted } from 'vue';

import { useDictStore } from '#/store/dict';

import { CourseDict, MemberDict, OrderDict } from '#/constants/dict';

const dictStore = useDictStore();

// 加载字典数据
onMounted(() => {
  // 加载课程相关字典
  dictStore.setDictInfo(CourseDict.DIFFICULTY, [
    { dictCode: 1, dictSort: 1, dictLabel: '初级', dictValue: 'beginner', dictType: CourseDict.DIFFICULTY, status: '0', isDefault: true },
    { dictCode: 2, dictSort: 2, dictLabel: '中级', dictValue: 'intermediate', dictType: CourseDict.DIFFICULTY, status: '0', isDefault: false },
    { dictCode: 3, dictSort: 3, dictLabel: '高级', dictValue: 'advanced', dictType: CourseDict.DIFFICULTY, status: '0', isDefault: false },
  ]);

  dictStore.setDictInfo(CourseDict.TYPE, [
    { dictCode: 1, dictSort: 1, dictLabel: '微课程', dictValue: 'micro', dictType: CourseDict.TYPE, status: '0', isDefault: false },
    { dictCode: 2, dictSort: 2, dictLabel: '公益课程', dictValue: 'public', dictType: CourseDict.TYPE, status: '0', isDefault: false },
    { dictCode: 3, dictSort: 3, dictLabel: '付费课程', dictValue: 'paid', dictType: CourseDict.TYPE, status: '0', isDefault: true },
    { dictCode: 4, dictSort: 4, dictLabel: '科研赋能', dictValue: 'research', dictType: CourseDict.TYPE, status: '0', isDefault: false },
  ]);

  dictStore.setDictInfo(CourseDict.STATUS, [
    { dictCode: 1, dictSort: 1, dictLabel: '草稿', dictValue: 'draft', dictType: CourseDict.STATUS, status: '0', isDefault: true },
    { dictCode: 2, dictSort: 2, dictLabel: '已发布', dictValue: 'published', dictType: CourseDict.STATUS, status: '0', isDefault: false },
    { dictCode: 3, dictSort: 3, dictLabel: '已下架', dictValue: 'offline', dictType: CourseDict.STATUS, status: '0', isDefault: false },
  ]);

  // 加载会员相关字典
  dictStore.setDictInfo(MemberDict.LEVEL, [
    { dictCode: 1, dictSort: 1, dictLabel: '注册用户', dictValue: 'registered', dictType: MemberDict.LEVEL, status: '0', isDefault: true },
    { dictCode: 2, dictSort: 2, dictLabel: 'VIP会员', dictValue: 'vip', dictType: MemberDict.LEVEL, status: '0', isDefault: false },
    { dictCode: 3, dictSort: 3, dictLabel: 'SVIP会员', dictValue: 'svip', dictType: MemberDict.LEVEL, status: '0', isDefault: false },
  ]);

  // 加载订单相关字典
  dictStore.setDictInfo(OrderDict.STATUS, [
    { dictCode: 1, dictSort: 1, dictLabel: '待支付', dictValue: 'pending', dictType: OrderDict.STATUS, status: '0', isDefault: true },
    { dictCode: 2, dictSort: 2, dictLabel: '已完成', dictValue: 'completed', dictType: OrderDict.STATUS, status: '0', isDefault: false },
    { dictCode: 3, dictSort: 3, dictLabel: '已取消', dictValue: 'cancelled', dictType: OrderDict.STATUS, status: '0', isDefault: false },
  ]);

  dictStore.setDictInfo(OrderDict.PAYMENT_METHOD, [
    { dictCode: 1, dictSort: 1, dictLabel: '微信支付', dictValue: 'wechat', dictType: OrderDict.PAYMENT_METHOD, status: '0', isDefault: true },
    { dictCode: 2, dictSort: 2, dictLabel: '支付宝', dictValue: 'alipay', dictType: OrderDict.PAYMENT_METHOD, status: '0', isDefault: false },
  ]);
});

// 获取字典选项
const difficultyOptions = computed(() => dictStore.getDictOptions(CourseDict.DIFFICULTY));
const typeOptions = computed(() => dictStore.getDictOptions(CourseDict.TYPE));
const statusOptions = computed(() => dictStore.getDictOptions(CourseDict.STATUS));
const memberLevelOptions = computed(() => dictStore.getDictOptions(MemberDict.LEVEL));
const orderStatusOptions = computed(() => dictStore.getDictOptions(OrderDict.STATUS));
const paymentMethodOptions = computed(() => dictStore.getDictOptions(OrderDict.PAYMENT_METHOD));

// 表单数据
const formData = {
  difficulty: '',
  type: '',
  status: '',
  memberLevel: '',
};
</script>

<template>
  <div class="dict-example p-6">
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">字典使用示例</h2>
      <p class="text-gray-600">展示如何在组件中使用字典数据</p>
    </div>

    <!-- 课程相关字典 -->
    <a-card title="课程相关字典" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 课程难度 -->
        <div>
          <label class="block text-sm font-medium mb-2">课程难度</label>
          <a-select v-model:value="formData.difficulty" :options="difficultyOptions" placeholder="请选择难度" class="w-full" />
        </div>

        <!-- 课程类型 -->
        <div>
          <label class="block text-sm font-medium mb-2">课程类型</label>
          <a-select v-model:value="formData.type" :options="typeOptions" placeholder="请选择类型" class="w-full" />
        </div>

        <!-- 课程状态 -->
        <div>
          <label class="block text-sm font-medium mb-2">课程状态</label>
          <a-select v-model:value="formData.status" :options="statusOptions" placeholder="请选择状态" class="w-full" />
        </div>
      </div>
    </a-card>

    <!-- 会员相关字典 -->
    <a-card title="会员相关字典" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 会员等级 -->
        <div>
          <label class="block text-sm font-medium mb-2">会员等级</label>
          <a-radio-group v-model:value="formData.memberLevel" :options="memberLevelOptions" />
        </div>
      </div>
    </a-card>

    <!-- 订单相关字典 -->
    <a-card title="订单相关字典" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 订单状态 -->
        <div>
          <label class="block text-sm font-medium mb-2">订单状态</label>
          <div class="space-x-2">
            <a-tag v-for="option in orderStatusOptions" :key="option.value" :color="option.listClass || 'default'">
              {{ option.label }}
            </a-tag>
          </div>
        </div>

        <!-- 支付方式 -->
        <div>
          <label class="block text-sm font-medium mb-2">支付方式</label>
          <div class="space-x-2">
            <a-tag v-for="option in paymentMethodOptions" :key="option.value" :color="option.cssClass || 'default'">
              {{ option.label }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 字典数据展示 -->
    <a-card title="字典数据预览">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="课程难度选项数">
          {{ difficultyOptions.length }}
        </a-descriptions-item>
        <a-descriptions-item label="课程类型选项数">
          {{ typeOptions.length }}
        </a-descriptions-item>
        <a-descriptions-item label="课程状态选项数">
          {{ statusOptions.length }}
        </a-descriptions-item>
        <a-descriptions-item label="会员等级选项数">
          {{ memberLevelOptions.length }}
        </a-descriptions-item>
        <a-descriptions-item label="订单状态选项数">
          {{ orderStatusOptions.length }}
        </a-descriptions-item>
        <a-descriptions-item label="支付方式选项数">
          {{ paymentMethodOptions.length }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>
