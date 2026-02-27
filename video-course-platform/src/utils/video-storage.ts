/**
 * 视频库数据存储管理
 */

export interface Video {
  id: string;
  title: string;                  // 视频标题
  description: string;            // 视频描述
  videoType: 'upload' | 'third-party';  // 视频类型
  videoUrl: string;               // 视频URL（上传或第三方）
  thumbnailUrl: string;           // 封面图
  duration: number;               // 时长（秒）
  fileSize?: number;              // 文件大小（上传的视频才有，单位：字节）
  format: string;                 // 视频格式
  uploadTime: string;             // 上传时间
  category: string;               // 分类
}

const VIDEO_STORAGE_KEY = 'course_videos';

// 默认视频数据
const defaultVideos: Video[] = [
  {
    id: 'v1',
    title: 'Vue3 基础入门 - 第1课',
    description: 'Vue3 简介、环境搭建和第一个应用',
    videoType: 'upload',
    videoUrl: 'https://example.com/videos/vue3-lesson1.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video1/300/200',
    duration: 1800, // 30分钟
    fileSize: 256000000, // 约244MB
    format: 'mp4',
    uploadTime: '2024-01-15',
    category: '前端开发',
  },
  {
    id: 'v2',
    title: 'React Hooks 详解',
    description: 'useState、useEffect 等 Hooks 的使用方法',
    videoType: 'third-party',
    videoUrl: 'https://cdn.example.com/react-hooks.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video2/300/200',
    duration: 2400, // 40分钟
    format: 'mp4',
    uploadTime: '2024-01-14',
    category: '前端开发',
  },
  {
    id: 'v3',
    title: 'TypeScript 类型系统',
    description: '深入理解 TypeScript 的类型系统',
    videoType: 'upload',
    videoUrl: 'https://example.com/videos/ts-types.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video3/300/200',
    duration: 2100, // 35分钟
    fileSize: 180000000,
    format: 'mp4',
    uploadTime: '2024-01-13',
    category: '前端开发',
  },
  {
    id: 'v4',
    title: 'Python 数据分析基础',
    description: 'Pandas 和 NumPy 入门教程',
    videoType: 'third-party',
    videoUrl: 'https://cdn.example.com/python-data.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video4/300/200',
    duration: 2700, // 45分钟
    format: 'mp4',
    uploadTime: '2024-01-12',
    category: '数据科学',
  },
  {
    id: 'v5',
    title: 'Node.js 后端开发实战',
    description: '使用 Express + MongoDB 构建后端API',
    videoType: 'upload',
    videoUrl: 'https://example.com/videos/nodejs-api.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/video5/300/200',
    duration: 3600, // 60分钟
    fileSize: 520000000,
    format: 'mp4',
    uploadTime: '2024-01-11',
    category: '后端开发',
  },
];

// ============ 视频库管理 ============

export function initVideoData() {
  const existing = localStorage.getItem(VIDEO_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(defaultVideos));
  }
}

export function getAllVideos(): Video[] {
  initVideoData();
  const data = localStorage.getItem(VIDEO_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getVideoById(id: string): Video | undefined {
  return getAllVideos().find((v) => v.id === id);
}

export function addVideo(video: Omit<Video, 'id'>): Video {
  const list = getAllVideos();
  const newItem: Video = {
    ...video,
    id: Date.now().toString(),
  };
  list.push(newItem);
  saveVideos(list);
  return newItem;
}

export function updateVideo(id: string, data: Partial<Video>): void {
  const list = getAllVideos();
  const index = list.findIndex((item) => item.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    saveVideos(list);
  }
}

export function deleteVideo(id: string): void {
  const list = getAllVideos();
  const newList = list.filter((item) => item.id !== id);
  saveVideos(newList);
}

export function batchDeleteVideos(ids: string[]): void {
  const list = getAllVideos();
  const newList = list.filter((item) => !ids.includes(item.id));
  saveVideos(newList);
}

export function saveVideos(videos: Video[]) {
  localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
}

// 获取视频分类
export function getVideoCategories(): string[] {
  const videos = getAllVideos();
  const categories = new Set(videos.map((v) => v.category));
  return Array.from(categories);
}

// 按分类筛选视频
export function getVideosByCategory(category: string): Video[] {
  return getAllVideos().filter((v) => v.category === category);
}

// 按类型筛选视频
export function getVideosByType(type: 'upload' | 'third-party'): Video[] {
  return getAllVideos().filter((v) => v.videoType === type);
}

// 搜索视频
export function searchVideos(keyword: string): Video[] {
  const videos = getAllVideos();
  const lowerKeyword = keyword.toLowerCase();
  return videos.filter(
    (v) =>
      v.title.toLowerCase().includes(lowerKeyword) ||
      v.description.toLowerCase().includes(lowerKeyword)
  );
}

// 格式化文件大小
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// 格式化时长
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// 自动初始化
initVideoData();
