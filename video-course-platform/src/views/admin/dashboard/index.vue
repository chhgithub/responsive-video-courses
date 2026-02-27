<script setup lang="ts">
import { onMounted, ref } from 'vue';

const loading = ref(false);

const stats = ref([
  { title: '总课程数', value: 20, icon: 'Reading', color: '#409eff' },
  { title: '总学员数', value: 1250, icon: 'User', color: '#67c23a' },
  { title: '讲师人数', value: 6, icon: 'Avatar', color: '#e6a23c' },
  { title: '认证项目', value: 8, icon: 'Medal', color: '#f56c6c' },
]);

onMounted(() => {
  loading.value = true;
  setTimeout(() => { loading.value = false; }, 500);
});
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <div class="page-header">
      <h2>工作台</h2>
      <p>欢迎使用视频课程管理系统</p>
    </div>

    <el-row :gutter="24" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon :size="40" :color="stat.color">
              <component :is="stat.icon" />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="content-row">
      <el-col :xs="24" :sm="12">
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" icon="Plus">新增课程</el-button>
            <el-button type="success" icon="Edit">发布课程</el-button>
            <el-button type="warning" icon="User">管理用户</el-button>
            <el-button type="info" icon="Setting">系统设置</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-card class="content-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <div class="system-info">
            <p><strong>版本:</strong> v1.0.0</p>
            <p><strong>技术栈:</strong> Vue 3 + Element Plus</p>
            <p><strong>状态:</strong> 运行中</p>
            <p><strong>最后更新:</strong> 2025-02-27</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.dashboard { padding: $spacing-large; }
.page-header { margin-bottom: $spacing-large; h2 { font-size: 24px; margin-bottom: $spacing-small; color: $text-color-primary; } p { font-size: $font-size-base; color: $text-color-secondary; margin: 0; } }
.stats-row { margin-bottom: $spacing-large; }
.stat-card .stat-content { display: flex; align-items: center; gap: $spacing-large; }
.stat-card .stat-info { flex: 1; }
.stat-card .stat-value { font-size: 28px; font-weight: bold; color: $text-color-primary; margin-bottom: $spacing-small; }
.stat-card .stat-title { font-size: $font-size-base; color: $text-color-secondary; }
.content-row .content-card { margin-bottom: $spacing-large; &:last-child { margin-bottom: 0; } }
.card-header { font-size: $font-size-large; font-weight: 600; color: $text-color-primary; }
.quick-actions { display: flex; flex-direction: column; gap: $spacing-base; }
.system-info p { margin: $spacing-small 0; font-size: $font-size-base; color: $text-color-regular; }
</style>
