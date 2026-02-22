import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:home',
      order: -1,
      title: '主页',
    },
    name: 'Home',
    path: '/home',
    redirect: '/home/banner',
    children: [
      {
        name: 'HomeBanner',
        path: '/home/banner',
        component: () => import('#/views/home/banner/index.vue'),
        meta: {
          title: 'Banner配置',
          icon: 'lucide:image',
        },
      },
      {
        name: 'HomeNews',
        path: '/home/news',
        component: () => import('#/views/home/news/index.vue'),
        meta: {
          title: '资讯公告',
          icon: 'lucide:newspaper',
        },
      },
      {
        name: 'HomeActivity',
        path: '/home/activity',
        component: () => import('#/views/home/activity/index.vue'),
        meta: {
          title: '活动日历',
          icon: 'lucide:calendar',
        },
      },
      {
        name: 'HomeHot',
        path: '/home/hot',
        component: () => import('#/views/home/hot/index.vue'),
        meta: {
          title: '热点',
          icon: 'lucide:flame',
        },
      },
      {
        name: 'HomeConsultation',
        path: '/home/consultation',
        component: () => import('#/views/home/consultation/index.vue'),
        meta: {
          title: '在线咨询',
          icon: 'lucide:message-square',
        },
      },
    ],
  },
];

export default routes;
