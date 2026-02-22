/**
 * 资讯活动类型定义
 */

// 资讯公告表单状态
export interface NewsFormState {
	title: string;
	content: string;
	coverImage: string;
	publishTime: string;
	status: '0' | '1';
	orderNum: number;
}

// 活动日历表单状态
export interface ActivityFormState {
	title: string;
	startDate: string;
	endDate: string;
	location: string;
	description: string;
	coverImage: string;
	status: '0' | '1';
	orderNum: number;
}

// 热点表单状态
export interface HotTopicFormState {
	title: string;
	link: string;
	coverImage: string;
	orderNum: number;
	status: '0' | '1';
}

// Tab 类型
export type ActivityTabType = 'news' | 'activity' | 'hot';

// 导出所有类型的联合，方便使用
export type TabType = ActivityTabType;
