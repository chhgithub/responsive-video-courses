import request from '../request';
import type { Introduction } from '../types';

export const introductionApi = {
  // 获取课程介绍
  getCourseIntro(): Promise<Introduction> {
    return request.get('/public/introduction/course-intro');
  },

  // 获取认证中心介绍
  getCertCenter(): Promise<Introduction> {
    return request.get('/public/introduction/cert-center');
  },

  // 获取研究院介绍
  getAboutResearch(): Promise<Introduction> {
    return request.get('/public/introduction/about-research');
  },

  // 获取数字创新中心介绍
  getAboutDigital(): Promise<Introduction> {
    return request.get('/public/introduction/about-digital');
  },

  // 获取教育培训中心介绍
  getAboutEducation(): Promise<Introduction> {
    return request.get('/public/introduction/about-education');
  },

  // 获取联系方式
  getContact(): Promise<Introduction> {
    return request.get('/public/introduction/contact');
  },

  // 获取师资介绍
  getFaculty(): Promise<Introduction> {
    return request.get('/public/introduction/faculty');
  },

  // 获取所有关于我们信息
  getAboutUsAll(): Promise<{
    research: Introduction;
    digital: Introduction;
    education: Introduction;
    contact: Introduction;
  }> {
    return request.get('/public/introduction/about-us/all');
  },
};
