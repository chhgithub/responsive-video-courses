<script lang="ts" setup>
import { ref } from 'vue';

// Mock 数据 - 各认证类型的内容
const certContents = ref({
  ai_trainer: {
    id: 1,
    title: '人工智能训练师认证',
    content: '<p>人工智能训练师是新兴职业，负责设计、训练和优化AI模型。</p>',
    coverImage: 'https://picsum.photos/seed/ai-trainer/400/200',
    evaluationPlan: '<p>评价计划包括理论知识考试和实操考核两部分。</p>',
    gradeAnnouncement: '<p>成绩将在考试结束后7个工作日内公示。</p>',
    registrationConsult: '<p>报名咨询请拨打：400-123-4567</p>',
  },
  ai_engineer: {
    id: 2,
    title: '人工智能工程技术人员认证',
    content: '<p>人工智能工程技术人员专注于AI系统的工程化落地。</p>',
    trainingPlan: '<p>培训计划为期3个月，包含理论学习和项目实战。</p>',
    registrationConsult: '<p>报名咨询请发送邮件至：ai@example.com</p>',
  },
  caac_drone: {
    id: 3,
    title: 'CAAC无人机执照认证',
    content: '<p>CAAC无人机执照是从事无人机飞行作业的必备证书。</p>',
    registrationConsult: '<p>报名咨询请联系当地培训中心。</p>',
    trialFlight: '<p>提供免费试飞体验，欢迎预约。</p>',
  },
  tech_broker: {
    id: 4,
    title: '技术经纪人认证',
    content: '<p>技术经纪人连接技术创新与市场需求，推动成果转化。</p>',
    registrationConsult: '<p>报名咨询请关注微信公众号。</p>',
    classPlan: '<p>每月开设一期培训班，小班教学。</p>',
  },
  other: {
    id: 5,
    title: '其他认证项目',
    content: '<p>提供多种专业认证项目，助力职业发展。</p>',
    pmpInfo: '<p>PMP项目管理专业人士认证，全球认可。</p>',
    npdpInfo: '<p>NPDP产品经理国际认证，提升产品管理能力。</p>',
  },
});

// Tab 配置
const certTypes = ref([
  { key: 'ai_trainer', label: '人工智能训练师' },
  { key: 'ai_engineer', label: '人工智能工程技术人员' },
  { key: 'caac_drone', label: 'CAAC无人机执照' },
  { key: 'tech_broker', label: '技术经纪人' },
  { key: 'other', label: '其他' },
]);

const activeTab = ref('ai_trainer');
</script>

<template>
  <div class="cert-page">
    <!-- Banner -->
    <section
      class="banner-section bg-gradient-to-r from-blue-500 to-purple-600 py-16"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="mb-4 text-4xl font-bold text-white">认证中心</h1>
        <p class="text-xl text-gray-100">专业认证，助力职业发展</p>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section px-4 py-12">
      <div class="container mx-auto">
        <a-tabs v-model:activeKey="activeTab" centered size="large">
          <a-tab-pane v-for="tab in certTypes" :key="tab.key" :tab="tab.label">
            <div class="cert-content">
              <!-- 封面图 -->
              <div v-if="certContents[tab.key]?.coverImage" class="mb-8">
                <img
                  :src="certContents[tab.key].coverImage"
                  :alt="certContents[tab.key].title"
                  class="mx-auto max-h-64 rounded-lg object-cover shadow-lg"
                />
              </div>

              <!-- 标题 -->
              <h2 class="mb-6 text-center text-3xl font-bold text-gray-900">
                {{ certContents[tab.key]?.title }}
              </h2>

              <!-- 详细介绍 -->
              <div
                v-if="certContents[tab.key]?.content"
                class="mx-auto mb-8 max-w-4xl text-lg leading-relaxed text-gray-700"
                v-html="certContents[tab.key].content"
              ></div>

              <!-- 扩展字段内容 -->
              <div
                v-if="certContents[tab.key]"
                class="mx-auto max-w-4xl space-y-6"
              >
                <!-- 人工智能训练师 -->
                <template v-if="tab.key === 'ai_trainer'">
                  <div
                    v-if="certContents.ai_trainer.evaluationPlan"
                    class="rounded-lg bg-blue-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-blue-900">
                      评价计划
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.ai_trainer.evaluationPlan"
                    ></div>
                  </div>
                  <div
                    v-if="certContents.ai_trainer.gradeAnnouncement"
                    class="rounded-lg bg-green-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-green-900">
                      成绩公示
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.ai_trainer.gradeAnnouncement"
                    ></div>
                  </div>
                  <div
                    v-if="certContents.ai_trainer.registrationConsult"
                    class="rounded-lg bg-purple-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-purple-900">
                      报名咨询
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.ai_trainer.registrationConsult"
                    ></div>
                  </div>
                </template>

                <!-- 人工智能工程技术人员 -->
                <template v-else-if="tab.key === 'ai_engineer'">
                  <div
                    v-if="certContents.ai_engineer.trainingPlan"
                    class="rounded-lg bg-blue-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-blue-900">
                      培训计划
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.ai_engineer.trainingPlan"
                    ></div>
                  </div>
                  <div
                    v-if="certContents.ai_engineer.registrationConsult"
                    class="rounded-lg bg-purple-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-purple-900">
                      报名咨询
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.ai_engineer.registrationConsult"
                    ></div>
                  </div>
                </template>

                <!-- CAAC无人机执照 -->
                <template v-else-if="tab.key === 'caac_drone'">
                  <div
                    v-if="certContents.caac_drone.registrationConsult"
                    class="rounded-lg bg-blue-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-blue-900">
                      报名咨询
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.caac_drone.registrationConsult"
                    ></div>
                  </div>
                  <div
                    v-if="certContents.caac_drone.trialFlight"
                    class="rounded-lg bg-orange-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-orange-900">
                      试飞体验
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.caac_drone.trialFlight"
                    ></div>
                  </div>
                </template>

                <!-- 技术经纪人 -->
                <template v-else-if="tab.key === 'tech_broker'">
                  <div
                    v-if="certContents.tech_broker.registrationConsult"
                    class="rounded-lg bg-blue-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-blue-900">
                      报名咨询
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.tech_broker.registrationConsult"
                    ></div>
                  </div>
                  <div
                    v-if="certContents.tech_broker.classPlan"
                    class="rounded-lg bg-green-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-green-900">
                      开班计划
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.tech_broker.classPlan"
                    ></div>
                  </div>
                </template>

                <!-- 其他认证 -->
                <template v-else-if="tab.key === 'other'">
                  <div
                    v-if="certContents.other.pmpInfo"
                    class="rounded-lg bg-blue-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-blue-900">
                      PMP项目管理
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.other.pmpInfo"
                    ></div>
                  </div>
                  <div
                    v-if="certContents.other.npdpInfo"
                    class="rounded-lg bg-purple-50 p-6"
                  >
                    <h3 class="mb-3 text-xl font-semibold text-purple-900">
                      NPDP产品管理
                    </h3>
                    <div
                      class="text-gray-700"
                      v-html="certContents.other.npdpInfo"
                    ></div>
                  </div>
                </template>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cert-page {
  min-height: calc(100vh - 64px - 300px);
}

.cert-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
