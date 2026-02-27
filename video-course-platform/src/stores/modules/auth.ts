import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface UserInfo {
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roles?: string[];
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  // Getters
  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => {
    return userInfo.value?.roles?.includes('admin') || false;
  });

  // Actions
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
    localStorage.setItem('auth_user', JSON.stringify(info));
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  function initAuth() {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      token.value = savedToken;
    }

    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    setToken,
    setUserInfo,
    logout,
    initAuth,
  };
});
