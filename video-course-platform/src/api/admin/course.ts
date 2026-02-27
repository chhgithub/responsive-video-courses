import request from '../request';
import type { Course, CourseQuery, PageResult } from '../types';

const Api = {
  courseList: '/admin/course/list',
  courseInfo: '/admin/course',
};

export const adminCourseApi = {
  // 获取课程列表
  list(params: CourseQuery): Promise<PageResult<Course>> {
    return request.get(Api.courseList, { params });
  },

  // 获取课程详情
  detail(id: string): Promise<Course> {
    return request.get(`${Api.courseInfo}/${id}`);
  },

  // 新增课程
  add(data: Partial<Course>): Promise<void> {
    return request.postWithMsg(Api.courseInfo, data);
  },

  // 更新课程
  update(data: Partial<Course>): Promise<void> {
    return request.putWithMsg(Api.courseInfo, data);
  },

  // 删除课程
  remove(courseIds: string): Promise<void> {
    return request.deleteWithMsg(`${Api.courseInfo}/${courseIds}`);
  },

  // 批量删除课程
  batchRemove(courseIds: string[]): Promise<void> {
    return request.deleteWithMsg(`${Api.courseInfo}/batch`, { data: { courseIds } });
  },

  // 上架/下架课程
  updateStatus(courseId: string, status: string): Promise<void> {
    return request.putWithMsg(`${Api.courseInfo}/${courseId}/status`, { status });
  },

  // 获取课程分类树
  categoryTree(): Promise<any[]> {
    return request.get('/admin/course/category-tree');
  },

  // 获取讲师列表
  teacherList(): Promise<any[]> {
    return request.get('/admin/course/teacher-list');
  },
};
