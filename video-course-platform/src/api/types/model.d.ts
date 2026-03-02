// 业务模型类型定义

import type { PageParams } from './common';

// 用户角色
export type UserRole = 'admin' | 'org_admin' | 'teacher' | 'student';

// 用户信息
export interface UserInfo {
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  roles?: string[];

  // 单位管理员专属字段
  organizationId?: string;
  organizationName?: string;

  createTime?: string;
}

// 登录表单
export interface LoginForm {
  username: string;
  password: string;
  captcha?: string;
}

// 注册表单
export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  captcha?: string;
}

// 课程信息
export interface Course {
  courseId: string;
  courseName: string;
  courseCover: string;
  courseIntro: string;
  categoryId?: string;
  categoryName?: string;
  teacherIds?: string[];
  teacherNames?: string[];
  price: number;
  originalPrice?: number;
  isFree: boolean;
  status: 'draft' | 'published';
  viewCount: number;
  enrollCount: number;
  rating?: number;
  createTime: string;
  updateTime?: string;
  chapters?: CourseChapter[];
}

// 课程章节
export interface CourseChapter {
  chapterId: string;
  courseId: string;
  chapterName: string;
  chapterIntro?: string;
  videoUrl?: string;
  duration?: number;
  sortOrder: number;
  isFree: boolean;
}

// 课程查询参数
export interface CourseQuery extends PageParams {
  keyword?: string;
  categoryId?: string;
  teacherId?: string;
  status?: string;
  isFree?: boolean;
}

// 讲师信息
export interface Teacher {
  teacherId: string;
  teacherName: string;
  avatar: string;
  title?: string;
  intro?: string;
  specialties?: string[];
  courseCount?: number;
  studentCount?: number;
  rating?: number;
}

// 介绍信息
export interface Introduction {
  id: string;
  type: 'course_intro' | 'cert_center' | 'about_research' | 'about_digital' | 'about_education' | 'contact' | 'faculty';
  title: string;
  content: string;
  cover?: string;
  status: 'draft' | 'published';
  createTime: string;
  updateTime?: string;
  createBy?: string;
}

// 系统用户
export interface SystemUser {
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  deptId?: string;
  deptName?: string;
  roles?: string[];
  status: 'active' | 'disabled';
  createTime: string;
}

// 角色
export interface Role {
  roleId: string;
  roleName: string;
  roleCode: string;
  description?: string;
  permissions?: string[];
  status: 'active' | 'disabled';
  createTime: string;
}

// 菜单
export interface Menu {
  menuId: string;
  parentId?: string;
  menuName: string;
  menuType: 'menu' | 'button' | 'directory';
  path?: string;
  icon?: string;
  component?: string;
  permission?: string;
  sortOrder: number;
  visible: boolean;
  children?: Menu[];
}

// 字典类型
export interface DictType {
  dictId: string;
  dictName: string;
  dictCode: string;
  description?: string;
  status: 'active' | 'disabled';
  createTime: string;
}

// 字典数据
export interface DictData {
  dictCode: string;
  dictLabel: string;
  dictValue: string;
  sortOrder: number;
  status: 'active' | 'disabled';
  cssClass?: string;
  remark?: string;
}
