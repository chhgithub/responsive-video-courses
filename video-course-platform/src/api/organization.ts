/**
 * 单位管理 API
 * 单位管理员使用的接口
 */

import { filterByOrg, getCurrentOrgId } from '@/utils/permission-filter';
import { getAllUsers, getUserById } from '@/utils/user-storage';
import { getAllRedemptionCodes, getAllRedemptionRecords, getUserCourseAccess } from '@/utils/general-education-storage';
import { getPublishedCourses } from '@/utils/portal-course-adapter';
import { getAllPackages } from '@/utils/course-package-storage';

/**
 * 获取本单位的学员列表
 * @returns 本单位的所有学员
 */
export function getOrgStudents() {
  // 获取所有用户
  const allUsers = getAllUsers();

  // 过滤出本单位的用户
  const orgUsers = filterByOrg(allUsers);

  // 只返回学员角色
  return orgUsers.filter(user => user.role === 'student');
}

/**
 * 获取本单位的兑换码列表（只读）
 * @returns 本单位的所有兑换码
 */
export function getOrgRedemptionCodes() {
  const allCodes = getAllRedemptionCodes();
  return filterByOrg(allCodes);
}

/**
 * 获取本单位的兑换码使用记录
 * @returns 本单位的兑换码使用记录
 */
export function getOrgRedemptionRecords() {
  const allRecords = getAllRedemptionRecords();
  return filterByOrg(allRecords);
}

/**
 * 获取本单位的学员学习进度
 * @returns 本单位学员的学习进度列表
 */
export function getOrgStudentProgress() {
  const orgId = getCurrentOrgId();
  if (!orgId) return [];

  // 获取所有课程访问权限
  const allAccess = getUserCourseAccess();

  // 过滤出本单位的学员
  const orgAccess = allAccess.filter(access => {
    const user = getUserById(access.userId);
    return user && user.organizationId === orgId;
  });

  // 组合学员和进度信息
  const progressList = orgAccess.map(access => {
    const user = getUserById(access.userId);
    const course = getPublishedCourses().find(c => c.id === access.courseId);

    return {
      userId: access.userId,
      userName: user?.nickname || user?.username || '',
      courseId: access.courseId,
      courseName: course?.title || '未知课程',
      packageName: access.packageName,
      organizationId: access.organizationId,
      organizationName: access.organizationName,
      progress: calculateProgress(access.courseId), // 模拟进度，实际需要从学习记录中获取
      lastWatchTime: access.acquireTime, // 暂使用获取时间代替
      expireTime: access.expireTime,
      accessSource: access.accessSource,
    };
  });

  return progressList;
}

/**
 * 获取本单位的学员详细信息
 * @param userId 学员ID
 * @returns 学员详细信息
 */
export function getOrgStudentDetail(userId: string) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('学员不存在');
  }

  // 检查学员是否属于本单位
  const orgId = getCurrentOrgId();
  if (user.organizationId !== orgId) {
    throw new Error('无权访问该学员信息');
  }

  // 获取学员的课程访问权限
  const accessRecords = getUserCourseAccess().filter(a => a.userId === userId);

  // 组合详细信息
  return {
    ...user,
    courseCount: accessRecords.length,
    activeCourses: accessRecords.filter(a => !a.expireTime || new Date(a.expireTime) > new Date()).length,
    accessRecords,
  };
}

/**
 * 获取兑换码的详细使用信息
 * @param codeId 兑换码ID
 * @returns 兑换码使用详情
 */
export function getOrgCodeDetail(codeId: string) {
  const code = getAllRedemptionCodes().find(c => c.id === codeId);
  if (!code) {
    throw new Error('兑换码不存在');
  }

  // 检查兑换码是否属于本单位
  const orgId = getCurrentOrgId();
  if (code.organizationId !== orgId) {
    throw new Error('无权访问该兑换码');
  }

  // 获取使用记录
  const records = getAllRedemptionRecords().filter(r => r.codeId === codeId);

  // 获取兑换的课程
  const courses = getPublishedCourses().filter(c =>
    code.targetType === 'course' && code.targetIds.includes(c.id)
  );

  const packages = getAllPackages().filter(p =>
    code.targetType === 'package' && code.targetIds.includes(p.packageId.toString())
  );

  return {
    ...code,
    usedRecords: records,
    courses,
    packages,
  };
}

/**
 * 获取本单位的统计数据
 * @returns 统计数据
 */
export function getOrgStatistics() {
  const students = getOrgStudents();
  const codes = getOrgRedemptionCodes();
  const records = getOrgRedemptionRecords();

  return {
    // 学员统计
    totalStudents: students.length,
    activeStudents: students.filter(s => {
      const access = getUserCourseAccess().filter(a => a.userId === s.userId);
      return access.length > 0;
    }).length,

    // 兑换码统计
    totalCodes: codes.length,
    unusedCodes: codes.filter(c => c.status === 'unused').length,
    usedCodes: codes.filter(c => c.status === 'used').length,
    expiredCodes: codes.filter(c => c.status === 'expired').length,

    // 兑换统计
    totalRedemptions: records.length,

    // 学习进度统计
    totalAccess: getUserCourseAccess().filter(a => {
      const user = getUserById(a.userId);
      return user && user.organizationId === getCurrentOrgId();
    }).length,
  };
}

// 辅助函数：计算进度（模拟）
function calculateProgress(courseId: string): number {
  // 实际应该从学习记录中计算
  // 这里返回一个随机数模拟
  return Math.floor(Math.random() * 100);
}

/**
 * 搜索本单位的学员
 * @param keyword 搜索关键词
 * @returns 匹配的学员列表
 */
export function searchOrgStudents(keyword: string) {
  const students = getOrgStudents();
  if (!keyword) return students;

  const lowerKeyword = keyword.toLowerCase();
  return students.filter(s =>
    s.nickname.toLowerCase().includes(lowerKeyword) ||
    s.phone?.toLowerCase().includes(lowerKeyword) ||
    s.email?.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 筛选本单位的兑换码
 * @param status 状态
 * @returns 匹配的兑换码列表
 */
export function filterOrgCodes(status?: string) {
  const codes = getOrgRedemptionCodes();
  if (!status) return codes;

  return codes.filter(c => c.status === status);
}
