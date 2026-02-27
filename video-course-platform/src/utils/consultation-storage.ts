/**
 * 在线咨询数据存储管理
 */

export interface Reply {
  id: string;
  consultationId: string;
  responder: string;
  replyType: 'online' | 'phone' | 'email';
  content: string;
  createdAt: string;
}

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
  replies?: Reply[];
}

const CONSULTATION_STORAGE_KEY = 'portal_consultations';

// 默认咨询数据
const defaultConsultations: Consultation[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    subject: 'Python课程咨询',
    message: '想了解Python零基础课程的详细内容和价格',
    status: 'pending',
    createdAt: '2024-01-15 10:30',
    replies: [],
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139002',
    email: 'lisi@example.com',
    subject: '少儿编程报名',
    message: '我家孩子8岁，想报名少儿编程课程，请问有哪些班级？',
    status: 'replied',
    repliedAt: '2024-01-14 16:00',
    createdAt: '2024-01-14 14:20',
    replies: [
      {
        id: 'r1',
        consultationId: '2',
        responder: '管理员',
        replyType: 'phone',
        content: '已通过电话联系家长，介绍了少儿编程的课程安排，家长表示满意，已预约试听课程',
        createdAt: '2024-01-14 16:00',
      },
    ],
  },
  {
    id: '3',
    name: '王五',
    phone: '13700137003',
    email: 'wangwu@example.com',
    subject: '课程套餐优惠',
    message: '购买多个课程有什么优惠吗？',
    status: 'replied',
    repliedAt: '2024-01-13 10:30',
    createdAt: '2024-01-13 09:15',
    replies: [
      {
        id: 'r2',
        consultationId: '3',
        responder: '管理员',
        replyType: 'online',
        content: '您好！购买多个课程确实有优惠。购买2门课程享受9折优惠，购买3门及以上享受85折优惠。详情可以拨打咨询电话了解。',
        createdAt: '2024-01-13 10:30',
      },
    ],
  },
];

// 初始化数据
export function initConsultationData() {
  const existing = localStorage.getItem(CONSULTATION_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(defaultConsultations));
  }
}

// 获取所有咨询
export function getAllConsultations(): Consultation[] {
  initConsultationData();
  const data = localStorage.getItem(CONSULTATION_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 根据ID获取咨询详情
export function getConsultationById(id: string): Consultation | undefined {
  return getAllConsultations().find((c) => c.id === id);
}

// 添加咨询
export function addConsultation(consultation: Omit<Consultation, 'id' | 'createdAt' | 'status'>): Consultation {
  const list = getAllConsultations();
  const newItem: Consultation = {
    ...consultation,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN'),
  };
  list.unshift(newItem);
  localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(list));
  return newItem;
}

// 更新咨询状态
export function updateConsultationStatus(
  id: string,
  status: Consultation['status']
): void {
  const list = getAllConsultations();
  const item = list.find((c) => c.id === id);
  if (item) {
    item.status = status;
    if ((status === 'replied' || status === 'processed') && !item.repliedAt) {
      item.repliedAt = new Date().toLocaleString('zh-CN');
    }
    localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(list));
  }
}

// 添加回复记录
export function addReply(
  consultationId: string,
  replyType: Reply['replyType'],
  content: string,
  responder: string = '管理员'
): Reply {
  const list = getAllConsultations();
  const item = list.find((c) => c.id === consultationId);
  if (!item) {
    throw new Error('咨询记录不存在');
  }

  if (!item.replies) {
    item.replies = [];
  }

  const newReply: Reply = {
    id: Date.now().toString(),
    consultationId,
    responder,
    replyType,
    content,
    createdAt: new Date().toLocaleString('zh-CN'),
  };

  item.replies.push(newReply);

  // 如果当前是待处理状态，自动改为已回复
  if (item.status === 'pending') {
    item.status = 'replied';
    item.repliedAt = newReply.createdAt;
  }

  localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(list));
  return newReply;
}

// 获取咨询的回复记录
export function getReplies(consultationId: string): Reply[] {
  const consultation = getConsultationById(consultationId);
  return consultation?.replies || [];
}

// 删除咨询
export function deleteConsultation(id: string): void {
  const list = getAllConsultations();
  const newList = list.filter((item) => item.id !== id);
  localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(newList));
}

// 批量删除咨询
export function batchDeleteConsultations(ids: string[]): void {
  const list = getAllConsultations();
  const newList = list.filter((item) => !ids.includes(item.id));
  localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(newList));
}

// 查询咨询记录
export function queryConsultations(params: {
  name?: string;
  phone?: string;
  status?: Consultation['status'];
}): Consultation[] {
  let consultations = getAllConsultations();

  if (params.name) {
    consultations = consultations.filter((c) => c.name.includes(params.name!));
  }

  if (params.phone) {
    consultations = consultations.filter((c) => c.phone === params.phone);
  }

  if (params.status) {
    consultations = consultations.filter((c) => c.status === params.status);
  }

  return consultations;
}

// 自动初始化
initConsultationData();
