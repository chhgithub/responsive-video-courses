/**
 * 前台用户数据存储管理
 */

export interface User {
  userId: string;
  username: string;
  password: string; // 加密后的密码
  nickname: string;
  avatar?: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  birthday?: string;
  createTime: string;
}

const USER_STORAGE_KEY = 'portal_users';

// 默认用户数据（测试用）
const defaultUsers: User[] = [
  {
    userId: '1',
    username: 'test',
    password: 'test', // 实际应该加密
    nickname: '测试用户',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138000',
    gender: 'male',
    age: 25,
    createTime: '2024-01-01',
  },
  {
    userId: '2',
    username: 'admin',
    password: 'admin',
    nickname: '管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13900139000',
    gender: 'female',
    age: 30,
    createTime: '2024-01-02',
  },
];

/**
 * 初始化用户数据
 */
export function initUserData() {
  const existing = localStorage.getItem(USER_STORAGE_KEY);
  if (!existing) {
    console.log('初始化默认用户数据...');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
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
