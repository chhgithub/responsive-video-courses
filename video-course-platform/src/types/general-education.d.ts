/**
 * 通识教育相关类型定义
 */

// ==================== 单位管理 ====================

/**
 * 单位类型
 */
export type OrganizationType = 'family' | 'school';

/**
 * 单位信息
 */
export interface Organization {
  id: string;
  name: string;           // 单位名称
  code: string;          // 单位编码（唯一标识）
  type: OrganizationType; // 类型：家庭教育/校园教育
  contactPerson?: string; // 联系人
  contactPhone?: string;  // 联系电话
  description?: string;   // 单位描述
  createTime: string;
}

// ==================== 兑换码 ====================

/**
 * 兑换码状态
 */
export type RedemptionCodeStatus = 'unused' | 'used' | 'expired';

/**
 * 兑换码信息
 */
export interface RedemptionCode {
  id: string;
  code: string;           // 兑换码（唯一）
  organizationId: string; // 所属单位ID
  organizationName: string; // 单位名称（冗余，便于查询）
  courseId: string;       // 关联的课程ID
  courseName: string;     // 课程名称（冗余）
  status: RedemptionCodeStatus;
  usedBy?: string;        // 使用者用户ID
  usedTime?: string;      // 使用时间
  expireTime: string;    // 过期时间
  note?: string;          // 备注
  createTime: string;
}

// ==================== 介绍内容 ====================

/**
 * 内容分类
 */
export enum GeneralCategory {
  FAMILY = 'family',
  SCHOOL = 'school',
}

/**
 * 内容类型
 */
export enum GeneralContentType {
  INTRO = 'intro',      // 介绍
  BASE = 'base',        // 实践基地
}

/**
 * 通识教育介绍内容
 */
export interface GeneralEducationIntro {
  id: string;
  category: GeneralCategory;      // 家庭教育/校园教育
  type: GeneralContentType;        // 介绍/实践基地
  title: string;
  coverImage?: string;
  content: string;        // 富文本内容
  images?: string[];      // 图片列表
  isPublished: boolean;
  sortOrder: number;
  createTime: string;
}

// ==================== 兑换记录 ====================

/**
 * 兑换记录
 */
export interface RedemptionRecord {
  id: string;
  codeId: string;         // 兑换码ID
  code: string;           // 兑换码
  organizationId: string; // 单位ID
  organizationName: string; // 单位名称
  courseId: string;       // 课程ID
  courseName: string;     // 课程名称
  userId: string;         // 兑换用户ID
  userName: string;       // 用户名
  redeemTime: string;     // 兑换时间
  ip?: string;            // IP地址
}

// ==================== 用户课程权限 ====================

/**
 * 课程访问来源
 */
export type AccessSource = 'purchase' | 'redeem';

/**
 * 用户课程访问权限
 */
export interface UserCourseAccess {
  id: string;
  userId: string;
  courseId: string;
  accessSource: AccessSource;     // 来源：购买/兑换
  redemptionCode?: string;        // 兑换码（如果是兑换）
  organizationId?: string;        // 单位ID（如果是兑换）
  organizationName?: string;      // 单位名称
  acquireTime: string;            // 获取时间
  expireTime?: string;            // 过期时间（兑换课程有时限）
}

// ==================== 存储数据结构 ====================

/**
 * 通识教育存储数据
 */
export interface GeneralEducationStorage {
  version: string;
  organizations: Organization[];
  redemptionCodes: RedemptionCode[];
  redemptionRecords: RedemptionRecord[];
  intros: GeneralEducationIntro[];
  userCourseAccess: UserCourseAccess[];
}
