/**
 * 课程管理数据存储（扩展版）
 */

const COURSE_STORAGE_KEY = 'course_data';
const REVIEW_STORAGE_KEY = 'course_reviews';
const LEARNING_RECORD_KEY = 'learning_records';

// 课时内容类型
export type ContentType = 'video' | 'audio' | 'ppt' | 'document' | 'rich-text';
export type VideoType = 'upload' | 'third-party';
export type CourseStatus = 'draft' | 'published' | 'offline';
// LearningStatus 已移至 learning-storage.ts，统一使用那里的 LearningStatus
export type ReviewStatus = 'pending' | 'approved' | 'rejected';  // 评价审核状态

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
  teacherIds?: number[];      // 讲师ID数组（可选）
  teacherNames?: string[];    // 讲师名称数组（可选）
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

  // 精选课程相关字段
  isFeatured?: boolean;      // 是否精选
  featuredOrder?: number;    // 精选排序（无上限）
  featuredReason?: string;   // 精选理由
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
  // 讲师回复
  replyContent?: string;
  replyTime?: string;
  // 用户对讲师回复的再回复
  userReplyContent?: string;
  userReplyTime?: string;
  reviewTime: string;
  likes: number;
  // 审核字段
  status: ReviewStatus;        // 审核状态
  rejectReason?: string;       // 拒绝原因
  auditTime?: string;          // 审核时间
  auditor?: string;            // 审核人
}

// 默认学习记录（统一使用通识教育的学习记录管理）
const defaultLearningRecords: any[] = [
  {
    recordId: 'lr_001',
    courseId: 1,
    userId: 'u001',
    userName: '张小明',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaoming',
    enrollTime: '2024-01-10',
    progress: 85,
    completedLessons: ['l1', 'l2', 'l3'],
    totalWatchDuration: 145800,
    lastWatchTime: '2024-01-15 14:30',
    status: 'learning',
  },
  {
    recordId: 'lr_002',
    courseId: 1,
    userId: 'u002',
    userName: '李小红',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lixiaohong',
    enrollTime: '2024-01-08',
    progress: 100,
    completedLessons: ['l1', 'l2', 'l3', 'l4'],
    totalWatchDuration: 180000,
    lastWatchTime: '2024-01-12 09:15',
    status: 'completed',
  },
];

// 默认课程数据
const defaultCourses: Course[] = [
  {
    courseId: 1,
    courseName: 'Vue3 从入门到精通',
    categoryId: 1,
    categoryName: '前端开发',
    teacherIds: [1],
    teacherNames: ['张老师'],
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
    isFeatured: true,
    featuredOrder: 100,
    featuredReason: 'Vue3课程内容优质，学员评价高，报名人数多'
  },
  {
    courseId: 2,
    courseName: 'React 实战开发',
    categoryId: 1,
    categoryName: '前端开发',
    teacherIds: [2],
    teacherNames: ['李老师'],
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
    isFeatured: true,
    featuredOrder: 200,
    featuredReason: 'React实战课程，最新React 18技术栈，实战项目丰富'
  },
  {
    courseId: 3,
    courseName: 'TypeScript 进阶',
    categoryId: 1,
    categoryName: '前端开发',
    teacherIds: [3],
    teacherNames: ['王老师'],
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
    isFeatured: false,
    featuredOrder: 0,
    featuredReason: ''
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
    status: 'approved',
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
    status: 'approved',
  },
  {
    reviewId: 'r3',
    courseId: 1,
    userId: 'u3',
    userName: '王五',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3',
    rating: 2,
    content: '课程质量一般，不太推荐',
    reviewTime: '2024-01-16',
    likes: 5,
    status: 'pending',
  },
];

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
  // 方案A：检查课程是否已有订单
  const { getAllOrders } = require('./order-storage');
  const orders = getAllOrders();

  // 检查是否有该课程的已支付订单
  const hasPaidOrders = orders.some(
    (order: any) =>
      (order.type === 'course' && order.courseId === id && order.status === 'paid') ||
      (order.type === 'package' && order.packageCourses?.some((c: any) => c.courseId === id))
  );

  if (hasPaidOrders) {
    throw new Error('该课程已有订单，不允许删除。请先下架课程或将订单处理完毕。');
  }

  const list = getAllCourses();
  const newList = list.filter((item) => item.courseId !== id);
  saveCourses(newList);
}

export function batchDeleteCourses(ids: number[]): void {
  // 方案A：检查课程是否已有订单
  const { getAllOrders } = require('./order-storage');
  const orders = getAllOrders();

  // 检查是否有这些课程的已支付订单
  const coursesWithOrders: number[] = [];
  for (const courseId of ids) {
    const hasPaidOrders = orders.some(
      (order: any) =>
        (order.type === 'course' && order.courseId === courseId && order.status === 'paid') ||
        (order.type === 'package' && order.packageCourses?.some((c: any) => c.courseId === courseId))
    );

    if (hasPaidOrders) {
      const course = getCourseById(courseId);
      coursesWithOrders.push(courseId);
    }
  }

  if (coursesWithOrders.length > 0) {
    const courseNames = coursesWithOrders
      .map(id => getCourseById(id)?.courseName || `课程${id}`)
      .join('、');
    throw new Error(`以下课程已有订单，不允许删除：${courseNames}。请先下架课程或将订单处理完毕。`);
  }

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

// 根据课程价格自动调整课时免费状态
export function updateLessonFreeStatusByPrice(course: Course): Course {
  const updatedCourse = { ...course };

  if (course.price === 0) {
    // 课程免费：所有课时自动设置为免费
    updatedCourse.chapters = course.chapters.map(chapter => ({
      ...chapter,
      lessons: chapter.lessons.map(lesson => ({
        ...lesson,
        isFree: true,
      })),
    }));
    updatedCourse.isFree = true;
  } else {
    // 课程付费：课时免费状态由用户设置，默认不免费（但保留已设置的免费课时）
    // 注意：这里不会强制修改已设置的免费状态，只是更新课程isFree标志
    updatedCourse.isFree = false;
  }

  return updatedCourse;
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
    status: 'pending',  // 默认待审核
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

// 更新评价（支持用户回复讲师）
export function updateReview(review: CourseReview): void {
  const list = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
  const index = list.findIndex((r: CourseReview) => r.reviewId === review.reviewId);
  if (index !== -1) {
    list[index] = { ...list[index], ...review };
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
  }
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

// 审核评价
export function auditReview(
  reviewId: string,
  status: ReviewStatus,
  rejectReason?: string,
  auditor?: string
): void {
  const list = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
  const index = list.findIndex((r: CourseReview) => r.reviewId === reviewId);
  if (index !== -1) {
    list[index].status = status;
    if (status === 'rejected') {
      list[index].rejectReason = rejectReason;
    } else {
      // 如果审核通过，清除拒绝原因
      delete list[index].rejectReason;
    }
    list[index].auditTime = new Date().toISOString().split('T')[0];
    list[index].auditor = auditor || '系统管理员';
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
  }
}

// 获取待审核评价数量
export function getPendingReviewsCount(): number {
  initReviewData();
  const data = localStorage.getItem(REVIEW_STORAGE_KEY);
  const reviews: CourseReview[] = data ? JSON.parse(data) : [];
  return reviews.filter((r) => r.status === 'pending').length;
}

// 数据迁移 - 为旧数据添加审核状态
export function migrateReviewData(): void {
  const data = localStorage.getItem(REVIEW_STORAGE_KEY);
  if (!data) return;

  const reviews = JSON.parse(data);
  let needUpdate = false;

  reviews.forEach((review: any) => {
    if (!review.status) {
      review.status = 'approved';  // 旧数据默认已通过
      needUpdate = true;
    }
  });

  if (needUpdate) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
    console.log('评价数据迁移完成');
  }
}

// ============ 学员学习记录管理 ============

export function initLearningRecordData(force: boolean = true) {
  const existing = localStorage.getItem(LEARNING_RECORD_KEY);
  if (!existing || force) {
    console.log('localStorage中没有学习记录数据，初始化默认数据...');
    localStorage.setItem(LEARNING_RECORD_KEY, JSON.stringify(defaultLearningRecords));
  } else {
    try {
      const data = JSON.parse(existing);
      // 如果学习记录数量少于默认数量（2条），强制重新初始化
      if (!Array.isArray(data) || data.length < 2) {
        console.log('学习记录数据不足（现有', data?.length || 0, '条），重新初始化默认数据...');
        localStorage.setItem(LEARNING_RECORD_KEY, JSON.stringify(defaultLearningRecords));
      } else {
        console.log('学习记录数据正常，共', data.length, '条记录');
      }
    } catch (error) {
      console.error('学习记录数据解析失败，重新初始化:', error);
      localStorage.setItem(LEARNING_RECORD_KEY, JSON.stringify(defaultLearningRecords));
    }
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
migrateReviewData();  // 数据迁移
initLearningRecordData();
