// 通用类型定义

// 分页参数
export interface PageParams {
  page?: number;
  pageSize?: number;
}

// 分页结果
export interface PageResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API 响应
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 通用 ID 类型
export type ID = string | number;

// ID 列表
export type IDS = ID | ID[];
