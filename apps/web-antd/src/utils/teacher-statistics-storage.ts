/**
 * 讲师统计数据存储
 * 处理课程浏览量、报名人数、学员增长等统计数据（不含收入）
 */

import type { Course } from '#/mock/course-center';
import { getCourseStudents, getCourseCompletionRate } from '#/utils/student-data-storage';

// ========== 课程统计数据接口 ==========
export interface CourseStatistics {
	courseId: string;
	courseTitle: string;
	courseCover: string;
	viewCount: number; // 浏览量
	studentCount: number; // 报名人数
	completionRate: number; // 完课率
	avgProgress: number; // 平均学习进度
	todayViews: number; // 今日浏览
	todayEnrollments: number; // 今日报名
	lastUpdated: string;
}

// ========== 整体统计数据接口 ==========
export interface OverallStatistics {
	totalCourses: number; // 总课程数
	publishedCourses: number; // 已发布课程数
	totalStudents: number; // 总学员数
	todayNewStudents: number; // 今日新增学员
	totalViews: number; // 总浏览量
	todayViews: number; // 今日浏览量
	avgCompletionRate: number; // 平均完课率
	topCourses: Array<{
		courseId: string;
		courseTitle: string;
		studentCount: number;
		viewCount: number;
	}>; // 热门课程排行
}

// ========== 获取浏览量统计数据 ==========
function getViewStats(): Map<string, { total: number; today: number; daily: Array<{ date: string; count: number }> }> {
	const data = localStorage.getItem('course_view_stats');
	if (!data) return new Map();

	const stats = JSON.parse(data);
	const map = new Map();

	Object.entries(stats).forEach(([courseId, courseData]: [string, any]) => {
		map.set(courseId, {
			total: courseData.total || 0,
			today: courseData.today || 0,
			daily: courseData.daily || [],
		});
	});

	return map;
}

// ========== 记录课程浏览 ==========
export function recordCourseView(courseId: string): void {
	const stats = getViewStats();
	const today = new Date().toLocaleDateString('zh-CN');

	const courseStats = stats.get(courseId) || { total: 0, today: 0, daily: [] };

	// 更新总浏览量
	courseStats.total += 1;

	// 更新今日浏览
	const todayEntry = courseStats.daily.find((d: any) => d.date === today);
	if (todayEntry) {
		todayEntry.count += 1;
	} else {
		courseStats.daily.push({ date: today, count: 1 });
	}

	// 只保留最近30天的数据
	courseStats.daily = courseStats.daily.slice(-30);

	courseStats.today = todayEntry?.count + 1 || 1;

	stats.set(courseId, courseStats);

	// 转换回对象存储
	const obj: any = {};
	stats.forEach((value, key) => {
		obj[key] = value;
	});

	localStorage.setItem('course_view_stats', JSON.stringify(obj));

	// 同时更新课程数据中的浏览量
	const coursesData = localStorage.getItem('teacher_courses');
	if (coursesData) {
		const courses: Course[] = JSON.parse(coursesData);
		const course = courses.find(c => c.id === courseId);
		if (course) {
			course.viewCount = courseStats.total;
			localStorage.setItem('teacher_courses', JSON.stringify(courses));
		}
	}
}

// ========== 记录课程报名 ==========
export function recordCourseEnrollment(courseId: string): void {
	const data = localStorage.getItem('course_enrollment_stats');
	const stats = data ? JSON.parse(data) : {};
	const today = new Date().toLocaleDateString('zh-CN');

	if (!stats[courseId]) {
		stats[courseId] = {
			total: 0,
			today: 0,
			daily: [],
		};
	}

	stats[courseId].total += 1;

	const todayEntry = stats[courseId].daily.find((d: any) => d.date === today);
	if (todayEntry) {
		todayEntry.count += 1;
	} else {
		stats[courseId].daily.push({ date: today, count: 1 });
	}

	stats[courseId].daily = stats[courseId].daily.slice(-30);
	stats[courseId].today = todayEntry?.count + 1 || 1;

	localStorage.setItem('course_enrollment_stats', JSON.stringify(stats));

	// 同时更新课程数据中的学员数
	const coursesData = localStorage.getItem('teacher_courses');
	if (coursesData) {
		const courses: Course[] = JSON.parse(coursesData);
		const course = courses.find(c => c.id === courseId);
		if (course) {
			course.studentCount = stats[courseId].total;
			localStorage.setItem('teacher_courses', JSON.stringify(courses));
		}
	}
}

// ========== 获取单个课程统计数据 ==========
export function getCourseStatistics(courseId: string): CourseStatistics | null {
	// 获取课程信息
	const coursesData = localStorage.getItem('teacher_courses');
	if (!coursesData) return null;

	const courses: Course[] = JSON.parse(coursesData);
	const course = courses.find(c => c.id === courseId);
	if (!course) return null;

	// 获取浏览量统计
	const viewStats = getViewStats();
	const viewData = viewStats.get(courseId) || { total: 0, today: 0 };

	// 获取学员统计
	const completionData = getCourseCompletionRate(courseId);

	// 获取今日报名数
	const enrollmentData = localStorage.getItem('course_enrollment_stats');
	const enrollmentStats = enrollmentData ? JSON.parse(enrollmentData) : {};
	const todayEnrollments = enrollmentStats[courseId]?.today || 0;

	return {
		courseId: course.id,
		courseTitle: course.title,
		courseCover: course.coverImage,
		viewCount: viewData.total,
		studentCount: completionData.totalStudents,
		completionRate: completionData.completionRate,
		avgProgress: completionData.avgProgress,
		todayViews: viewData.today,
		todayEnrollments,
		lastUpdated: new Date().toLocaleString('zh-CN'),
	};
}

// ========== 获取整体统计数据 ==========
export function getOverallStatistics(teacherId: string): OverallStatistics {
	// 获取讲师的所有课程
	const coursesData = localStorage.getItem('teacher_courses');
	if (!coursesData) {
		return {
			totalCourses: 0,
			publishedCourses: 0,
			totalStudents: 0,
			todayNewStudents: 0,
			totalViews: 0,
			todayViews: 0,
			avgCompletionRate: 0,
			topCourses: [],
		};
	}

	const courses: Course[] = JSON.parse(coursesData);
	const teacherCourses = courses.filter(c => c.teacherId === teacherId);

	// 基础统计
	const totalCourses = teacherCourses.length;
	const publishedCourses = teacherCourses.filter(c => c.status === 'published').length;

	// 学员统计
	let totalStudents = 0;
	let todayNewStudents = 0;
	let totalCompletionRate = 0;
	const courseStats: any[] = [];

	teacherCourses.forEach(course => {
		const students = getCourseStudents(course.id);
		const completionData = getCourseCompletionRate(course.id);
		const stats = getCourseStatistics(course.id);

		totalStudents += students.length;
		totalCompletionRate += completionData.completionRate;

		if (stats) {
			todayNewStudents += stats.todayEnrollments;
			totalViews += course.viewCount || 0;
			todayViews += stats.todayViews;

			courseStats.push({
				courseId: course.id,
				courseTitle: course.title,
				studentCount: students.length,
				viewCount: course.viewCount || 0,
			});
		}
	});

	// 平均完课率
	const avgCompletionRate = totalCourses > 0
		? Math.round(totalCompletionRate / totalCourses)
		: 0;

	// 热门课程排行（按学员数排序）
	const topCourses = courseStats
		.sort((a, b) => b.studentCount - a.studentCount)
		.slice(0, 5);

	return {
		totalCourses,
		publishedCourses,
		totalStudents,
		todayNewStudents,
		totalViews,
		todayViews,
		avgCompletionRate,
		topCourses,
	};
}

// ========== 获取学员增长趋势数据 ==========
export function getStudentGrowthTrend(
	courseIds?: string[],
	days: number = 30
): Array<{ date: string; count: number }> {
	const enrollmentData = localStorage.getItem('course_enrollment_stats');
	if (!enrollmentData) return [];

	const stats: any = JSON.parse(enrollmentData);
	const dailyData: Map<string, number> = new Map();

	// 聚合所有课程的每日报名数据
	Object.entries(stats).forEach(([courseId, courseData]: [string, any]) => {
		if (courseIds && !courseIds.includes(courseId)) return;

		courseData.daily?.forEach((dayData: any) => {
			const current = dailyData.get(dayData.date) || 0;
			dailyData.set(dayData.date, current + dayData.count);
		});
	});

	// 生成最近N天的数据
	const result: Array<{ date: string; count: number }> = [];
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toLocaleDateString('zh-CN');

		result.push({
			date: dateStr,
			count: dailyData.get(dateStr) || 0,
		});
	}

	return result;
}

// ========== 获取课程销量排行 ==========
export function getTopCoursesBySales(teacherId: string, limit: number = 10) {
	const overallStats = getOverallStatistics(teacherId);
	return overallStats.topCourses.slice(0, limit);
}
