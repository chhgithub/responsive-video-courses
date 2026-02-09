/**
 * 课程管理模型
 */

/** 课程类型枚举 */
export enum CourseType {
  MICRO = 'micro',           // 微课程
  PUBLIC = 'public',         // 公益课程
  PAID = 'paid',             // 付费课程
  RESEARCH = 'research',     // 科研赋能
  TRAINING_K12 = 'k12',      // K12集训
  TRAINING_ADULT = 'adult',  // 成人集训
}

/** 难度等级枚举 */
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/** 课程基础信息 */
export interface Course {
  courseId: number;
  courseName: string;
  courseCover: string;
  courseIntro: string;
  categoryId: number;
  categoryName?: string;
  teacherId: number;
  teacherName?: string;
  price: number;
  originalPrice: number;
  isFree: boolean;
  status: string;
  sortOrder: number;
  viewCount: number;
  enrollCount: number;
  createTime: string;
  updateTime?: string;
  // 新增字段
  courseType?: CourseType;
  isTrial?: boolean;
  trialDuration?: number;
  validDays?: number;
  difficulty?: Difficulty;
  tags?: string[];
  totalDuration?: number;
  progress?: number;
}

/** 课程查询参数 */
export interface CourseQuery extends PageQuery {
  courseName?: string;
  categoryId?: number;
  teacherId?: number;
  status?: string;
  isFree?: boolean;
}

/** 课程章节 */
export interface CourseChapter {
  chapterId: number;
  courseId: number;
  chapterName: string;
  chapterType: 'document' | 'video';
  videoUrl: string;
  documentUrl?: string;
  duration: number;
  isFree: boolean;
  sortOrder: number;
  createTime: string;
}

/** 课程分类 */
export interface CourseCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  sortOrder: number;
  children?: CourseCategory[];
}

/** 课程讲师 */
export interface CourseTeacher {
  teacherId: number;
  teacherName: string;
  avatar?: string;
  title?: string;
  introduction?: string;
}
