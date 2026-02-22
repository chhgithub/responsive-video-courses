<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { message } from 'ant-design-vue';

defineOptions({ name: 'PortalRegister' });

const router = useRouter();

// 表单数据
const form = ref({
	role: 'student' as 'student' | 'teacher',
	username: '',
	nickname: '', // 新增：昵称
	phone: '', // 新增：手机号
	password: '',
	confirmPassword: '',
	avatar: '', // 新增：头像
	agreePolicy: false,
});

// 头像输入框引用
const avatarInput = ref<HTMLInputElement>();

// 表单验证状态
const errors = ref({
	username: '',
	nickname: '', // 新增
	phone: '', // 新增
	password: '',
	confirmPassword: '',
	agreePolicy: '',
});

// 密码强度
const passwordStrength = computed(() => {
	const pwd = form.value.password;
	if (!pwd) return { level: 0, text: '', class: '' };
	if (pwd.length < 6) return { level: 1, text: '弱', class: 'weak' };
	if (pwd.length < 10) return { level: 2, text: '中', class: 'medium' };
	return { level: 3, text: '强', class: 'strong' };
});

// 强度条宽度
const strengthWidth = computed(() => {
	return `${(passwordStrength.value.level / 3) * 100}%`;
});

// 用户名验证
function validateUsername(): boolean {
	const username = form.value.username.trim();
	if (!username) {
		errors.value.username = '请输入用户名';
		return false;
	}
	const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
	if (!regex.test(username)) {
		errors.value.username =
			'用户名必须是3-20位字母、数字或下划线，且以字母开头';
		return false;
	}
	errors.value.username = '';
	return true;
}

// 昵称验证
function validateNickname(): boolean {
	const nickname = form.value.nickname.trim();
	if (!nickname) {
		errors.value.nickname = '请输入昵称';
		return false;
	}
	if (nickname.length < 2 || nickname.length > 20) {
		errors.value.nickname = '昵称长度为2-20位';
		return false;
	}
	errors.value.nickname = '';
	return true;
}

// 手机号验证
function validatePhone(): boolean {
	const phone = form.value.phone.trim();
	if (!phone) {
		errors.value.phone = '请输入手机号';
		return false;
	}
	const regex = /^1[3-9]\d{9}$/;
	if (!regex.test(phone)) {
		errors.value.phone = '请输入正确的手机号';
		return false;
	}
	errors.value.phone = '';
	return true;
}

// 检查用户名是否存在
function checkUsernameExists(username: string): boolean {
	const users = JSON.parse(localStorage.getItem('portal_users') || '[]');
	return users.some((u: any) => u.username === username);
}

// 检查手机号是否存在
function checkPhoneExists(phone: string): boolean {
	const users = JSON.parse(localStorage.getItem('portal_users') || '[]');
	return users.some((u: any) => u.phone === phone);
}

// 密码验证
function validatePassword(): boolean {
	if (!form.value.password) {
		errors.value.password = '请输入密码';
		return false;
	}
	if (form.value.password.length < 6) {
		errors.value.password = '密码至少需要6位';
		return false;
	}
	errors.value.password = '';
	return true;
}

// 确认密码验证
function validateConfirmPassword(): boolean {
	if (!form.value.confirmPassword) {
		errors.value.confirmPassword = '请确认密码';
		return false;
	}
	if (form.value.confirmPassword !== form.value.password) {
		errors.value.confirmPassword = '两次密码不一致';
		return false;
	}
	errors.value.confirmPassword = '';
	return true;
}

// 协议验证
function validateAgree(): boolean {
	if (!form.value.agreePolicy) {
		errors.value.agreePolicy = '请先同意用户协议和隐私政策';
		return false;
	}
	errors.value.agreePolicy = '';
	return true;
}

// 头像上传 - 转换为 base64
function handleAvatarUpload(event: Event) {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;

	// 验证格式
	const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
	if (!validTypes.includes(file.type)) {
		message.error('只支持 jpg、png、gif 格式的图片');
		return;
	}

	// 验证大小（2MB）
	if (file.size > 2 * 1024 * 1024) {
		message.error('图片大小不能超过 2MB');
		return;
	}

	// 转换为 base64
	const reader = new FileReader();
	reader.onload = (e) => {
		form.value.avatar = e.target?.result as string;
		message.success('头像上传成功');
	};
	reader.readAsDataURL(file);
}

// 提交注册
function handleRegister() {
	// 验证所有字段
	const isUsernameValid = validateUsername();
	const isNicknameValid = validateNickname();
	const isPhoneValid = validatePhone();
	const isPasswordValid = validatePassword();
	const isConfirmValid = validateConfirmPassword();
	const isAgreeValid = validateAgree();

	if (
		!isUsernameValid ||
		!isNicknameValid ||
		!isPhoneValid ||
		!isPasswordValid ||
		!isConfirmValid ||
		!isAgreeValid
	) {
		return;
	}

	// 检查用户名是否已存在
	if (checkUsernameExists(form.value.username)) {
		message.error('用户名已存在，请更换');
		return;
	}

	// 检查手机号是否已存在
	if (checkPhoneExists(form.value.phone)) {
		message.error('该手机号已被注册');
		return;
	}

	// 生成默认头像（如果未上传）
	const avatar =
		form.value.avatar ||
		`https://api.dicebear.com/7.x/avataaars/svg?seed=${form.value.username}`;

	// 保存用户数据
	const newUser = {
		id: Date.now().toString(),
		role: form.value.role,
		username: form.value.username,
		nickname: form.value.nickname,
		phone: form.value.phone,
		avatar: avatar,
		password: form.value.password,
		createTime: new Date().toLocaleString('zh-CN'),
	};

	const users = JSON.parse(localStorage.getItem('portal_users') || '[]');
	users.push(newUser);
	localStorage.setItem('portal_users', JSON.stringify(users));

	// 成功提示
	message.success('注册成功！即将跳转到登录页...');
	setTimeout(() => {
		router.push('/portal/login');
	}, 1500);
}

// 跳转到登录
function goToLogin() {
	router.push('/portal/login');
}
</script>

<template>
	<div class="register-page min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
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
							<h1 class="mt-6 text-3xl font-bold">欢迎加入我们</h1>
							<p class="mt-3 text-blue-100">创建账号，开启学习之旅</p>
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
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span>海量优质课程</span>
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
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span>专业讲师指导</span>
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
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<span>学习证书认证</span>
							</div>
						</div>
					</div>

					<!-- 右侧表单区 -->
					<div class="p-12">
						<h2 class="mb-6 text-2xl font-bold text-gray-800">创建账号</h2>

						<!-- 角色选择 -->
						<div class="mb-4">
							<label class="mb-3 block text-sm font-medium text-gray-700">
								选择角色
							</label>
							<div class="grid grid-cols-2 gap-4">
								<div
									class="role-card cursor-pointer rounded-lg border-2 p-4 text-center transition-all"
									:class="
										form.role === 'student'
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:border-blue-300'
									"
									@click="form.role = 'student'"
								>
									<div class="mb-2 text-3xl">👨‍🎓</div>
									<div class="font-medium text-gray-800">学员</div>
									<div class="mt-1 text-xs text-gray-500">学习课程</div>
								</div>
								<div
									class="role-card cursor-pointer rounded-lg border-2 p-4 text-center transition-all"
									:class="
										form.role === 'teacher'
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:border-blue-300'
									"
									@click="form.role = 'teacher'"
								>
									<div class="mb-2 text-3xl">👨‍🏫</div>
									<div class="font-medium text-gray-800">讲师</div>
									<div class="mt-1 text-xs text-gray-500">分享知识</div>
								</div>
							</div>
						</div>

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
							<p v-else class="mt-1 text-xs text-gray-400">
								3-20位字母、数字或下划线
							</p>
						</div>

						<!-- 昵称 -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-medium text-gray-700">
								昵称
							</label>
							<input
								v-model="form.nickname"
								type="text"
								placeholder="请输入昵称"
								class="w-full rounded-lg border px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								@blur="validateNickname"
							/>
							<p v-if="errors.nickname" class="mt-1 text-xs text-red-500">
								{{ errors.nickname }}
							</p>
							<p v-else class="mt-1 text-xs text-gray-400">
								2-20位中文、字母、数字或符号
							</p>
						</div>

						<!-- 手机号 -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-medium text-gray-700">
								手机号
							</label>
							<input
								v-model="form.phone"
								type="text"
								placeholder="请输入手机号"
								maxlength="11"
								class="w-full rounded-lg border px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								@blur="validatePhone"
							/>
							<p v-if="errors.phone" class="mt-1 text-xs text-red-500">
								{{ errors.phone }}
							</p>
							<p v-else class="mt-1 text-xs text-gray-400">
								用于找回密码和账号安全验证
							</p>
						</div>

						<!-- 密码 -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-medium text-gray-700">
								密码
							</label>
							<input
								v-model="form.password"
								type="password"
								placeholder="请输入密码"
								class="w-full rounded-lg border px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								@blur="validatePassword"
							/>
							<!-- 密码强度指示器 -->
							<div
								v-if="form.password"
								class="mt-2 flex items-center gap-2"
							>
								<div class="strength-bar flex-1">
									<div
										class="strength-fill h-1 transition-all"
										:class="passwordStrength.class"
										:style="{ width: strengthWidth }"
									></div>
								</div>
								<span
									class="text-xs"
									:class="{
										'text-red-500': passwordStrength.class === 'weak',
										'text-orange-500':
											passwordStrength.class === 'medium',
										'text-green-500':
											passwordStrength.class === 'strong',
									}"
								>
									{{ passwordStrength.text }}
								</span>
							</div>
						</div>

						<!-- 确认密码 -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-medium text-gray-700">
								确认密码
							</label>
							<input
								v-model="form.confirmPassword"
								type="password"
								placeholder="请再次输入密码"
								class="w-full rounded-lg border px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								@blur="validateConfirmPassword"
							/>
							<p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">
								{{ errors.confirmPassword }}
							</p>
						</div>

						<!-- 头像上传 -->
						<div class="mb-6">
							<label class="mb-3 block text-sm font-medium text-gray-700">
								头像
							</label>
							<div class="flex items-center gap-6">
								<!-- 头像预览 -->
								<div class="relative">
									<div
										class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50"
									>
										<img
											v-if="form.avatar"
											:src="form.avatar"
											alt="头像预览"
											class="h-full w-full object-cover"
										/>
										<svg
											v-else
											class="h-10 w-10 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
									</div>
								</div>

								<!-- 上传按钮 -->
								<div>
									<input
										ref="avatarInput"
										type="file"
										class="hidden"
										accept="image/jpeg,image/jpg,image/png,image/gif"
										@change="handleAvatarUpload"
									/>
									<button
										type="button"
										class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
										@click="avatarInput?.click()"
									>
										选择图片
									</button>
									<p class="mt-2 text-xs text-gray-400">
										支持 jpg、png、gif 格式，大小不超过 2MB
									</p>
								</div>
							</div>
						</div>

						<!-- 同意协议 -->
						<div class="mb-6">
							<label class="flex cursor-pointer items-start gap-2">
								<input
									v-model="form.agreePolicy"
									type="checkbox"
									class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-sm text-gray-600">
									我已阅读并同意
									<a href="#" class="text-blue-600 hover:underline">
										《用户协议》
									</a>
									和
									<a href="#" class="text-blue-600 hover:underline">
										《隐私政策》
									</a>
								</span>
							</label>
							<p v-if="errors.agreePolicy" class="mt-1 text-xs text-red-500">
								{{ errors.agreePolicy }}
							</p>
						</div>

						<!-- 注册按钮 -->
						<button
							class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
							@click="handleRegister"
						>
							立即注册
						</button>

						<!-- 已有账号 -->
						<p class="mt-4 text-center text-sm text-gray-600">
							已有账号？
							<a
								href="#"
								class="font-medium text-blue-600 hover:underline"
								@click.prevent="goToLogin"
							>
								立即登录
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.register-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
}

/* 密码强度指示器 */
.strength-bar {
	height: 4px;
	background: #e5e7eb;
	border-radius: 2px;
	overflow: hidden;
}

.strength-fill.weak {
	background: #ef4444;
}

.strength-fill.medium {
	background: #f59e0b;
}

.strength-fill.strong {
	background: #22c55e;
}

/* 角色卡片选中效果 */
.role-card {
	position: relative;
}

.role-card.active {
	border-color: #3b82f6;
}

.role-card.active::before {
	content: '';
	position: absolute;
	top: 8px;
	right: 8px;
	width: 20px;
	height: 20px;
	background: #3b82f6;
	border-radius: 50%;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 20 20'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E");
	background-size: 12px;
	background-position: center;
	background-repeat: no-repeat;
}

/* 响应式 */
@media (max-width: 768px) {
	.register-page {
		padding: 20px;
	}

	.register-page .container {
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
