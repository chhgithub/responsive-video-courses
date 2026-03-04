/**
 * 用户消息中心数据存储
 */

// 消息类型
export type MessageType =
  | 'system'      // 系统通知
  | 'consultation' // 咨询回复（在线）
  | 'course'       // 课程相关
  | 'order'        // 订单相关
  | 'announcement'; // 公告

// 消息状态
export type MessageStatus = 'unread' | 'read' | 'deleted';

// 用户消息接口
export interface UserMessage {
  messageId: string;
  userId: string;              // 接收用户ID
  type: MessageType;          // 消息类型
  title: string;              // 消息标题
  content: string;            // 消息内容
  status: MessageStatus;       // 消息状态
  createdAt: string;          // 创建时间
  readAt?: string;            // 已读时间

  // 扩展字段
  sourceId?: string;          // 来源ID（如咨询ID、课程ID）
  sourceType?: string;        // 来源类型
  actionUrl?: string;         // 操作链接
  priority?: 'low' | 'normal' | 'high'; // 优先级
}

const MESSAGE_STORAGE_KEY = 'user_messages';

// 初始化消息数据
export function initMessageData() {
  const existing = localStorage.getItem(MESSAGE_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify([]));
  }
}

// 发送消息给用户
export function sendMessageToUser(message: Omit<UserMessage, 'messageId', 'status', 'createdAt'>): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');

  const newMessage: UserMessage = {
    ...message,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  list.push(newMessage);
  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
}

// 群发消息
export function broadcastMessage(
  userIds: string[],
  method: 'message' | 'sms',
  message: Omit<UserMessage, 'messageId', 'userId', 'status', 'createdAt'>
): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
  const timestamp = Date.now();

  const newMessages = userIds.map(userId => ({
    ...message,
    messageId: `msg_${timestamp}_${userId}`,
    userId,
    status: 'unread' as const,
    createdAt: new Date().toISOString(),
  }));

  list.push(...newMessages);
  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
}

// 获取用户的未读消息数量
export function getUnreadMessageCount(userId: string): number {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
  return list.filter((m: UserMessage) => m.userId === userId && m.status === 'unread').length;
}

// 获取用户消息列表
export function getUserMessages(
  userId: string,
  type?: MessageType,
  limit?: number
): UserMessage[] {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');

  let filtered = list.filter((m: UserMessage) => {
    if (m.userId !== userId) return false;
    if (m.status === 'deleted') return false;
    if (type && m.type !== type) return false;
    return true;
  });

  // 按时间倒序
  filtered = filtered.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return limit ? filtered.slice(0, limit) : filtered;
}

// 标记消息已读
export function markMessageAsRead(messageId: string): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
  const index = list.findIndex((m: UserMessage) => m.messageId === messageId);

  if (index !== -1) {
    list[index].status = 'read';
    list[index].readAt = new Date().toISOString();
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
  }
}

// 标记所有消息已读
export function markAllMessagesAsRead(userId: string): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');

  list.forEach((m: UserMessage) => {
    if (m.userId === userId && m.status === 'unread') {
      m.status = 'read';
      m.readAt = new Date().toISOString();
    }
  });

  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
}

// 删除消息
export function deleteMessage(messageId: string): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
  const index = list.findIndex((m: UserMessage) => m.messageId === messageId);

  if (index !== -1) {
    list[index].status = 'deleted';
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
  }
}

// 清空用户所有消息
export function clearAllMessages(userId: string): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');

  list.forEach((m: UserMessage) => {
    if (m.userId === userId) {
      m.status = 'deleted';
    }
  });

  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
}

// 获取所有消息（用于管理）
export function getAllMessages(): UserMessage[] {
  initMessageData();
  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
  return list.filter((m: UserMessage) => m.status !== 'deleted');
}

// 根据消息ID获取消息
export function getMessageById(messageId: string): UserMessage | null {
  initMessageData();
  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
  return list.find((m: UserMessage) => m.messageId === messageId) || null;
}

// 批量删除消息
export function batchDeleteMessages(messageIds: string[]): void {
  initMessageData();

  const list = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');

  list.forEach((m: UserMessage) => {
    if (messageIds.includes(m.messageId)) {
      m.status = 'deleted';
    }
  });

  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(list));
}
