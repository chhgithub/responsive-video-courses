/**
 * 介绍信息相关类型定义
 */

// ==================== 基础类型 ====================

/**
 * 基础介绍信息接口
 */
export interface IntroductionBase {
  id: string;
  categoryId: string; // 一级分类：course/cert/about/faculty
  subCategoryId: string; // 二级分类
  tertiaryCategoryId?: string; // 三级分类（可选，用于更细粒度的分类）
  title: string;
  content: string;
  coverImage?: string;
  images?: string[]; // 多图支持
  isPublished: boolean;
  sortOrder: number;
  createTime: string;
  updateTime?: string;
  publishTime?: string;
}

// ==================== 关于我们 ====================

/**
 * 联系方式信息
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  qrCode?: string;
  coordinates?: string; // 地图坐标，格式：经度,纬度
  workingHours?: string; // 工作时间
  wechatAccount?: string; // 微信公众号
}

/**
 * 关于我们信息（扩展基础接口）
 */
export interface AboutUsInfo extends IntroductionBase {
  categoryId: 'about';
  subCategoryId: 'research' | 'digital' | 'education' | 'contact';
  contactInfo?: ContactInfo;
}

/**
 * 关于我们完整数据
 */
export interface AboutUsAll {
  research: AboutUsInfo | null;
  digital: AboutUsInfo | null;
  education: AboutUsInfo | null;
  contact: AboutUsInfo | null;
}

// ==================== 认证中心 ====================

/**
 * 认证模块
 */
export interface CertModule {
  id: string;
  title: string; // 如：培训计划、报名咨询等
  content: string;
  coverImage?: string;
  images?: string[];
  attachments?: Attachment[]; // 附件列表
  isPublished: boolean;
  sortOrder: number;
}

/**
 * 附件信息
 */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

/**
 * 认证类型枚举
 */
export type CertType =
  | 'ai_trainer' // 人工智能训练师
  | 'ai_engineer' // 人工智能工程技术人员
  | 'drone' // CAAC无人机执照
  | 'tech_broker' // 技术经纪人
  | 'other'; // 其他

/**
 * 认证模块ID枚举
 */
export type CertModuleId =
  // 人工智能训练师
  | 'evalPlan'
  | 'gradePublic'
  | 'register'
  // 人工智能工程技术人员
  | 'trainingPlan'
  // CAAC无人机执照
  | 'trialFlight'
  // 技术经纪人
  | 'classPlan'
  // 其他
  | 'pmp'
  | 'npdp'
  // 通用
  | 'register'
  | 'consult';

/**
 * 认证中心信息
 */
export interface CertInfo {
  id: string;
  certType: CertType;
  certTitle: string; // 认证项目名称
  description?: string; // 认证项目简介
  coverImage?: string;
  modules: CertModule[]; // 内容模块列表
  isPublished: boolean;
  sortOrder: number;
  createTime: string;
  updateTime?: string;
}

/**
 * 认证中心配置映射
 */
export interface CertConfigMap {
  ai_trainer: {
    title: string;
    modules: CertModuleId[];
  };
  ai_engineer: {
    title: string;
    modules: CertModuleId[];
  };
  drone: {
    title: string;
    modules: CertModuleId[];
  };
  tech_broker: {
    title: string;
    modules: CertModuleId[];
  };
  other: {
    title: string;
    modules: CertModuleId[];
  };
}

// ==================== 师资队伍 ====================

/**
 * 师资类型
 */
export type FacultyType = 'display' | 'application' | 'consultation';

/**
 * 讲师信息
 */
export interface TeacherInfo {
  id: string;
  name: string;
  avatar: string;
  title: string; // 职称/头衔
  specialties: string[]; // 专业领域
  intro: string; // 个人简介
  achievements?: string[]; // 成就/荣誉
  isPublished: boolean; // 是否在前台展示
  sortOrder: number;
  createTime: string;
  updateTime?: string;
}

/**
 * 师资申请状态
 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

/**
 * 师资申请
 */
export interface FacultyApplication {
  id: string;
  applicantName: string;
  phone: string;
  email: string;
  currentTitle?: string; // 当前职称
  institution?: string; // 所属机构
  specialties: string[]; // 专业领域
  achievements?: string; // 成就描述
  resume?: string; // 简历文件URL
  status: ApplicationStatus;
  rejectReason?: string;
  applyTime: string;
  reviewTime?: string;
  reviewer?: string;
}

/**
 * 师资咨询状态
 */
export type ConsultationStatus = 'pending' | 'resolved';

/**
 * 师资咨询
 */
export interface FacultyConsultation {
  id: string;
  consultantName: string;
  phone: string;
  email?: string;
  topic: string; // 咨询主题
  message: string; // 咨询内容
  status: ConsultationStatus;
  consultTime: string;
  reply?: string; // 回复内容
  replyTime?: string;
}

/**
 * 师资申请配置
 */
export interface FacultyApplicationConfig {
  isOpen: boolean; // 是否开放申请
  description: string; // 申请说明
  requirements: string; // 申请条件
  materials: string; // 所需材料
}

/**
 * 师资咨询配置
 */
export interface FacultyConsultationConfig {
  isOpen: boolean; // 是否开放咨询
  description: string; // 咨询说明
}

/**
 * 师资队伍完整数据
 */
export interface FacultyAll {
  teachers: TeacherInfo[];
  applicationConfig: FacultyApplicationConfig;
  consultationConfig: FacultyConsultationConfig;
  applications: FacultyApplication[];
  consultations: FacultyConsultation[];
}

// ==================== 课程介绍 ====================

/**
 * 课程介绍信息
 */
export interface CourseIntroInfo extends IntroductionBase {
  categoryId: 'course';
  subCategoryId: 'course_intro';
}

// ==================== 统一存储类型 ====================

/**
 * 介绍信息存储数据结构
 */
export interface IntroductionStorage {
  version?: string; // 数据版本号，用于清除旧数据
  courseIntro: CourseIntroInfo[];
  certCenter: CertInfo[];
  aboutUs: AboutUsInfo[];
  faculty: FacultyAll;
}

// ==================== API请求/响应类型 ====================

/**
 * 分页结果
 */
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 通用响应
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 认证模块编辑表单
 */
export interface CertModuleForm {
  certType: CertType;
  moduleId: CertModuleId;
  title: string;
  content: string;
  coverImage?: string;
  images?: string[];
  attachments?: Attachment[];
  isPublished: boolean;
  sortOrder: number;
}

/**
 * 讲师编辑表单
 */
export interface TeacherForm {
  id?: string;
  name: string;
  avatar: string;
  title: string;
  specialties: string[];
  intro: string;
  achievements?: string[];
  isPublished: boolean;
  sortOrder: number;
}
