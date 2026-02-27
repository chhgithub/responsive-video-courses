import type {
  IntroductionContent,
  IntroductionQuery,
  IntroductionCategory,
} from './model.d';

import type { ID, IDS, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

// 重新导出类型，方便其他模块导入
export type {
  IntroductionContent as Introduction,
  IntroductionQuery,
  IntroductionCategory,
} from './model.d';
export {
  IntroductionCategoryMap,
  CertCenterSubCategoryMap,
  AboutUsSubCategoryMap,
  FacultySubCategoryMap,
  CertCenterSubCategory,
  AboutUsSubCategory,
  FacultySubCategory,
} from './model.d';

enum Api {
  introList = '/introduction/list',
  introInfo = '/introduction',
  publish = '/introduction',
}

/**
 * 获取介绍信息列表
 * @param params 查询参数
 * @returns 介绍信息列表
 */
export async function introductionList(params?: IntroductionQuery) {
  return requestClient.get<PageResult<IntroductionContent>>(
    Api.introList,
    { params },
  );
}

/**
 * 介绍信息详情
 * @param id 介绍ID
 * @returns 介绍信息详情
 */
export async function introductionInfo(id: ID) {
  return requestClient.get<IntroductionContent>(`${Api.introInfo}/${id}`);
}

/**
 * 新增介绍信息
 * @param data 介绍数据
 */
export async function introductionAdd(data: Partial<IntroductionContent>) {
  return requestClient.postWithMsg<void>(Api.introInfo, data);
}

/**
 * 更新介绍信息
 * @param data 介绍数据
 */
export async function introductionUpdate(data: Partial<IntroductionContent>) {
  return requestClient.putWithMsg<void>(Api.introInfo, data);
}

/**
 * 删除介绍信息
 * @param ids 介绍ID数组
 */
export async function introductionRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.introInfo}/${ids}`);
}

/**
 * 发布介绍信息
 * @param id 介绍ID
 */
export async function introductionPublish(id: ID) {
  return requestClient.postWithMsg<{ message: string; data: IntroductionContent }>(
    `${Api.publish}/${id}/publish`,
    {},
  );
}

/**
 * 取消发布介绍信息
 * @param id 介绍ID
 */
export async function introductionUnpublish(id: ID) {
  return requestClient.postWithMsg<{ message: string; data: IntroductionContent }>(
    `${Api.publish}/${id}/unpublish`,
    {},
  );
}
