/**
 * 公开API - 获取课程介绍已发布内容
 */
import { useResponseSuccess } from '~/utils/response';
import { introductionData } from '~/introduction/data';

export default eventHandler(async (event) => {
  // 只返回已发布的课程介绍内容
  const publishedData = introductionData.find(
    (item) => item.categoryId === 'course_intro' && item.isPublished,
  );

  return useResponseSuccess(publishedData || null);
});
