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
        path: 'course-learn/:courseId',
        name: 'CourseLearn',
        component: () => import('@/views/portal/course-learn.vue'),
        meta: { title: '课程学习', requiresAuth: true },
      },
      {
        path: 'checkout/:courseId',
        name: 'Checkout',
        component: () => import('@/views/portal/checkout.vue'),
        meta: { title: '确认订单', requiresAuth: true },
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
        redirect: '/portal/general/index',
        meta: { title: '通识教育' },
      },
      {
        path: 'general/index',
        name: 'PortalGeneralIndex',
        component: () => import('@/views/portal/general/index.vue'),
        meta: { title: '通识教育' },
      },
      {
        path: 'general/intro',
        name: 'PortalGeneralIntro',
        component: () => import('@/views/portal/general/intro.vue'),
        meta: { title: '通识教育介绍' },
      },
      {
        path: 'general/redeem',
        name: 'PortalGeneralRedeem',
        component: () => import('@/views/portal/general/redeem.vue'),
        meta: { title: '课程兑换' },
      },
      {
        path: 'general/my-courses',
        name: 'PortalGeneralMyCourses',
        component: () => import('@/views/portal/general/my-courses.vue'),
        meta: { title: '我的兑换', requiresAuth: true },
      },
      // 认证中心路由
      {
        path: 'cert',
        redirect: '/portal/cert/ai-trainer',
      },
      {
        path: 'cert/ai-trainer',
        name: 'CertAiTrainer',
        component: () => import('@/views/portal/cert/ai-trainer.vue'),
        meta: { title: '人工智能训练师' },
      },
      {
        path: 'cert/ai-engineer',
        name: 'CertAiEngineer',
        component: () => import('@/views/portal/cert/ai-engineer.vue'),
        meta: { title: '人工智能工程技术人员' },
      },
      {
        path: 'cert/drone',
        name: 'CertDrone',
        component: () => import('@/views/portal/cert/drone.vue'),
        meta: { title: 'CAAC无人机执照' },
      },
      {
        path: 'cert/tech-broker',
        name: 'CertTechBroker',
        component: () => import('@/views/portal/cert/tech-broker.vue'),
        meta: { title: '技术经纪人' },
      },
      {
        path: 'cert/other',
        name: 'CertOther',
        component: () => import('@/views/portal/cert/other.vue'),
        meta: { title: '其他认证项目' },
      },
      // 关于我们路由
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
      {
        path: 'about/faculty',
        name: 'AboutFaculty',
        component: () => import('@/views/portal/about/faculty.vue'),
        meta: { title: '师资队伍' },
      },
    ],
  },
];

export default routes;
