import type { RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';

import { $t } from '#/locales';

const BasicLayout = () => import('#/layouts/basic.vue');
const AuthPageLayout = () => import('#/layouts/auth.vue');
const PortalLayout = () => import('#/layouts/portal.vue');
/** 全局404页面 */
const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/** 基本路由，这些路由是必须存在的 */
const coreRoutes: RouteRecordRaw[] = [
  /**
   * 根路由
   * 使用基础布局，作为所有页面的父级容器，子级就不必配置BasicLayout。
   * 此路由必须存在，且不应修改
   */
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: '/portal', // 默认重定向到前台首页
    children: [],
  },
  {
    component: () => import('#/views/_core/social-callback/index.vue'),
    meta: {
      title: $t('page.auth.oauthLogin'),
    },
    name: 'OAuthRedirect',
    path: '/social-callback',
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      {
        name: 'Login',
        path: 'login',
        component: () => import('#/views/_core/authentication/login.vue'),
        meta: {
          title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () =>
          import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () =>
          import('#/views/_core/authentication/forget-password.vue'),
        meta: {
          title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: {
          title: $t('page.auth.register'),
        },
      },
    ],
  },
  /**
   * 前台页面路由
   * 前台是公开访问的课程展示平台，不需要权限验证
   */
  {
    component: PortalLayout,
    meta: {
      hideInBreadcrumb: true,
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
        name: 'PortalAbout',
        path: 'about',
        redirect: '/portal/about/research',
        meta: {
          title: '关于我们',
        },
      },
      {
        name: 'PortalAboutResearch',
        path: 'about/research',
        component: () => import('#/views/portal/about/research.vue'),
        meta: {
          title: '关于研究院',
        },
      },
      {
        name: 'PortalAboutDigital',
        path: 'about/digital',
        component: () => import('#/views/portal/about/digital.vue'),
        meta: {
          title: '关于数字创新中心',
        },
      },
      {
        name: 'PortalAboutEducation',
        path: 'about/education',
        component: () => import('#/views/portal/about/education.vue'),
        meta: {
          title: '关于教育培训中心',
        },
      },
      {
        name: 'PortalAboutContact',
        path: 'about/contact',
        component: () => import('#/views/portal/about/contact.vue'),
        meta: {
          title: '联系我们',
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
        name: 'PortalCert',
        path: 'cert',
        component: () => import('#/views/portal/cert.vue'),
        meta: {
          title: '认证中心',
        },
      },
      {
        name: 'PortalTeachers',
        path: 'teachers',
        component: () => import('#/views/portal/teachers.vue'),
        meta: {
          title: '师资队伍',
        },
      },
      {
        name: 'PortalGeneral',
        path: 'general',
        component: () => import('#/views/portal/general.vue'),
        meta: {
          title: '通识教育',
        },
      },
    ],
  },
  /**
   * 会员中心路由
   * 需要登录后才能访问的个人中心功能
   */
  {
    component: PortalLayout,
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      title: '会员中心',
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
        },
        redirect: '/member/profile/courses',
        children: [
          {
            name: 'MemberCourses',
            path: 'courses',
            component: () => import('#/views/member/profile/courses.vue'),
            meta: {
              title: '我的课程',
            },
          },
          {
            name: 'MemberOrders',
            path: 'orders',
            component: () => import('#/views/member/profile/orders.vue'),
            meta: {
              title: '订单记录',
            },
          },
          {
            name: 'MemberSettings',
            path: 'settings',
            component: () => import('#/views/member/profile/settings.vue'),
            meta: {
              title: '账号设置',
            },
          },
        ],
      },
    ],
  },
];

export { coreRoutes, fallbackNotFoundRoute };
