/**
 * 关于我们数据初始化工具
 * 确保前台能够正确显示后台管理的"关于我们"数据
 */

import { introductionStorage } from '@/utils/introduction-storage';
import type { AboutUsInfo } from '@/types/introduction';

const ABOUT_US_STORAGE_KEY = 'about_us_data_initialized';

/**
 * 检查关于我们数据是否已初始化
 */
export function isAboutUsDataInitialized(): boolean {
  const flag = localStorage.getItem(ABOUT_US_STORAGE_KEY);
  return flag === 'true';
}

/**
 * 初始化关于我们数据
 * 确保前台能够显示默认内容
 */
export function initAboutUsData(): void {
  if (isAboutUsDataInitialized()) {
    console.log('关于我们数据已初始化，跳过');
    return;
  }

  try {
    // 获取当前存储的数据
    const currentData = introductionStorage.aboutUs.getAll();

    // 如果数据为空，初始化默认数据会自动创建
    if (!currentData || currentData.length === 0) {
      console.log('关于我们数据为空，触发初始化');
      // 触发 storage 的 getStorage 会自动初始化
      introductionStorage.aboutUs.getAll();
    }

    // 标记已初始化
    localStorage.setItem(ABOUT_US_STORAGE_KEY, 'true');
    console.log('关于我们数据初始化完成');
  } catch (error) {
    console.error('初始化关于我们数据失败:', error);
  }
}

/**
 * 诊断关于我们数据
 * 返回当前数据状态
 */
export function diagnoseAboutUsData(): {
  exists: boolean;
  totalCount: number;
  publishedCount: number;
  categories: Record<string, { exists: boolean; published: boolean; title?: string }>;
} {
  const result = {
    exists: false,
    totalCount: 0,
    publishedCount: 0,
    categories: {
      research: { exists: false, published: false },
      digital: { exists: false, published: false },
      education: { exists: false, published: false },
      contact: { exists: false, published: false },
    },
  };

  try {
    const allData = introductionStorage.aboutUs.getAll();
    result.exists = allData && allData.length > 0;
    result.totalCount = allData?.length || 0;
    result.publishedCount = allData?.filter((item) => item.isPublished).length || 0;

    // 检查各个分类
    const categories = ['research', 'digital', 'education', 'contact'] as const;
    categories.forEach((cat) => {
      const item = introductionStorage.aboutUs.getBySubCategory(cat);
      if (item) {
        result.categories[cat] = {
          exists: true,
          published: item.isPublished,
          title: item.title,
        };
      }
    });
  } catch (error) {
    console.error('诊断关于我们数据失败:', error);
  }

  return result;
}

/**
 * 重新初始化关于我们数据
 * 强制覆盖现有数据
 */
export function reinitAboutUsData(): void {
  // 清除初始化标记
  localStorage.removeItem(ABOUT_US_STORAGE_KEY);

  // 清除现有数据
  localStorage.removeItem('introduction_data');

  // 重新初始化
  initAboutUsData();

  console.log('关于我们数据已重新初始化');
}

/**
 * 修复关于我们数据
 * 检查并修复缺失的分类
 */
export function repairAboutUsData(): void {
  const diagnosis = diagnoseAboutUsData();
  let repaired = false;

  // 检查各个分类
  Object.entries(diagnosis.categories).forEach(([key, value]) => {
    if (!value.exists || !value.published) {
      console.warn(`分类 [${key}] 数据异常:`, value);
      repaired = true;
    }
  });

  if (repaired) {
    console.log('检测到关于我们数据异常，建议重新初始化');
    console.log('请调用 reinitAboutUsData() 进行修复');
  } else {
    console.log('关于我们数据正常');
  }
}

// 导出便捷函数
export default {
  isInitialized: isAboutUsDataInitialized,
  init: initAboutUsData,
  diagnose: diagnoseAboutUsData,
  reinit: reinitAboutUsData,
  repair: repairAboutUsData,
};
