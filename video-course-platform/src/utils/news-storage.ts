/**
 * 资讯、活动、热点数据存储管理
 */

export interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  publishTime: string;
  isActive: boolean;
  orderNum: number;
}

export interface Activity {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  isActive: boolean;
  orderNum: number;
}

export interface HotTopic {
  id: string;
  title: string;
  link: string;
  coverImage?: string;
  isActive: boolean;
  orderNum: number;
}

const NEWS_STORAGE_KEY = 'portal_news';
const ACTIVITY_STORAGE_KEY = 'portal_activities';
const HOT_TOPIC_STORAGE_KEY = 'portal_hot_topics';

// 默认资讯数据
const defaultNews: News[] = [
  {
    id: '1',
    title: '平台全新课程上线通知',
    content: '我们很高兴地宣布，平台全新上线了多门优质课程，涵盖前端开发、后端开发、人工智能等多个领域...',
    category: '公告',
    publishTime: '2024-01-15',
    isActive: true,
    orderNum: 1,
  },
  {
    id: '2',
    title: '系统维护通知',
    content: '为了提供更好的服务，我们将于2024年1月20日凌晨2:00-6:00进行系统维护，届时部分功能可能无法使用...',
    category: '通知',
    publishTime: '2024-01-14',
    isActive: true,
    orderNum: 2,
  },
  {
    id: '3',
    title: '新用户注册活动',
    content: '新用户注册即可获得7天VIP会员体验资格，快来参与吧！',
    category: '活动',
    publishTime: '2024-01-13',
    isActive: true,
    orderNum: 3,
  },
];

// 默认活动数据
const defaultActivities: Activity[] = [
  {
    id: '1',
    title: '前端开发技术分享会',
    startDate: '2024-02-15',
    endDate: '2024-02-15',
    location: '线上直播',
    description: '邀请资深前端工程师分享最新的前端开发技术和趋势',
    isActive: true,
    orderNum: 1,
  },
  {
    id: '2',
    title: 'Python 机器学习实战训练营',
    startDate: '2024-02-20',
    endDate: '2024-02-27',
    location: '北京',
    description: '为期一周的机器学习实战训练，从理论到实践全面掌握',
    isActive: true,
    orderNum: 2,
  },
  {
    id: '3',
    title: '云计算架构师认证考试',
    startDate: '2024-03-01',
    endDate: '2024-03-01',
    location: '上海',
    description: '云计算架构师认证考试，获得权威认证证书',
    isActive: true,
    orderNum: 3,
  },
];

// 默认热点话题数据
const defaultHotTopics: HotTopic[] = [
  {
    id: '1',
    title: 'AI 如何改变编程方式',
    link: '#',
    coverImage: 'https://picsum.photos/seed/hot1/200/200',
    isActive: true,
    orderNum: 1,
  },
  {
    id: '2',
    title: '2024年前端开发趋势',
    link: '#',
    coverImage: 'https://picsum.photos/seed/hot2/200/200',
    isActive: true,
    orderNum: 2,
  },
  {
    id: '3',
    title: '微服务架构最佳实践',
    link: '#',
    coverImage: 'https://picsum.photos/seed/hot3/200/200',
    isActive: true,
    orderNum: 3,
  },
  {
    id: '4',
    title: 'Web3 开发入门指南',
    link: '#',
    coverImage: 'https://picsum.photos/seed/hot4/200/200',
    isActive: true,
    orderNum: 4,
  },
  {
    id: '5',
    title: '低代码平台对比分析',
    link: '#',
    coverImage: 'https://picsum.photos/seed/hot5/200/200',
    isActive: true,
    orderNum: 5,
  },
];

// ============ 资讯管理 ============

export function initNewsData() {
  const existing = localStorage.getItem(NEWS_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(defaultNews));
  }
}

export function getAllNews(): News[] {
  initNewsData();
  const data = localStorage.getItem(NEWS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getActiveNews(): News[] {
  return getAllNews().filter((n) => n.isActive);
}

export function saveNews(news: News[]) {
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
}

// ============ 活动管理 ============

export function initActivityData() {
  const existing = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(defaultActivities));
  }
}

export function getAllActivities(): Activity[] {
  initActivityData();
  const data = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getActiveActivities(): Activity[] {
  return getAllActivities().filter((a) => a.isActive);
}

export function saveActivities(activities: Activity[]) {
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
}

// ============ 热点话题管理 ============

export function initHotTopicData() {
  const existing = localStorage.getItem(HOT_TOPIC_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(HOT_TOPIC_STORAGE_KEY, JSON.stringify(defaultHotTopics));
  }
}

export function getAllHotTopics(): HotTopic[] {
  initHotTopicData();
  const data = localStorage.getItem(HOT_TOPIC_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getActiveHotTopics(): HotTopic[] {
  return getAllHotTopics().filter((h) => h.isActive);
}

export function saveHotTopics(topics: HotTopic[]) {
  localStorage.setItem(HOT_TOPIC_STORAGE_KEY, JSON.stringify(topics));
}

// 自动初始化
initNewsData();
initActivityData();
initHotTopicData();
