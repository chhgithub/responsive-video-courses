/**
 * 课程管理数据存储（扩展版）
 */

// 课时内容类型
export type ContentType = 'video' | 'audio' | 'ppt' | 'document' | 'rich-text';
export type VideoType = 'upload' | 'third-party';
export type CourseStatus = 'draft' | 'published' | 'offline';
export type LearningStatus = 'learning' | 'completed' | 'dropped';

// 课时接口
export interface Lesson {
  lessonId: string;
  lessonName: string;
  lessonOrder: number;
  contentType: ContentType;

  // 视频类
  videoType?: VideoType;
  videoId?: string;
  videoUrl?: string;

  // 音频类
  audioUrl?: string;
  audioDuration?: number;

  // PPT/文档类
  fileUrl?: string;
  pageCount?: number;

  // 富文本类
  richTextContent?: string;

  duration: number;
  isFree: boolean;
  isTrial: boolean;
}

// 章节接口
export interface Chapter {
  chapterId: string;
  chapterName: string;
  chapterOrder: number;
  lessons: Lesson[];
}

// 课程接口
export interface Course {
  courseId: number;
  courseName: string;
  categoryId: number;
  categoryName: string;
  teacherId: number;
  teacherName: string;
  courseType: string;
  difficulty: string;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  courseCover: string;
  courseIntro: string;
  createTime: string;

  // 新增字段
  validDays: number;
  isTrial: boolean;
  trialDuration: number;
  trialLessonIds: string[];
  status: CourseStatus;

  // 章节管理
  chapters: Chapter[];

  // 统计信息
  enrollCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  sortOrder: number;
}

// 课程评价接口
export interface CourseReview {
  reviewId: string;
  courseId: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  replyContent?: string;
  replyTime?: string;
  reviewTime: string;
  likes: number;
}

// 学员学习记录接口
export interface StudentLearningRecord {
  recordId: string;
  courseId: number;
  userId: string;
  userName: string;
  userAvatar: string;
  enrollTime: string;
  progress: number;
  completedLessons: string[];
  lastWatchTime: string;
  lastWatchLesson: string;
  totalWatchDuration: number;
  status: LearningStatus;
}

const COURSE_STORAGE_KEY = 'admin_courses';
const REVIEW_STORAGE_KEY = 'course_reviews';
const LEARNING_RECORD_KEY = 'student_learning_records';

// 默认课程数据
const defaultCourses: Course[] = [
  {
    courseId: 1,
    courseName: 'Vue3 从入门到精通',
    categoryId: 1,
    categoryName: '前端开发',
    teacherId: 1,
    teacherName: '张老师',
    courseType: 'paid',
    difficulty: 'intermediate',
    price: 199,
    originalPrice: 299,
    isFree: false,
    courseCover: 'https://picsum.photos/seed/course1/300/200',
    courseIntro: '深入学习Vue3核心技术，包括Composition API、响应式原理、组件化开发等',
    createTime: '2024-01-15',
    validDays: 365,
    isTrial: true,
    trialDuration: 120,
    trialLessonIds: [],
    status: 'published',
    chapters: [
      {
        chapterId: 'ch1',
        chapterName: 'Vue3基础入门',
        chapterOrder: 1,
        lessons: [
          {
            lessonId: 'l1',
            lessonName: 'Vue3简介与环境搭建',
            lessonOrder: 1,
            contentType: 'video',
            videoType: 'upload',
            videoId: 'v1',
            duration: 1800,
            isFree: false,
            isTrial: true,
          },
          {
            lessonId: 'l2',
            lessonName: 'Composition API基础',
            lessonOrder: 2,
            contentType: 'video',
            videoType: 'upload',
            videoId: 'v2',
            duration: 2400,
            isFree: false,
            isTrial: false,
          },
        ],
      },
      {
        chapterId: 'ch2',
        chapterName: '组件化开发',
        chapterOrder: 2,
        lessons: [
          {
            lessonId: 'l3',
            lessonName: '组件基础',
            lessonOrder: 1,
            contentType: 'rich-text',
            richTextContent: '<p>组件是Vue的核心概念...</p>',
            duration: 600,
            isFree: false,
            isTrial: false,
          },
        ],
      },
    ],
    enrollCount: 1234,
    viewCount: 5678,
    rating: 4.8,
    reviewCount: 128,
    sortOrder: 1,
  },
  {
    courseId: 2,
    courseName: 'React 实战开发',
    categoryId: 1,
    categoryName: '前端开发',
    teacherId: 2,
    teacherName: '李老师',
    courseType: 'paid',
    difficulty: 'intermediate',
    price: 299,
    originalPrice: 399,
    isFree: false,
    courseCover: 'https://picsum.photos/seed/course2/300/200',
    courseIntro: 'React 18全家桶实战项目开发',
    createTime: '2024-01-14',
    validDays: 0,
    isTrial: true,
    trialDuration: 0,
    trialLessonIds: ['l1', 'l2'],
    status: 'published',
    chapters: [],
    enrollCount: 2345,
    viewCount: 8901,
    rating: 4.9,
    reviewCount: 256,
    sortOrder: 2,
  },
  {
    courseId: 3,
    courseName: 'TypeScript 进阶',
    categoryId: 1,
    categoryName: '前端开发',
    teacherId: 3,
    teacherName: '王老师',
    courseType: 'paid',
    difficulty: 'advanced',
    price: 159,
    originalPrice: 199,
    isFree: false,
    courseCover: 'https://picsum.photos/seed/course3/300/200',
    courseIntro: '掌握TypeScript高级特性',
    createTime: '2024-01-13',
    validDays: 180,
    isTrial: false,
    trialDuration: 0,
    trialLessonIds: [],
    status: 'draft',
    chapters: [],
    enrollCount: 876,
    viewCount: 3456,
    rating: 4.7,
    reviewCount: 64,
    sortOrder: 3,
  },
];

// 默认评价数据
const defaultReviews: CourseReview[] = [
  {
    reviewId: 'r1',
    courseId: 1,
    userId: 'u1',
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1',
    rating: 5,
    content: '课程内容很棒，老师讲得非常详细！',
    reviewTime: '2024-01-15',
    likes: 23,
  },
  {
    reviewId: 'r2',
    courseId: 1,
    userId: 'u2',
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2',
    rating: 4,
    content: '整体不错，但有些地方可以更深入一些',
    replyContent: '感谢反馈，我们会在后续课程中加强这部分内容',
    replyTime: '2024-01-14',
    reviewTime: '2024-01-13',
    likes: 12,
  },
];

// 默认学习记录数据
const defaultLearningRecords: StudentLearningRecord[] = [
  {
    recordId: 'lr1',
    courseId: 1,
    userId: 'u1',
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1',
    enrollTime: '2024-01-10',
    progress: 80,
    completedLessons: ['l1', 'l2'],
    lastWatchTime: '2024-01-15 14:30',
    lastWatchLesson: 'l3',
    totalWatchDuration: 14400,
    status: 'learning',
  },
  {
    recordId: 'lr2',
    courseId: 1,
    userId: 'u2',
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2',
    enrollTime: '2024-01-05',
    progress: 100,
    completedLessons: ['l1', 'l2', 'l3'],
    lastWatchTime: '2024-01-12 10:00',
    lastWatchLesson: 'l3',
    totalWatchDuration: 18000,
    status: 'completed',
  },
];

// ============ 课程管理 ============

export function initCourseData() {
  const existing = localStorage.getItem(COURSE_STORAGE_KEY);
  if (!existing) {
    console.log('localStorage中没有课程数据，初始化默认数据...');
    localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(defaultCourses));
  } else {
    try {
      const data = JSON.parse(existing);
      // 如果课程数量少于默认课程数量（6门），强制重新初始化
      if (!Array.isArray(data) || data.length < 6) {
        console.log('课程数据不足（现有', data?.length || 0, '门），重新初始化默认数据...');
        localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(defaultCourses));
      } else {
        console.log('课程数据正常，共', data.length, '门课程');
      }
    } catch (error) {
      console.error('课程数据解析失败，重新初始化:', error);
      localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(defaultCourses));
    }
  }
}

export function getAllCourses(): Course[] {
  initCourseData();
  const data = localStorage.getItem(COURSE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCourseById(id: number): Course | undefined {
  return getAllCourses().find((c) => c.courseId === id);
}

export function addCourse(course: Omit<Course, 'courseId'>): Course {
  const list = getAllCourses();
  const newItem: Course = {
    ...course,
    courseId: Date.now(),
  };
  list.push(newItem);
  saveCourses(list);
  return newItem;
}

export function updateCourse(id: number, data: Partial<Course>): void {
  const list = getAllCourses();
  const index = list.findIndex((item) => item.courseId === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    saveCourses(list);
  }
}

export function deleteCourse(id: number): void {
  const list = getAllCourses();
  const newList = list.filter((item) => item.courseId !== id);
  saveCourses(newList);
}

export function batchDeleteCourses(ids: number[]): void {
  const list = getAllCourses();
  const newList = list.filter((item) => !ids.includes(item.courseId));
  saveCourses(newList);
}

export function copyCourse(id: number): Course {
  const course = getCourseById(id);
  if (!course) throw new Error('课程不存在');

  const newCourse: Course = {
    ...JSON.parse(JSON.stringify(course)),
    courseId: Date.now(),
    courseName: `${course.courseName} (副本)`,
    createTime: new Date().toISOString().split('T')[0],
    enrollCount: 0,
    viewCount: 0,
    reviewCount: 0,
    status: 'draft',
  };

  // 重新生成章节和课时ID
  newCourse.chapters = course.chapters.map((chapter) => ({
    ...chapter,
    chapterId: `ch_${Date.now()}_${Math.random()}`,
    lessons: chapter.lessons.map((lesson) => ({
      ...lesson,
      lessonId: `l_${Date.now()}_${Math.random()}`,
    })),
  }));

  const list = getAllCourses();
  list.push(newCourse);
  saveCourses(list);
  return newCourse;
}

export function updateCourseStatus(id: number, status: CourseStatus): void {
  updateCourse(id, { status });
}

export function saveCourses(courses: Course[]) {
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
}

// ============ 课程评价管理 ============

export function initReviewData() {
  const existing = localStorage.getItem(REVIEW_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(defaultReviews));
  }
}

export function getReviewsByCourseId(courseId: number): CourseReview[] {
  initReviewData();
  const data = localStorage.getItem(REVIEW_STORAGE_KEY);
  const reviews: CourseReview[] = data ? JSON.parse(data) : [];
  return reviews.filter((r) => r.courseId === courseId);
}

export function addReview(review: Omit<CourseReview, 'reviewId'>): CourseReview {
  const list = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
  const newItem: CourseReview = {
    ...review,
    reviewId: `r_${Date.now()}`,
  };
  list.push(newItem);
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));

  // 更新课程评价数
  const course = getCourseById(review.courseId);
  if (course) {
    const courseReviews = getReviewsByCourseId(review.courseId);
    const avgRating = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
    updateCourse(review.courseId, {
      reviewCount: courseReviews.length,
      rating: Number(avgRating.toFixed(1)),
    });
  }

  return newItem;
}

export function deleteReview(reviewId: string): void {
  const list = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
  const review = list.find((r: CourseReview) => r.reviewId === reviewId);
  const newList = list.filter((r: CourseReview) => r.reviewId !== reviewId);
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(newList));

  // 更新课程评价数
  if (review) {
    const course = getCourseById(review.courseId);
    if (course) {
      const courseReviews = getReviewsByCourseId(review.courseId);
      const avgRating = courseReviews.length > 0
        ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
        : 0;
      updateCourse(review.courseId, {
        reviewCount: courseReviews.length,
        rating: Number(avgRating.toFixed(1)),
      });
    }
  }
}

export function replyReview(reviewId: string, replyContent: string): void {
  const list = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
  const index = list.findIndex((r: CourseReview) => r.reviewId === reviewId);
  if (index !== -1) {
    list[index].replyContent = replyContent;
    list[index].replyTime = new Date().toISOString().split('T')[0];
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
  }
}

// ============ 学员学习记录管理 ============

export function initLearningRecordData() {
  const existing = localStorage.getItem(LEARNING_RECORD_KEY);
  if (!existing) {
    localStorage.setItem(LEARNING_RECORD_KEY, JSON.stringify(defaultLearningRecords));
  }
}

export function getLearningRecordsByCourseId(courseId: number): StudentLearningRecord[] {
  initLearningRecordData();
  const data = localStorage.getItem(LEARNING_RECORD_KEY);
  const records: StudentLearningRecord[] = data ? JSON.parse(data) : [];
  return records.filter((r) => r.courseId === courseId);
}

export function getLearningRecordsByUserId(userId: string): StudentLearningRecord[] {
  initLearningRecordData();
  const data = localStorage.getItem(LEARNING_RECORD_KEY);
  const records: StudentLearningRecord[] = data ? JSON.parse(data) : [];
  return records.filter((r) => r.userId === userId);
}

export function addLearningRecord(record: Omit<StudentLearningRecord, 'recordId'>): StudentLearningRecord {
  const list = JSON.parse(localStorage.getItem(LEARNING_RECORD_KEY) || '[]');
  const newItem: StudentLearningRecord = {
    ...record,
    recordId: `lr_${Date.now()}`,
  };
  list.push(newItem);
  localStorage.setItem(LEARNING_RECORD_KEY, JSON.stringify(list));

  // 更新课程报名人数
  const course = getCourseById(record.courseId);
  if (course) {
    const records = getLearningRecordsByCourseId(record.courseId);
    updateCourse(record.courseId, { enrollCount: records.length });
  }

  return newItem;
}

export function updateLearningProgress(
  recordId: string,
  progress: number,
  completedLessons: string[],
  lastWatchLesson: string,
  totalWatchDuration: number
): void {
  const list = JSON.parse(localStorage.getItem(LEARNING_RECORD_KEY) || '[]');
  const index = list.findIndex((r: StudentLearningRecord) => r.recordId === recordId);
  if (index !== -1) {
    list[index].progress = progress;
    list[index].completedLessons = completedLessons;
    list[index].lastWatchLesson = lastWatchLesson;
    list[index].lastWatchTime = new Date().toISOString().split('T')[0];
    list[index].totalWatchDuration = totalWatchDuration;
    list[index].status = progress >= 100 ? 'completed' : 'learning';
    localStorage.setItem(LEARNING_RECORD_KEY, JSON.stringify(list));
  }
}

// 自动初始化
initCourseData();
initReviewData();
initLearningRecordData();
