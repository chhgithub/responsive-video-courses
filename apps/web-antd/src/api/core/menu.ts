/**
 * @description: 菜单meta
 * @param title 菜单名
 * @param icon 菜单图标
 * @param noCache 是否不缓存
 * @param link 外链链接
 */
export interface MenuMeta {
  icon?: string;
  link?: string;
  noCache?: boolean;
  title: string;
  order?: number;
  affixTab?: boolean;
  hideInMenu?: boolean;
  keepAlive?: boolean;
}

/**
 * @description: 菜单
 * @param name 菜单名
 * @param path 菜单路径
 * @param hidden 是否隐藏
 * @param component 组件名称 Layout
 * @param alwaysShow 总是显示
 * @param query 路由参数(json形式)
 * @param meta 路由信息
 * @param children 子路由信息
 */
export interface Menu {
  alwaysShow?: boolean;
  children?: Menu[];
  component?: string;
  hidden?: boolean;
  meta: MenuMeta;
  name: string;
  path: string;
  query?: string;
  redirect?: string;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  // 模拟菜单数据（原型开发使用）
  // 注意：系统管理路由已在 router/routes/modules/course.ts 中定义，这里不需要重复返回
  return new Promise<Menu[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          path: '/course',
          name: 'Course',
          component: 'BasicLayout',
          redirect: '/course/list',
          meta: {
            title: '课程管理',
            icon: 'lucide:graduation-cap',
            order: 2,
          },
          children: [
            {
              path: '/course/list',
              name: 'CourseList',
              component: 'course/index',
              meta: {
                title: '课程列表',
                icon: 'lucide:list',
              },
            },
          ],
        },
        {
          path: '/introduction',
          name: 'Introduction',
          component: 'BasicLayout',
          redirect: '/introduction/list',
          meta: {
            title: '介绍信息',
            icon: 'lucide:file-text',
            order: 3,
          },
          children: [
            {
              path: '/introduction/list',
              name: 'IntroductionList',
              component: 'introduction/index',
              meta: {
                title: '介绍信息管理',
                icon: 'lucide:list',
              },
            },
          ],
        },
      ]);
    }, 100);
  });
}
