/**
 * 日期格式化工具
 */

/**
 * 格式化日期为中文格式
 * @param dateStr 日期字符串
 * @returns 格式化后的日期
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';

  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateStr;
  }
}

/**
 * 格式化过期时间
 * @param expireTime 过期时间
 * @returns 格式化后的过期时间
 */
export function formatExpireTime(expireTime?: string): string {
  if (!expireTime) return '永不过期';

  try {
    const expire = new Date(expireTime);
    const now = new Date();
    const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays <= 0) return '已过期';
    if (diffDays === 1) return '1天后过期';
    if (diffDays < 7) return `${diffDays}天后过期`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周后过期`;
    return `${Math.ceil(diffDays / 30)}个月后过期`;
  } catch (error) {
    console.error('过期时间格式化失败:', error);
    return expireTime || '-';
  }
}

/**
 * 格式化性别
 * @param gender 性别
 * @returns 性别文本
 */
export function formatGender(gender?: string): string {
  if (!gender) return '-';
  const genderMap: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他',
  };
  return genderMap[gender] || '-';
}

/**
 * 计算时间差
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 时间差描述
 */
export function getTimeDiff(startTime: string, endTime?: string): string {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diff = end.getTime() - start.getTime();

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  if (minutes > 0) return `${minutes}分钟`;
  return '刚刚';
}
