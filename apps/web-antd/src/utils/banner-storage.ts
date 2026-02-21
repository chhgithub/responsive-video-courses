export interface Banner {
	id: string;
	title: string;
	imageUrl: string;
	orderNum: number;
	status: '0' | '1';
	createTime: string;
}

const STORAGE_KEY = 'banner_config_data';

// 默认初始化数据
const defaultBanners: Banner[] = [
	{
		id: '1',
		title: '春季新课首发',
		imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
		orderNum: 1,
		status: '1',
		createTime: '2024-01-01 10:00:00',
	},
	{
		id: '2',
		title: '限时优惠活动',
		imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
		orderNum: 2,
		status: '1',
		createTime: '2024-01-02 10:00:00',
	},
];

/**
 * 获取所有 Banner
 */
export function getBanners(): Banner[] {
	const data = localStorage.getItem(STORAGE_KEY);
	if (!data) {
		// 如果没有数据，初始化默认数据
		setBanners(defaultBanners);
		return defaultBanners;
	}
	return JSON.parse(data);
}

/**
 * 设置所有 Banner
 */
function setBanners(banners: Banner[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
}

/**
 * 根据ID获取 Banner
 */
export function getBannerById(id: string): Banner | undefined {
	const banners = getBanners();
	return banners.find((b) => b.id === id);
}

/**
 * 新增 Banner
 */
export function addBanner(
	banner: Omit<Banner, 'id' | 'createTime'>
): Banner {
	const banners = getBanners();
	const newBanner: Banner = {
		...banner,
		id: Date.now().toString(),
		createTime: new Date().toLocaleString('zh-CN', {
			hour12: false,
		}),
	};
	banners.push(newBanner);
	setBanners(banners);
	return newBanner;
}

/**
 * 更新 Banner
 */
export function updateBanner(id: string, data: Partial<Banner>): void {
	const banners = getBanners();
	const index = banners.findIndex((b) => b.id === id);
	if (index !== -1) {
		banners[index] = { ...banners[index], ...data };
		setBanners(banners);
	}
}

/**
 * 删除 Banner
 */
export function deleteBanner(id: string): void {
	const banners = getBanners();
	const filtered = banners.filter((b) => b.id !== id);
	setBanners(filtered);
}

/**
 * 切换状态
 */
export function toggleStatus(id: string): void {
	const banners = getBanners();
	const banner = banners.find((b) => b.id === id);
	if (banner) {
		banner.status = banner.status === '1' ? '0' : '1';
		setBanners(banners);
	}
}

/**
 * 获取启用的 Banner（前台使用）
 */
export function getActiveBanners(): Banner[] {
	const banners = getBanners();
	return banners
		.filter((b) => b.status === '1')
		.sort((a, b) => a.orderNum - b.orderNum);
}
