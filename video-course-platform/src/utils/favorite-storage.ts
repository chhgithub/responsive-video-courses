/**
 * 收藏功能数据存储管理
 */

export interface Favorite {
  favoriteId: string;
  userId: string;
  courseId: string;
  courseName: string;
  courseCover: string;
  teacherName: string;
  price: number;
  isFree: boolean;
  createTime: string;
}

const FAVORITE_STORAGE_KEY = 'portal_favorites';

/**
 * 获取所有收藏
 */
export function getAllFavorites(): Favorite[] {
  const data = localStorage.getItem(FAVORITE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 获取用户收藏列表
 */
export function getUserFavorites(userId: string): Favorite[] {
  const favorites = getAllFavorites();
  return favorites.filter((f) => f.userId === userId);
}

/**
 * 检查是否已收藏
 */
export function isCourseFavorited(userId: string, courseId: string): boolean {
  const favorites = getUserFavorites(userId);
  return favorites.some((f) => f.courseId === courseId);
}

/**
 * 添加收藏
 */
export function addFavorite(favoriteData: Omit<Favorite, 'favoriteId' | 'createTime'>): Favorite {
  const favorites = getAllFavorites();

  // 检查是否已收藏
  if (isCourseFavorited(favoriteData.userId, favoriteData.courseId)) {
    throw new Error('已收藏该课程');
  }

  const newFavorite: Favorite = {
    ...favoriteData,
    favoriteId: `FAV-${Date.now()}`,
    createTime: new Date().toISOString(),
  };

  favorites.push(newFavorite);
  saveFavorites(favorites);

  return newFavorite;
}

/**
 * 取消收藏
 */
export function removeFavorite(userId: string, courseId: string): void {
  const favorites = getAllFavorites();
  const filtered = favorites.filter((f) => !(f.userId === userId && f.courseId === courseId));

  if (filtered.length === favorites.length) {
    throw new Error('未收藏该课程');
  }

  saveFavorites(filtered);
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(userId: string, courseData: Omit<Favorite, 'favoriteId' | 'userId' | 'createTime'>): boolean {
  if (isCourseFavorited(userId, courseData.courseId)) {
    removeFavorite(userId, courseData.courseId);
    return false;
  } else {
    addFavorite({
      ...courseData,
      userId,
    });
    return true;
  }
}

/**
 * 保存收藏数据
 */
function saveFavorites(favorites: Favorite[]): void {
  localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favorites));
}
