<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Props {
  collapsed: boolean;
}

const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const menuItems = computed(() => [
  // {
  //   path: '/admin/dashboard',
  //   title: '仪表盘',
  //   icon: 'Odometer',
  
  // },
  // 主页管理 - 作为一级菜单
  {
    path: '/admin/home',
    title: '主页',
    icon: 'HomeFilled',
    children: [
      { path: '/admin/home/banner', title: 'Banner配置' },
      { path: '/admin/home/news', title: '资讯公告' },
      { path: '/admin/home/activity', title: '活动日历' },
      { path: '/admin/home/hot', title: '热点' },
      { path: '/admin/home/consultation', title: '在线咨询' },
    ],
  },
  {
    path: '/admin/course',
    title: '课程中心',
    icon: 'VideoPlay',
    children: [
      { path: '/admin/course/list', title: '课程管理' },
      { path: '/admin/course/video', title: '视频库管理' },
      { path: '/admin/course/package', title: '课程套餐' },
    ],
  },
  {
    path: '/admin/order',
    title: '订单管理',
    icon: 'ShoppingCart',
    children: [
      { path: '/admin/order/list', title: '订单列表' },
    ],
  },
  {
    path: '/admin/introduction',
    title: '介绍信息',
    icon: 'Document',
    children: [
      // { path: '/admin/introduction/course-intro', title: '课程介绍' },
      { path: '/admin/introduction/cert-center', title: '认证中心介绍' },
      { path: '/admin/introduction/about-us', title: '关于我们介绍' },
      { path: '/admin/introduction/faculty', title: '师资介绍' },
    ],
  },
  {
    path: '/admin/system',
    title: '系统管理',
    icon: 'Setting',
    children: [
      { path: '/admin/system/user', title: '用户管理' },
      { path: '/admin/system/role', title: '角色管理' },
      { path: '/admin/system/menu', title: '菜单管理' },
      { path: '/admin/system/dict', title: '字典管理' },
      { path: '/admin/system/payment-config', title: '支付配置' },
    ],
  },
]);
</script>

<template>
  <div class="admin-sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <h2 v-if="!collapsed">管理后台</h2>
      <h2 v-else>管理</h2>
    </div>

    <el-menu
      :default-active="route.path"
      :default-openeds="['/admin/home']"
      :collapse="collapsed"
      :collapse-transition="false"
      router
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-sub-menu v-if="item.children" :index="item.path">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.admin-sidebar {
  width: $sidebar-width;
  background: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }

  .sidebar-header {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #263445;

    h2 {
      color: #fff;
      font-size: $font-size-large;
      margin: 0;
    }
  }

  :deep(.el-menu) {
    border-right: none;
    background: #304156;

    .el-menu-item,
    .el-sub-menu__title {
      color: #bfcbd9;

      &:hover {
        background: #263445;
      }
    }

    .el-menu-item.is-active {
      color: #409eff;
      background: #263445;
    }
  }
}
</style>
