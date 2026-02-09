import type { Course, CourseChapter, CourseQuery } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  categoryTree = '/course/category/tree',
  chapterInfo = '/course/chapter',
  chapterList = '/course/chapter/list',
  courseExport = '/course/export',
  courseInfo = '/course',
  courseList = '/course/list',
  teacherList = '/course/teacher/list',
}

/**
 * 获取课程列表（模拟数据）
 * @param _params 查询参数
 * @returns 课程列表
 */
export function courseList(_params?: CourseQuery) {
  // 模拟数据返回（原型开发使用）
  return new Promise<PageResult<Course>>((resolve) => {
    setTimeout(() => {
      const mockData: Course[] = [
        {
          courseId: 1,
          courseName: 'Vue3 从入门到精通',
          courseCover: 'https://picsum.photos/seed/vue/200/120',
          courseIntro: '本课程全面讲解Vue3的核心概念和实战技巧',
          categoryId: 1,
          categoryName: '前端开发',
          teacherId: 1,
          teacherName: '张老师',
          price: 199,
          originalPrice: 299,
          isFree: false,
          status: 'published',
          sortOrder: 1,
          viewCount: 1250,
          enrollCount: 86,
          createTime: '2025-01-15 10:00:00',
        },
        {
          courseId: 2,
          courseName: 'React 实战开发',
          courseCover: 'https://picsum.photos/seed/react/200/120',
          courseIntro: '深入React生态系统，掌握现代前端开发',
          categoryId: 1,
          categoryName: '前端开发',
          teacherId: 2,
          teacherName: '李老师',
          price: 0,
          originalPrice: 0,
          isFree: true,
          status: 'published',
          sortOrder: 2,
          viewCount: 2341,
          enrollCount: 156,
          createTime: '2025-01-20 14:30:00',
        },
        {
          courseId: 3,
          courseName: 'Python 数据分析',
          courseCover: 'https://picsum.photos/seed/python/200/120',
          courseIntro: '使用Python进行数据分析和可视化',
          categoryId: 2,
          categoryName: '后端开发',
          teacherId: 1,
          teacherName: '张老师',
          price: 299,
          originalPrice: 399,
          isFree: false,
          status: 'published',
          sortOrder: 3,
          viewCount: 876,
          enrollCount: 52,
          createTime: '2025-02-01 09:15:00',
        },
      ];

      resolve({
        rows: mockData,
        total: mockData.length,
      });
    }, 300);
  });
}

/**
 * 课程详情
 * @param courseId 课程ID
 * @returns 课程详情
 */
export function courseInfo(courseId: ID) {
  return requestClient.get<Course>(`${Api.courseInfo}/${courseId}`);
}

/**
 * 获取课程信息（用于编辑）
 * @param courseId 课程ID
 * @returns 课程信息
 */
export function getCourseForEdit(courseId?: ID) {
  const url = courseId ? `${Api.courseInfo}/${courseId}` : `${Api.courseInfo}/`;
  return requestClient.get<Course>(url);
}

/**
 * 新增课程
 * @param data 课程数据
 */
export function courseAdd(data: Partial<Course>) {
  return requestClient.postWithMsg<void>(Api.courseInfo, data);
}

/**
 * 更新课程
 * @param data 课程数据
 */
export function courseUpdate(data: Partial<Course>) {
  return requestClient.putWithMsg<void>(Api.courseInfo, data);
}

/**
 * 删除课程
 * @param courseIds 课程ID数组
 */
export function courseRemove(courseIds: IDS) {
  // 模拟删除（原型开发使用）
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('模拟删除课程:', courseIds);
      resolve();
    }, 300);
  });
}

/**
 * 导出课程
 * @param data 查询参数
 */
export function courseExport(data: Partial<Course>) {
  return requestClient.get<Blob>(Api.courseExport, {
    data,
    isTransformResponse: false,
    responseType: 'blob',
  });
}

/**
 * 获取课程章节列表
 * @param courseId 课程ID
 * @returns 章节列表
 */
export function chapterList(courseId: ID) {
  return requestClient.get<CourseChapter[]>(`${Api.chapterList}/${courseId}`);
}

/**
 * 新增课程章节
 * @param data 章节数据
 */
export function chapterAdd(data: Partial<CourseChapter>) {
  return requestClient.postWithMsg<void>(Api.chapterInfo, data);
}

/**
 * 更新课程章节
 * @param data 章节数据
 */
export function chapterUpdate(data: Partial<CourseChapter>) {
  return requestClient.putWithMsg<void>(Api.chapterInfo, data);
}

/**
 * 删除课程章节
 * @param chapterIds 章节ID数组
 */
export function chapterRemove(chapterIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.chapterInfo}/${chapterIds}`);
}

/**
 * 获取课程分类树（模拟数据）
 * @returns 分类树
 */
export function categoryTree() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          categoryId: 1,
          categoryName: '前端开发',
          children: [
            { categoryId: 11, categoryName: 'Vue', children: [] },
            { categoryId: 12, categoryName: 'React', children: [] },
          ],
        },
        {
          categoryId: 2,
          categoryName: '后端开发',
          children: [
            { categoryId: 21, categoryName: 'Python', children: [] },
            { categoryId: 22, categoryName: 'Java', children: [] },
          ],
        },
      ]);
    }, 200);
  });
}

/**
 * 获取讲师列表（模拟数据）
 * @returns 讲师列表
 */
export function teacherList() {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { teacherId: 1, teacherName: '张老师' },
        { teacherId: 2, teacherName: '李老师' },
        { teacherId: 3, teacherName: '王老师' },
      ]);
    }, 200);
  });
}

/**
 * 更改课程状态
 * @param data 课程数据
 */
export function courseStatusChange(data: Partial<Course>) {
  const requestData = {
    courseId: data.courseId,
    status: data.status,
  };
  return requestClient.putWithMsg<void>(
    `${Api.courseInfo}/status`,
    requestData,
  );
}
