<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
	getAllCourses,
	getMicroCourses,
	getResearchPrograms,
	getTrainingPlans,
	getTagsByType,
	getCategories,
	getCurrentUserRole,
	type Course,
	type MicroCourse,
	type ResearchProgram,
	type TrainingPlan,
} from '#/mock/course-center';

import TeacherCourseCenter from './components/TeacherCourseCenter.vue';
import StudentCourseCenter from './components/StudentCourseCenter.vue';

const route = useRoute();

// 当前用户角色
const userRole = ref(getCurrentUserRole());

// 监听登录状态变化
function handleLoginStateChange() {
	userRole.value = getCurrentUserRole();
}

onMounted(() => {
	window.addEventListener('portal-login-state-changed', handleLoginStateChange);
	window.addEventListener('storage', handleStorageChange);
});

function handleStorageChange(event: StorageEvent) {
	if (event.key === 'portal_login_state') {
		handleLoginStateChange();
	}
}

// 根据角色判断显示哪个组件
const showTeacherView = computed(() => userRole.value === 'teacher');
const showStudentView = computed(() => !userRole.value || userRole.value === 'student');
</script>

<template>
  <!-- 讲师视角 -->
  <TeacherCourseCenter v-if="showTeacherView" />

  <!-- 学员视角（未登录或学员角色） -->
  <StudentCourseCenter v-else-if="showStudentView" />

  <!-- 未登录时的提示 -->
  <div
    v-else
    class="flex min-h-[400px] items-center justify-center bg-gray-50"
  >
    <div class="text-center">
      <p class="text-gray-500">加载中...</p>
    </div>
  </div>
</template>
