/**
 * 会员中心数据存储管理
 */

// 用户信息
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  memberLevel: 'VIP会员' | '普通会员';
  memberExpireTime: string;
  registerTime: string;
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
}

// 课程信息
export interface MyCourse {
  id: string;
  title: string;
  cover: string;
  teacher: string;
  category: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastStudyTime: string;
  status: 'learning' | 'completed';
}

// 订单信息
export interface Order {
  id: string;
  orderNo: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  orderTime: string;
  payTime?: string;
  courses: string[];
}

export interface OrderItem {
  id: string;
  title: string;
  cover: string;
  price: number;
  quantity: number;
}

// 学习历史
export interface LearningRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  watchDuration: number; // 观看时长（秒）
  studyTime: string;
}

// 收藏
export interface Favorite {
  id: string;
  courseId: string;
  title: string;
  cover: string;
  teacher: string;
  price: number;
  originalPrice?: number;
  studentCount: number;
  rating: number;
  favoriteTime: string;
}

const USER_INFO_KEY = 'member_user_info';
const MY_COURSES_KEY = 'member_my_courses';
const ORDERS_KEY = 'member_orders';
const LEARNING_HISTORY_KEY = 'member_learning_history';
const FAVORITES_KEY = 'member_favorites';

// 默认用户信息
const defaultUserInfo: UserInfo = {
  id: '1',
  username: 'student001',
  nickname: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student001',
  memberLevel: 'VIP会员',
  memberExpireTime: '2025-12-31',
  registerTime: '2024-01-01',
  totalCourses: 5,
  completedCourses: 2,
  totalHours: 48,
};

// 默认我的课程数据
const defaultMyCourses: MyCourse[] = [
  {
    id: 'c1',
    title: 'Vue3 从入门到精通',
    cover: 'https://picsum.photos/seed/mycourse1/300/200',
    teacher: '张老师',
    category: '前端开发',
    progress: 80,
    totalLessons: 20,
    completedLessons: 16,
    lastStudyTime: '2024-01-15 14:30',
    status: 'learning',
  },
  {
    id: 'c2',
    title: 'React 实战开发',
    cover: 'https://picsum.photos/seed/mycourse2/300/200',
    teacher: '李老师',
    category: '前端开发',
    progress: 45,
    totalLessons: 25,
    completedLessons: 11,
    lastStudyTime: '2024-01-14 16:20',
    status: 'learning',
  },
  {
    id: 'c3',
    title: 'TypeScript 进阶',
    cover: 'https://picsum.photos/seed/mycourse3/300/200',
    teacher: '王老师',
    category: '前端开发',
    progress: 100,
    totalLessons: 15,
    completedLessons: 15,
    lastStudyTime: '2024-01-10 10:00',
    status: 'completed',
  },
  {
    id: 'c4',
    title: 'Python 数据分析入门',
    cover: 'https://picsum.photos/seed/mycourse4/300/200',
    teacher: '赵老师',
    category: '数据科学',
    progress: 20,
    totalLessons: 18,
    completedLessons: 4,
    lastStudyTime: '2024-01-13 09:15',
    status: 'learning',
  },
  {
    id: 'c5',
    title: '机器学习实战',
    cover: 'https://picsum.photos/seed/mycourse5/300/200',
    teacher: '刘老师',
    category: '人工智能',
    progress: 100,
    totalLessons: 22,
    completedLessons: 22,
    lastStudyTime: '2024-01-08 15:30',
    status: 'completed',
  },
];

// 默认订单数据
const defaultOrders: Order[] = [
  {
    id: 'o1',
    orderNo: 'ORD20240115001',
    items: [
      {
        id: 'item1',
        title: 'Vue3 从入门到精通',
        cover: 'https://picsum.photos/seed/mycourse1/300/200',
        price: 19900,
        quantity: 1,
      },
    ],
    totalAmount: 19900,
    status: 'paid',
    orderTime: '2024-01-15 10:30',
    payTime: '2024-01-15 10:35',
    courses: ['c1'],
  },
  {
    id: 'o2',
    orderNo: 'ORD20240110001',
    items: [
      {
        id: 'item2',
        title: 'React 实战开发',
        cover: 'https://picsum.photos/seed/mycourse2/300/200',
        price: 29900,
        quantity: 1,
      },
    ],
    totalAmount: 29900,
    status: 'paid',
    orderTime: '2024-01-10 14:20',
    payTime: '2024-01-10 14:25',
    courses: ['c2'],
  },
  {
    id: 'o3',
    orderNo: 'ORD20240105001',
    items: [
      {
        id: 'item3',
        title: 'Python 数据分析入门',
        cover: 'https://picsum.photos/seed/mycourse4/300/200',
        price: 15900,
        quantity: 1,
      },
    ],
    totalAmount: 15900,
    status: 'pending',
    orderTime: '2024-01-05 09:00',
    courses: ['c4'],
  },
];

// 默认学习历史
const defaultLearningHistory: LearningRecord[] = [
  {
    id: 'lh1',
    courseId: 'c1',
    courseTitle: 'Vue3 从入门到精通',
    lessonTitle: '第16课：Vue3 组合式API详解',
    watchDuration: 1800,
    studyTime: '2024-01-15 14:30',
  },
  {
    id: 'lh2',
    courseId: 'c2',
    courseTitle: 'React 实战开发',
    lessonTitle: '第11课：Hooks 深入理解',
    watchDuration: 2400,
    studyTime: '2024-01-14 16:20',
  },
  {
    id: 'lh3',
    courseId: 'c3',
    courseTitle: 'TypeScript 进阶',
    lessonTitle: '第15课：高级类型体操',
    watchDuration: 2100,
    studyTime: '2024-01-10 10:00',
  },
  {
    id: 'lh4',
    courseId: 'c4',
    courseTitle: 'Python 数据分析入门',
    lessonTitle: '第4课：Pandas 数据处理',
    watchDuration: 1500,
    studyTime: '2024-01-13 09:15',
  },
  {
    id: 'lh5',
    courseId: 'c1',
    courseTitle: 'Vue3 从入门到精通',
    lessonTitle: '第15课：Vuex 状态管理',
    watchDuration: 1950,
    studyTime: '2024-01-14 15:45',
  },
];

// 默认收藏数据
const defaultFavorites: Favorite[] = [
  {
    id: 'f1',
    courseId: 'c6',
    title: 'Node.js 后端开发',
    cover: 'https://picsum.photos/seed/course4/300/200',
    teacher: '赵老师',
    price: 24900,
    originalPrice: 34900,
    studentCount: 1567,
    rating: 4.8,
    favoriteTime: '2024-01-10 11:00',
  },
  {
    id: 'f2',
    courseId: 'c7',
    title: 'UI/UX 设计基础',
    cover: 'https://picsum.photos/seed/course9/300/200',
    teacher: '孙老师',
    price: 17900,
    studentCount: 2340,
    rating: 4.7,
    favoriteTime: '2024-01-08 16:30',
  },
];

// ============ 用户信息管理 ============

export function initUserInfo() {
  const existing = localStorage.getItem(USER_INFO_KEY);
  if (!existing) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(defaultUserInfo));
  }
}

export function getUserInfo(): UserInfo {
  initUserInfo();
  const data = localStorage.getItem(USER_INFO_KEY);
  return data ? JSON.parse(data) : defaultUserInfo;
}

export function saveUserInfo(userInfo: UserInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

// ============ 我的课程管理 ============

export function initMyCourses() {
  const existing = localStorage.getItem(MY_COURSES_KEY);
  if (!existing) {
    localStorage.setItem(MY_COURSES_KEY, JSON.stringify(defaultMyCourses));
  }
}

export function getMyCourses(): MyCourse[] {
  initMyCourses();
  const data = localStorage.getItem(MY_COURSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getLearningCourses(): MyCourse[] {
  return getMyCourses().filter((c) => c.status === 'learning');
}

export function getCompletedCourses(): MyCourse[] {
  return getMyCourses().filter((c) => c.status === 'completed');
}

export function saveMyCourses(courses: MyCourse[]) {
  localStorage.setItem(MY_COURSES_KEY, JSON.stringify(courses));
}

// ============ 订单管理 ============

export function initOrders() {
  const existing = localStorage.getItem(ORDERS_KEY);
  if (!existing) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(defaultOrders));
  }
}

export function getOrders(): Order[] {
  initOrders();
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrderByStatus(status: string): Order[] {
  if (status === 'all') return getOrders();
  return getOrders().filter((o) => o.status === status);
}

// ============ 学习历史管理 ============

export function initLearningHistory() {
  const existing = localStorage.getItem(LEARNING_HISTORY_KEY);
  if (!existing) {
    localStorage.setItem(LEARNING_HISTORY_KEY, JSON.stringify(defaultLearningHistory));
  }
}

export function getLearningHistory(): LearningRecord[] {
  initLearningHistory();
  const data = localStorage.getItem(LEARNING_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function addLearningRecord(record: LearningRecord) {
  const history = getLearningHistory();
  history.unshift(record);
  localStorage.setItem(LEARNING_HISTORY_KEY, JSON.stringify(history));
}

export function saveLearningHistory(history: LearningRecord[]) {
  localStorage.setItem(LEARNING_HISTORY_KEY, JSON.stringify(history));
}

// ============ 收藏管理 ============

export function initFavorites() {
  const existing = localStorage.getItem(FAVORITES_KEY);
  if (!existing) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(defaultFavorites));
  }
}

export function getFavorites(): Favorite[] {
  initFavorites();
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
}

export function isFavorite(courseId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.courseId === courseId);
}

export function addFavorite(favorite: Favorite) {
  const favorites = getFavorites();
  favorites.push(favorite);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(courseId: string) {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.courseId !== courseId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

// 自动初始化
initUserInfo();
initMyCourses();
initOrders();
initLearningHistory();
initFavorites();
