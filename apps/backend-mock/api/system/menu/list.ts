import { MOCK_MENU_LIST } from '~/utils/mock-data';
import { useResponseSuccess } from '~/utils/response';

export default eventHandler(async () => {
  // 原型模式：跳过 token 验证
  return useResponseSuccess(MOCK_MENU_LIST);
});
