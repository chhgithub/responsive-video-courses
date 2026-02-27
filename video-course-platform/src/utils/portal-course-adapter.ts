/**
 * 前台网站数据适配器
 * 从后台管理系统读取已上架的课程和套餐数据，并进行字段映射
 */

import {
  getAllCourses,
  getCourseById,
  type Course as AdminCourse,
  type Chapter,
  type Lesson,
} from './course-storage';
import {
  getAllPackages,
  type CoursePackage as AdminPackage,
} from './course-package-storage';

// ============ 课程数据适配 ============

// 前台课程接口
export interface PortalCourse {
  // 基础字段（保持前台原有结构）
  id: string;
  title: string;
  coverImage: string;
  teacher: { name: string };
  category: string;
  tags: string[];
  rating: number;
  studentCount: number;
  price: number;
  isFree: boolean;
  trialLessonId?: string;
  ageRange?: string;

  // 后台完整数据（用于详情页展示）
  courseIntro: string;
  difficulty: string;
  originalPrice?: number;
  validDays: number;
  isTrial: boolean;
  trialDuration: number;
  chapters: Chapter[];
  enrollCount: number;
  viewCount: number;
  reviewCount: number;
  createTime: string;
  categoryId: number;
  teacherId: number;
  courseType: string;
}

// 后台课程映射到前台课程
function mapAdminCourseToPortal(adminCourse: AdminCourse): PortalCourse {
  return {
    // 基础字段映射
    id: String(adminCourse.courseId),
    title: adminCourse.courseName,
    coverImage: adminCourse.courseCover,
    teacher: { name: adminCourse.teacherName },
    category: adminCourse.categoryName,
    tags: [
      adminCourse.difficulty === 'beginner' ? '入门' :
      adminCourse.difficulty === 'intermediate' ? '进阶' :
      adminCourse.difficulty === 'advanced' ? '高级' : adminCourse.difficulty,
      adminCourse.courseType === 'paid' ? '付费' : '免费',
    ].filter(Boolean),
    rating: adminCourse.rating,
    studentCount: adminCourse.enrollCount,
    price: adminCourse.price,
    isFree: adminCourse.isFree,
    trialLessonId: adminCourse.isTrial && adminCourse.trialLessonIds.length > 0
      ? adminCourse.trialLessonIds[0]
      : undefined,
    ageRange: undefined, // 后台暂无年龄段字段

    // 后台完整数据
    courseIntro: adminCourse.courseIntro,
    difficulty: adminCourse.difficulty,
    originalPrice: adminCourse.originalPrice,
    validDays: adminCourse.validDays,
    isTrial: adminCourse.isTrial,
    trialDuration: adminCourse.trialDuration,
    chapters: adminCourse.chapters,
    enrollCount: adminCourse.enrollCount,
    viewCount: adminCourse.viewCount,
    reviewCount: adminCourse.reviewCount,
    createTime: adminCourse.createTime,
    categoryId: adminCourse.categoryId,
    teacherId: adminCourse.teacherId,
    courseType: adminCourse.courseType,
  };
}

/**
 * 获取已上架的课程列表
 */
export function getPublishedCourses(): PortalCourse[] {
  const allCourses = getAllCourses();
  return allCourses
    .filter((course) => course.status === 'published')
    .map(mapAdminCourseToPortal);
}

/**
 * 根据ID获取课程详情（前台）
 */
export function getPortalCourseById(id: string | number): PortalCourse | undefined {
  const courseId = typeof id === 'string' ? parseInt(id) : id;
  const adminCourse = getCourseById(courseId);
  return adminCourse ? mapAdminCourseToPortal(adminCourse) : undefined;
}

/**
 * 搜索课程
 */
export function searchCourses(keyword: string): PortalCourse[] {
  const publishedCourses = getPublishedCourses();
  const lowerKeyword = keyword.toLowerCase();

  return publishedCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(lowerKeyword) ||
      course.teacher.name.toLowerCase().includes(lowerKeyword) ||
      course.category.toLowerCase().includes(lowerKeyword) ||
      course.courseIntro.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 按分类筛选课程
 */
export function getCoursesByCategory(category: string): PortalCourse[] {
  if (category === '全部') {
    return getPublishedCourses();
  }
  return getPublishedCourses().filter((course) => course.category === category);
}

/**
 * 获取所有课程分类
 */
export function getCourseCategories(): string[] {
  const courses = getPublishedCourses();
  const categories = new Set(courses.map((c) => c.category));
  return ['全部', ...Array.from(categories)];
}

// ============ 套餐数据适配 ============

// 前台套餐接口
export interface PortalPackage {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  price: number;
  originalPrice: number;
  discount: number;
  savings: number;
  courseCount: number;
  courses: Array<{
    courseId: number;
    courseName: string;
    courseCover: string;
    teacherName: string;
    isRequired: boolean;
  }>;
  rating: number;
  enrollCount: number;
  reviewCount: number;
  validDays: number;
  isTrial: boolean;
  trialDays: number;
  createTime: string;
}

// 后台套餐映射到前台套餐
function mapAdminPackageToPortal(adminPackage: AdminPackage): PortalPackage {
  return {
    id: String(adminPackage.packageId),
    name: adminPackage.packageName,
    description: adminPackage.packageDesc,
    coverImage: adminPackage.packageCover,
    price: adminPackage.price,
    originalPrice: adminPackage.originalPrice,
    discount: adminPackage.discount,
    savings: adminPackage.originalPrice - adminPackage.price,
    courseCount: adminPackage.courses.length,
    courses: adminPackage.courses,
    rating: adminPackage.rating,
    enrollCount: adminPackage.enrollCount,
    reviewCount: adminPackage.reviewCount,
    validDays: adminPackage.validDays,
    isTrial: adminPackage.isTrial,
    trialDays: adminPackage.trialDays,
    createTime: adminPackage.createTime,
  };
}

/**
 * 获取已上架的套餐列表
 */
export function getPublishedPackages(): PortalPackage[] {
  const allPackages = getAllPackages();
  return allPackages
    .filter((pkg) => pkg.status === 'published')
    .map(mapAdminPackageToPortal);
}

/**
 * 根据ID获取套餐详情
 */
export function getPortalPackageById(id: string | number): PortalPackage | undefined {
  const packageId = typeof id === 'string' ? parseInt(id) : id;
  const allPackages = getAllPackages();
  const adminPackage = allPackages.find((p) => p.packageId === packageId);
  return adminPackage ? mapAdminPackageToPortal(adminPackage) : undefined;
}

/**
 * 搜索套餐
 */
export function searchPackages(keyword: string): PortalPackage[] {
  const publishedPackages = getPublishedPackages();
  const lowerKeyword = keyword.toLowerCase();

  return publishedPackages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(lowerKeyword) ||
      pkg.description.toLowerCase().includes(lowerKeyword)
  );
}

// ============ 统计数据 ============

/**
 * 获取课程统计信息
 */
export function getCourseStatistics() {
  const courses = getPublishedCourses();
  const totalCourses = courses.length;
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollCount, 0);
  const averageRating = courses.length > 0
    ? courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
    : 0;

  return {
    totalCourses,
    totalEnrollments,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

/**
 * 获取套餐统计信息
 */
export function getPackageStatistics() {
  const packages = getPublishedPackages();
  const totalPackages = packages.length;
  const totalEnrollments = packages.reduce((sum, p) => sum + p.enrollCount, 0);
  const averageRating = packages.length > 0
    ? packages.reduce((sum, p) => sum + p.rating, 0) / packages.length
    : 0;

  return {
    totalPackages,
    totalEnrollments,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}
