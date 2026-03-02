/**
 * 课程套餐（课程整合）数据存储管理
 */

export type PackageStatus = 'draft' | 'published' | 'offline';
export type LearningStatus = 'learning' | 'completed' | 'dropped';

// 套餐包含的课程
export interface PackageCourse {
  packageId: number;
  courseId: number;
  courseName: string;
  courseCover: string;
  teacherName: string;
  originalPrice: number;
  isRequired: boolean;
  sortOrder: number;
}

// 课程套餐
export interface CoursePackage {
  packageId: number;
  packageName: string;
  packageDesc: string;
  packageCover: string;
  price: number;
  originalPrice: number;
  discount: number;
  validDays: number;
  isTrial: boolean;
  trialDays: number;
  status: PackageStatus;

  courses: PackageCourse[];

  enrollCount: number;
  rating: number;
  reviewCount: number;
  sortOrder: number;
  createTime: string;
}

// 套餐评价
export interface PackageReview {
  reviewId: string;
  packageId: number;
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

// 套餐学习记录
export interface PackageLearningRecord {
  recordId: string;
  packageId: number;
  userId: string;
  userName: string;
  userAvatar: string;
  enrollTime: string;
  expiryTime?: string;
  progress: number;
  completedCourses: number[];
  totalWatchDuration: number;
  lastWatchTime: string;
  lastWatchCourse: number;
  status: LearningStatus;
  // 各课程的学习详情
  courseProgress: Array<{
    courseId: number;
    courseName: string;
    progress: number;
    completed: boolean;
    watchDuration: number;
  }>;
}

const PACKAGE_STORAGE_KEY = 'course_packages';
const PACKAGE_REVIEW_STORAGE_KEY = 'package_reviews';
const PACKAGE_LEARNING_RECORD_KEY = 'package_learning_records';

// 默认套餐数据
const defaultPackages: CoursePackage[] = [
  {
    packageId: 1,
    packageName: 'Vue全栈开发套餐',
    packageDesc: '从Vue3基础到Node.js后端，全栈技能一次掌握。包含Vue3基础、Vue3组件化开发、Node.js后端开发三门课程。',
    packageCover: 'https://picsum.photos/seed/pkg1/400/300',
    price: 499,
    originalPrice: 797,
    discount: 37.4,
    validDays: 365,
    isTrial: true,
    trialDays: 7,
    status: 'published',
    courses: [
      {
        packageId: 1,
        courseId: 1,
        courseName: 'Vue3 从入门到精通',
        courseCover: 'https://picsum.photos/seed/course1/300/200',
        teacherName: '张老师',
        originalPrice: 199,
        isRequired: true,
        sortOrder: 1,
      },
      {
        packageId: 1,
        courseId: 2,
        courseName: 'Vue3 组件化开发实战',
        courseCover: 'https://picsum.photos/seed/course2/300/200',
        teacherName: '李老师',
        originalPrice: 299,
        isRequired: true,
        sortOrder: 2,
      },
      {
        packageId: 1,
        courseId: 3,
        courseName: 'Node.js 后端开发',
        courseCover: 'https://picsum.photos/seed/course3/300/200',
        teacherName: '王老师',
        originalPrice: 299,
        isRequired: false,
        sortOrder: 3,
      },
    ],
    enrollCount: 234,
    rating: 4.8,
    reviewCount: 128,
    sortOrder: 1,
    createTime: '2024-01-15',
  },
  {
    packageId: 2,
    packageName: 'Python数据分析套餐',
    packageDesc: 'Python数据分析全套课程，从Python基础到高级数据分析技能。',
    packageCover: 'https://picsum.photos/seed/pkg2/400/300',
    price: 399,
    originalPrice: 598,
    discount: 33.3,
    validDays: 180,
    isTrial: true,
    trialDays: 3,
    status: 'published',
    courses: [
      {
        packageId: 2,
        courseId: 4,
        courseName: 'Python 数据分析入门',
        courseCover: 'https://picsum.photos/seed/course4/300/200',
        teacherName: '赵老师',
        originalPrice: 199,
        isRequired: true,
        sortOrder: 1,
      },
      {
        packageId: 2,
        courseId: 5,
        courseName: 'Pandas 数据处理实战',
        courseCover: 'https://picsum.photos/seed/course5/300/200',
        teacherName: '刘老师',
        originalPrice: 199,
        isRequired: true,
        sortOrder: 2,
      },
      {
        packageId: 2,
        courseId: 6,
        courseName: 'Python 数据可视化',
        courseCover: 'https://picsum.photos/seed/course6/300/200',
        teacherName: '陈老师',
        originalPrice: 199,
        isRequired: true,
        sortOrder: 3,
      },
    ],
    enrollCount: 567,
    rating: 4.9,
    reviewCount: 256,
    sortOrder: 2,
    createTime: '2024-01-14',
  },
  {
    packageId: 3,
    packageName: 'Java微服务架构套餐',
    packageDesc: '从Java基础到微服务架构，企业级应用开发全流程。',
    packageCover: 'https://picsum.photos/seed/pkg3/400/300',
    price: 899,
    originalPrice: 1297,
    discount: 30.7,
    validDays: 0,
    isTrial: false,
    trialDays: 0,
    status: 'draft',
    courses: [
      {
        packageId: 3,
        courseId: 7,
        courseName: 'Java 基础到进阶',
        courseCover: 'https://picsum.photos/seed/course7/300/200',
        teacherName: '周老师',
        originalPrice: 299,
        isRequired: true,
        sortOrder: 1,
      },
      {
        packageId: 3,
        courseId: 8,
        courseName: 'Spring Boot 实战',
        courseCover: 'https://picsum.photos/seed/course8/300/200',
        teacherName: '吴老师',
        originalPrice: 399,
        isRequired: true,
        sortOrder: 2,
      },
      {
        packageId: 3,
        courseId: 9,
        courseName: '微服务架构设计',
        courseCover: 'https://picsum.photos/seed/course9/300/200',
        teacherName: '郑老师',
        originalPrice: 599,
        isRequired: true,
        sortOrder: 3,
      },
    ],
    enrollCount: 0,
    rating: 0,
    reviewCount: 0,
    sortOrder: 3,
    createTime: '2024-01-13',
  },
];

// 默认评价数据
const defaultReviews: PackageReview[] = [
  {
    reviewId: 'pr1',
    packageId: 1,
    userId: 'u1',
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1',
    rating: 5,
    content: '套餐很划算，三门课程都学完了，Vue3基础和组件化实战都非常实用，Node.js还没开始学。整体来说性价比很高！',
    reviewTime: '2024-01-15',
    likes: 45,
  },
  {
    reviewId: 'pr2',
    packageId: 1,
    userId: 'u2',
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2',
    rating: 4,
    content: '课程内容很丰富，讲师讲解详细。建议增加一些实战项目的案例。',
    replyContent: '感谢反馈，我们会在后续课程中增加更多实战案例。',
    replyTime: '2024-01-14',
    reviewTime: '2024-01-13',
    likes: 23,
  },
];

// 默认学习记录数据
const defaultLearningRecords: PackageLearningRecord[] = [
  {
    recordId: 'plr1',
    packageId: 1,
    userId: 'u1',
    userName: '张三',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1',
    enrollTime: '2024-01-10',
    expiryTime: '2025-01-10',
    progress: 67,
    completedCourses: [1, 2],
    totalWatchDuration: 162000,
    lastWatchTime: '2024-01-15 14:30',
    lastWatchCourse: 2,
    status: 'learning',
    courseProgress: [
      {
        courseId: 1,
        courseName: 'Vue3 从入门到精通',
        progress: 100,
        completed: true,
        watchDuration: 72000,
      },
      {
        courseId: 2,
        courseName: 'Vue3 组件化开发实战',
        progress: 100,
        completed: true,
        watchDuration: 90000,
      },
      {
        courseId: 3,
        courseName: 'Node.js 后端开发',
        progress: 0,
        completed: false,
        watchDuration: 0,
      },
    ],
  },
  {
    recordId: 'plr2',
    packageId: 1,
    userId: 'u2',
    userName: '李四',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2',
    enrollTime: '2024-01-05',
    expiryTime: '2025-01-05',
    progress: 33,
    completedCourses: [1],
    totalWatchDuration: 72000,
    lastWatchTime: '2024-01-14 16:20',
    lastWatchCourse: 2,
    status: 'learning',
    courseProgress: [
      {
        courseId: 1,
        courseName: 'Vue3 从入门到精通',
        progress: 100,
        completed: true,
        watchDuration: 72000,
      },
      {
        courseId: 2,
        courseName: 'Vue3 组件化开发实战',
        progress: 50,
        completed: false,
        watchDuration: 0,
      },
      {
        courseId: 3,
        courseName: 'Node.js 后端开发',
        progress: 0,
        completed: false,
        watchDuration: 0,
      },
    ],
  },
];

// ============ 套餐管理 ============

export function initPackageData() {
  const existing = localStorage.getItem(PACKAGE_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(defaultPackages));
  }
}

export function getAllPackages(): CoursePackage[] {
  initPackageData();
  const data = localStorage.getItem(PACKAGE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getPackageById(id: number): CoursePackage | undefined {
  return getAllPackages().find((p) => p.packageId === id);
}

export function addPackage(pkg: Omit<CoursePackage, 'packageId'>): CoursePackage {
  const list = getAllPackages();
  const newItem: CoursePackage = {
    ...pkg,
    packageId: Date.now(),
  };
  list.push(newItem);
  savePackages(list);
  return newItem;
}

export function updatePackage(id: number, data: Partial<CoursePackage>): void {
  const list = getAllPackages();
  const index = list.findIndex((item) => item.packageId === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    savePackages(list);
  }
}

export function deletePackage(id: number): void {
  const list = getAllPackages();
  const newList = list.filter((item) => item.packageId !== id);
  savePackages(newList);
}

export function batchDeletePackages(ids: number[]): void {
  const list = getAllPackages();
  const newList = list.filter((item) => !ids.includes(item.packageId));
  savePackages(newList);
}

export function copyPackage(id: number): CoursePackage {
  const pkg = getPackageById(id);
  if (!pkg) throw new Error('套餐不存在');

  const newPackage: CoursePackage = {
    ...JSON.parse(JSON.stringify(pkg)),
    packageId: Date.now(),
    packageName: `${pkg.packageName} (副本)`,
    createTime: new Date().toISOString().split('T')[0],
    enrollCount: 0,
    rating: 0,
    reviewCount: 0,
    status: 'draft',
  };

  const list = getAllPackages();
  list.push(newPackage);
  savePackages(list);
  return newPackage;
}

export function updatePackageStatus(id: number, status: PackageStatus): void {
  updatePackage(id, { status });
}

export function savePackages(packages: CoursePackage[]) {
  localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(packages));
}

// 价格计算相关
export function calculateOriginalPrice(courses: PackageCourse[]): number {
  return courses.reduce((sum, course) => sum + course.originalPrice, 0);
}

export function calculateDiscount(packagePrice: number, originalPrice: number): number {
  if (originalPrice === 0) return 0;
  return Number((((originalPrice - packagePrice) / originalPrice) * 100).toFixed(1));
}

export function calculateSavings(packagePrice: number, originalPrice: number): number {
  return originalPrice - packagePrice;
}

// 套餐课程管理
export function addCourseToPackage(
  packageId: number,
  course: {
    courseId: number;
    courseName: string;
    courseCover: string;
    teacherName: string;
    originalPrice: number;
    isRequired: boolean;
  }
): void {
  const pkg = getPackageById(packageId);
  if (!pkg) return;

  const newCourse: PackageCourse = {
    packageId,
    ...course,
    sortOrder: pkg.courses.length + 1,
  };

  pkg.courses.push(newCourse);
  updatePackage(packageId, { courses: pkg.courses });
}

export function removeCourseFromPackage(packageId: number, courseId: number): void {
  const pkg = getPackageById(packageId);
  if (!pkg) return;

  pkg.courses = pkg.courses.filter((c) => c.courseId !== courseId);
  updatePackage(packageId, { courses: pkg.courses });
}

export function updatePackageCourseOrder(packageId: number, courses: PackageCourse[]): void {
  updatePackage(packageId, { courses });
}

export function toggleCourseRequired(packageId: number, courseId: number): void {
  const pkg = getPackageById(packageId);
  if (!pkg) return;

  const course = pkg.courses.find((c) => c.courseId === courseId);
  if (course) {
    course.isRequired = !course.isRequired;
    updatePackage(packageId, { courses: pkg.courses });
  }
}

// ============ 套餐评价管理 ============

export function initPackageReviewData() {
  const existing = localStorage.getItem(PACKAGE_REVIEW_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(PACKAGE_REVIEW_STORAGE_KEY, JSON.stringify(defaultReviews));
  }
}

export function getPackageReviews(packageId: number): PackageReview[] {
  initPackageReviewData();
  const data = localStorage.getItem(PACKAGE_REVIEW_STORAGE_KEY);
  const reviews: PackageReview[] = data ? JSON.parse(data) : [];
  return reviews.filter((r) => r.packageId === packageId);
}

export function addPackageReview(review: Omit<PackageReview, 'reviewId'>): PackageReview {
  const list = JSON.parse(localStorage.getItem(PACKAGE_REVIEW_STORAGE_KEY) || '[]');
  const newItem: PackageReview = {
    ...review,
    reviewId: `pr_${Date.now()}`,
  };
  list.push(newItem);
  localStorage.setItem(PACKAGE_REVIEW_STORAGE_KEY, JSON.stringify(list));

  // 更新套餐评价数
  const pkg = getPackageById(review.packageId);
  if (pkg) {
    const reviews = getPackageReviews(review.packageId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    updatePackage(review.packageId, {
      reviewCount: reviews.length,
      rating: Number(avgRating.toFixed(1)),
    });
  }

  return newItem;
}

export function deletePackageReview(reviewId: string): void {
  const list = JSON.parse(localStorage.getItem(PACKAGE_REVIEW_STORAGE_KEY) || '[]');
  const review = list.find((r: PackageReview) => r.reviewId === reviewId);
  const newList = list.filter((r: PackageReview) => r.reviewId !== reviewId);
  localStorage.setItem(PACKAGE_REVIEW_STORAGE_KEY, JSON.stringify(newList));

  if (review) {
    const pkg = getPackageById(review.packageId);
    if (pkg) {
      const reviews = getPackageReviews(review.packageId);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      updatePackage(review.packageId, {
        reviewCount: reviews.length,
        rating: Number(avgRating.toFixed(1)),
      });
    }
  }
}

export function replyPackageReview(reviewId: string, replyContent: string): void {
  const list = JSON.parse(localStorage.getItem(PACKAGE_REVIEW_STORAGE_KEY) || '[]');
  const index = list.findIndex((r: PackageReview) => r.reviewId === reviewId);
  if (index !== -1) {
    list[index].replyContent = replyContent;
    list[index].replyTime = new Date().toISOString().split('T')[0];
    localStorage.setItem(PACKAGE_REVIEW_STORAGE_KEY, JSON.stringify(list));
  }
}

// ============ 套餐学员学习记录管理 ============

export function initPackageLearningRecordData() {
  const existing = localStorage.getItem(PACKAGE_LEARNING_RECORD_KEY);
  if (!existing) {
    localStorage.setItem(PACKAGE_LEARNING_RECORD_KEY, JSON.stringify(defaultLearningRecords));
  }
}

export function getPackageLearningRecords(packageId: number): PackageLearningRecord[] {
  initPackageLearningRecordData();
  const data = localStorage.getItem(PACKAGE_LEARNING_RECORD_KEY);
  const records: PackageLearningRecord[] = data ? JSON.parse(data) : [];
  return records.filter((r) => r.packageId === packageId);
}

export function getPackageStudentDetail(packageId: number, userId: string): PackageLearningRecord | undefined {
  const records = getPackageLearningRecords(packageId);
  return records.find((r) => r.userId === userId);
}

export function addPackageLearningRecord(record: Omit<PackageLearningRecord, 'recordId'>): PackageLearningRecord {
  const list = JSON.parse(localStorage.getItem(PACKAGE_LEARNING_RECORD_KEY) || '[]');
  const newItem: PackageLearningRecord = {
    ...record,
    recordId: `plr_${Date.now()}`,
  };
  list.push(newItem);
  localStorage.setItem(PACKAGE_LEARNING_RECORD_KEY, JSON.stringify(list));

  // 更新套餐报名人数
  const pkg = getPackageById(record.packageId);
  if (pkg) {
    const records = getPackageLearningRecords(record.packageId);
    updatePackage(record.packageId, { enrollCount: records.length });
  }

  return newItem;
}

export function updatePackageStudentProgress(
  recordId: string,
  progress: number,
  completedCourses: number[],
  lastWatchCourse: number,
  totalWatchDuration: number,
  courseProgress: PackageLearningRecord['courseProgress']
): void {
  const list = JSON.parse(localStorage.getItem(PACKAGE_LEARNING_RECORD_KEY) || '[]');
  const index = list.findIndex((r: PackageLearningRecord) => r.recordId === recordId);
  if (index !== -1) {
    list[index].progress = progress;
    list[index].completedCourses = completedCourses;
    list[index].lastWatchCourse = lastWatchCourse;
    list[index].lastWatchTime = new Date().toISOString().split('T')[0];
    list[index].totalWatchDuration = totalWatchDuration;
    list[index].courseProgress = courseProgress;
    list[index].status = progress >= 100 ? 'completed' : 'learning';
    localStorage.setItem(PACKAGE_LEARNING_RECORD_KEY, JSON.stringify(list));
  }
}

// 计算套餐整体进度（必修课程的平均进度）
export function calculatePackageProgress(courses: PackageCourse[], completedCourses: number[]): number {
  const requiredCourses = courses.filter((c) => c.isRequired);
  if (requiredCourses.length === 0) return 0;

  const completedRequired = requiredCourses.filter((c) => completedCourses.includes(c.courseId)).length;
  return Math.round((completedRequired / requiredCourses.length) * 100);
}

// 检查套餐是否过期
export function isPackageExpired(enrollTime: string, validDays: number): boolean {
  if (validDays === 0) return false;
  const enroll = new Date(enrollTime);
  const expiry = new Date(enroll.getTime() + validDays * 24 * 60 * 60 * 1000);
  return new Date() > expiry;
}

// 获取剩余天数
export function getRemainingDays(enrollTime: string, validDays: number): number {
  const enroll = new Date(enrollTime);
  const expiry = new Date(enroll.getTime() + validDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const remaining = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  return remaining > 0 ? remaining : 0;
}

/**
 * 获取包含指定课程的所有套餐
 * @param courseId 课程ID
 * @returns 包含该课程的套餐列表
 */
export function getPackagesByCourse(courseId: number): CoursePackage[] {
  const packages = getAllPackages();
  return packages.filter(pkg =>
    pkg.status === 'published' &&
    pkg.courses.some(c => c.courseId === courseId)
  );
}

/**
 * 计算套餐节省金额
 * @param pkg 套餐
 * @returns 节省金额（分为单位）
 */
export function calculatePackageSavings(pkg: CoursePackage): number {
  const coursesOriginalPrice = pkg.courses.reduce((sum, c) => sum + c.originalPrice, 0);
  return coursesOriginalPrice - pkg.price;
}

/**
 * 格式化套餐价格
 * @param price 价格（分为单位）
 * @returns 格式化后的价格字符串
 */
export function formatPackagePrice(price: number): string {
  return `¥${(price / 100).toFixed(2)}`;
}

// 自动初始化
initPackageData();
initPackageReviewData();
initPackageLearningRecordData();
