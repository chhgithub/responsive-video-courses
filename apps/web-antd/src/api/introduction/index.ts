import type { Introduction, IntroductionQuery } from './model.d';

import type { ID, IDS, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

// 重新导出类型，方便其他模块导入
export type { Introduction, IntroductionQuery } from './model.d';
export { IntroductionTypeMap } from './model.d';

enum Api {
  introInfo = '/introduction',
  introList = '/introduction/list',
}

/**
 * 获取介绍信息列表（模拟数据）
 * @param _params 查询参数
 * @returns 介绍信息列表
 */
export function introductionList(_params?: IntroductionQuery) {
  return new Promise<PageResult<Introduction>>((resolve) => {
    setTimeout(() => {
      const mockData: Introduction[] = [
        {
          id: 1,
          type: 'course_intro',
          title: '课程介绍',
          content:
            '<p>我们提供优质的视频课程，涵盖前端、后端、移动端等多个技术领域。</p>',
          coverImage: 'https://picsum.photos/seed/course/400/200',
          updateTime: '2025-02-01 10:00:00',
        },
        {
          id: 2,
          type: 'cert_center',
          title: '认证中心介绍',
          content:
            '<p>认证中心提供专业的技能认证服务，助您职业发展更上一层楼。</p>',
          coverImage: 'https://picsum.photos/seed/cert/400/200',
          updateTime: '2025-02-01 10:00:00',
        },
        {
          id: 3,
          type: 'about_us',
          title: '关于我们',
          content:
            '<p>我们是一家专注于在线教育的科技公司，致力于为学习者提供高质量的课程。</p>',
          updateTime: '2025-02-01 10:00:00',
        },
        {
          id: 4,
          type: 'faculty',
          title: '师资介绍',
          content:
            '<p>我们的讲师团队由多位行业专家组成，拥有丰富的实战经验。</p>',
          coverImage: 'https://picsum.photos/seed/faculty/400/200',
          updateTime: '2025-02-01 10:00:00',
        },
      ];

      resolve({
        rows: mockData,
        total: mockData.length,
      });
    }, 300);
  });
}

/**
 * 介绍信息详情
 * @param id 介绍ID
 * @returns 介绍信息详情
 */
export function introductionInfo(id: ID) {
  return requestClient.get<Introduction>(`${Api.introInfo}/${id}`);
}

/**
 * 根据类型获取介绍信息（用于编辑）
 * @param type 介绍类型
 * @returns 介绍信息
 */
export function getIntroductionByType(type: string) {
  return new Promise<Introduction>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 0,
        type: type as any,
        title: '',
        content: '',
        updateTime: '',
      });
    }, 200);
  });
}

/**
 * 新增介绍信息
 * @param data 介绍数据
 */
export function introductionAdd(data: Partial<Introduction>) {
  return requestClient.postWithMsg<void>(Api.introInfo, data);
}

/**
 * 更新介绍信息
 * @param data 介绍数据
 */
export function introductionUpdate(data: Partial<Introduction>) {
  return requestClient.putWithMsg<void>(Api.introInfo, data);
}

/**
 * 删除介绍信息
 * @param ids 介绍ID数组
 */
export function introductionRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.introInfo}/${ids}`);
}
