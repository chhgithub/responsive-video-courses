import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess, useResponseError } from '~/utils/response';
import { introductionData } from './data';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id } = getRouterParams(event);
  const item = introductionData.find((item) => item.id === Number(id));

  if (!item) {
    return useResponseError('内容不存在');
  }

  return useResponseSuccess(item);
});
