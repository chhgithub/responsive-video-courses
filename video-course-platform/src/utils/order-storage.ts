/**
 * 订单数据存储管理
 */

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type PaymentMethod = 'alipay' | 'wechat';

import { addLearningRecord } from './course-storage';

export interface Order {
  orderId: string;
  userId: string;
  userName?: string;      // 用户名（便于后台显示）
  userAvatar?: string;    // 用户头像
  userEmail?: string;     // 用户邮箱
  courseId: string;
  courseName: string;
  courseCover: string;
  price: number;
  originalPrice?: number; // 原价
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createTime: string;
  payTime?: string;
  adminNote?: string;     // 管理员备注
  refundTime?: string;    // 退款时间
  refundReason?: string;  // 退款原因
}

const ORDER_STORAGE_KEY = 'portal_orders';

/**
 * 获取所有订单
 */
export function getAllOrders(): Order[] {
  const data = localStorage.getItem(ORDER_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 获取用户订单列表
 */
export function getUserOrders(userId: string): Order[] {
  const orders = getAllOrders();
  return orders.filter((o) => o.userId === userId);
}

/**
 * 根据订单ID获取订单
 */
export function getOrderById(orderId: string): Order | undefined {
  const orders = getAllOrders();
  return orders.find((o) => o.orderId === orderId);
}

/**
 * 获取用户某课程的订单
 */
export function getUserCourseOrder(userId: string, courseId: string): Order | undefined {
  const orders = getUserOrders(userId);
  return orders.find((o) => o.courseId === courseId && o.status === 'paid');
}

/**
 * 检查用户是否已购买课程
 */
export function hasUserPurchasedCourse(userId: string, courseId: string): boolean {
  const order = getUserCourseOrder(userId, courseId);
  return !!order;
}

/**
 * 创建订单
 */
export function createOrder(orderData: Omit<Order, 'orderId' | 'createTime' | 'status' | 'payTime' | 'refundTime' | 'refundReason'>): Order {
  const orders = getAllOrders();

  // 检查是否已有未支付的订单
  const existingPendingOrder = orders.find(
    (o) => o.userId === orderData.userId && o.courseId === orderData.courseId && o.status === 'pending'
  );

  if (existingPendingOrder) {
    return existingPendingOrder;
  }

  // 创建新订单
  const newOrder: Order = {
    ...orderData,
    orderId: `ORDER-${Date.now()}`,
    createTime: new Date().toISOString(),
    status: 'pending',
  };

  orders.push(newOrder);
  saveOrders(orders);

  return newOrder;
}

/**
 * 支付订单
 */
export function payOrder(orderId: string, paymentMethod: PaymentMethod): Order {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index === -1) {
    throw new Error('订单不存在');
  }

  const order = orders[index];

  if (order.status !== 'pending') {
    throw new Error('订单状态异常');
  }

  // 更新订单状态
  order.status = 'paid';
  order.paymentMethod = paymentMethod;
  order.payTime = new Date().toISOString();

  orders[index] = order;
  saveOrders(orders);

  // 订单支付成功后，自动创建学习记录
  try {
    addLearningRecord({
      courseId: parseInt(order.courseId),
      userId: order.userId,
      userName: order.userName || '',
      userAvatar: order.userAvatar || '',
      enrollTime: order.payTime,
      progress: 0,
      completedLessons: [],
      lastWatchTime: '',
      lastWatchLesson: '',
      totalWatchDuration: 0,
      status: 'learning',
    });
  } catch (error) {
    console.error('创建学习记录失败:', error);
  }

  return order;
}

/**
 * 取消订单
 */
export function cancelOrder(orderId: string): void {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index === -1) {
    throw new Error('订单不存在');
  }

  const order = orders[index];

  if (order.status !== 'pending') {
    throw new Error('只能取消待支付订单');
  }

  order.status = 'cancelled';
  orders[index] = order;
  saveOrders(orders);
}

/**
 * 保存订单数据
 */
function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

/**
 * 获取订单统计
 */
export function getOrderStats(userId: string) {
  const orders = getUserOrders(userId);

  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
  };
}

// ==================== 管理员 API ====================

/**
 * 管理员：获取所有订单
 */
export function adminGetAllOrders(): Order[] {
  return getAllOrders();
}

/**
 * 管理员：根据状态筛选订单
 */
export function adminGetOrdersByStatus(status?: OrderStatus): Order[] {
  const orders = getAllOrders();
  if (!status) return orders;
  return orders.filter((o) => o.status === status);
}

/**
 * 管理员：根据订单ID获取订单
 */
export function adminGetOrderById(orderId: string): Order | undefined {
  return getOrderById(orderId);
}

/**
 * 管理员：更新订单状态
 */
export function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  reason?: string
): boolean {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index === -1) {
    console.error('订单不存在:', orderId);
    return false;
  }

  const order = orders[index];
  order.status = status;

  // 如果是退款，记录退款时间和原因
  if (status === 'refunded') {
    order.refundTime = new Date().toISOString();
    order.refundReason = reason;
  }

  orders[index] = order;
  saveOrders(orders);
  return true;
}

/**
 * 管理员：添加订单备注
 */
export function adminAddOrderNote(orderId: string, note: string): boolean {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index === -1) {
    console.error('订单不存在:', orderId);
    return false;
  }

  orders[index].adminNote = note;
  saveOrders(orders);
  return true;
}

/**
 * 管理员：更新订单信息（补充用户信息）
 */
export function adminUpdateOrderInfo(
  orderId: string,
  info: { userName?: string; userAvatar?: string; userEmail?: string }
): boolean {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index === -1) {
    console.error('订单不存在:', orderId);
    return false;
  }

  if (info.userName) orders[index].userName = info.userName;
  if (info.userAvatar) orders[index].userAvatar = info.userAvatar;
  if (info.userEmail) orders[index].userEmail = info.userEmail;

  saveOrders(orders);
  return true;
}
