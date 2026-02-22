<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { message } from 'ant-design-vue';

defineOptions({ name: 'PortalLogin' });

const router = useRouter();

// 表单数据
const form = ref({
	username: '',
	password: '',
	remember: false,
});

// 表单验证状态
const errors = ref({
	username: '',
	password: '',
});

// 密码显示状态
const showPassword = ref(false);

// 页面加载时检查是否有记住的用户名
onMounted(() => {
	const savedState = localStorage.getItem('portal_login_remember');
	if (savedState) {
		const { username } = JSON.parse(savedState);
		form.value.username = username;
		form.value.remember = true;
	}
});

// 用户名验证
function validateUsername(): boolean {
	if (!form.value.username.trim()) {
		errors.value.username = '请输入用户名';
		return false;
	}
	errors.value.username = '';
	return true;
}

// 密码验证
function validatePassword(): boolean {
	if (!form.value.password) {
		errors.value.password = '请输入密码';
		return false;
	}
	errors.value.password = '';
	return true;
}

// 从 localStorage 验证登录
function validateLogin(username: string, password: string) {
	const users = JSON.parse(localStorage.getItem('portal_users') || '[]');
	const user = users.find(
		(u: any) => u.username === username && u.password === password
	);
	return user;
}

// 登录处理
function handleLogin() {
	// 验证表单
	const isUsernameValid = validateUsername();
	const isPasswordValid = validatePassword();

	if (!isUsernameValid || !isPasswordValid) {
		return;
	}

	// 验证用户名和密码
	const user = validateLogin(form.value.username, form.value.password);

	if (!user) {
		message.error('用户名或密码错误');
		return;
	}

	// 保存登录状态
	const loginState = {
		isLoggedIn: true,
		user: {
			id: user.id,
			username: user.username,
			nickname: user.nickname || user.username, // 优先显示昵称
			role: user.role,
			phone: user.phone,
			avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
		},
		loginTime: new Date().toISOString(),
	};
	localStorage.setItem('portal_login_state', JSON.stringify(loginState));

	// 记住用户名
	if (form.value.remember) {
		localStorage.setItem(
			'portal_login_remember',
			JSON.stringify({ username: form.value.username })
		);
	} else {
		localStorage.removeItem('portal_login_remember');
	}

	// 触发自定义事件，通知其他组件登录状态已更新
	window.dispatchEvent(new CustomEvent('portal-login-state-changed'));

	// 成功提示
	message.success('登录成功！');

	// 检查是否有返回URL（用于购买流程闭环）
	const returnUrl = localStorage.getItem('returnUrl');
	if (returnUrl) {
		localStorage.removeItem('returnUrl');
		setTimeout(() => {
			window.location.href = returnUrl;
		}, 1000);
	} else {
		// 默认跳转到首页
		setTimeout(() => {
			router.push('/portal');
		}, 1000);
	}
}

// 跳转到注册页面
function goToRegister() {
	router.push('/portal/register');
}

// 忘记密码
function handleForgetPassword() {
	message.info('请联系管理员重置密码');
}
</script>

<template>
	<div class="login-page min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
		<div class="container mx-auto px-4">
			<div
				class="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
			>
				<div class="grid grid-cols-1 md:grid-cols-2">
					<!-- 左侧品牌区 -->
					<div
						class="bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white"
					>
						<div class="mb-8">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20"
							>
								<span class="text-2xl font-bold">V</span>
							</div>
							<h1 class="mt-6 text-3xl font-bold">欢迎回来</h1>
							<p class="mt-3 text-blue-100">登录您的账号继续学习</p>
						</div>

						<div class="space-y-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
								>
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
								</div>
								<span>海量学员互动</span>
							</div>
							<div class="flex items-center gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
								>
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<span>学习进度追踪</span>
							</div>
							<div class="flex items-center gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
								>
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								</div>
								<span>获得学习证书</span>
							</div>
						</div>
					</div>

					<!-- 右侧表单区 -->
					<div class="p-12">
						<h2 class="mb-6 text-2xl font-bold text-gray-800">账号登录</h2>

						<!-- 用户名 -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-medium text-gray-700">
								用户名
							</label>
							<input
								v-model="form.username"
								type="text"
								placeholder="请输入用户名"
								class="w-full rounded-lg border px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								@blur="validateUsername"
							/>
							<p v-if="errors.username" class="mt-1 text-xs text-red-500">
								{{ errors.username }}
							</p>
						</div>

						<!-- 密码 -->
						<div class="mb-4">
							<div class="flex items-center justify-between">
								<label class="mb-2 block text-sm font-medium text-gray-700">
									密码
								</label>
								<a
									href="#"
									class="mb-2 text-xs text-blue-600 hover:underline"
									@click.prevent="handleForgetPassword"
								>
									忘记密码？
								</a>
							</div>
							<div class="relative">
								<input
									v-model="form.password"
									:type="showPassword ? 'text' : 'password'"
									placeholder="请输入密码"
									class="w-full rounded-lg border px-4 py-2.5 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
									@blur="validatePassword"
									@keyup.enter="handleLogin"
								/>
								<button
									type="button"
									class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									@click="showPassword = !showPassword"
								>
									<svg
										v-if="!showPassword"
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
									<svg
										v-else
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								</button>
							</div>
							<p v-if="errors.password" class="mt-1 text-xs text-red-500">
								{{ errors.password }}
							</p>
						</div>

						<!-- 记住我 -->
						<div class="mb-6">
							<label class="flex cursor-pointer items-center gap-2">
								<input
									v-model="form.remember"
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-600">记住我</span>
							</label>
						</div>

						<!-- 登录按钮 -->
						<button
							class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
							@click="handleLogin"
						>
							登录
						</button>

						<!-- 还没有账号 -->
						<p class="mt-4 text-center text-sm text-gray-600">
							还没有账号？
							<a
								href="#"
								class="font-medium text-blue-600 hover:underline"
								@click.prevent="goToRegister"
							>
								立即注册
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.login-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
}

/* 响应式 */
@media (max-width: 768px) {
	.login-page {
		padding: 20px;
	}

	.login-page .container {
		padding: 0;
	}

	.grid {
		grid-template-columns: 1fr;
	}

	.bg-gradient-to-br {
		padding: 40px;
	}

	.p-12 {
		padding: 24px;
	}
}
</style>
