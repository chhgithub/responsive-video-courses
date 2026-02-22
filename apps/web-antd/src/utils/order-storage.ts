/**
 * 订单数据存储管理
 */

// 订单状态
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

// 订单接口
export interface Order {
	id: string;
	userId: string;
	courseId: string;
	courseTitle: string;
	courseCover: string;
	originalPrice: number; // 单位：分
	actualPrice: number; // 实付金额
	couponId?: string;
	couponDiscount?: number; // 优惠金额
	status: OrderStatus;
	createdAt: string;
	paidAt?: string;
}

const ORDERS_KEY = 'orders';

/**
 * 获取所有订单
 */
export function getAllOrders(): Order[] {
	const data = localStorage.getItem(ORDERS_KEY);
	return data ? JSON.parse(data) : [];
}

/**
 * 获取用户订单
 */
export function getUserOrders(userId: string): Order[] {
	const orders = getAllOrders();
	return orders.filter(o => o.userId === userId);
}

/**
 * 根据课程ID获取订单
 */
export function getOrderByCourse(userId: string, courseId: string): Order | undefined {
	const orders = getUserOrders(userId);
	return orders.find(o => o.courseId === courseId && o.status === 'paid');
}

/**
 * 检查课程是否已购买
 */
export function isCoursePurchased(userId: string, courseId: string): boolean {
	const order = getOrderByCourse(userId, courseId);
	return !!order;
}

/**
 * 创建订单
 */
export function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
	const orders = getAllOrders();
	const newOrder: Order = {
		...orderData,
		id: `o_${Date.now()}`,
		createdAt: new Date().toLocaleString('zh-CN'),
	};
	orders.push(newOrder);
	localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
	return newOrder;
}

/**
 * 更新订单状态
 */
export function updateOrderStatus(orderId: string, status: OrderStatus, paidAt?: string): boolean {
	const orders = getAllOrders();
	const order = orders.find(o => o.id === orderId);
	if (!order) return false;

	order.status = status;
	if (paidAt) {
		order.paidAt = paidAt;
	}

	localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
	return true;
}
