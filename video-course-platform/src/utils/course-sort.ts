import type { Course } from '@/utils/course-storage';

/**
 * 课程排序函数
 * @param a 课程A
 * @param b 课程B
 * @returns 排序结果
 */
export const courseSorter = (a: Course, b: Course) => {
  // 精选课程排在前面
  if (a.isFeatured && !b.isFeatured) return -1;
  if (!a.isFeatured && b.isFeatured) return 1;

  // 精选课程之间按排序值排序
  if (a.isFeatured && b.isFeatured) {
    return b.featuredOrder - a.featuredOrder;
  }

  // 普通课程按默认排序
  return (a.sortOrder || 0) - (b.sortOrder || 0);
};

/**
 * 获取精选课程列表
 * @param courses 所有课程列表
 * @returns 排序后的精选课程列表
 */
export const getFeaturedCourses = (courses: Course[]): Course[] => {
  return courses
    .filter(course => course.isFeatured)
    .sort((a, b) => b.featuredOrder - a.featuredOrder);
};

/**
 * 获取普通课程列表
 * @param courses 所有课程列表
 * @returns 排序后的普通课程列表
 */
export const getNormalCourses = (courses: Course[]): Course[] => {
  return courses
    .filter(course => !course.isFeatured)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};