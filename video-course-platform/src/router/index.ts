import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 导入路由模块
import portalRoutes from './routes/portal';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import memberRoutes from './routes/member';
import { setupRouterGuard } from './guards';

const routes: RouteRecordRaw[] = [
  // 重定向到首页
  {
    path: '/',
    redirect: '/portal',
  },
  // 前台路由
  ...portalRoutes,
  // 后台路由
  ...adminRoutes,
  // 认证路由
  ...authRoutes,
  // 会员路由
  ...memberRoutes,
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 设置路由守卫
setupRouterGuard(router);

export default router;
