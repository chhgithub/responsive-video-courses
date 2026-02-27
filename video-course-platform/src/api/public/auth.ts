import request from '../request';
import type { LoginForm, RegisterForm, UserInfo } from '../types';

export const authApi = {
  // 登录
  login(data: LoginForm): Promise<{ token: string; userInfo: UserInfo }> {
    return request.post('/public/auth/login', data);
  },

  // 注册
  register(data: RegisterForm): Promise<void> {
    return request.post('/public/auth/register', data);
  },

  // 获取用户信息
  getUserInfo(): Promise<UserInfo> {
    return request.get('/public/auth/user-info');
  },

  // 退出登录
  logout(): Promise<void> {
    return request.post('/public/auth/logout');
  },

  // 刷新 token
  refreshToken(refreshToken: string): Promise<{ token: string }> {
    return request.post('/public/auth/refresh', { refreshToken });
  },
};
