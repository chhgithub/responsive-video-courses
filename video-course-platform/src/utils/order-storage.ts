/**
 * 订单数据存储管理
 */

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunding' | 'refunded' | 'refund_failed';
export type PaymentMethod = 'alipay' | 'wechat';
export type OrderType = 'course' | 'package';  // 订单类型：单课程/课程套餐
export type PurchaseType = 'purchase' | 'redeem';  // 购买方式：购买/兑换

// 从 learning-storage.ts 导入学习记录管理函数，统一使用那里的学习记录系统
import { upsertLearningRecord, getCourseLearningRecord } from './learning-storage';

export interface Order {
  orderId: string;
  type: OrderType;          // 订单类型
  purchaseType: PurchaseType;  // 购买方式：购买/兑换
  userId: string;
  userName?: string;      // 用户名（便于后台显示）
  userAvatar?: string;    // 用户头像
  userEmail?: string;     // 用户邮箱

  // 单课程字段
  courseId?: string;         // 课程ID（单课程订单）
  courseName?: string;       // 课程名称（单课程订单）
  courseCover?: string;      // 课程封面（单课程订单）

  // 套餐字段
  packageId?: string;       // 套餐ID（套餐订单）
  packageName?: string;     // 套餐名称（套餐订单）
  packageCover?: string;    // 套餐封面（套餐订单）
  packageCourses?: Array<{   // 套餐包含的课程列表
    courseId: number;
    courseName: string;
    courseCover: string;
    originalPrice: number;
  }>;

  price: number;
  originalPrice?: number; // 原价
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createTime: string;
  payTime?: string;
  adminNote?: string;     // 管理员备注
  refundTime?: string;    // 退款时间
  refundReason?: string;  // 退款原因
  refundFailReason?: string; // 退款失败原因
}

const ORDER_STORAGE_KEY = 'portal_orders';
const ORDER_DATA_VERSION = 'v7'; // 数据版本号，用于强制刷新

/**
 * 获取所有订单
 */
export function getAllOrders(forceInit = false): Order[] {
  const data = localStorage.getItem(ORDER_STORAGE_KEY);
  const version = localStorage.getItem(`${ORDER_STORAGE_KEY}_version`);
  let orders = data ? JSON.parse(data) : [];

  // 如果没有订单数据、数据结构异常、或者版本不匹配，或者强制初始化，初始化默认数据（原型设计）
  const shouldInit = forceInit || !data || !Array.isArray(orders) || orders.length === 0 || version !== ORDER_DATA_VERSION;

  console.log('getAllOrders 调用 - forceInit:', forceInit, 'data:', data, 'version:', version, 'expected:', ORDER_DATA_VERSION, 'shouldInit:', shouldInit);
  console.log('解析的订单数量:', orders?.length || 0);

  if (shouldInit) {
    console.log('初始化默认订单数据... forceInit:', forceInit, 'version:', version, 'expected:', ORDER_DATA_VERSION);
    console.log('初始化默认订单数据...');
    const defaultOrders: Order[] = [
      // 待付款订单
      {
        orderId: 'ORDER-PENDING-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '1',
        courseName: 'Vue3 从入门到精通',
        courseCover: 'https://picsum.photos/seed/course1/300/200',
        price: 199,
        originalPrice: 299,
        status: 'pending',
        createTime: '2024-03-04 09:30:00',
      },
      {
        orderId: 'ORDER-PENDING-002',
        type: 'package',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        packageId: '2',
        packageName: 'Python数据分析套餐',
        packageCover: 'https://picsum.photos/seed/pkg2/400/300',
        packageCourses: [
          {
            courseId: 4,
            courseName: 'Python 数据分析入门',
            courseCover: 'https://picsum.photos/seed/course4/300/200',
            originalPrice: 199,
          },
          {
            courseId: 5,
            courseName: 'Pandas 数据处理实战',
            courseCover: 'https://picsum.photos/seed/course5/300/200',
            originalPrice: 199,
          },
        ],
        price: 399,
        originalPrice: 598,
        status: 'pending',
        createTime: '2024-03-04 10:15:00',
      },
      // 已完成订单
      {
        orderId: 'ORDER-PAID-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '2',
        courseName: 'Vue3 组件化开发实战',
        courseCover: 'https://picsum.photos/seed/course2/300/200',
        price: 299,
        originalPrice: 399,
        status: 'paid',
        paymentMethod: 'alipay',
        createTime: '2024-02-28 14:30:00',
        payTime: '2024-02-28 14:35:00',
      },
      {
        orderId: 'ORDER-PAID-002',
        type: 'package',
        purchaseType: 'redeem',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        packageId: '1',
        packageName: 'Vue全栈开发套餐',
        packageCover: 'https://picsum.photos/seed/pkg1/400/300',
        packageCourses: [
          {
            courseId: 1,
            courseName: 'Vue3 从入门到精通',
            courseCover: 'https://picsum.photos/seed/course1/300/200',
            originalPrice: 199,
          },
          {
            courseId: 2,
            courseName: 'Vue3 组件化开发实战',
            courseCover: 'https://picsum.photos/seed/course2/300/200',
            originalPrice: 299,
          },
          {
            courseId: 3,
            courseName: 'Node.js 后端开发',
            courseCover: 'https://picsum.photos/seed/course3/300/200',
            originalPrice: 299,
            isRequired: true,
          },
        ],
        price: 499,
        originalPrice: 797,
        status: 'paid',
        createTime: '2024-02-20 10:20:00',
        payTime: '2024-02-20 10:35:00',
      },
      {
        orderId: 'ORDER-PAID-003',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '4',
        courseName: 'Python 数据分析入门',
        courseCover: 'https://picsum.photos/seed/course4/300/200',
        price: 199,
        originalPrice: 299,
        status: 'paid',
        paymentMethod: 'wechat',
        createTime: '2024-02-15 09:00:00',
        payTime: '2024-02-15 09:05:00',
      },
      // 已取消订单
      {
        orderId: 'ORDER-CANCELLED-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '3',
        courseName: 'Node.js 后端开发',
        courseCover: 'https://picsum.photos/seed/course3/300/200',
        price: 299,
        originalPrice: 399,
        status: 'cancelled',
        createTime: '2024-02-10 16:45:00',
      },
      {
        orderId: 'ORDER-CANCELLED-002',
        type: 'package',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        packageId: '3',
        packageName: 'Java微服务架构套餐',
        packageCover: 'https://picsum.photos/seed/pkg3/400/300',
        packageCourses: [
          {
            courseId: 7,
            courseName: 'Java 基础到进阶',
            courseCover: 'https://picsum.photos/seed/course7/300/200',
            originalPrice: 299,
          },
        ],
        price: 299,
        originalPrice: 299,
        status: 'cancelled',
        createTime: '2024-01-25 11:20:00',
      },
      // 退款中订单
      {
        orderId: 'ORDER-REFUNDING-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '5',
        courseName: 'Pandas 数据处理实战',
        courseCover: 'https://picsum.photos/seed/course5/300/200',
        price: 199,
        originalPrice: 299,
        status: 'refunding',
        paymentMethod: 'alipay',
        createTime: '2024-02-28 15:30:00',
        payTime: '2024-02-28 15:35:00',
        refundReason: '课程内容不符合预期',
      },
      // 已退款订单
      {
        orderId: 'ORDER-REFUNDED-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '6',
        courseName: 'Python 数据可视化',
        courseCover: 'https://picsum.photos/seed/course6/300/200',
        price: 199,
        originalPrice: 299,
        status: 'refunded',
        paymentMethod: 'wechat',
        createTime: '2024-02-20 10:00:00',
        payTime: '2024-02-20 10:05:00',
        refundTime: '2024-02-22 14:00:00',
        refundReason: '重复购买，申请退款',
      },
      // 退款失败订单
      {
        orderId: 'ORDER-REFUND-FAILED-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: '1',
        userName: '测试用户',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        userEmail: 'test@example.com',
        courseId: '8',
        courseName: 'Spring Boot 实战',
        courseCover: 'https://picsum.photos/seed/course8/300/200',
        price: 399,
        originalPrice: 499,
        status: 'refund_failed',
        paymentMethod: 'alipay',
        createTime: '2024-02-18 13:00:00',
        payTime: '2024-02-18 13:05:00',
        refundTime: '2024-02-20 10:00:00',
        refundReason: '不满足退款条件',
        refundFailReason: '已超过7天无理由退款期限',
      },
      // 原有示例数据（保持不变）
      {
        orderId: 'ORDER-001',
        type: 'course',
        purchaseType: 'purchase',
        userId: 'u001',
        userName: '张小明',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaoming',
        userEmail: 'zhangxm@example.com',
        courseId: '1',
        courseName: 'Vue3 从入门到精通',
        courseCover: 'https://picsum.photos/seed/course1/300/200',
        price: 199,
        originalPrice: 299,
        status: 'paid',
        paymentMethod: 'alipay',
        createTime: '2024-01-10 10:30:00',
        payTime: '2024-01-10 10:35:00',
      },
      {
        orderId: 'ORDER-002',
        type: 'package',
        purchaseType: 'redeem',
        userId: 'u002',
        userName: '李小红',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lixiaohong',
        userEmail: 'lixh@example.com',
        packageId: '1',
        packageName: 'Vue全栈开发套餐',
        packageCover: 'https://picsum.photos/seed/pkg1/400/300',
        packageCourses: [
          {
            courseId: 1,
            courseName: 'Vue3 从入门到精通',
            courseCover: 'https://picsum.photos/seed/course1/300/200',
            originalPrice: 199,
          },
          {
            courseId: 2,
            courseName: 'Vue3 组件化开发实战',
            courseCover: 'https://picsum.photos/seed/course2/300/200',
            originalPrice: 299,
          },
          {
            courseId: 3,
            courseName: 'Node.js 后端开发',
            courseCover: 'https://picsum.photos/seed/course3/300/200',
            originalPrice: 299,
            isRequired: true,
          },
        ],
        price: 499,
        originalPrice: 797,
        status: 'paid',
        createTime: '2024-01-08 14:20:00',
        payTime: '2024-01-08 14:35:00',
      },
    ];

    orders = defaultOrders;
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    localStorage.setItem(`${ORDER_STORAGE_KEY}_version`, ORDER_DATA_VERSION);
    console.log('初始化订单数据完成，共', orders.length, '条');
  }

  return orders;
}

/**
 * 获取用户订单列表
 */
export function getUserOrders(userId: string): Order[] {
  const orders = getAllOrders();
  console.log('getUserOrders - 输入userId:', userId);
  console.log('getUserOrders - 总订单数:', orders.length);
  const filtered = orders.filter((o) => o.userId === userId);
  console.log('getUserOrders - 过滤后订单数:', filtered.length);
  console.log('getUserOrders - 过滤后的订单:', filtered);

  // 原型调试：如果过滤后没有订单，返回测试用户(1)的订单
  if (filtered.length === 0 && orders.length > 0) {
    console.log('原型调试：用户 ' + userId + ' 暂无订单，返回测试用户(1)的订单');
    return orders.filter((o) => o.userId === '1');
  }

  return filtered;
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

  // 套餐订单：检查是否已有未支付的套餐订单
  if (orderData.type === 'package') {
    const existingPendingPackageOrder = orders.find(
      (o) => o.userId === orderData.userId && o.packageId === orderData.packageId && o.status === 'pending'
    );
    if (existingPendingPackageOrder) {
      return existingPendingPackageOrder;
    }
  }

  // 单课程订单：检查是否已有未支付的课程订单
  if (orderData.type === 'course' && orderData.courseId) {
    const existingPendingCourseOrder = orders.find(
      (o) => o.userId === orderData.userId && o.courseId === orderData.courseId && o.status === 'pending'
    );
    if (existingPendingCourseOrder) {
      return existingPendingCourseOrder;
    }
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
    if (order.type === 'course' && order.courseId) {
      // 单课程订单：为该课程创建学习记录
      upsertLearningRecord({
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
    } else if (order.type === 'package' && order.packageCourses) {
      // 套餐订单：为套餐中的所有课程创建学习记录
      order.packageCourses.forEach(course => {
        try {
          upsertLearningRecord({
            courseId: course.courseId,
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
          console.error('创建学习记录失败（课程ID:', course.courseId, '):', error);
        }
      });
    }
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

/**
 * 强制刷新订单数据（原型设计用）
 */
export function forceRefreshOrderData() {
  console.log('强制刷新订单数据...');
  localStorage.removeItem(ORDER_STORAGE_KEY);
  localStorage.removeItem(`${ORDER_STORAGE_KEY}_version`);
  getAllOrders(true);
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

  // 如果是退款中，记录退款原因
  if (status === 'refunding') {
    order.refundReason = reason;
  }

  // 如果是退款失败，记录失败原因
  if (status === 'refund_failed') {
    order.refundFailReason = reason;
  }

  // 如果是退款成功，记录退款时间和原因
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
