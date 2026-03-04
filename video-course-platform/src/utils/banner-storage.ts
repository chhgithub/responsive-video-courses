/**
 * Banner 数据存储管理
 */

export interface Banner {
  id: string;
  title: string;
  pcImageUrl: string;
  mobileImageUrl: string;
  link?: string;
  status: '0' | '1'; // '1' 启用, '0' 禁用
  orderNum: number;
  createTime?: string;
}

const BANNER_STORAGE_KEY = 'portal_banners';

// 默认 Banner 数据
const defaultBanners: Banner[] = [
  {
    id: '1',
    title: '欢迎来到视频课程平台',
    pcImageUrl: 'https://picsum.photos/seed/banner1/1280/400',
    mobileImageUrl: 'https://picsum.photos/seed/banner1-mobile/750/300',
    link: '/portal/courses',
    status: '1',
    orderNum: 1,
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    title: '精品课程推荐',
    pcImageUrl: 'https://picsum.photos/seed/banner2/1280/400',
    mobileImageUrl: 'https://picsum.photos/seed/banner2-mobile/750/300',
    link: '/portal/courses',
    status: '1',
    orderNum: 2,
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: '3',
    title: '认证中心',
    pcImageUrl: 'https://picsum.photos/seed/banner3/1280/400',
    mobileImageUrl: 'https://picsum.photos/seed/banner3-mobile/750/300',
    link: '/portal/cert',
    status: '1',
    orderNum: 3,
    createTime: '2024-01-01 10:00:00',
  },
];

/**
 * 初始化 Banner 数据
 */
export function initBannerData() {
  const existing = localStorage.getItem(BANNER_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(defaultBanners));
  }
}

/**
 * 获取所有 Banner
 */
export function getAllBanners(): Banner[] {
  initBannerData();
  const data = localStorage.getItem(BANNER_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 获取启用的 Banner
 */
export function getActiveBanners(): Banner[] {
  return getAllBanners().filter((b) => b.status === '1');
}

/**
 * 获取所有 Banner（别名）
 */
export function getBanners(): Banner[] {
  return getAllBanners();
}

/**
 * 根据 ID 获取 Banner
 */
export function getBannerById(id: string): Banner | undefined {
  const banners = getAllBanners();
  return banners.find((b) => b.id === id);
}

/**
 * 切换 Banner 状态
 */
export function toggleStatus(id: string) {
  const banners = getAllBanners();
  const index = banners.findIndex((b) => b.id === id);
  if (index !== -1) {
    banners[index].status = banners[index].status === '1' ? '0' : '1';
    saveBanners(banners);
  }
}

/**
 * 保存 Banner 数据
 */
export function saveBanners(banners: Banner[]) {
  localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners));
}

/**
 * 添加 Banner
 */
export function addBanner(banner: Partial<Banner> & { title: string; pcImageUrl: string; mobileImageUrl: string }) {
  const banners = getAllBanners();
  const newBanner: Banner = {
    id: Date.now().toString(),
    title: banner.title,
    pcImageUrl: banner.pcImageUrl,
    mobileImageUrl: banner.mobileImageUrl,
    link: banner.link || '',
    status: banner.status || '0',
    orderNum: banner.orderNum ?? 0,
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  banners.push(newBanner);
  saveBanners(banners);
}

/**
 * 更新 Banner
 */
export function updateBanner(id: string, updates: Partial<Banner>) {
  const banners = getAllBanners();
  const index = banners.findIndex((b) => b.id === id);
  if (index !== -1) {
    banners[index] = { ...banners[index], ...updates };
    saveBanners(banners);
  }
}

/**
 * 删除 Banner
 */
export function deleteBanner(id: string) {
  const banners = getAllBanners();
  const filtered = banners.filter((b) => b.id !== id);
  saveBanners(filtered);
}

// 自动初始化
initBannerData();
