/**
 * 学员数据管理存储
 * 处理讲师查看学员列表、学习进度、完课率等功能
 */

import { getUserLearningRecords, getCourseProgress } from '#/utils/learning-storage';
import { getUserOrders } from '#/utils/order-storage';

// ========== 学员信息接口 ==========
export interface StudentInfo {
	userId: string;
	username: string;
	nickname: string;
	avatar: string;
	phone: string;
	enrolledAt: string; // 报名时间
	lastStudyAt: string; // 最后学习时间
	progress: number; // 学习进度 0-100
	completedLessons: number; // 已完成课时数
	totalLessons: number; // 总课时数
}

// ========== 获取课程的学员列表 ==========
export function getCourseStudents(courseId: string): StudentInfo[] {
	// 获取购买了该课程的所有订单
	const allOrders = getUserOrders();
	const courseOrders = allOrders.filter(order =>
		order.courseId === courseId &&
		order.status === 'paid'
	);

	// 获取课程信息计算总课时数
	const courseData = localStorage.getItem('teacher_courses');
	if (!courseData) return [];

	const courses = JSON.parse(courseData);
	const course = courses.find((c: any) => c.id === courseId);

	const totalLessons = course?.chapters?.reduce(
		(sum: number, chapter: any) => sum + (chapter.lessons?.length || 0),
		0
	) || 0;

	// 构建学员信息
	const students: StudentInfo[] = courseOrders.map(order => {
		// 获取用户信息
		const usersData = localStorage.getItem('portal_users');
		const users = usersData ? JSON.parse(usersData) : [];
		const user = users.find((u: any) => u.id === order.userId);

		// 获取学习进度
		const progressInfo = getCourseProgress(order.userId, courseId);

		return {
			userId: order.userId,
			username: user?.username || '未知',
			nickname: user?.nickname || user?.username || '未知',
			avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.userId}`,
			phone: user?.phone || '-',
			enrolledAt: order.paidAt || order.createdAt,
			lastStudyAt: progressInfo.lastStudyAt,
			progress: progressInfo.progress,
			completedLessons: progressInfo.completedLessons,
			totalLessons,
		};
	});

	// 按最后学习时间排序
	return students.sort((a, b) =>
		b.lastStudyAt.localeCompare(a.lastStudyAt)
	);
}

// ========== 获取学员在课程中的详细进度 ==========
export function getStudentProgress(
	userId: string,
	courseId: string
): {
	totalLessons: number;
	completedLessons: number;
	progress: number;
	lastStudyAt: string;
	records: Array<{
		lessonId: string;
		lessonTitle: string;
		chapterId: string;
		chapterTitle: string;
		progress: number;
		completed: boolean;
		lastStudyAt: string;
	}>;
} {
	const progressInfo = getCourseProgress(userId, courseId);

	// 获取课程章节信息
	const courseData = localStorage.getItem('teacher_courses');
	if (!courseData) {
		return {
			totalLessons: 0,
			completedLessons: 0,
			progress: 0,
			lastStudyAt: '-',
			records: [],
		};
	}

	const courses = JSON.parse(courseData);
	const course = courses.find((c: any) => c.id === courseId);

	if (!course) {
		return {
			totalLessons: 0,
			completedLessons: 0,
			progress: 0,
			lastStudyAt: '-',
			records: [],
		};
	}

	// 构建详细的课时学习记录
	const records: any[] = [];
	course.chapters?.forEach((chapter: any) => {
		chapter.lessons?.forEach((lesson: any) => {
			const lessonRecord = getUserLearningRecords(userId).find(
				r => r.lessonId === lesson.id
			);

			records.push({
				lessonId: lesson.id,
				lessonTitle: lesson.title,
				chapterId: chapter.id,
				chapterTitle: chapter.title,
				progress: lessonRecord?.progress || 0,
				completed: lessonRecord?.completed || false,
				lastStudyAt: lessonRecord?.lastStudyAt || '-',
			});
		});
	});

	return {
		totalLessons: progressInfo.totalLessons,
		completedLessons: progressInfo.completedLessons,
		progress: progressInfo.progress,
		lastStudyAt: progressInfo.lastStudyAt,
		records,
	};
}

// ========== 获取课程完课率统计 ==========
export function getCourseCompletionRate(courseId: string): {
	totalStudents: number;
	completedStudents: number; // 完课率>=80%
	completionRate: number;
	avgProgress: number; // 平均进度
} {
	const students = getCourseStudents(courseId);

	const totalStudents = students.length;
	const completedStudents = students.filter(s => s.progress >= 80).length;

	const totalProgress = students.reduce((sum, s) => sum + s.progress, 0);
	const avgProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

	return {
		totalStudents,
		completedStudents,
		completionRate: totalStudents > 0
			? Math.round((completedStudents / totalStudents) * 100)
			: 0,
		avgProgress,
	};
}

// ========== 获取今日活跃学员数 ==========
export function getTodayActiveStudents(courseId: string): number {
	const students = getCourseStudents(courseId);
	const today = new Date().toLocaleDateString('zh-CN');

	return students.filter(student => {
		const lastStudyDate = new Date(student.lastStudyAt).toLocaleDateString('zh-CN');
		return lastStudyDate === today;
	}).length;
}

// ========== 搜索学员 ==========
export function searchStudents(
	courseId: string,
	keyword: string
): StudentInfo[] {
	const students = getCourseStudents(courseId);

	if (!keyword.trim()) return students;

	const lowerKeyword = keyword.toLowerCase();

	return students.filter(student =>
		student.nickname.toLowerCase().includes(lowerKeyword) ||
		student.username.toLowerCase().includes(lowerKeyword) ||
		student.phone.includes(keyword)
	);
}

// ========== 导出学员数据 ==========
export function exportStudentData(courseId: string): string {
	const students = getCourseStudents(courseId);

	// CSV 格式
	const headers = ['用户名', '昵称', '手机号', '报名时间', '最后学习时间', '学习进度', '已完成课时', '总课时数'];
	const rows = students.map(s => [
		s.username,
		s.nickname,
		s.phone,
		s.enrolledAt,
		s.lastStudyAt,
		`${s.progress}%`,
		s.completedLessons.toString(),
		s.totalLessons.toString(),
	]);

	const csvContent = [
		headers.join(','),
		...rows.map(row => row.join(',')),
	].join('\n');

	return csvContent;
}
