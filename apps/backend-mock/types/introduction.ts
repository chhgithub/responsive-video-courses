/**
 * 介绍信息类型定义
 */

/** 介绍内容项 */
export interface IntroductionContent {
  id: number;
  categoryId: string; // 一级类别
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
