/**
 * 权限过滤工具
 * 根据用户角色过滤数据，实现数据隔离
 */

import type { UserRole } from '@/api/types/model';
import { useAuthStore } from '@/stores';

/**
 * 根据用户角色过滤数据
 * @param items 数据列表
 * @param userId 用户ID（可选，如果不提供则使用当前登录用户）
 * @returns 过滤后的数据
 */
export function filterByOrg<T extends { organizationId?: string }>(
  items: T[],
  userId?: string
): T[] {
  // 从 stores 获取用户信息
  const authStore = useAuthStore();
  const userInfo = authStore.userInfo;

  if (!userInfo) {
    return [];
  }

  // 总管理员返回所有数据
  if (userInfo.roles?.includes('admin')) {
    return items;
  }

  // 单位管理员只返回本单位数据
  if (userInfo.roles?.includes('org_admin') && userInfo.organizationId) {
    return items.filter(item => item.organizationId === userInfo.organizationId);
  }

  // 其他角色返回空数组
  return [];
}

/**
 * 获取当前用户的单位ID
 * @returns 单位ID，如果不是单位管理员则返回 undefined
 */
export function getCurrentOrgId(): string | undefined {
  const authStore = useAuthStore();
  return authStore.userInfo?.organizationId;
}

/**
 * 获取当前用户的单位名称
 * @returns 单位名称，如果不是单位管理员则返回 undefined
 */
export function getCurrentOrgName(): string | undefined {
  const authStore = useAuthStore();
  return authStore.userInfo?.organizationName;
}

/**
 * 检查用户是否是单位管理员
 * @returns 是否是单位管理员
 */
export function isOrgAdmin(): boolean {
  const authStore = useAuthStore();
  return authStore.userInfo?.roles?.includes('org_admin');
}

/**
 * 检查用户是否是总管理员
 * @returns 是否是总管理员
 */
export function isAdmin(): boolean {
  const authStore = useAuthStore();
  return authStore.userInfo?.roles?.includes('admin');
}

/**
 * 检查是否有访问权限
 * @param requiredRole 需要的角色
 * @returns 是否有权限
 */
export function hasPermission(requiredRole: UserRole): boolean {
  const userInfo = getCurrentUserInfo();
  if (!userInfo) return false;

  // 总管理员拥有所有权限
  if (userInfo.roles?.includes('admin')) return true;

  // 角色匹配
  return userInfo.roles?.includes(requiredRole);
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export function getCurrentUserInfo(): any {
  const authStore = useAuthStore();
  return authStore.userInfo;
}
