/**
 * 学习记录存储管理
 */

// 学习记录接口
export interface LearningRecord {
	id: string;
	userId: string;
	courseId: string;
	lessonId: string;
	progress: number; // 0-100
	lastPosition: number; // 视频播放位置（秒）
	completed: boolean;
	completedAt?: string;
	lastStudyAt: string;
	createdAt: string;
	updatedAt: string;
}

const LEARNING_KEY = 'learning_records';

/**
 * 获取所有学习记录
 */
function getAllRecords(): LearningRecord[] {
	const data = localStorage.getItem(LEARNING_KEY);
	return data ? JSON.parse(data) : [];
}

/**
 * 保存或更新学习进度
 */
export function saveLearningProgress(record: Omit<LearningRecord, 'id' | 'createdAt' | 'updatedAt'>): LearningRecord {
	const records = getAllRecords();

	// 查找是否已有记录
	const existingIndex = records.findIndex(
		r => r.userId === record.userId && r.courseId === record.courseId && r.lessonId === record.lessonId
	);

	const learningRecord: LearningRecord = {
		...record,
		id: existingIndex >= 0 ? records[existingIndex].id : `lr_${Date.now()}`,
		createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : new Date().toLocaleString('zh-CN'),
		updatedAt: new Date().toLocaleString('zh-CN'),
		completedAt: record.completed ? new Date().toLocaleString('zh-CN') : undefined,
	};

	if (existingIndex >= 0) {
		records[existingIndex] = learningRecord;
	} else {
		records.push(learningRecord);
	}

	localStorage.setItem(LEARNING_KEY, JSON.stringify(records));
	return learningRecord;
}

/**
 * 获取用户在课程中的学习进度
 */
export function getCourseProgress(userId: string, courseId: string): {
	totalLessons: number;
	completedLessons: number;
	progress: number;
	lastStudyAt: string;
} {
	const records = getAllRecords();
	const courseRecords = records.filter(
		r => r.userId === userId && r.courseId === courseId
	);

	const totalLessons = courseRecords.length;
	const completedLessons = courseRecords.filter(r => r.completed).length;
	const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
	const lastStudyAt = courseRecords.length > 0
		? courseRecords.sort((a, b) => b.lastStudyAt.localeCompare(a.lastStudyAt))[0].lastStudyAt
		: '-';

	return {
		totalLessons,
		completedLessons,
		progress,
		lastStudyAt,
	};
}

/**
 * 获取用户在某课时的学习记录
 */
export function getLessonRecord(userId: string, courseId: string, lessonId: string): LearningRecord | undefined {
	const records = getAllRecords();
	return records.find(
		r => r.userId === userId && r.courseId === courseId && r.lessonId === lessonId
	);
}

/**
 * 获取用户的所有学习记录
 */
export function getUserLearningRecords(userId: string): LearningRecord[] {
	const records = getAllRecords();
	return records.filter(r => r.userId === userId);
}

/**
 * 标记课时为已完成
 */
export function markLessonCompleted(
	userId: string,
	courseId: string,
	lessonId: string
): boolean {
	const records = getAllRecords();
	const record = records.find(
		r => r.userId === userId && r.courseId === courseId && r.lessonId === lessonId
	);

	if (record) {
		record.completed = true;
		record.progress = 100;
		record.completedAt = new Date().toLocaleString('zh-CN');
		record.updatedAt = new Date().toLocaleString('zh-CN');
		localStorage.setItem(LEARNING_KEY, JSON.stringify(records));
		return true;
	}

	// 如果没有记录，创建新的已完成记录
	saveLearningProgress({
		userId,
		courseId,
		lessonId,
		progress: 100,
		lastPosition: 0,
		completed: true,
		lastStudyAt: new Date().toLocaleString('zh-CN'),
	});

	return true;
}
