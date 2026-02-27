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
  if (!targetItem.isPublished) {
    return useResponseError('该内容未发布');
  }

  // 取消发布
  targetItem.isPublished = false;
  targetItem.publishTime = undefined;
  targetItem.updateTime = new Date().toLocaleString('zh-CN');

  return useResponseSuccess({
    message: '已取消发布',
    data: targetItem,
  });
});
