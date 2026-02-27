import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  sleep,
  unAuthorizedResponse,
  useResponseSuccess,
  useResponseError,
} from '~/utils/response';
import { introductionData } from './data';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id } = getRouterParams(event);
  const targetId = Number(id);

  await sleep(600);

  const targetItem = introductionData.find((item) => item.id === targetId);

  if (!targetItem) {
    return useResponseError('内容不存在');
  }

  // 检查是否已发布
  if (targetItem.isPublished) {
    return useResponseError('该内容已发布');
  }

  // 取消同子类别下其他内容的发布状态
  introductionData.forEach((item) => {
    if (
      item.subCategoryId === targetItem.subCategoryId
      && item.categoryId === targetItem.categoryId
      && item.isPublished
    ) {
      item.isPublished = false;
      item.publishTime = undefined;
    }
  });

  // 发布当前内容
  targetItem.isPublished = true;
  targetItem.publishTime = new Date().toLocaleString('zh-CN');
  targetItem.updateTime = new Date().toLocaleString('zh-CN');

  return useResponseSuccess({
    message: '发布成功！已自动替换旧版本',
    data: targetItem,
  });
});
