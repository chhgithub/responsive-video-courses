/**
 * 介绍信息管理模型
 */

/** 一级类别枚举 */
export enum IntroductionCategory {
  COURSE_INTRO = 'course_intro', // 课程介绍
  CERT_CENTER = 'cert_center', // 认证中心介绍
  ABOUT_US = 'about_us', // 关于我们
  FACULTY = 'faculty', // 师资介绍
}

/** 认证中心子类别枚举 */
export enum CertCenterSubCategory {
  AI_TRAINER = 'ai_trainer', // 人工智能训练师
  AI_ENGINEER = 'ai_engineer', // 人工智能工程技术人员
  CAAC_DRONE = 'caac_drone', // CAAC无人机执照
  TECH_BROKER = 'tech_broker', // 技术经纪人
  OTHER = 'other', // 其他(PMP/NPDP)
}

/** 关于我们子类别枚举 */
export enum AboutUsSubCategory {
  RESEARCH_INSTITUTE = 'research_institute', // 关于研究院
  DIGITAL_CENTER = 'digital_center', // 关于数字创新中心
  EDUCATION_CENTER = 'education_center', // 关于教育培训中心
  CONTACT = 'contact', // 联系我们
}

/** 师资介绍子类别枚举 */
export enum FacultySubCategory {
  SHOWCASE = 'showcase', // 师资展示
  APPLICATION = 'application', // 师资申请
  CONSULTATION = 'consultation', // 师资咨询
}

/** 扩展字段类型定义 */
// 认证中心 - 人工智能训练师
export interface AITrainerExtra {
  evaluationPlan?: string; // 评价计划
  gradeAnnouncement?: string; // 成绩公示
  registrationConsult?: string; // 报名咨询
}

// 认证中心 - 人工智能工程技术人员
export interface AIEngineerExtra {
  trainingPlan?: string; // 培训计划
  registrationConsult?: string; // 报名咨询
}

// 认证中心 - CAAC无人机执照
export interface CAACDroneExtra {
  registrationConsult?: string; // 报名咨询
  trialFlight?: string; // 试飞体验
}

// 认证中心 - 技术经纪人
export interface TechBrokerExtra {
  registrationConsult?: string; // 报名咨询
  classPlan?: string; // 开班计划
}

// 认证中心 - 其他
export interface CertOtherExtra {
  pmpInfo?: string; // PMP项目管理信息
  npdpInfo?: string; // NPDP产品管理信息
}

// 关于我们 - 联系我们
export interface ContactExtra {
  phone?: string; // 咨询电话
  fax?: string; // 传真号码
  email?: string; // 电子邮箱
  website?: string; // 官方网站
  address?: string; // 公司地址
  zipCode?: string; // 邮政编码
  workingHours?: {
    // 工作时间
    weekdays?: string;
    weekend?: string;
  };
  qrcodes?: Array<{
    // 二维码信息
    name: string;
    image: string;
    followers?: string;
  }>;
  offices?: Array<{
    // 办事处地址
    city: string;
    address: string;
    phone: string;
  }>;
}

/** 介绍内容项 */
export interface IntroductionContent {
  id: number;
  categoryId: IntroductionCategory; // 一级类别
  subCategoryId: string; // 二级子类别
  title: string;
  content?: string; // 富文本内容
  coverImage?: string;
  extraData?: Record<string, any>; // 扩展字段，JSON格式
  isPublished: boolean; // 是否已发布
  publishTime?: string; // 发布时间
  sortOrder: number; // 排序
  createTime: string;
  updateTime: string;
}

/** 一级类别显示名称映射 */
export const IntroductionCategoryMap: Record<IntroductionCategory, string> = {
  [IntroductionCategory.COURSE_INTRO]: '课程介绍',
  [IntroductionCategory.CERT_CENTER]: '认证中心介绍',
  [IntroductionCategory.ABOUT_US]: '关于我们',
  [IntroductionCategory.FACULTY]: '师资介绍',
};

/** 认证中心子类别显示名称映射 */
export const CertCenterSubCategoryMap: Record<CertCenterSubCategory, string> = {
  [CertCenterSubCategory.AI_TRAINER]: '人工智能训练师',
  [CertCenterSubCategory.AI_ENGINEER]: '人工智能工程技术人员',
  [CertCenterSubCategory.CAAC_DRONE]: 'CAAC无人机执照',
  [CertCenterSubCategory.TECH_BROKER]: '技术经纪人',
  [CertCenterSubCategory.OTHER]: '其他',
};

/** 关于我们子类别显示名称映射 */
export const AboutUsSubCategoryMap: Record<AboutUsSubCategory, string> = {
  [AboutUsSubCategory.RESEARCH_INSTITUTE]: '关于研究院',
  [AboutUsSubCategory.DIGITAL_CENTER]: '关于数字创新中心',
  [AboutUsSubCategory.EDUCATION_CENTER]: '关于教育培训中心',
  [AboutUsSubCategory.CONTACT]: '联系我们',
};

/** 师资介绍子类别显示名称映射 */
export const FacultySubCategoryMap: Record<FacultySubCategory, string> = {
  [FacultySubCategory.SHOWCASE]: '师资展示',
  [FacultySubCategory.APPLICATION]: '师资申请',
  [FacultySubCategory.CONSULTATION]: '师资咨询',
};

/** 查询参数 */
export interface IntroductionQuery extends PageQuery {
  categoryId?: IntroductionCategory;
  subCategoryId?: string;
  title?: string;
  isPublished?: boolean;
}

/** 兼容旧版本的类型别名 */
export interface Introduction extends IntroductionContent {}

/** @deprecated 使用 IntroductionCategory 代替 */
export enum IntroductionType {
  ABOUT_US = 'about_us', // 关于我们
  CERT_CENTER = 'cert_center', // 认证中心介绍
  COURSE_INTRO = 'course_intro', // 课程介绍
  FACULTY = 'faculty', // 师资介绍
}

/** @deprecated 使用 IntroductionCategoryMap 代替 */
export const IntroductionTypeMap: Record<IntroductionType, string> = {
  [IntroductionType.COURSE_INTRO]: '课程介绍',
  [IntroductionType.CERT_CENTER]: '认证中心介绍',
  [IntroductionType.ABOUT_US]: '关于我们',
  [IntroductionType.FACULTY]: '师资介绍',
};
