/**
 * 学习记录数据存储管理
 */

export interface LearningRecord {
  recordId: string;
  userId: string;
  courseId: string;
  courseName: string;
  courseCover: string;
  progress: number; // 0-100
  lastWatchTime: string;
  lastWatchLesson: string;
  totalWatchDuration: number; // 秒
  completedLessons: string[];
  createTime: string;
  updateTime: string;
}

const LEARNING_STORAGE_KEY = 'portal_learning_records';

/**
 * 获取所有学习记录
 */
export function getAllLearningRecords(): LearningRecord[] {
  const data = localStorage.getItem(LEARNING_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 获取用户学习记录
 */
export function getUserLearningRecords(userId: string): LearningRecord[] {
  const records = getAllLearningRecords();
  return records.filter((r) => r.userId === userId);
}

/**
 * 获取用户某课程的学习记录
 */
export function getCourseLearningRecord(userId: string, courseId: string): LearningRecord | undefined {
  const records = getUserLearningRecords(userId);
  return records.find((r) => r.courseId === courseId);
}

/**
 * 创建或更新学习记录
 */
export function upsertLearningRecord(recordData: Omit<LearningRecord, 'recordId' | 'createTime' | 'updateTime'>): LearningRecord {
  const records = getAllLearningRecords();
  const existingIndex = records.findIndex((r) => r.userId === recordData.userId && r.courseId === recordData.courseId);

  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    // 更新现有记录
    records[existingIndex] = {
      ...records[existingIndex],
      ...recordData,
      updateTime: now,
    };
    saveRecords(records);
    return records[existingIndex];
  } else {
    // 创建新记录
    const newRecord: LearningRecord = {
      ...recordData,
      recordId: `LEARNING-${Date.now()}`,
      createTime: now,
      updateTime: now,
    };
    records.push(newRecord);
    saveRecords(records);
    return newRecord;
  }
}

/**
 * 更新学习进度
 */
export function updateLearningProgress(
  userId: string,
  courseId: string,
  progress: number,
  lessonId: string,
  watchDuration: number
): void {
  const record = getCourseLearningRecord(userId, courseId);

  if (record) {
    // 更新进度
    const completedLessons = record.completedLessons.includes(lessonId)
      ? record.completedLessons
      : [...record.completedLessons, lessonId];

    upsertLearningRecord({
      userId: record.userId,
      courseId: record.courseId,
      courseName: record.courseName,
      courseCover: record.courseCover,
      progress,
      lastWatchTime: now,
      lastWatchLesson: lessonId,
      totalWatchDuration: record.totalWatchDuration + watchDuration,
      completedLessons,
    });
  }
}

/**
 * 获取最近观看的课程
 */
export function getRecentWatchedCourses(userId: string, limit: number = 5): LearningRecord[] {
  const records = getUserLearningRecords(userId);
  return records
    .sort((a, b) => new Date(b.lastWatchTime).getTime() - new Date(a.lastWatchTime).getTime())
    .slice(0, limit);
}

/**
 * 获取学习统计
 */
export function getLearningStats(userId: string) {
  const records = getUserLearningRecords(userId);

  const totalCourses = records.length;
  const completedCourses = records.filter((r) => r.progress >= 100).length;
  const inProgressCourses = records.filter((r) => r.progress > 0 && r.progress < 100).length;
  const totalWatchDuration = records.reduce((sum, r) => sum + r.totalWatchDuration, 0);
  const averageProgress = totalCourses > 0 ? records.reduce((sum, r) => sum + r.progress, 0) / totalCourses : 0;

  return {
    totalCourses,
    completedCourses,
    inProgressCourses,
    totalWatchDuration,
    averageProgress: Math.round(averageProgress),
  };
}

/**
 * 保存学习记录数据
 */
function saveRecords(records: LearningRecord[]): void {
  localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(records));
}

function now(): string {
  return new Date().toISOString();
}
