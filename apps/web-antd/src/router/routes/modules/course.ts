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
      title: '介绍信息',
    },
    name: 'Introduction',
    path: '/introduction',
    children: [
      {
        name: 'CourseIntro',
        path: '/introduction/course-intro',
        component: () => import('#/views/introduction/course-intro/index.vue'),
        meta: {
          title: '课程介绍',
          icon: 'lucide:book-open',
        },
      },
      {
        name: 'CertCenter',
        path: '/introduction/cert-center',
        component: () => import('#/views/introduction/cert-center/index.vue'),
        meta: {
          title: '认证中心介绍',
          icon: 'lucide:award',
        },
      },
      {
        name: 'AboutUs',
        path: '/introduction/about-us',
        component: () => import('#/views/introduction/about-us/index.vue'),
        meta: {
          title: '关于我们介绍',
          icon: 'lucide:info',
        },
      },
      {
        name: 'Faculty',
        path: '/introduction/faculty',
        component: () => import('#/views/introduction/faculty/index.vue'),
        meta: {
          title: '师资介绍',
          icon: 'lucide:users',
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
