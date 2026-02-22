/**
 * 课程中心 Mock 数据
 */

// 用户角色类型
export type UserRole = 'teacher' | 'student' | null;

// 课程类型
export type CourseType = 'video' | 'audio' | 'document' | 'text';
export type LessonType = 'video' | 'audio' | 'document' | 'text';
export type VideoSource = 'local' | 'aliyun' | 'tencent' | 'polyv';
export type ValidityType = 'permanent' | 'days' | 'date_range';
export type CourseStatus = 'draft' | 'published' | 'offline';

// 标签类型
export type TagType = 'age' | 'category' | 'payment' | 'difficulty' | 'format';

// 讲师接口
export interface Teacher {
	id: string;
	name: string;
	avatar: string;
	bio: string;
	specialties: string[];
}

// 章节接口
export interface Chapter {
	id: string;
	courseId: string;
	title: string;
	description?: string;
	sortOrder: number;
	lessons: Lesson[];
	createdAt: string;
}

// 课时接口
export interface Lesson {
	id: string;
	chapterId: string;
	courseId: string;
	title: string;
	type: LessonType;
	content?: string;
	videoUrl?: string;
	videoSource?: VideoSource;
	videoDuration?: number; // 秒
	documentUrl?: string;
	isTrial: boolean; // 是否试听
	isFree: boolean; // 是否免费
	sortOrder: number;
	createdAt: string;
}

// 课程接口
export interface Course {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	categoryId: string;
	category: string;
	teacherId: string;
	teacher: Teacher;
	price: number; // 单位：分
	originalPrice?: number;
	isFree: boolean;
	tags: string[];
	ageRange: string;
	level?: string;
	status: CourseStatus;
	trialLessonId?: string; // 试听课ID
	validDays: number; // 0表示永久
	validType: ValidityType;
	validStartDate?: string;
	validEndDate?: string;
	studentCount: number; // 学员数
	viewCount: number; // 浏览量
	rating: number;
	reviewCount: number;
	chapters: Chapter[];
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
}

// 课程套餐接口
export interface CoursePackage {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	courseIds: string[];
	courses: Course[];
	price: number;
	originalPrice: number;
	tags: string[];
	ageRange: string;
	validDays: number;
	validType: ValidityType;
	studentCount: number;
	rating: number;
	reviewCount: number;
	status: CourseStatus;
	sortOrder: number;
	createdAt: string;
}

// 视频库接口
export interface VideoLibrary {
	id: string;
	title: string;
	description: string;
	videoUrl: string;
	videoSource: VideoSource;
	duration: number; // 秒
	size: number; // 字节
	format: string;
	coverImage?: string;
	categoryId?: string;
	category?: string;
	uploaderId: string;
	uploader: Teacher;
	status: 'processing' | 'ready' | 'failed';
	createdAt: string;
}

// 微课程接口
export interface MicroCourse {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	videoUrl: string;
	duration: number; // 秒
	price: number;
	tags: string[];
	ageRange: string;
	categoryId: string;
	category: string;
	teacherId: string;
	teacher: Teacher;
	studentCount: number;
	rating: number;
	status: CourseStatus;
	sortOrder: number;
	createdAt: string;
}

// 公益课程接口
export interface PublicCourse {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	content: string;
	tags: string[];
	ageRange: string;
	categoryId: string;
	category: string;
	teacherId: string;
	teacher: Teacher;
	enrollmentCount: number;
	rating: number;
	status: CourseStatus;
	sortOrder: number;
	createdAt: string;
}

// 科研赋能接口
export interface ResearchProgram {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	requirements: string;
	tags: string[];
	ageRange: string;
	categoryId: string;
	category: string;
	capacity: number;
	enrolledCount: number;
	teacherId: string;
	teacher: Teacher;
	enrollmentDeadline: string;
	status: CourseStatus;
	sortOrder: number;
	createdAt: string;
}

// 集训计划接口
export interface TrainingPlan {
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
	categoryId: string;
	category: string;
	status: 'enrolling' | 'full' | 'closed' | 'cancelled';
	sortOrder: number;
	createdAt: string;
}

// 学习记录接口
export interface LearningRecord {
	id: string;
	userId: string;
	userName: string;
	userAvatar: string;
	courseId: string;
	lessonId: string;
	packageId?: string;
	progress: number; // 完成百分比
	lastPosition: number; // 最后播放位置（秒）
	completed: boolean;
	completedAt?: string;
	lastStudyAt: string;
	createdAt: string;
	updatedAt: string;
}

// 课程评价接口
export interface CourseReview {
	id: string;
	userId: string;
	userName: string;
	userAvatar: string;
	courseId: string;
	packageId?: string;
	rating: number;
	content: string;
	images?: string[];
	status: 'pending' | 'approved' | 'rejected';
	createdAt: string;
}

// 咨询记录接口
export interface Consultation {
	id: string;
	userId: string;
	userName: string;
	programId: string;
	question: string;
	answer?: string;
	status: 'pending' | 'answered' | 'closed';
	createdAt: string;
	answeredAt?: string;
}

// 标签接口
export interface Tag {
	id: string;
	name: string;
	type: TagType;
	color?: string;
	usageCount: number;
}

// 课程分类接口
export interface CourseCategory {
	id: string;
	name: string;
	icon?: string;
	description?: string;
	parentId?: string;
	sortOrder: number;
}

// ============ Mock 数据 ============

// Mock 讲师数据
export const mockTeachers: Teacher[] = [
	{
		id: 't1',
		name: '张老师',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
		bio: '10年Python教学经验',
		specialties: ['编程', 'Python', '人工智能'],
	},
	{
		id: 't2',
		name: '李老师',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2',
		bio: '资深少儿美术教育专家',
		specialties: ['美术', '创意绘画', '水彩'],
	},
	{
		id: 't3',
		name: '王老师',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3',
		bio: '钢琴演奏硕士',
		specialties: ['音乐', '钢琴', '乐理'],
	},
];

// Mock 课程数据
export const mockCourses: Course[] = [
	{
		id: 'c1',
		title: 'Python零基础入门课程',
		description: '本课程适合零基础学员，从Python安装开始，循序渐进讲解Python基础语法、数据类型、流程控制、函数、面向对象等核心知识点。',
		coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
		categoryId: 'cat1',
		category: '编程',
		teacherId: 't1',
		teacher: mockTeachers[0],
		price: 19900,
		originalPrice: 29900,
		isFree: false,
		tags: ['7-12岁', '编程', '付费', '入门'],
		ageRange: '7-12岁',
		level: '入门',
		status: 'published',
		trialLessonId: 'l1',
		validDays: 0,
		validType: 'permanent',
		studentCount: 1234,
		viewCount: 5678,
		rating: 4.8,
		reviewCount: 123,
		chapters: [
			{
				id: 'ch1',
				courseId: 'c1',
				title: '第一章：Python环境搭建',
				sortOrder: 1,
				lessons: [
					{
						id: 'l1',
						chapterId: 'ch1',
						courseId: 'c1',
						title: '1.1 Python安装与配置',
						type: 'video',
						videoUrl: 'https://example.com/video/l1.mp4',
						videoSource: 'local',
						videoDuration: 930,
						isTrial: true,
						isFree: false,
						sortOrder: 1,
						createdAt: '2025-01-15',
					},
					{
						id: 'l2',
						chapterId: 'ch1',
						courseId: 'c1',
						title: '1.2 IDE选择与使用',
						type: 'video',
						videoUrl: 'https://example.com/video/l2.mp4',
						videoSource: 'local',
						videoDuration: 765,
						isTrial: false,
						isFree: false,
						sortOrder: 2,
						createdAt: '2025-01-15',
					},
				],
				createdAt: '2025-01-15',
			},
		],
		sortOrder: 1,
		createdAt: '2025-01-15',
		updatedAt: '2025-02-10',
	},
	{
		id: 'c2',
		title: '少儿创意绘画',
		description: '通过趣味绘画激发孩子的创造力和想象力，学习基础绘画技巧。',
		coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
		categoryId: 'cat2',
		category: '美术',
		teacherId: 't2',
		teacher: mockTeachers[1],
		price: 0,
		isFree: true,
		tags: ['3-6岁', '美术', '免费'],
		ageRange: '3-6岁',
		status: 'published',
		validDays: 0,
		validType: 'permanent',
		studentCount: 456,
		viewCount: 2345,
		rating: 4.9,
		reviewCount: 89,
		chapters: [],
		sortOrder: 2,
		createdAt: '2025-01-20',
		updatedAt: '2025-02-05',
	},
	{
		id: 'c3',
		title: '钢琴基础教程',
		description: '从零开始学习钢琴，掌握正确的演奏方法和基础乐理知识。',
		coverImage: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=800',
		categoryId: 'cat3',
		category: '音乐',
		teacherId: 't3',
		teacher: mockTeachers[2],
		price: 29900,
		originalPrice: 39900,
		isFree: false,
		tags: ['7-12岁', '音乐', '付费', '入门'],
		ageRange: '7-12岁',
		level: '入门',
		status: 'published',
		validDays: 365,
		validType: 'days',
		studentCount: 789,
		viewCount: 3456,
		rating: 4.7,
		reviewCount: 156,
		chapters: [],
		sortOrder: 3,
		createdAt: '2025-01-10',
		updatedAt: '2025-02-01',
	},
];

// Mock 微课程数据
export const mockMicroCourses: MicroCourse[] = [
	{
		id: 'm1',
		title: '3分钟学会用ChatGPT',
		description: '快速掌握ChatGPT的基本使用方法',
		coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
		videoUrl: 'https://example.com/video/m1.mp4',
		duration: 180,
		price: 990,
		tags: ['成人', '人工智能', '付费'],
		ageRange: '成人',
		categoryId: 'cat1',
		category: '编程',
		teacherId: 't1',
		teacher: mockTeachers[0],
		studentCount: 2345,
		rating: 4.6,
		status: 'published',
		sortOrder: 1,
		createdAt: '2025-02-01',
	},
];

// Mock 科研赋能数据
export const mockResearchPrograms: ResearchProgram[] = [
	{
		id: 'r1',
		title: 'AI大模型应用研究',
		description: '探索大语言模型在教育、医疗、金融等领域的创新应用',
		coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
		requirements: '具备Python基础，对人工智能有浓厚兴趣',
		tags: ['13-18岁', '人工智能'],
		ageRange: '13-18岁',
		categoryId: 'cat4',
		category: '人工智能',
		capacity: 50,
		enrolledCount: 45,
		teacherId: 't1',
		teacher: mockTeachers[0],
		enrollmentDeadline: '2025-03-01',
		status: 'published',
		sortOrder: 1,
		createdAt: '2025-01-10',
	},
];

// Mock 集训计划数据
export const mockTrainingPlans: TrainingPlan[] = [
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
		categoryId: 'cat1',
		category: '编程',
		status: 'enrolling',
		sortOrder: 1,
		createdAt: '2024-12-01',
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
		categoryId: 'cat1',
		category: '编程',
		status: 'enrolling',
		sortOrder: 1,
		createdAt: '2025-01-05',
	},
];

// Mock 标签数据
export const mockTags: Tag[] = [
	{ id: 'tag1', name: '3-6岁', type: 'age', color: 'green', usageCount: 45 },
	{ id: 'tag2', name: '7-12岁', type: 'age', color: 'blue', usageCount: 123 },
	{ id: 'tag3', name: '13-18岁', type: 'age', color: 'orange', usageCount: 67 },
	{ id: 'tag4', name: '成人', type: 'age', color: 'purple', usageCount: 234 },
	{ id: 'tag5', name: '编程', type: 'category', color: 'blue', usageCount: 156 },
	{ id: 'tag6', name: '美术', type: 'category', color: 'pink', usageCount: 89 },
	{ id: 'tag7', name: '音乐', type: 'category', color: 'yellow', usageCount: 56 },
	{ id: 'tag8', name: '数学', type: 'category', color: 'red', usageCount: 78 },
	{ id: 'tag9', name: '免费', type: 'payment', color: 'green', usageCount: 34 },
	{ id: 'tag10', name: '付费', type: 'payment', color: 'orange', usageCount: 267 },
];

// Mock 课程分类数据
export const mockCategories: CourseCategory[] = [
	{ id: 'cat1', name: '编程', icon: 'lucide:code', sortOrder: 1 },
	{ id: 'cat2', name: '美术', icon: 'lucide:palette', sortOrder: 2 },
	{ id: 'cat3', name: '音乐', icon: 'lucide:music', sortOrder: 3 },
	{ id: 'cat4', name: '人工智能', icon: 'lucide:cpu', sortOrder: 4 },
	{ id: 'cat5', name: '数学', icon: 'lucide:calculator', sortOrder: 5 },
];

// 获取当前用户角色
export function getCurrentUserRole(): UserRole {
	const state = localStorage.getItem('portal_login_state');
	if (!state) return null;
	try {
		const loginState = JSON.parse(state);
		return loginState?.user?.role || null;
	} catch {
		return null;
	}
}

// 获取所有课程（学员视角）
export function getAllCourses(params?: {
	keyword?: string;
	category?: string;
	ageRange?: string;
	payment?: string;
	type?: string;
}): Course[] {
	let courses = [...mockCourses];

	if (params?.keyword) {
		const keyword = params.keyword.toLowerCase();
		courses = courses.filter(
			(c) =>
				c.title.toLowerCase().includes(keyword) ||
				c.description.toLowerCase().includes(keyword),
		);
	}

	if (params?.category && params.category !== '全部') {
		courses = courses.filter((c) => c.category === params.category);
	}

	if (params?.ageRange && params.ageRange !== '全部') {
		courses = courses.filter((c) => c.ageRange === params.ageRange);
	}

	if (params?.payment === '免费') {
		courses = courses.filter((c) => c.isFree);
	} else if (params?.payment === '付费') {
		courses = courses.filter((c) => !c.isFree);
	}

	return courses.filter((c) => c.status === 'published');
}

// 获取讲师的课程（讲师视角）
export function getTeacherCourses(teacherId?: string): Course[] {
	if (!teacherId) return [];
	return mockCourses.filter((c) => c.teacherId === teacherId);
}

// 获取微课程
export function getMicroCourses(): MicroCourse[] {
	return mockMicroCourses.filter((c) => c.status === 'published');
}

// 获取科研赋能
export function getResearchPrograms(): ResearchProgram[] {
	return mockResearchPrograms.filter((c) => c.status === 'published');
}

// 获取集训计划
export function getTrainingPlans(type?: 'K12' | 'ADULT'): TrainingPlan[] {
	if (type) {
		return mockTrainingPlans.filter((p) => p.type === type);
	}
	return mockTrainingPlans;
}

// 获取标签
export function getTagsByType(type: TagType): Tag[] {
	return mockTags.filter((t) => t.type === type);
}

// 获取课程分类
export function getCategories(): CourseCategory[] {
	return mockCategories;
}
