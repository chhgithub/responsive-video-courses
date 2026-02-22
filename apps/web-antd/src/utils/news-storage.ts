/**
 * 资讯公告存储工具
 */

export interface News {
	id: string;
	title: string;
	content: string;
	coverImage: string;
	publishTime: string;
	status: '0' | '1';
	orderNum: number;
	createTime: string;
}

const NEWS_STORAGE_KEY = 'portal_news';

// 获取所有资讯
export function getNews(): News[] {
	const data = localStorage.getItem(NEWS_STORAGE_KEY);
	if (!data) {
		// 返回默认数据
		return getDefaultNews();
	}
	try {
		return JSON.parse(data);
	} catch {
		return getDefaultNews();
	}
}

// 获取启用的资讯
export function getActiveNews(): News[] {
	return getNews().filter((item) => item.status === '1');
}

// 添加资讯
export function addNews(news: Omit<News, 'id' | 'createTime'>): News {
	const list = getNews();
	const newItem: News = {
		...news,
		id: Date.now().toString(),
		createTime: new Date().toLocaleString('zh-CN'),
	};
	list.push(newItem);
	localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
	return newItem;
}

// 更新资讯
export function updateNews(id: string, data: Partial<News>): void {
	const list = getNews();
	const index = list.findIndex((item) => item.id === id);
	if (index !== -1) {
		list[index] = { ...list[index], ...data };
		localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
	}
}

// 删除资讯
export function deleteNews(id: string): void {
	const list = getNews();
	const newList = list.filter((item) => item.id !== id);
	localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(newList));
}

// 切换资讯状态
export function toggleNewsStatus(id: string): void {
	const list = getNews();
	const item = list.find((item) => item.id === id);
	if (item) {
		item.status = item.status === '1' ? '0' : '1';
		localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
	}
}

// 重置资讯数据
export function resetNews(): void {
	localStorage.removeItem(NEWS_STORAGE_KEY);
}

// 默认数据
function getDefaultNews(): News[] {
	return [
		{
			id: '1',
			title: '2025年春季课程开课通知',
			content: '根据教学计划安排，2025年春季课程将于3月1日正式开课，请各位学员提前做好学习准备。',
			coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
			publishTime: '2025-02-20',
			status: '1',
			orderNum: 1,
			createTime: '2025-02-15 10:00:00',
		},
		{
			id: '2',
			title: '关于举办AI技术讲座的公告',
			content: '为提升学员对人工智能技术的了解，中心将举办AI技术专题讲座，邀请业内专家分享最新技术趋势。',
			coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
			publishTime: '2025-02-18',
			status: '1',
			orderNum: 2,
			createTime: '2025-02-10 14:30:00',
		},
		{
			id: '3',
			title: '数字创新中心入选国家级示范项目',
			content: '近日，数字创新中心凭借在数字化转型领域的突出贡献，成功入选国家级示范项目名单。',
			coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
			publishTime: '2025-02-15',
			status: '1',
			orderNum: 3,
			createTime: '2025-02-08 09:15:00',
		},
	];
}

/**
 * 活动日历存储工具
 */

export interface Activity {
	id: string;
	title: string;
	startDate: string;
	endDate: string;
	location: string;
	description: string;
	coverImage: string;
	status: '0' | '1';
	orderNum: number;
	createTime: string;
}

const ACTIVITY_STORAGE_KEY = 'portal_activities';

// 获取所有活动
export function getActivities(): Activity[] {
	const data = localStorage.getItem(ACTIVITY_STORAGE_KEY);
	if (!data) {
		return getDefaultActivities();
	}
	try {
		return JSON.parse(data);
	} catch {
		return getDefaultActivities();
	}
}

// 获取启用的活动
export function getActiveActivities(): Activity[] {
	return getActivities().filter((item) => item.status === '1');
}

// 添加活动
export function addActivity(
	activity: Omit<Activity, 'id' | 'createTime'>
): Activity {
	const list = getActivities();
	const newItem: Activity = {
		...activity,
		id: Date.now().toString(),
		createTime: new Date().toLocaleString('zh-CN'),
	};
	list.push(newItem);
	localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(list));
	return newItem;
}

// 更新活动
export function updateActivity(id: string, data: Partial<Activity>): void {
	const list = getActivities();
	const index = list.findIndex((item) => item.id === id);
	if (index !== -1) {
		list[index] = { ...list[index], ...data };
		localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(list));
	}
}

// 删除活动
export function deleteActivity(id: string): void {
	const list = getActivities();
	const newList = list.filter((item) => item.id !== id);
	localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(newList));
}

// 切换活动状态
export function toggleActivityStatus(id: string): void {
	const list = getActivities();
	const item = list.find((item) => item.id === id);
	if (item) {
		item.status = item.status === '1' ? '0' : '1';
		localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(list));
	}
}

// 重置活动数据
export function resetActivities(): void {
	localStorage.removeItem(ACTIVITY_STORAGE_KEY);
}

// 默认数据
function getDefaultActivities(): Activity[] {
	return [
		{
			id: '1',
			title: '春季公开课：Python入门与实践',
			startDate: '2025-03-05',
			endDate: '2025-03-05',
			location: '线上直播',
			description: '本次公开课将介绍Python基础语法及实际应用案例，适合零基础学员参加。',
			coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
			status: '1',
			orderNum: 1,
			createTime: '2025-02-10 10:00:00',
		},
		{
			id: '2',
			title: '数字化转型研讨会',
			startDate: '2025-03-15',
			endDate: '2025-03-16',
			location: '科技园会议中心',
			description: '邀请行业专家共同探讨企业数字化转型的路径与实践经验。',
			coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800',
			status: '1',
			orderNum: 2,
			createTime: '2025-02-08 14:20:00',
		},
		{
			id: '3',
			title: 'AI技术工作坊',
			startDate: '2025-03-20',
			endDate: '2025-03-22',
			location: '创新中心实验室',
			description: '为期三天的AI技术实践工作坊，包含机器学习、深度学习等主题。',
			coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
			status: '1',
			orderNum: 3,
			createTime: '2025-02-05 09:30:00',
		},
	];
}

/**
 * 热点存储工具
 */

export interface HotTopic {
	id: string;
	title: string;
	link: string;
	coverImage: string;
	orderNum: number;
	status: '0' | '1';
	createTime: string;
}

const HOT_STORAGE_KEY = 'portal_hot_topics';

// 获取所有热点
export function getHotTopics(): HotTopic[] {
	const data = localStorage.getItem(HOT_STORAGE_KEY);
	if (!data) {
		return getDefaultHotTopics();
	}
	try {
		return JSON.parse(data);
	} catch {
		return getDefaultHotTopics();
	}
}

// 获取启用的热点
export function getActiveHotTopics(): HotTopic[] {
	return getHotTopics().filter((item) => item.status === '1');
}

// 添加热点
export function addHotTopic(
	hot: Omit<HotTopic, 'id' | 'createTime'>
): HotTopic {
	const list = getHotTopics();
	const newItem: HotTopic = {
		...hot,
		id: Date.now().toString(),
		createTime: new Date().toLocaleString('zh-CN'),
	};
	list.push(newItem);
	localStorage.setItem(HOT_STORAGE_KEY, JSON.stringify(list));
	return newItem;
}

// 更新热点
export function updateHotTopic(id: string, data: Partial<HotTopic>): void {
	const list = getHotTopics();
	const index = list.findIndex((item) => item.id === id);
	if (index !== -1) {
		list[index] = { ...list[index], ...data };
		localStorage.setItem(HOT_STORAGE_KEY, JSON.stringify(list));
	}
}

// 删除热点
export function deleteHotTopic(id: string): void {
	const list = getHotTopics();
	const newList = list.filter((item) => item.id !== id);
	localStorage.setItem(HOT_STORAGE_KEY, JSON.stringify(newList));
}

// 切换热点状态
export function toggleHotTopicStatus(id: string): void {
	const list = getHotTopics();
	const item = list.find((item) => item.id === id);
	if (item) {
		item.status = item.status === '1' ? '0' : '1';
		localStorage.setItem(HOT_STORAGE_KEY, JSON.stringify(list));
	}
}

// 重置热点数据
export function resetHotTopics(): void {
	localStorage.removeItem(HOT_STORAGE_KEY);
}

// 默认数据
function getDefaultHotTopics(): HotTopic[] {
	return [
		{
			id: '1',
			title: 'AI大语言模型技术突破',
			link: 'https://example.com/news/1',
			coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
			orderNum: 1,
			status: '1',
			createTime: '2025-02-20 10:00:00',
		},
		{
			id: '2',
			title: '量子计算商业化进展',
			link: 'https://example.com/news/2',
			coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
			orderNum: 2,
			status: '1',
			createTime: '2025-02-18 15:30:00',
		},
		{
			id: '3',
			title: 'Web3.0应用生态建设',
			link: 'https://example.com/news/3',
			coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
			orderNum: 3,
			status: '1',
			createTime: '2025-02-16 11:20:00',
		},
	];
}
