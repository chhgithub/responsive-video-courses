import type { RouteRecordRaw } from 'vue-router';

import { PortalLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: PortalLayout,
    meta: {
      hideInMenu: true,
      title: '前台',
    },
    name: 'Portal',
    path: '/portal',
    children: [
      {
        name: 'PortalHome',
        path: '',
        component: () => import('#/views/portal/index.vue'),
        meta: {
          title: '首页',
        },
      },
      {
        name: 'PortalCourses',
        path: 'courses',
        component: () => import('#/views/portal/courses.vue'),
        meta: {
          title: '课程中心',
        },
      },
      {
        name: 'PortalMicro',
        path: 'micro',
        component: () => import('#/views/portal/micro.vue'),
        meta: {
          title: '微课程',
        },
      },
      {
        name: 'PortalPublic',
        path: 'public',
        component: () => import('#/views/portal/public.vue'),
        meta: {
          title: '公益课程',
        },
      },
      {
        name: 'PortalResearch',
        path: 'research',
        component: () => import('#/views/portal/research.vue'),
        meta: {
          title: '科研赋能',
        },
      },
      {
        name: 'PortalTraining',
        path: 'training',
        component: () => import('#/views/portal/training.vue'),
        meta: {
          title: '集训计划',
        },
      },
      {
        name: 'PortalCourseDetail',
        path: 'course/:id',
        component: () => import('#/views/portal/course-detail.vue'),
        meta: {
          title: '课程详情',
          hideInMenu: true,
        },
      },
      {
        name: 'PortalPlayer',
        path: 'player/:courseId/:chapterId',
        component: () => import('#/views/portal/player.vue'),
        meta: {
          title: '视频播放',
          hideInMenu: true,
          requiresAuth: true,
        },
      },
    ],
  },
  {
    component: PortalLayout,
    meta: {
      hideInMenu: true,
      title: '会员',
    },
    name: 'Member',
    path: '/member',
    children: [
      {
        name: 'MemberProfile',
        path: 'profile',
        component: () => import('#/views/member/profile/index.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true,
        },
      },
      {
        name: 'MemberCourses',
        path: 'courses',
        component: () => import('#/views/member/profile/courses.vue'),
        meta: {
          title: '我的课程',
          requiresAuth: true,
        },
      },
      {
        name: 'MemberOrders',
        path: 'orders',
        component: () => import('#/views/member/profile/orders.vue'),
        meta: {
          title: '订单记录',
          requiresAuth: true,
        },
      },
      {
        name: 'MemberSettings',
        path: 'settings',
        component: () => import('#/views/member/profile/settings.vue'),
        meta: {
          title: '账号设置',
          requiresAuth: true,
        },
      },
    ],
  },
  {
    component: PortalLayout,
    meta: {
      hideInMenu: true,
      title: '支付',
    },
    name: 'Payment',
    path: '/payment',
    children: [
      {
        name: 'PaymentCheckout',
        path: 'checkout/:courseId',
        component: () => import('#/views/payment/checkout.vue'),
        meta: {
          title: '确认订单',
          requiresAuth: true,
        },
      },
    ],
  },
];

export default routes;
