<script setup lang="ts">
import { ref } from 'vue';

import { getCertByKey, getCertList } from '@/utils/cert-storage';

// 当前激活的Tab
const activeTab = ref('ai_trainer');

// Tab配置
const certTypes = getCertList();

// 获取当前认证内容
const currentCert = ref(getCertByKey(activeTab.value));

// Tab切换
function handleTabChange(key: string) {
  activeTab.value = key;
  currentCert.value = getCertByKey(key);
}
</script>

<template>
  <div class="cert-page">
    <!-- Banner -->
    <section class="banner-section">
      <div class="container">
        <h1>认证中心</h1>
        <p>专业认证，助力职业发展</p>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section">
      <div class="container">
        <!-- Tab切换 -->
        <div class="tab-wrapper">
          <div class="tab-headers">
            <button
              v-for="tab in certTypes"
              :key="tab.key"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
              @click="handleTabChange(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 内容展示 -->
        <div v-if="currentCert" class="cert-content">
          <!-- 封面图 -->
          <div v-if="currentCert.coverImage" class="cert-cover">
            <img :src="currentCert.coverImage" :alt="currentCert.title" />
          </div>

          <!-- 标题 -->
          <h2 class="cert-title">{{ currentCert.title }}</h2>

          <!-- 详细介绍 -->
          <div v-if="currentCert.content" class="cert-section" v-html="currentCert.content"></div>

          <!-- 扩展字段内容 -->
          <div v-if="currentCert.trainingPlan" class="cert-section training-plan">
            <h3>培训计划</h3>
            <div v-html="currentCert.trainingPlan"></div>
          </div>

          <div v-if="currentCert.evaluationPlan" class="cert-section evaluation-plan">
            <h3>评价计划</h3>
            <div v-html="currentCert.evaluationPlan"></div>
          </div>

          <div v-if="currentCert.gradeAnnouncement" class="cert-section grade-announcement">
            <h3>成绩公示</h3>
            <div v-html="currentCert.gradeAnnouncement"></div>
          </div>

          <div v-if="currentCert.trialFlight" class="cert-section trial-flight">
            <h3>试飞体验</h3>
            <div v-html="currentCert.trialFlight"></div>
          </div>

          <div v-if="currentCert.classPlan" class="cert-section class-plan">
            <h3>开班计划</h3>
            <div v-html="currentCert.classPlan"></div>
          </div>

          <div v-if="currentCert.pmpInfo" class="cert-section pmp-info">
            <div v-html="currentCert.pmpInfo"></div>
          </div>

          <div v-if="currentCert.npdpInfo" class="cert-section npdp-info">
            <div v-html="currentCert.npdpInfo"></div>
          </div>

          <div v-if="currentCert.registrationConsult" class="cert-section registration-consult">
            <h3>报名咨询</h3>
            <div v-html="currentCert.registrationConsult"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.cert-page {
  min-height: 100vh;
  background: $background-color-base;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

// Banner区域
.banner-section {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  padding: $spacing-extra-extra-large 0;
  text-align: center;
  color: #fff;

  h1 {
    font-size: $font-size-extra-extra-large;
    font-weight: bold;
    margin-bottom: $spacing-base;

    @media (min-width: 768px) {
      font-size: 48px;
    }
  }

  p {
    font-size: $font-size-large;
    color: rgba(255, 255, 255, 0.9);
  }
}

// 内容区域
.content-section {
  padding: $spacing-extra-extra-large 0;
}

// Tab切换
.tab-wrapper {
  margin-bottom: $spacing-extra-large;
}

.tab-headers {
  display: flex;
  justify-content: center;
  border-bottom: 2px solid $border-color-lighter;
  overflow-x: auto;
}

.tab-btn {
  padding: $spacing-base $spacing-large;
  font-size: $font-size-base;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  color: $text-color-secondary;
  border-bottom: 3px solid transparent;
  transition: $transition-base;
  white-space: nowrap;

  &:hover {
    color: $text-color-primary;
  }

  &.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    font-weight: 600;
  }
}

// 认证内容
.cert-content {
  background: #fff;
  border-radius: $border-radius-large;
  padding: $spacing-extra-extra-large;
  box-shadow: $box-shadow-card;
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cert-cover {
  margin-bottom: $spacing-extra-large;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: $border-radius-large;
    box-shadow: $box-shadow-base;
  }
}

.cert-title {
  font-size: $font-size-extra-extra-large;
  font-weight: bold;
  color: $text-color-primary;
  text-align: center;
  margin-bottom: $spacing-extra-large;
}

.cert-section {
  margin-bottom: $spacing-extra-large;
  padding: $spacing-large;
  background: $background-color-base;
  border-radius: $border-radius-base;
  border-left: 4px solid #3b82f6;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: $font-size-large;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-base;
  }

  :deep(p) {
    font-size: $font-size-base;
    line-height: 1.8;
    color: $text-color-regular;
    margin-bottom: $spacing-small;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    color: $text-color-primary;
    font-weight: 600;
  }

  :deep(ul) {
    list-style: disc;
    padding-left: $spacing-large;
    margin-bottom: $spacing-small;
  }

  :deep(a) {
    color: #3b82f6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 特殊字段样式
.training-plan,
.evaluation-plan,
.grade-announcement,
.trial-flight,
.class-plan,
.registration-consult {
  border-left-color: #10b981;
}

.pmp-info,
.npdp-info {
  border-left: none;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}
</style>
