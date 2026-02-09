import type { LoginAndRegisterParams } from '@vben/common-ui';
import type { UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { doLogout, seeConnectionClose } from '#/api';
import { getAllMenusApi } from '#/api/core/menu';
import { $t } from '#/locales';

import { useDictStore } from './dict';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: LoginAndRegisterParams,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;

      // ===== 模拟登录模式（原型开发使用） =====
      // 跳过真实的后端 API 调用，直接使用模拟数据
      const mockToken = `mock_access_token_${Date.now()}`;

      // 将 accessToken 存储到 accessStore 中
      accessStore.setAccessToken(mockToken);
      accessStore.setRefreshToken(mockToken);

      // 模拟用户信息
      userInfo = {
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${
          params.username || 'admin'
        }`,
        email: 'admin@example.com',
        permissions: ['*:*:*'], // 所有权限
        realName: '管理员',
        roles: ['admin'],
        userId: 1,
        username: params.username || 'admin',
      };

      /**
       * 设置用户信息
       */
      userStore.setUserInfo(userInfo);
      /**
       * 设置权限码
       */
      accessStore.setAccessCodes(userInfo.permissions);

      /**
       * 加载菜单数据（前端路由模式需要）
       */
      const menus = await getAllMenusApi();
      accessStore.setAccessMenus(menus);

      if (accessStore.loginExpired) {
        accessStore.setLoginExpired(false);
      } else {
        onSuccess
          ? await onSuccess?.()
          : await router.push(preferences.app.defaultHomePath);
      }

      if (userInfo?.realName) {
        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await seeConnectionClose();
      await doLogout();
    } catch (error) {
      console.error(error);
    } finally {
      resetAllStores();
      accessStore.setLoginExpired(false);

      // 回登陆页带上当前路由地址
      await router.replace({
        path: LOGIN_PATH,
        query: redirect
          ? {
              redirect: encodeURIComponent(router.currentRoute.value.fullPath),
            }
          : {},
      });
    }
  }

  async function fetchUserInfo() {
    // 模拟用户信息（原型开发使用）
    const userInfo: UserInfo = {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      email: 'admin@example.com',
      permissions: ['*:*:*'],
      realName: '管理员',
      roles: ['admin'],
      userId: 1,
      username: 'admin',
    };
    userStore.setUserInfo(userInfo);

    /**
     * 需要重新加载字典
     * 比如退出登录切换到其他租户
     */
    const dictStore = useDictStore();
    dictStore.resetCache();
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
