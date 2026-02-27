import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/layouts/admin/index.vue'),
    redirect: '/admin/home/banner',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      // 主页管理
      {
        path: 'home',
        name: 'AdminHome',
        redirect: '/admin/home/banner',
        meta: { title: '主页', icon: 'home' },
        children: [
          {
            path: 'banner',
            name: 'AdminHomeBanner',
            component: () => import('@/views/admin/home/index.vue'),
            meta: { title: 'Banner配置', icon: 'image' },
          },
          {
            path: 'news',
            name: 'AdminHomeNews',
            component: () => import('@/views/admin/home/news.vue'),
            meta: { title: '资讯公告', icon: 'document' },
          },
          {
            path: 'activity',
            name: 'AdminHomeActivity',
            component: () => import('@/views/admin/home/activity.vue'),
            meta: { title: '活动日历', icon: 'calendar' },
          },
          {
            path: 'hot',
            name: 'AdminHomeHot',
            component: () => import('@/views/admin/home/hot.vue'),
            meta: { title: '热点', icon: 'fire' },
          },
          {
            path: 'consultation',
            name: 'AdminHomeConsultation',
            component: () => import('@/views/admin/home/consultation.vue'),
            meta: { title: '在线咨询', icon: 'chat' },
          },
        ],
      },
      {
        path: 'course',
        name: 'AdminCourse',
        redirect: '/admin/course/list',
        meta: { title: '课程管理', icon: 'course' },
        children: [
          {
            path: 'list',
            name: 'AdminCourseList',
            component: () => import('@/views/admin/course/index.vue'),
            meta: { title: '课程列表' },
          },
        ],
      },
      {
        path: 'introduction',
        name: 'AdminIntroduction',
        redirect: '/admin/introduction/course-intro',
        meta: { title: '介绍信息', icon: 'document' },
        children: [
          {
            path: 'course-intro',
            name: 'AdminCourseIntro',
            component: () => import('@/views/admin/introduction/course-intro/index.vue'),
            meta: { title: '课程介绍' },
          },
          {
            path: 'cert-center',
            name: 'AdminCertCenter',
            component: () => import('@/views/admin/introduction/cert-center/index.vue'),
            meta: { title: '认证中心介绍' },
          },
          {
            path: 'about-us',
            name: 'AdminAboutUs',
            component: () => import('@/views/admin/introduction/about-us/index.vue'),
            meta: { title: '关于我们介绍' },
          },
          {
            path: 'faculty',
            name: 'AdminFaculty',
            component: () => import('@/views/admin/introduction/faculty/index.vue'),
            meta: { title: '师资介绍' },
          },
        ],
      },
      {
        path: 'system',
        name: 'AdminSystem',
        redirect: '/admin/system/user',
        meta: { title: '系统管理', icon: 'setting' },
        children: [
          {
            path: 'user',
            name: 'AdminSystemUser',
            component: () => import('@/views/admin/system/user/index.vue'),
            meta: { title: '用户管理' },
          },
          {
            path: 'role',
            name: 'AdminSystemRole',
            component: () => import('@/views/admin/system/role/index.vue'),
            meta: { title: '角色管理' },
          },
          {
            path: 'menu',
            name: 'AdminSystemMenu',
            component: () => import('@/views/admin/system/menu/index.vue'),
            meta: { title: '菜单管理' },
          },
          {
            path: 'dict',
            name: 'AdminSystemDict',
            component: () => import('@/views/admin/system/dict/index.vue'),
            meta: { title: '字典管理' },
          },
        ],
      },
    ],
  },
];

export default routes;
