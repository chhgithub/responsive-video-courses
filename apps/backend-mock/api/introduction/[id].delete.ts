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

  const index = introductionData.findIndex((item) => item.id === targetId);

  if (index === -1) {
    return useResponseError('内容不存在');
  }

  // 检查是否已发布
  if (introductionData[index].isPublished) {
    return useResponseError('已发布的内容不能删除，请先取消发布');
  }

  introductionData.splice(index, 1);

  return useResponseSuccess(null);
});
