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
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:settings',
      order: 999,
      title: '系统管理',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'lucide:users',
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'lucide:shield',
        },
      },
      {
        name: 'SystemMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'lucide:menu',
        },
      },
      {
        name: 'SystemDict',
        path: '/system/dict',
        component: () => import('#/views/system/dict/index.vue'),
        meta: {
          title: '字典管理',
          icon: 'lucide:book-a',
        },
      },
    ],
  },
];

export default routes;
