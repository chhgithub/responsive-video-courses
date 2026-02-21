import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:info',
      order: 1,
      title: '关于我们',
    },
    name: 'AboutUs',
    path: '/about',
    children: [
      {
        name: 'AboutResearch',
        path: '/about/research',
        component: () => import('#/views/frontend/about-research.vue'),
        meta: {
          title: '关于研究院',
        },
      },
      {
        name: 'AboutDigital',
        path: '/about/digital',
        component: () => import('#/views/frontend/about-digital.vue'),
        meta: {
          title: '关于数字创新中心',
        },
      },
      {
        name: 'AboutEducation',
        path: '/about/education',
        component: () => import('#/views/frontend/about-education.vue'),
        meta: {
          title: '关于教育培训中心',
        },
      },
      {
        name: 'ContactUs',
        path: '/about/contact',
        component: () => import('#/views/frontend/contact-us.vue'),
        meta: {
          title: '联系我们',
        },
      },
    ],
  },
];

export default routes;
