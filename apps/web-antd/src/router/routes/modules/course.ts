import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:graduation-cap',
      order: 2,
      title: $t('课程管理'),
    },
    name: 'Course',
    path: '/course',
    children: [
      {
        name: 'CourseList',
        path: '/course/list',
        component: () => import('#/views/course/index.vue'),
        meta: {
          title: $t('课程列表'),
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:file-text',
      order: 3,
      title: $t('介绍信息'),
    },
    name: 'Introduction',
    path: '/introduction',
    children: [
      {
        name: 'IntroductionList',
        path: '/introduction/list',
        component: () => import('#/views/introduction/index.vue'),
        meta: {
          title: $t('介绍信息管理'),
        },
      },
    ],
  },
];

export default routes;
