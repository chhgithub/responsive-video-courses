const BasicLayout = () => import('./basic.vue');
const AuthPageLayout = () => import('./auth.vue');
const PortalLayout = () => import('./portal.vue');

const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);

export { AuthPageLayout, BasicLayout, IFrameView, PortalLayout };
