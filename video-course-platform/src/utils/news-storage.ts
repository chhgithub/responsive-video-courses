/**
 * 资讯、活动、热点数据存储管理
 */

export interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
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
  coverImage?: string;
  isActive: boolean;
  orderNum: number;
}

export interface HotTopic {
  id: string;
  title: string;
  content: string;
  link: string;
  coverImage: string;
  createdAt: string;
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
    content: '探索人工智能辅助编程的最新趋势，从GitHub Copilot到ChatGPT，AI工具正在重塑开发流程。本文深入分析AI编程助手的应用场景、优缺点及未来发展方向，帮助开发者提高效率。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-15',
    isActive: true,
    orderNum: 1,
  },
  {
    id: '2',
    title: '2024年前端开发趋势',
    content: 'Vue3、React19、Svelte等主流框架的最新特性解析。Server Components、Suspense、并发渲染等新技术的实践应用。前端性能优化最佳实践分享，包括代码分割、懒加载、缓存策略等。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-14',
    isActive: true,
    orderNum: 2,
  },
  {
    id: '3',
    title: '微服务架构最佳实践',
    content: '从单体应用到微服务的演进之路，服务拆分策略与原则。Docker & Kubernetes容器化部署实战。服务治理：注册中心、配置中心、熔断降级。分布式事务解决方案对比与选择。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-13',
    isActive: true,
    orderNum: 3,
  },
  {
    id: '4',
    title: 'Web3 开发入门指南',
    content: '区块链技术基础：去中心化、共识机制、智能合约。Solidity编程语言快速入门。以太坊DApp开发实战：NFT、DeFi应用开发。Web3.js与前端集成实战教程。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-12',
    isActive: true,
    orderNum: 4,
  },
  {
    id: '5',
    title: '低代码平台对比分析',
    content: '主流低代码平台功能对比：宜搭、简道云、明道云、Appsmith。低代码平台适用场景与局限性分析。企业如何选择合适的低代码方案。自研低代码平台的技术架构建议。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-10',
    isActive: true,
    orderNum: 5,
  },
  {
    id: '6',
    title: 'Go语言高性能编程',
    content: 'Go语言并发编程深入解析：goroutine、channel、context。性能调优工具与技巧：pprof、trace、benchstat。内存管理与垃圾回收机制。高并发系统设计实战案例。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-08',
    isActive: true,
    orderNum: 6,
  },
  {
    id: '7',
    title: '云原生架构设计',
    content: '云原生技术栈全景图：Kubernetes、Istio、Prometheus、Grafana。服务网格Istio实战：流量管理、安全策略、可观测性。持续交付/持续部署流水线设计。GitOps最佳实践。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-05',
    isActive: true,
    orderNum: 7,
  },
  {
    id: '8',
    title: 'TypeScript进阶技巧',
    content: '泛型编程深入理解与应用场景。类型体操实战：复杂类型推导与工具类型。装饰器与元编程。Monads与函数式编程在TS中的实践。大型项目TS配置优化。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-03',
    isActive: true,
    orderNum: 8,
  },
  {
    id: '9',
    title: '数据库性能优化',
    content: 'MySQL索引优化策略与执行计划分析。读写分离与分库分表实战。Redis缓存设计模式与避坑指南。数据库连接池配置优化。慢查询定位与解决思路。',
    link: '',
    coverImage: '',
    createdAt: '2024-01-01',
    isActive: true,
    orderNum: 9,
  },
  {
    id: '10',
    title: 'DevOps实践之路',
    content: 'CI/CD流水线设计：Jenkins、GitLab CI、GitHub Actions。容器化部署最佳实践。监控告警体系搭建：Prometheus + Grafana + AlertManager。日志聚合分析：ELK Stack实战。',
    link: '',
    coverImage: '',
    createdAt: '2023-12-28',
    isActive: true,
    orderNum: 10,
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

export function getNewsById(id: string): News | undefined {
  return getAllNews().find((n) => n.id === id);
}

export function addNews(news: Omit<News, 'id'>): News {
  const list = getAllNews();
  const newItem: News = {
    ...news,
    id: Date.now().toString(),
  };
  list.push(newItem);
  saveNews(list);
  return newItem;
}

export function updateNews(id: string, data: Partial<News>): void {
  const list = getAllNews();
  const index = list.findIndex((item) => item.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    saveNews(list);
  }
}

export function deleteNews(id: string): void {
  const list = getAllNews();
  const newList = list.filter((item) => item.id !== id);
  saveNews(newList);
}

export function toggleNewsStatus(id: string): void {
  const list = getAllNews();
  const item = list.find((item) => item.id === id);
  if (item) {
    item.isActive = !item.isActive;
    saveNews(list);
  }
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

export function getActivityById(id: string): Activity | undefined {
  return getAllActivities().find((a) => a.id === id);
}

export function addActivity(activity: Omit<Activity, 'id'>): Activity {
  const list = getAllActivities();
  const newItem: Activity = {
    ...activity,
    id: Date.now().toString(),
  };
  list.push(newItem);
  saveActivities(list);
  return newItem;
}

export function updateActivity(id: string, data: Partial<Activity>): void {
  const list = getAllActivities();
  const index = list.findIndex((item) => item.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    saveActivities(list);
  }
}

export function deleteActivity(id: string): void {
  const list = getAllActivities();
  const newList = list.filter((item) => item.id !== id);
  saveActivities(newList);
}

export function toggleActivityStatus(id: string): void {
  const list = getAllActivities();
  const item = list.find((item) => item.id === id);
  if (item) {
    item.isActive = !item.isActive;
    saveActivities(list);
  }
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
  if (!data) return [];

  const topics: HotTopic[] = JSON.parse(data);

  // 数据迁移：为旧数据添加content字段
  let needSave = false;
  topics.forEach((topic) => {
    if (!topic.content || topic.content === '') {
      topic.content = `${topic.title}的详细内容...`;
      needSave = true;
    }
    if (!topic.createdAt) {
      topic.createdAt = new Date().toISOString().split('T')[0];
      needSave = true;
    }
  });

  if (needSave) {
    saveHotTopics(topics);
  }

  return topics;
}

export function getActiveHotTopics(): HotTopic[] {
  return getAllHotTopics().filter((h) => h.isActive);
}

export function getHotTopicById(id: string): HotTopic | undefined {
  return getAllHotTopics().find((h) => h.id === id);
}

export function addHotTopic(hot: Omit<HotTopic, 'id'>): HotTopic {
  const list = getAllHotTopics();
  const newItem: HotTopic = {
    ...hot,
    id: Date.now().toString(),
  };
  list.push(newItem);
  saveHotTopics(list);
  return newItem;
}

export function updateHotTopic(id: string, data: Partial<HotTopic>): void {
  const list = getAllHotTopics();
  const index = list.findIndex((item) => item.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    saveHotTopics(list);
  }
}

export function deleteHotTopic(id: string): void {
  const list = getAllHotTopics();
  const newList = list.filter((item) => item.id !== id);
  saveHotTopics(newList);
}

export function toggleHotTopicStatus(id: string): void {
  const list = getAllHotTopics();
  const item = list.find((item) => item.id === id);
  if (item) {
    item.isActive = !item.isActive;
    saveHotTopics(list);
  }
}

export function saveHotTopics(topics: HotTopic[]) {
  localStorage.setItem(HOT_TOPIC_STORAGE_KEY, JSON.stringify(topics));
}

// 自动初始化
initNewsData();
initActivityData();
initHotTopicData();
