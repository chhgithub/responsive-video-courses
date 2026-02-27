import request from '../request';
import type { Course, CourseQuery, PageResult, Teacher } from '../types';

export const courseApi = {
  // 获取课程列表
  list(params: CourseQuery): Promise<PageResult<Course>> {
    return request.get('/public/course/list', { params });
  },

  // 获取课程详情
  detail(id: string): Promise<Course> {
    return request.get(`/public/course/${id}`);
  },

  // 获取热门课程
  hot(limit = 10): Promise<Course[]> {
    return request.get('/public/course/hot', { params: { limit } });
  },

  // 获取推荐课程
  featured(limit = 4): Promise<Course[]> {
    return request.get('/public/course/featured', { params: { limit } });
  },

  // 获取课程分类
  categories(): Promise<any[]> {
    return request.get('/public/course/categories');
  },

  // 获取讲师列表
  teachers(): Promise<Teacher[]> {
    return request.get('/public/course/teachers');
  },

  // 获取讲师详情
  teacherDetail(id: string): Promise<Teacher> {
    return request.get(`/public/course/teacher/${id}`);
  },

  // 获取课程章节
  chapters(courseId: string): Promise<any[]> {
    return request.get(`/public/course/${courseId}/chapters`);
  },
};
