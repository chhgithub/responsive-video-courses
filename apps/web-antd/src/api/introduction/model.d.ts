/**
 * 介绍信息管理模型
 */

/** 介绍信息基础信息 */
export interface Introduction {
  id: number;
  type: IntroductionType;
  title: string;
  content: string;
  coverImage?: string;
  updateTime: string;
}

/** 介绍类型枚举 */
export enum IntroductionType {
  ABOUT_US = 'about_us', // 关于我们
  CERT_CENTER = 'cert_center', // 认证中心介绍
  COURSE_INTRO = 'course_intro', // 课程介绍
  FACULTY = 'faculty', // 师资介绍
}

/** 介绍类型显示名称映射 */
export const IntroductionTypeMap: Record<IntroductionType, string> = {
  [IntroductionType.COURSE_INTRO]: '课程介绍',
  [IntroductionType.CERT_CENTER]: '认证中心介绍',
  [IntroductionType.ABOUT_US]: '关于我们',
  [IntroductionType.FACULTY]: '师资介绍',
};

/** 查询参数 */
export interface IntroductionQuery extends PageQuery {
  type?: IntroductionType;
  title?: string;
}
