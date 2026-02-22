/**
 * 在线咨询数据存储工具
 * 使用 localStorage 模拟后端数据存储
 */

export interface Consultation {
	id: string;
	name: string;
	phone: string;
	email: string;
	subject: string;
	message: string;
	status: 'pending' | 'replied' | 'closed';
	createdAt: string;
	repliedAt?: string;
}

const STORAGE_KEY = 'consultations';

// 生成唯一ID
function generateId(): string {
	return `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取所有咨询记录
 */
export function getConsultations(): Consultation[] {
	const data = localStorage.getItem(STORAGE_KEY);
	if (!data) {
		// 初始化一些模拟数据
		const mockData: Consultation[] = [
			{
				id: generateId(),
				name: '张三',
				phone: '13800138001',
				email: 'zhangsan@example.com',
				subject: 'Python课程咨询',
				message: '想了解Python零基础课程的详细内容和价格',
				status: 'pending',
				createdAt: '2025-02-20 10:30:00',
			},
			{
				id: generateId(),
				name: '李四',
				phone: '13900139002',
				email: 'lisi@example.com',
				subject: '少儿编程报名',
				message: '我家孩子8岁，想报名少儿编程课程，请问有哪些班级？',
				status: 'replied',
				createdAt: '2025-02-19 14:20:00',
				repliedAt: '2025-02-19 16:00:00',
			},
			{
				id: generateId(),
				name: '王五',
				phone: '13700137003',
				email: 'wangwu@example.com',
				subject: '课程套餐优惠',
				message: '购买多个课程有什么优惠吗？',
				status: 'pending',
				createdAt: '2025-02-18 09:15:00',
			},
			{
				id: generateId(),
				name: '赵六',
				phone: '13600136004',
				email: 'zhaoliu@example.com',
				subject: '培训退款',
				message: '因为工作原因无法参加培训，可以退款吗？',
				status: 'closed',
				createdAt: '2025-02-15 11:00:00',
				repliedAt: '2025-02-15 15:30:00',
			},
		];
		localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
		return mockData;
	}
	return JSON.parse(data);
}

/**
 * 保存咨询记录列表
 */
function saveConsultations(consultations: Consultation[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
}

/**
 * 添加新咨询
 */
export function addConsultation(
	consultation: Omit<Consultation, 'id' | 'createdAt' | 'status'>
): Consultation {
	const consultations = getConsultations();
	const newConsultation: Consultation = {
		...consultation,
		id: generateId(),
		status: 'pending',
		createdAt: new Date().toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}),
	};
	consultations.unshift(newConsultation);
	saveConsultations(consultations);
	return newConsultation;
}

/**
 * 删除咨询
 */
export function deleteConsultation(id: string): boolean {
	const consultations = getConsultations();
	const filtered = consultations.filter((c) => c.id !== id);
	if (filtered.length === consultations.length) {
		return false; // 没有找到要删除的记录
	}
	saveConsultations(filtered);
	return true;
}

/**
 * 批量删除咨询
 */
export function batchDeleteConsultations(ids: string[]): number {
	const consultations = getConsultations();
	const initialLength = consultations.length;
	const filtered = consultations.filter((c) => !ids.includes(c.id));
	saveConsultations(filtered);
	return initialLength - filtered.length;
}

/**
 * 更新咨询状态
 */
export function updateConsultationStatus(
	id: string,
	status: Consultation['status']
): boolean {
	const consultations = getConsultations();
	const index = consultations.findIndex((c) => c.id === id);
	if (index === -1) {
		return false;
	}
	consultations[index].status = status;
	if (status === 'replied' && !consultations[index].repliedAt) {
		consultations[index].repliedAt = new Date().toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		});
	}
	saveConsultations(consultations);
	return true;
}

/**
 * 根据ID获取咨询详情
 */
export function getConsultationById(id: string): Consultation | undefined {
	const consultations = getConsultations();
	return consultations.find((c) => c.id === id);
}

/**
 * 查询咨询记录
 */
export function queryConsultations(params: {
	name?: string;
	phone?: string;
	status?: Consultation['status'];
}): Consultation[] {
	let consultations = getConsultations();

	if (params.name) {
		consultations = consultations.filter((c) =>
			c.name.includes(params.name!)
		);
	}

	if (params.phone) {
		consultations = consultations.filter((c) => c.phone === params.phone);
	}

	if (params.status) {
		consultations = consultations.filter((c) => c.status === params.status);
	}

	return consultations;
}
