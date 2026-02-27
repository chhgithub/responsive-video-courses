import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { introductionData } from './data';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const query = getQuery(event);
  const { categoryId, subCategoryId, title } = query;

  let filteredData = [...introductionData];

  // 按一级类别筛选
  if (categoryId) {
    filteredData = filteredData.filter(
      (item) => item.categoryId === categoryId,
    );
  }

  // 按二级类别筛选
  if (subCategoryId) {
    filteredData = filteredData.filter(
      (item) => item.subCategoryId === subCategoryId,
    );
  }

  // 按标题模糊搜索
  if (title) {
    filteredData = filteredData.filter((item) =>
      item.title.includes(title as string),
    );
  }

  // 按排序字段排序
  filteredData.sort((a, b) => a.sortOrder - b.sortOrder);

  return useResponseSuccess({
    items: filteredData,
    total: filteredData.length,
  });
});
