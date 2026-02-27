import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/member',
    component: () => import('@/layouts/EmptyLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'profile',
        name: 'MemberProfile',
        component: () => import('@/views/member/profile/index.vue'),
        meta: { title: '个人中心' },
        redirect: '/member/profile/courses',
        children: [
          {
            path: 'courses',
            name: 'MemberCourses',
            component: () => import('@/views/member/profile/courses.vue'),
            meta: { title: '我的课程' },
          },
          {
            path: 'orders',
            name: 'MemberOrders',
            component: () => import('@/views/member/profile/orders.vue'),
            meta: { title: '订单记录' },
          },
          {
            path: 'settings',
            name: 'MemberSettings',
            component: () => import('@/views/member/profile/settings.vue'),
            meta: { title: '账号设置' },
          },
        ],
      },
      {
        path: 'learning-history',
        name: 'LearningHistory',
        component: () => import('@/views/member/learning-history.vue'),
        meta: { title: '学习历史' },
      },
      {
        path: 'my-favorites',
        name: 'MyFavorites',
        component: () => import('@/views/member/my-favorites.vue'),
        meta: { title: '我的收藏' },
      },
    ],
  },
];

export default routes;
