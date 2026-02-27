import request from '../request';
import type { Introduction, PageResult } from '../types';

export const adminIntroductionApi = {
  // 获取介绍信息列表
  list(type?: string): Promise<PageResult<Introduction>> {
    return request.get('/admin/introduction/list', { params: { type } });
  },

  // 获取介绍信息详情
  detail(id: string): Promise<Introduction> {
    return request.get(`/admin/introduction/${id}`);
  },

  // 根据类型获取介绍信息
  getByType(type: string): Promise<Introduction> {
    return request.get(`/admin/introduction/type/${type}`);
  },

  // 新增介绍信息
  add(data: Partial<Introduction>): Promise<void> {
    return request.postWithMsg('/admin/introduction', data);
  },

  // 更新介绍信息
  update(data: Partial<Introduction>): Promise<void> {
    return request.putWithMsg('/admin/introduction', data);
  },

  // 删除介绍信息
  remove(id: string): Promise<void> {
    return request.deleteWithMsg(`/admin/introduction/${id}`);
  },

  // 发布/取消发布
  updateStatus(id: string, status: string): Promise<void> {
    return request.putWithMsg(`/admin/introduction/${id}/status`, { status });
  },

  // 课程介绍
  courseIntro: {
    list: () => request.get('/admin/introduction/course-intro/list'),
    detail: (id: string) => request.get(`/admin/introduction/course-intro/${id}`),
    add: (data: any) => request.postWithMsg('/admin/introduction/course-intro', data),
    update: (data: any) => request.putWithMsg('/admin/introduction/course-intro', data),
    remove: (id: string) => request.deleteWithMsg(`/admin/introduction/course-intro/${id}`),
  },

  // 认证中心介绍
  certCenter: {
    list: () => request.get('/admin/introduction/cert-center/list'),
    detail: (id: string) => request.get(`/admin/introduction/cert-center/${id}`),
    add: (data: any) => request.postWithMsg('/admin/introduction/cert-center', data),
    update: (data: any) => request.putWithMsg('/admin/introduction/cert-center', data),
    remove: (id: string) => request.deleteWithMsg(`/admin/introduction/cert-center/${id}`),
  },

  // 关于我们
  aboutUs: {
    list: () => request.get('/admin/introduction/about-us/list'),
    detail: (id: string) => request.get(`/admin/introduction/about-us/${id}`),
    add: (data: any) => request.postWithMsg('/admin/introduction/about-us', data),
    update: (data: any) => request.putWithMsg('/admin/introduction/about-us', data),
    remove: (id: string) => request.deleteWithMsg(`/admin/introduction/about-us/${id}`),
  },

  // 师资介绍
  faculty: {
    list: () => request.get('/admin/introduction/faculty/list'),
    detail: (id: string) => request.get(`/admin/introduction/faculty/${id}`),
    add: (data: any) => request.postWithMsg('/admin/introduction/faculty', data),
    update: (data: any) => request.putWithMsg('/admin/introduction/faculty', data),
    remove: (id: string) => request.deleteWithMsg(`/admin/introduction/faculty/${id}`),
  },
};
