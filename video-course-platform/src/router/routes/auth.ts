import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'LoginIndex',
        component: () => import('@/views/portal/login.vue'),
        meta: { title: '登录', hideInMenu: true },
      },
    ],
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/login.vue'),
    meta: { title: '后台登录', hideInMenu: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'RegisterIndex',
        component: () => import('@/views/portal/register.vue'),
        meta: { title: '注册', hideInMenu: true },
      },
    ],
  },
];

export default routes;
