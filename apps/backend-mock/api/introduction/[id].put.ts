import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  sleep,
  unAuthorizedResponse,
  useResponseSuccess,
  useResponseError,
} from '~/utils/response';
import { introductionData } from './data';
import type { IntroductionContent } from '~/types/introduction';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id } = getRouterParams(event);
  const targetId = Number(id);
  const body = (await readBody(event)) as Partial<IntroductionContent>;

  await sleep(600);

  const index = introductionData.findIndex((item) => item.id === targetId);

  if (index === -1) {
    return useResponseError('内容不存在');
  }

  // 更新字段（保留原有的发布状态和时间）
  introductionData[index] = {
    ...introductionData[index],
    ...body,
    id: targetId, // 确保ID不被修改
    updateTime: new Date().toLocaleString('zh-CN'),
  };

  return useResponseSuccess(introductionData[index]);
});
