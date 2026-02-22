<script lang="ts" setup>
import { ref } from 'vue';

// 科研赋能数据
interface ResearchProgram {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	requirements: string;
	tags: string[];
	ageRange: string;
	capacity: number;
	enrolledCount: number;
	enrollmentDeadline: string;
	status: 'draft' | 'published' | 'closed';
}

const researchPrograms = ref<ResearchProgram[]>([
	{
		id: 'r1',
		title: 'AI大模型应用研究',
		description: '探索大语言模型在教育、医疗、金融等领域的创新应用',
		coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
		requirements: '具备Python基础，对人工智能有浓厚兴趣',
		tags: ['13-18岁', '人工智能'],
		ageRange: '13-18岁',
		capacity: 50,
		enrolledCount: 45,
		enrollmentDeadline: '2025-03-01',
		status: 'published',
	},
	{
		id: 'r2',
		title: 'Web3.0区块链开发',
		description: '深入学习区块链技术原理和DApp开发',
		coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
		requirements: '需要一定的编程基础',
		tags: ['成人', '区块链'],
		ageRange: '成人',
		capacity: 30,
		enrolledCount: 28,
		enrollmentDeadline: '2025-04-01',
		status: 'published',
	},
]);

// 集训计划数据
interface TrainingPlan {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	type: 'K12' | 'ADULT';
	startDate: string;
	endDate: string;
	location: string;
	capacity: number;
	enrolledCount: number;
	price: number;
	tags: string[];
	ageRange: string;
	status: 'enrolling' | 'full' | 'closed';
}

const trainingPlans = ref<TrainingPlan[]>([
	{
		id: 'tr1',
		title: '2025寒假Python集训营',
		description: '15天集中训练，从零基础到独立开发项目',
		coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
		type: 'K12',
		startDate: '2025-01-15',
		endDate: '2025-01-30',
		location: '线上+线下',
		capacity: 20,
		enrolledCount: 18,
		price: 299900,
		tags: ['K12', '编程', '7-12岁'],
		ageRange: '7-12岁',
		status: 'enrolling',
	},
	{
		id: 'tr2',
		title: '成人数据分析实战集训',
		description: '30天掌握数据分析核心技能',
		coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
		type: 'ADULT',
		startDate: '2025-03-01',
		endDate: '2025-03-30',
		location: '线上',
		capacity: 50,
		enrolledCount: 35,
		price: 199900,
		tags: ['成人', '编程', '数据分析'],
		ageRange: '成人',
		status: 'enrolling',
	},
]);

// Tab切换
const activeTab = ref('research');

// 切换状态
function toggleResearchStatus(id: string) {
	const program = researchPrograms.value.find((p) => p.id === id);
	if (program) {
		program.status = program.status === 'published' ? 'closed' : 'published';
	}
}

// 切换集训状态
function toggleTrainingStatus(id: string) {
	const plan = trainingPlans.value.find((p) => p.id === id);
	if (plan) {
		plan.status = plan.status === 'enrolling' ? 'closed' : 'enrolling';
	}
}
</script>

<template>
  <div class="special-courses-page min-h-screen bg-gray-50 px-4 py-8">
    <div class="container mx-auto">
      <!-- Tab切换 -->
      <div class="mb-6 rounded-lg bg-white p-2 shadow-sm">
        <div class="flex gap-2">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'research' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="activeTab = 'research'"
          >
            🔬 科研赋能
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'k12' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="activeTab = 'k12'"
          >
            K12集训计划
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'adult' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            @click="activeTab = 'adult'"
          >
            成人集训计划
          </button>
        </div>
      </div>

      <!-- 科研赋能 -->
      <div v-if="activeTab === 'research'" class="space-y-4">
        <div
          v-for="program in researchPrograms"
          :key="program.id"
          class="rounded-lg bg-white p-4 shadow-sm"
        >
          <div class="flex gap-4">
            <img
              :src="program.coverImage"
              alt=""
              class="h-24 w-40 rounded-lg object-cover"
            />
            <div class="flex-1">
              <h3 class="mb-2 text-lg font-semibold text-gray-800">{{ program.title }}</h3>
              <p class="mb-3 text-sm text-gray-600 line-clamp-2">{{ program.description }}</p>
              <div class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in program.tags"
                  :key="tag"
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="mb-2 text-sm text-gray-500">
                <p>📋 报名要求：{{ program.requirements }}</p>
                <p>👥 已报名：{{ program.enrolledCount }}/{{ program.capacity }}</p>
                <p>📅 截止日期：{{ program.enrollmentDeadline }}</p>
              </div>
              <div class="flex gap-2">
                <button class="rounded-lg border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">
                  查看咨询
                </button>
                <button
                  class="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                  @click="toggleResearchStatus(program.id)"
                >
                  {{ program.status === 'published' ? '关闭报名' : '开启报名' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- K12集训计划 -->
      <div v-if="activeTab === 'k12'" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="plan in trainingPlans.filter((p) => p.type === 'K12')"
          :key="plan.id"
          class="overflow-hidden rounded-lg bg-white shadow-sm"
        >
          <div class="relative h-40">
            <img
              :src="plan.coverImage"
              :alt="plan.title"
              class="h-full w-full object-cover"
            />
            <div class="absolute left-3 top-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
              K12
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-2 text-lg font-semibold text-gray-800">{{ plan.title }}</h3>
            <p class="mb-3 text-sm text-gray-600 line-clamp-2">{{ plan.description }}</p>
            <div class="mb-3 text-sm text-gray-500">
              <p>📍 {{ plan.location }}</p>
              <p>📅 {{ plan.startDate }} - {{ plan.endDate }}</p>
              <p>👥 {{ plan.enrolledCount }}/{{ plan.capacity }}</p>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xl font-bold text-red-500">
                ¥{{ (plan.price / 100).toFixed(0) }}
              </div>
              <button
                class="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                @click="toggleTrainingStatus(plan.id)"
              >
                {{ plan.status === 'enrolling' ? '关闭报名' : '开启报名' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 成人集训计划 -->
      <div v-if="activeTab === 'adult'" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="plan in trainingPlans.filter((p) => p.type === 'ADULT')"
          :key="plan.id"
          class="overflow-hidden rounded-lg bg-white shadow-sm"
        >
          <div class="relative h-40">
            <img
              :src="plan.coverImage"
              :alt="plan.title"
              class="h-full w-full object-cover"
            />
            <div class="absolute left-3 top-3 rounded-full bg-purple-500 px-3 py-1 text-xs font-medium text-white">
              成人
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-2 text-lg font-semibold text-gray-800">{{ plan.title }}</h3>
            <p class="mb-3 text-sm text-gray-600 line-clamp-2">{{ plan.description }}</p>
            <div class="mb-3 text-sm text-gray-500">
              <p>📍 {{ plan.location }}</p>
              <p>📅 {{ plan.startDate }} - {{ plan.endDate }}</p>
              <p>👥 {{ plan.enrolledCount }}/{{ plan.capacity }}</p>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xl font-bold text-red-500">
                ¥{{ (plan.price / 100).toFixed(0) }}
              </div>
              <button
                class="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                @click="toggleTrainingStatus(plan.id)"
              >
                {{ plan.status === 'enrolling' ? '关闭报名' : '开启报名' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
