/**
 * 公开API - 前台网站使用
 * 不需要登录认证
 */
import { requestClient } from '#/api/request';

/**
 * 获取认证中心所有已发布内容
 */
export async function getCertCenterAll() {
  return requestClient.get<Record<string, any>>(
    '/public/introduction/cert_center/all',
  );
}

/**
 * 获取关于我们所有已发布内容
 */
export async function getAboutUsAll() {
  return requestClient.get<Record<string, any>>(
    '/public/introduction/about_us/all',
  );
}

/**
 * 获取师资介绍所有已发布内容
 */
export async function getFacultyAll() {
  return requestClient.get<Record<string, any>>(
    '/public/introduction/faculty/all',
  );
}

/**
 * 获取课程介绍已发布内容
 */
export async function getCourseIntro() {
  return requestClient.get<any>('/public/introduction/course_intro/get');
}
