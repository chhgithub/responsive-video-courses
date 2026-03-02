/**
 * 前台用户数据存储管理
 */

import type { UserRole } from '@/api/types/model';

export interface User {
  userId: string;
  username: string;
  password: string; // 加密后的密码
  nickname: string;
  avatar?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  birthday?: string;
  organizationId?: string; // 绑定的单位ID
  createTime: string;
}

const USER_STORAGE_KEY = 'portal_users';
const USER_STORAGE_VERSION = '3.0'; // 用户数据版本

// 默认用户数据（测试用）
const defaultUsers: User[] = [
  {
    userId: '1',
    username: 'test',
    password: 'test',
    nickname: '测试学员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138000',
    role: 'student',
    gender: 'male',
    age: 25,
    createTime: '2024-01-01',
  },
  {
    userId: '2',
    username: 'admin',
    password: '123456',
    nickname: '总管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13900139000',
    role: 'admin',
    gender: 'female',
    age: 30,
    createTime: '2024-01-02',
  },
  {
    userId: '3',
    username: 'org_admin',
    password: '123456',
    nickname: '单位管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=org_admin',
    phone: '13900240000',
    role: 'org_admin',
    gender: 'male',
    age: 35,
    organizationId: 'test-org-001',
    createTime: '2024-01-03',
  },
  // 测试单位学员（test-org-001）
  {
    userId: '1001',
    username: 'student1',
    password: '123456',
    nickname: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    phone: '13800138001',
    email: 'zhangsan@test.com',
    role: 'student',
    gender: 'male',
    age: 22,
    organizationId: 'test-org-001',
    createTime: '2024-02-01',
  },
  {
    userId: '1002',
    username: 'student2',
    password: '123456',
    nickname: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2',
    phone: '13800138002',
    email: 'lisi@test.com',
    role: 'student',
    gender: 'female',
    age: 23,
    organizationId: 'test-org-001',
    createTime: '2024-02-02',
  },
  {
    userId: '1003',
    username: 'student3',
    password: '123456',
    nickname: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student3',
    phone: '13800138003',
    email: 'wangwu@test.com',
    role: 'student',
    gender: 'male',
    age: 21,
    organizationId: 'test-org-001',
    createTime: '2024-02-03',
  },
  {
    userId: '1004',
    username: 'student4',
    password: '123456',
    nickname: '赵六',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student4',
    phone: '13800138004',
    email: 'zhaoliu@test.com',
    role: 'student',
    gender: 'female',
    age: 24,
    organizationId: 'test-org-001',
    createTime: '2024-02-04',
  },
  {
    userId: '1005',
    username: 'student5',
    password: '123456',
    nickname: '孙七',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student5',
    phone: '13800138005',
    email: 'sunqi@test.com',
    role: 'student',
    gender: 'male',
    age: 25,
    organizationId: 'test-org-001',
    createTime: '2024-02-05',
  },
];

/**
 * 初始化用户数据（检查版本）
 */
export function initUserData() {
  const existing = localStorage.getItem(USER_STORAGE_KEY);

  if (!existing) {
    console.log('初始化默认用户数据...');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
    localStorage.setItem(USER_STORAGE_KEY + '_version', USER_STORAGE_VERSION);
    return;
  }

  // 检查版本，如果不匹配则重新初始化
  const savedVersion = localStorage.getItem(USER_STORAGE_KEY + '_version');
  if (savedVersion !== USER_STORAGE_VERSION) {
    console.log('用户数据版本更新，重新初始化...');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
    localStorage.setItem(USER_STORAGE_KEY + '_version', USER_STORAGE_VERSION);
  }
}

/**
 * 获取所有用户
 */
export function getAllUsers(): User[] {
  initUserData();
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 根据用户名获取用户
 */
export function getUserByUsername(username: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.username === username);
}

/**
 * 根据手机号获取用户
 */
export function getUserByPhone(phone: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.phone === phone);
}

/**
 * 根据ID获取用户
 */
export function getUserById(userId: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.userId === userId);
}

/**
 * 用户注册
 */
export function registerUser(userData: Omit<User, 'userId' | 'createTime'>): User {
  const users = getAllUsers();

  // 检查用户名是否已存在
  if (getUserByUsername(userData.username)) {
    throw new Error('用户名已存在');
  }

  // 检查手机号是否已存在
  if (userData.phone && getUserByPhone(userData.phone)) {
    throw new Error('手机号已被注册');
  }

  // 单位管理员必须绑定单位
  if (userData.role === 'org_admin' && !userData.organizationId) {
    throw new Error('单位管理员必须绑定单位');
  }

  // 创建新用户
  const newUser: User = {
    ...userData,
    userId: Date.now().toString(),
    createTime: new Date().toISOString().split('T')[0],
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
}

/**
 * 用户登录验证
 */
export function loginUser(username: string, password: string): User {
  // 支持用户名或手机号登录
  let user = getUserByUsername(username);
  if (!user) {
    user = getUserByPhone(username);
  }

  if (!user) {
    throw new Error('用户不存在');
  }

  if (user.password !== password) {
    throw new Error('密码错误');
  }

  return user;
}

/**
 * 更新用户信息
 */
export function updateUser(userId: string, data: Partial<User>): void {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.userId === userId);

  if (index === -1) {
    throw new Error('用户不存在');
  }

  users[index] = { ...users[index], ...data };
  saveUsers(users);
}

/**
 * 修改密码
 */
export function changePassword(userId: string, oldPassword: string, newPassword: string): void {
  const user = getUserById(userId);

  if (!user) {
    throw new Error('用户不存在');
  }

  if (user.password !== oldPassword) {
    throw new Error('原密码错误');
  }

  updateUser(userId, { password: newPassword });
}

/**
 * 保存用户数据
 */
function saveUsers(users: User[]): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}
