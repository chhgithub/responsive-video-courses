/**
 * 群发消息数据存储
 */

import {
  broadcastMessage,
  type MessageType,
} from './message-storage';
import { getUsersByTag } from './user-tag-storage';
import { getLearningRecordsByCourseId } from './course-storage';
import { getPackageLearningRecords } from './course-package-storage';
import {
  getUserOrganizations,
  type UserOrganization,
} from './general-education-storage';
import { getAllUsers } from './user-storage';

// 群发目标类型
export type BroadcastTargetType =
  | 'all'         // 全部用户
  | 'tag'         // 特定标签的用户
  | 'course'      // 学习某课程的用户
  | 'package'     // 学习某套餐的用户
  | 'organization'; // 某单位的成员

// 群发发送方式
export type BroadcastMethod = 'message' | 'sms';

// 群发记录接口
export interface BroadcastRecord {
  broadcastId: string;
  target: BroadcastTargetType;      // 目标类型
  targetName: string;              // 目标名称描述（如："VIP用户"、"Vue3课程"、"XX学校"）
  targetIds: string[];             // 目标ID列表（标签ID、课程ID或单位ID）

  // 消息内容
  method: BroadcastMethod;          // 发送方式：站内信/短信
  type: MessageType;               // 消息类型
  title: string;                   // 消息标题
  content: string;                 // 消息内容
  actionUrl?: string;              // 操作链接
  priority?: 'low' | 'normal' | 'high'; // 优先级

  // 发送信息
  senderId: string;                 // 发送人ID
  senderName: string;              // 发送人姓名

  // 发送统计
  totalCount: number;              // 目标用户总数
  successCount: number;            // 发送成功数
  failCount: number;               // 发送失败数

  // 状态
  status: 'pending' | 'sending' | 'completed' | 'failed';
  sendTime: string;               // 发送时间
  completedTime?: string;          // 完成时间
  errorMessage?: string;           // 错误信息
}

const BROADCAST_STORAGE_KEY = 'broadcast_records';
const BROADCAST_HISTORY_KEY = 'broadcast_history';

// 初始化群发数据
export function initBroadcastData() {
  if (!localStorage.getItem(BROADCAST_STORAGE_KEY)) {
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(BROADCAST_HISTORY_KEY)) {
    localStorage.setItem(BROADCAST_HISTORY_KEY, JSON.stringify([]));
  }
}

// 获取所有群发记录
export function getAllBroadcastRecords(): BroadcastRecord[] {
  initBroadcastData();
  const data = localStorage.getItem(BROADCAST_STORAGE_KEY);
  const records = data ? JSON.parse(data) : [];
  return records.sort((a, b) =>
    new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime()
  );
}

// 根据ID获取群发记录
export function getBroadcastById(broadcastId: string): BroadcastRecord | null {
  const records = getAllBroadcastRecords();
  return records.find(r => r.broadcastId === broadcastId) || null;
}

// 添加群发记录
export function addBroadcastRecord(record: Omit<BroadcastRecord, 'broadcastId', 'sendTime', 'status', 'successCount', 'failCount'>): BroadcastRecord {
  const records = getAllBroadcastRecords();

  const newRecord: BroadcastRecord = {
    ...record,
    broadcastId: `broadcast_${Date.now()}`,
    sendTime: new Date().toISOString(),
    status: 'pending',
    successCount: 0,
    failCount: 0,
  };

  records.unshift(newRecord);
  localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(records));

  return newRecord;
}

// 更新群发记录状态
export function updateBroadcastStatus(
  broadcastId: string,
  status: BroadcastRecord['status'],
  successCount?: number,
  failCount?: number,
  errorMessage?: string
): void {
  const records = JSON.parse(localStorage.getItem(BROADCAST_STORAGE_KEY) || '[]');
  const index = records.findIndex((r: BroadcastRecord) => r.broadcastId === broadcastId);

  if (index !== -1) {
    records[index].status = status;
    if (successCount !== undefined) {
      records[index].successCount = successCount;
    }
    if (failCount !== undefined) {
      records[index].failCount = failCount;
    }
    if (errorMessage !== undefined) {
      records[index].errorMessage = errorMessage;
    }
    if (status === 'completed' || status === 'failed') {
      records[index].completedTime = new Date().toISOString();
    }
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(records));
  }
}

// 获取所有用户ID（从真实用户数据获取）
function getAllUserIds(): string[] {
  try {
    const users = getAllUsers();
    return users.map(u => u.userId);
  } catch (error) {
    console.error('获取用户ID失败:', error);
    // 如果获取失败，返回空数组
    return [];
  }
}

// 按标签群发
export async function broadcastByTag(
  tagId: string,
  tagName: string,
  method: BroadcastMethod,
  messageType: MessageType,
  title: string,
  content: string,
  senderId: string,
  senderName: string,
  actionUrl?: string,
  priority?: 'low' | 'normal' | 'high'
): Promise<BroadcastRecord> {
  // 获取标签下的所有用户ID
  const userIds = getUsersByTag(tagId);

  // 创建群发记录
  const record = addBroadcastRecord({
    target: 'tag',
    targetName: `标签：${tagName}`,
    targetIds: [tagId],
    method,
    type: messageType,
    title,
    content,
    actionUrl,
    priority,
    senderId,
    senderName,
    totalCount: userIds.length,
  });

  try {
    // 更新状态为发送中
    updateBroadcastStatus(record.broadcastId, 'sending');

    // 模拟异步发送
    await new Promise(resolve => setTimeout(resolve, 500));

    // 调用广播消息函数
    broadcastMessage(userIds, method, {
      type: messageType,
      title,
      content,
      actionUrl,
      priority,
    });

    // 更新状态为已完成
    updateBroadcastStatus(record.broadcastId, 'completed', userIds.length, 0);

    return record;
  } catch (error) {
    updateBroadcastStatus(record.broadcastId, 'failed', 0, userIds.length, error instanceof Error ? error.message : '发送失败');
    throw error;
  }
}

// 按课程学员群发
export async function broadcastByCourseStudents(
  courseId: number,
  courseName: string,
  method: BroadcastMethod,
  messageType: MessageType,
  title: string,
  content: string,
  senderId: string,
  senderName: string,
  actionUrl?: string,
  priority?: 'low' | 'normal' | 'high'
): Promise<BroadcastRecord> {
  // 获取课程的所有学习记录
  const records = getLearningRecordsByCourseId(courseId);
  const userIds = records.map(r => r.userId);

  // 创建群发记录
  const record = addBroadcastRecord({
    target: 'course',
    targetName: `课程学员：${courseName}`,
    targetIds: [courseId.toString()],
    method,
    type: messageType,
    title,
    content,
    actionUrl,
    priority,
    senderId,
    senderName,
    totalCount: userIds.length,
  });

  try {
    // 更新状态为发送中
    updateBroadcastStatus(record.broadcastId, 'sending');

    // 模拟异步发送
    await new Promise(resolve => setTimeout(resolve, 500));

    // 调用广播消息函数
    broadcastMessage(userIds, method, {
      type: messageType,
      title,
      content,
      actionUrl,
      priority,
    });

    // 更新状态为已完成
    updateBroadcastStatus(record.broadcastId, 'completed', userIds.length, 0);

    return record;
  } catch (error) {
    updateBroadcastStatus(record.broadcastId, 'failed', 0, userIds.length, error instanceof Error ? error.message : '发送失败');
    throw error;
  }
}

// 按套餐学员群发
export async function broadcastByPackageStudents(
  packageId: number,
  packageName: string,
  method: BroadcastMethod,
  messageType: MessageType,
  title: string,
  content: string,
  senderId: string,
  senderName: string,
  actionUrl?: string,
  priority?: 'low' | 'normal' | 'high'
): Promise<BroadcastRecord> {
  // 获取套餐的所有学习记录
  const records = getPackageLearningRecords(packageId);
  const userIds = records.map(r => r.userId);

  // 创建群发记录
  const record = addBroadcastRecord({
    target: 'package',
    targetName: `套餐学员：${packageName}`,
    targetIds: [packageId.toString()],
    method,
    type: messageType,
    title,
    content,
    actionUrl,
    priority,
    senderId,
    senderName,
    totalCount: userIds.length,
  });

  try {
    // 更新状态为发送中
    updateBroadcastStatus(record.broadcastId, 'sending');

    // 模拟异步发送
    await new Promise(resolve => setTimeout(resolve, 500));

    // 调用广播消息函数
    broadcastMessage(userIds, method, {
      type: messageType,
      title,
      content,
      actionUrl,
      priority,
    });

    // 更新状态为已完成
    updateBroadcastStatus(record.broadcastId, 'completed', userIds.length, 0);

    return record;
  } catch (error) {
    updateBroadcastStatus(record.broadcastId, 'failed', 0, userIds.length, error instanceof Error ? error.message : '发送失败');
    throw error;
  }
}

// 按单位成员群发
export async function broadcastByOrganizationMembers(
  organizationId: string,
  organizationName: string,
  method: BroadcastMethod,
  messageType: MessageType,
  title: string,
  content: string,
  senderId: string,
  senderName: string,
  actionUrl?: string,
  priority?: 'low' | 'normal' | 'high'
): Promise<BroadcastRecord> {
  // 获取单位下的所有用户ID
  const userOrgs = getUserOrganizations();
  const userIds = userOrgs
    .filter(uo => uo.organizationId === organizationId)
    .map(uo => uo.userId);

  // 创建群发记录
  const record = addBroadcastRecord({
    target: 'organization',
    targetName: `单位成员：${organizationName}`,
    targetIds: [organizationId],
    method,
    type: messageType,
    title,
    content,
    actionUrl,
    priority,
    senderId,
    senderName,
    totalCount: userIds.length,
  });

  try {
    // 更新状态为发送中
    updateBroadcastStatus(record.broadcastId, 'sending');

    // 模拟异步发送
    await new Promise(resolve => setTimeout(resolve, 500));

    // 调用广播消息函数
    broadcastMessage(userIds, method, {
      type: messageType,
      title,
      content,
      actionUrl,
      priority,
    });

    // 更新状态为已完成
    updateBroadcastStatus(record.broadcastId, 'completed', userIds.length, 0);

    return record;
  } catch (error) {
    updateBroadcastStatus(record.broadcastId, 'failed', 0, userIds.length, error instanceof Error ? error.message : '发送失败');
    throw error;
  }
}

// 全员群发
export async function broadcastToAll(
  method: BroadcastMethod,
  messageType: MessageType,
  title: string,
  content: string,
  senderId: string,
  senderName: string,
  actionUrl?: string,
  priority?: 'low' | 'normal' | 'high'
): Promise<BroadcastRecord> {
  // 获取所有用户ID
  const userIds = getAllUserIds();

  // 创建群发记录
  const record = addBroadcastRecord({
    target: 'all',
    targetName: '全部用户',
    targetIds: [],
    method,
    type: messageType,
    title,
    content,
    actionUrl,
    priority,
    senderId,
    senderName,
    totalCount: userIds.length,
  });

  try {
    // 更新状态为发送中
    updateBroadcastStatus(record.broadcastId, 'sending');

    // 模拟异步发送
    await new Promise(resolve => setTimeout(resolve, 500));

    // 调用广播消息函数
    broadcastMessage(userIds, method, {
      type: messageType,
      title,
      content,
      actionUrl,
      priority,
    });

    // 更新状态为已完成
    updateBroadcastStatus(record.broadcastId, 'completed', userIds.length, 0);

    return record;
  } catch (error) {
    updateBroadcastStatus(record.broadcastId, 'failed', 0, userIds.length, error instanceof Error ? error.message : '发送失败');
    throw error;
  }
}

// 获取预计接收人数
export function getEstimatedRecipientCount(
  targetType: BroadcastTargetType,
  targetIds: string[]
): number {
  // Safety check: ensure targetIds is an array
  const ids = Array.isArray(targetIds) ? targetIds : [];

  switch (targetType) {
    case 'all':
      return getAllUserIds().length;
    case 'tag':
      // 获取所有标签下的用户总数
      let tagCount = 0;
      ids.forEach(tagId => {
        tagCount += getUsersByTag(tagId).length;
      });
      return tagCount;
    case 'course':
      // 获取课程学员总数
      let courseCount = 0;
      ids.forEach(courseId => {
        courseCount += getLearningRecordsByCourseId(parseInt(courseId)).length;
      });
      return courseCount;
    case 'package':
      // 获取套餐学员总数
      let packageCount = 0;
      ids.forEach(packageId => {
        packageCount += getPackageLearningRecords(parseInt(packageId)).length;
      });
      return packageCount;
    case 'organization':
      // 获取单位成员总数
      const userOrgs = getUserOrganizations();
      let orgCount = 0;
      ids.forEach(orgId => {
        orgCount += userOrgs.filter(uo => uo.organizationId === orgId).length;
      });
      return orgCount;
    default:
      return 0;
  }
}

// 自动初始化
initBroadcastData();
