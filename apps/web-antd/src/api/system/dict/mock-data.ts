/**
 * 业务字典初始化数据
 * 用于系统初始化时的字典数据
 */

import { CourseDict, MemberDict, OrderDict } from '#/constants/dict';

/** 课程难度字典数据 */
export const courseDifficultyData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '初级',
    dictValue: 'beginner',
    dictType: CourseDict.DIFFICULTY,
    status: '0',
    isDefault: true,
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '中级',
    dictValue: 'intermediate',
    dictType: CourseDict.DIFFICULTY,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '高级',
    dictValue: 'advanced',
    dictType: CourseDict.DIFFICULTY,
    status: '0',
    isDefault: false,
  },
];

/** 课程状态字典数据 */
export const courseStatusData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '草稿',
    dictValue: 'draft',
    dictType: CourseDict.STATUS,
    status: '0',
    isDefault: true,
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '已发布',
    dictValue: 'published',
    dictType: CourseDict.STATUS,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '已下架',
    dictValue: 'offline',
    dictType: CourseDict.STATUS,
    status: '0',
    isDefault: false,
  },
];

/** 课程类型字典数据 */
export const courseTypeData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '微课程',
    dictValue: 'micro',
    dictType: CourseDict.TYPE,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '公益课程',
    dictValue: 'public',
    dictType: CourseDict.TYPE,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '付费课程',
    dictValue: 'paid',
    dictType: CourseDict.TYPE,
    status: '0',
    isDefault: true,
  },
  {
    dictCode: 4,
    dictSort: 4,
    dictLabel: '科研赋能',
    dictValue: 'research',
    dictType: CourseDict.TYPE,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 5,
    dictSort: 5,
    dictLabel: 'K12集训',
    dictValue: 'k12',
    dictType: CourseDict.TYPE,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 6,
    dictSort: 6,
    dictLabel: '成人集训',
    dictValue: 'adult',
    dictType: CourseDict.TYPE,
    status: '0',
    isDefault: false,
  },
];

/** 课程等级字典数据 */
export const courseLevelData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '入门级',
    dictValue: 'entry',
    dictType: CourseDict.LEVEL,
    status: '0',
    isDefault: true,
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '进阶级',
    dictValue: 'intermediate',
    dictType: CourseDict.LEVEL,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '精通级',
    dictValue: 'advanced',
    dictType: CourseDict.LEVEL,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 4,
    dictSort: 4,
    dictLabel: '专家级',
    dictValue: 'expert',
    dictType: CourseDict.LEVEL,
    status: '0',
    isDefault: false,
  },
];

/** 会员等级字典数据 */
export const memberLevelData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '注册用户',
    dictValue: 'registered',
    dictType: MemberDict.LEVEL,
    status: '0',
    isDefault: true,
    cssClass: 'badge-default',
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: 'VIP会员',
    dictValue: 'vip',
    dictType: MemberDict.LEVEL,
    status: '0',
    isDefault: false,
    cssClass: 'badge-primary',
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: 'SVIP会员',
    dictValue: 'svip',
    dictType: MemberDict.LEVEL,
    status: '0',
    isDefault: false,
    cssClass: 'badge-warning',
  },
];

/** 会员状态字典数据 */
export const memberStatusData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '正常',
    dictValue: 'normal',
    dictType: MemberDict.STATUS,
    status: '0',
    isDefault: true,
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '已过期',
    dictValue: 'expired',
    dictType: MemberDict.STATUS,
    status: '0',
    isDefault: false,
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '已冻结',
    dictValue: 'frozen',
    dictType: MemberDict.STATUS,
    status: '0',
    isDefault: false,
  },
];

/** 订单状态字典数据 */
export const orderStatusData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '待支付',
    dictValue: 'pending',
    dictType: OrderDict.STATUS,
    status: '0',
    isDefault: true,
    listClass: 'warning',
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '已完成',
    dictValue: 'completed',
    dictType: OrderDict.STATUS,
    status: '0',
    isDefault: false,
    listClass: 'success',
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '已取消',
    dictValue: 'cancelled',
    dictType: OrderDict.STATUS,
    status: '0',
    isDefault: false,
    listClass: 'info',
  },
  {
    dictCode: 4,
    dictSort: 4,
    dictLabel: '已退款',
    dictValue: 'refunded',
    dictType: OrderDict.STATUS,
    status: '0',
    isDefault: false,
    listClass: 'danger',
  },
];

/** 支付方式字典数据 */
export const paymentMethodData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '微信支付',
    dictValue: 'wechat',
    dictType: OrderDict.PAYMENT_METHOD,
    status: '0',
    isDefault: true,
    cssClass: 'badge-success',
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '支付宝',
    dictValue: 'alipay',
    dictType: OrderDict.PAYMENT_METHOD,
    status: '0',
    isDefault: false,
    cssClass: 'badge-primary',
  },
];

/** 支付状态字典数据 */
export const paymentStatusData = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: '待支付',
    dictValue: 'pending',
    dictType: OrderDict.PAYMENT_STATUS,
    status: '0',
    isDefault: true,
    listClass: 'warning',
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: '已支付',
    dictValue: 'paid',
    dictType: OrderDict.PAYMENT_STATUS,
    status: '0',
    isDefault: false,
    listClass: 'success',
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: '支付失败',
    dictValue: 'failed',
    dictType: OrderDict.PAYMENT_STATUS,
    status: '0',
    isDefault: false,
    listClass: 'danger',
  },
  {
    dictCode: 4,
    dictSort: 4,
    dictLabel: '已退款',
    dictValue: 'refunded',
    dictType: OrderDict.PAYMENT_STATUS,
    status: '0',
    isDefault: false,
    listClass: 'info',
  },
];

/**
 * 所有字典类型数据
 */
export const allDictData = {
  [CourseDict.DIFFICULTY]: courseDifficultyData,
  [CourseDict.STATUS]: courseStatusData,
  [CourseDict.TYPE]: courseTypeData,
  [CourseDict.LEVEL]: courseLevelData,
  [MemberDict.LEVEL]: memberLevelData,
  [MemberDict.STATUS]: memberStatusData,
  [OrderDict.STATUS]: orderStatusData,
  [OrderDict.PAYMENT_METHOD]: paymentMethodData,
  [OrderDict.PAYMENT_STATUS]: paymentStatusData,
};

/**
 * 所有字典类型
 */
export const allDictTypes = [
  {
    dictId: 1,
    dictName: '课程难度',
    dictType: CourseDict.DIFFICULTY,
    status: '0',
    remark: '课程难度等级',
  },
  {
    dictId: 2,
    dictName: '课程状态',
    dictType: CourseDict.STATUS,
    status: '0',
    remark: '课程发布状态',
  },
  {
    dictId: 3,
    dictName: '课程类型',
    dictType: CourseDict.TYPE,
    status: '0',
    remark: '课程分类类型',
  },
  {
    dictId: 4,
    dictName: '课程等级',
    dictType: CourseDict.LEVEL,
    status: '0',
    remark: '课程难度等级',
  },
  {
    dictId: 5,
    dictName: '会员等级',
    dictType: MemberDict.LEVEL,
    status: '0',
    remark: '会员等级分类',
  },
  {
    dictId: 6,
    dictName: '会员状态',
    dictType: MemberDict.STATUS,
    status: '0',
    remark: '会员账户状态',
  },
  {
    dictId: 7,
    dictName: '订单状态',
    dictType: OrderDict.STATUS,
    status: '0',
    remark: '订单处理状态',
  },
  {
    dictId: 8,
    dictName: '支付方式',
    dictType: OrderDict.PAYMENT_METHOD,
    status: '0',
    remark: '支付渠道',
  },
  {
    dictId: 9,
    dictName: '支付状态',
    dictType: OrderDict.PAYMENT_STATUS,
    status: '0',
    remark: '支付处理状态',
  },
];
