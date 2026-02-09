/**
 * 业务字典常量定义
 * 用于管理系统中使用的所有字典类型标识
 */

/**
 * 课程相关字典
 */
export const CourseDict = {
  /** 课程难度 */
  DIFFICULTY: 'course_difficulty',
  /** 课程状态 */
  STATUS: 'course_status',
  /** 课程类型 */
  TYPE: 'course_type',
  /** 难度等级 */
  LEVEL: 'course_level',
} as const;

/**
 * 会员相关字典
 */
export const MemberDict = {
  /** 会员等级 */
  LEVEL: 'member_level',
  /** 会员状态 */
  STATUS: 'member_status',
} as const;

/**
 * 订单相关字典
 */
export const OrderDict = {
  /** 订单状态 */
  STATUS: 'order_status',
  /** 支付方式 */
  PAYMENT_METHOD: 'payment_method',
  /** 支付状态 */
  PAYMENT_STATUS: 'payment_status',
} as const;

/**
 * 字典类型映射表（用于显示）
 */
export const DictLabelMap: Record<string, string> = {
  // 课程相关
  [CourseDict.DIFFICULTY]: '课程难度',
  [CourseDict.STATUS]: '课程状态',
  [CourseDict.TYPE]: '课程类型',
  [CourseDict.LEVEL]: '课程等级',

  // 会员相关
  [MemberDict.LEVEL]: '会员等级',
  [MemberDict.STATUS]: '会员状态',

  // 订单相关
  [OrderDict.STATUS]: '订单状态',
  [OrderDict.PAYMENT_METHOD]: '支付方式',
  [OrderDict.PAYMENT_STATUS]: '支付状态',
};

/**
 * 获取字典标签
 */
export function getDictLabel(dictType: string): string {
  return DictLabelMap[dictType] || dictType;
}
