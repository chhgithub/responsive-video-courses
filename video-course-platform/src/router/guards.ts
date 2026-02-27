import { useAuthStore } from '@/stores';
import type { Router } from 'vue-router';

export function setupRouterGuard(router: Router) {
  // 前置守卫
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // 初始化认证状态
    authStore.initAuth();

    // 检查是否需要认证
    const requiresAuth = to.matched.some(record => record.meta?.requiresAuth);
    
    if (requiresAuth && !authStore.isLoggedIn) {
      // 需要认证但未登录，重定向到登录页
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath },
      });
    } else if (to.path === '/admin/login' && authStore.isLoggedIn) {
      // 已登录用户访问登录页，重定向到后台主页Banner配置
      next({ path: '/admin/home/banner' });
    } else {
      next();
    }
  });

  // 后置守卫
  router.afterEach((to) => {
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - 视频课程平台`;
    } else {
      document.title = '视频课程平台';
    }
  });
}
