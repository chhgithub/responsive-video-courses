import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/portal',
    component: () => import('@/layouts/PortalLayout.vue'),
    children: [
      {
        path: '',
        name: 'PortalHome',
        component: () => import('@/views/portal/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'courses',
        name: 'PortalCourses',
        component: () => import('@/views/portal/courses.vue'),
        meta: { title: '课程中心' },
      },
      {
        path: 'course/:id',
        name: 'PortalCourseDetail',
        component: () => import('@/views/portal/course-detail.vue'),
        meta: { title: '课程详情' },
      },
      {
        path: 'cert',
        name: 'PortalCert',
        component: () => import('@/views/portal/cert.vue'),
        meta: { title: '认证中心' },
      },
      {
        path: 'teachers',
        name: 'PortalTeachers',
        component: () => import('@/views/portal/teachers.vue'),
        meta: { title: '师资队伍' },
      },
      {
        path: 'general',
        name: 'PortalGeneral',
        component: () => import('@/views/portal/general.vue'),
        meta: { title: '通识教育' },
      },
      {
        path: 'about/research',
        name: 'AboutResearch',
        component: () => import('@/views/portal/about/research.vue'),
        meta: { title: '关于研究院' },
      },
      {
        path: 'about/digital',
        name: 'AboutDigital',
        component: () => import('@/views/portal/about/digital.vue'),
        meta: { title: '关于数字创新中心' },
      },
      {
        path: 'about/education',
        name: 'AboutEducation',
        component: () => import('@/views/portal/about/education.vue'),
        meta: { title: '关于教育培训中心' },
      },
      {
        path: 'about/contact',
        name: 'AboutContact',
        component: () => import('@/views/portal/about/contact.vue'),
        meta: { title: '联系我们' },
      },
    ],
  },
];

export default routes;
