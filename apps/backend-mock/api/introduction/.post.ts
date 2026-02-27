import { verifyAccessToken } from '~/utils/jwt-utils';
import {
  sleep,
  unAuthorizedResponse,
  useResponseSuccess,
} from '~/utils/response';
import { introductionData, getNextId } from './data';
import type { IntroductionContent } from '~/types/introduction';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = (await readBody(event)) as Partial<IntroductionContent>;

  await sleep(600);

  const newItem: IntroductionContent = {
    id: getNextId(),
    categoryId: body.categoryId!,
    subCategoryId: body.subCategoryId!,
    title: body.title || '',
    content: body.content || '',
    coverImage: body.coverImage || '',
    extraData: body.extraData || {},
    isPublished: false, // 新增默认未发布
    publishTime: undefined,
    sortOrder: body.sortOrder || 0,
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
  };

  introductionData.push(newItem);

  return useResponseSuccess(newItem);
});
