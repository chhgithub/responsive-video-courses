/**
 * 讲师课程管理存储
 * 处理讲师对课程的增删改查、上架下架等操作
 */

import type { Course } from '#/mock/course-center';

const TEACHER_COURSES_KEY = 'teacher_courses';

// ========== 获取所有讲师课程 ==========
function getAllCourses(): Course[] {
	const data = localStorage.getItem(TEACHER_COURSES_KEY);
	return data ? JSON.parse(data) : [];
}

// ========== 获取当前讲师ID ==========
function getCurrentTeacherId(): string | null {
	try {
		const state = localStorage.getItem('portal_login_state');
		if (!state) return null;
		const loginState = JSON.parse(state);
		// 讲师角色检查
		if (loginState.user?.role !== 'teacher') return null;
		return loginState.user.id;
	} catch {
		return null;
	}
}

// ========== 获取讲师的课程列表 ==========
export function getTeacherCourses(): Course[] {
	const teacherId = getCurrentTeacherId();
	if (!teacherId) return [];

	const allCourses = getAllCourses();
	// 过滤出当前讲师的课程
	return allCourses.filter(course => course.teacherId === teacherId);
}

// ========== 创建课程 ==========
export function createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
	const courses = getAllCourses();
	const teacherId = getCurrentTeacherId();

	if (!teacherId) {
		throw new Error('未登录或不是讲师角色');
	}

	const newCourse: Course = {
		...courseData,
		id: `course_${Date.now()}`,
		teacherId,
		createdAt: new Date().toLocaleString('zh-CN'),
		updatedAt: new Date().toLocaleString('zh-CN'),
		viewCount: 0,
		studentCount: 0,
	};

	courses.push(newCourse);
	localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(courses));

	return newCourse;
}

// ========== 更新课程 ==========
export function updateCourse(courseId: string, updates: Partial<Course>): Course | null {
	const courses = getAllCourses();
	const teacherId = getCurrentTeacherId();

	if (!teacherId) return null;

	const index = courses.findIndex(
		c => c.id === courseId && c.teacherId === teacherId
	);

	if (index === -1) return null;

	// 更新课程信息
	courses[index] = {
		...courses[index],
		...updates,
		updatedAt: new Date().toLocaleString('zh-CN'),
	};

	localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(courses));

	return courses[index];
}

// ========== 删除课程 ==========
export function deleteCourse(courseId: string): boolean {
	const courses = getAllCourses();
	const teacherId = getCurrentTeacherId();

	if (!teacherId) return false;

	const initialLength = courses.length;
	const filtered = courses.filter(
		c => !(c.id === courseId && c.teacherId === teacherId)
	);

	if (filtered.length === initialLength) return false;

	localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(filtered));

	return true;
}

// ========== 批量删除课程 ==========
export function batchDeleteCourses(courseIds: string[]): number {
	const courses = getAllCourses();
	const teacherId = getCurrentTeacherId();

	if (!teacherId) return 0;

	const initialLength = courses.length;
	const filtered = courses.filter(
		c => !(courseIds.includes(c.id) && c.teacherId === teacherId)
	);

	const deletedCount = initialLength - filtered.length;
	if (deletedCount > 0) {
		localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(filtered));
	}

	return deletedCount;
}

// ========== 上架课程 ==========
export function publishCourse(courseId: string): Course | null {
	return updateCourse(courseId, { status: 'published' });
}

// ========== 下架课程 ==========
export function unpublishCourse(courseId: string): Course | null {
	return updateCourse(courseId, { status: 'draft' });
}

// ========== 批量上架/下架 ==========
export function batchUpdateCourseStatus(
	courseIds: string[],
	status: 'published' | 'draft'
): number {
	const courses = getAllCourses();
	const teacherId = getCurrentTeacherId();

	if (!teacherId) return 0;

	let updatedCount = 0;
	courses.forEach(course => {
		if (courseIds.includes(course.id) && course.teacherId === teacherId) {
			course.status = status;
			course.updatedAt = new Date().toLocaleString('zh-CN');
			updatedCount++;
		}
	});

	if (updatedCount > 0) {
		localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(courses));
	}

	return updatedCount;
}

// ========== 获取课程详情 ==========
export function getCourseById(courseId: string): Course | null {
	const courses = getAllCourses();
	const teacherId = getCurrentTeacherId();

	if (!teacherId) return null;

	return courses.find(
		c => c.id === courseId && c.teacherId === teacherId
	) || null;
}

// ========== 更新课程统计数据 ==========
export function updateCourseStats(
	courseId: string,
	stats: {
		viewCount?: number;
		studentCount?: number;
	}
): boolean {
	const courses = getAllCourses();
	const index = courses.findIndex(c => c.id === courseId);

	if (index === -1) return false;

	if (stats.viewCount !== undefined) {
		courses[index].viewCount = stats.viewCount;
	}
	if (stats.studentCount !== undefined) {
		courses[index].studentCount = stats.studentCount;
	}

	localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(courses));

	return true;
}
