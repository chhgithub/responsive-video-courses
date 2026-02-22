/**
 * 课程交互状态管理
 * 处理用户操作闭环：购买、学习、收藏等
 */

import { message } from 'ant-design-vue';

import { isCoursePurchased, createOrder } from '#/utils/order-storage';
import { getCourseProgress, saveLearningProgress } from '#/utils/learning-storage';

// ========== 收藏接口 ==========
interface Favorite {
	userId: string;
	courseId: string;
	createdAt: string;
}

const FAVORITES_KEY = 'course_favorites';

// ========== 获取当前用户 ==========
function getCurrentUser(): any {
	try {
		const state = localStorage.getItem('portal_login_state');
		if (!state) return null;
		const loginState = JSON.parse(state);
		return loginState.user;
	} catch {
		return null;
	}
}

// ========== 获取用户收藏列表 ==========
function getFavorites(): Favorite[] {
	const data = localStorage.getItem(FAVORITES_KEY);
	return data ? JSON.parse(data) : [];
}

// ========== 购买状态检查 ==========
export function checkPurchaseStatus(courseId: string): boolean {
	const user = getCurrentUser();
	if (!user) return false;
	return isCoursePurchased(user.id, courseId);
}

// ========== 点击"免费试听" ==========
export function handleTrialLesson(courseId: string, lessonId?: string) {
	// 跳转到课程学习页（试看模式）
	const url = lessonId
		? `/portal/learn/${courseId}?lessonId=${lessonId}&mode=trial`
		: `/portal/learn/${courseId}?mode=trial`;

	window.location.href = url;
}

// ========== 点击"立即购买" ==========
export function handlePurchase(courseId: string) {
	const user = getCurrentUser();

	// 检查登录状态
	if (!user) {
		// 保存当前页面，登录后返回
		localStorage.setItem('returnUrl', `/portal/course-detail/${courseId}`);
		message.warning('请先登录');
		window.location.href = '/portal/login';
		return;
	}

	// 检查是否已购买
	if (checkPurchaseStatus(courseId)) {
		message.info('您已购买此课程');
		return;
	}

	// 跳转到结算页
	window.location.href = `/portal/checkout/${courseId}`;
}

// ========== 点击"开始学习"/"继续学习" ==========
export function handleStartLearning(courseId: string) {
	const user = getCurrentUser();

	if (!user) {
		message.warning('请先登录');
		return;
	}

	// 检查是否已购买
	if (!checkPurchaseStatus(courseId)) {
		message.warning('请先购买课程');
		return;
	}

	// 跳转到课程学习页
	window.location.href = `/portal/learn/${courseId}`;
}

// ========== 检查试看权限 ==========
export function canTrialCourse(): boolean {
	// 所有课程都可以试看第一节课
	return true;
}

// ========== 检查完整学习权限 ==========
export function canLearnFullCourse(courseId: string): boolean {
	return checkPurchaseStatus(courseId);
}

// ========== 切换收藏状态 ==========
export function toggleFavorite(courseId: string): boolean {
	const user = getCurrentUser();
	if (!user) {
		message.warning('请先登录');
		return false;
	}

	const favorites = getFavorites();
	const index = favorites.findIndex(
		f => f.userId === user.id && f.courseId === courseId
	);

	if (index >= 0) {
		// 取消收藏
		favorites.splice(index, 1);
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		message.success('已取消收藏');
		return false;
	} else {
		// 添加收藏
		favorites.push({
			userId: user.id,
			courseId,
			createdAt: new Date().toLocaleString('zh-CN'),
		});
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		message.success('收藏成功');
		return true;
	}
}

// ========== 检查收藏状态 ==========
export function checkFavoriteStatus(courseId: string): boolean {
	const user = getCurrentUser();
	if (!user) return false;

	const favorites = getFavorites();
	return favorites.some(
		f => f.userId === user.id && f.courseId === courseId
	);
}

// ========== 获取课程学习进度 ==========
export function getCourseProgressInfo(courseId: string): {
	progress: number;
	lastStudyAt: string;
} {
	const user = getCurrentUser();
	if (!user) {
		return { progress: 0, lastStudyAt: '-' };
	}

	const progressInfo = getCourseProgress(user.id, courseId);
	return {
		progress: progressInfo.progress,
		lastStudyAt: progressInfo.lastStudyAt,
	};
}

// ========== 保存视频播放进度 ==========
export function updateVideoProgress(
	courseId: string,
	lessonId: string,
	currentTime: number,
	duration: number
) {
	const user = getCurrentUser();
	if (!user) return;

	const progress = Math.round((currentTime / duration) * 100);

	saveLearningProgress({
		userId: user.id,
		courseId,
		lessonId,
		progress,
		lastPosition: currentTime,
		completed: progress >= 100,
		lastStudyAt: new Date().toLocaleString('zh-CN'),
	});
}

// ========== 登录成功后处理 ==========
export function handleLoginSuccess() {
	const returnUrl = localStorage.getItem('returnUrl');
	if (returnUrl) {
		localStorage.removeItem('returnUrl');
		window.location.href = returnUrl;
	}
}
