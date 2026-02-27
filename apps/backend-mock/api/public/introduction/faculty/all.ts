/**
 * 公开API - 获取师资介绍所有已发布内容
 */
import { useResponseSuccess } from '~/utils/response';
import { introductionData } from '~/introduction/data';

export default eventHandler(async (event) => {
  // 只返回已发布的师资介绍内容
  const publishedData = introductionData.filter(
    (item) => item.categoryId === 'faculty' && item.isPublished,
  );

  // 按 subCategoryId 分组返回
  const result: Record<string, any> = {};
  publishedData.forEach((item) => {
    result[item.subCategoryId] = {
      ...item,
      ...item.extraData, // 展开extraData字段方便前端使用
    };
  });

  return useResponseSuccess(result);
});
