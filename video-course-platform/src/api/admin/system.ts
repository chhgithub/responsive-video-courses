import request from '../request';
import type { SystemUser, Role, Menu, DictType, DictData, PageResult } from '../types';

// 用户管理
export const userApi = {
  // 获取用户列表
  list(params: any): Promise<PageResult<SystemUser>> {
    return request.get('/admin/system/user/list', { params });
  },

  // 获取用户详情
  detail(id: string): Promise<SystemUser> {
    return request.get(`/admin/system/user/${id}`);
  },

  // 新增用户
  add(data: Partial<SystemUser>): Promise<void> {
    return request.postWithMsg('/admin/system/user', data);
  },

  // 更新用户
  update(data: Partial<SystemUser>): Promise<void> {
    return request.putWithMsg('/admin/system/user', data);
  },

  // 删除用户
  remove(id: string): Promise<void> {
    return request.deleteWithMsg(`/admin/system/user/${id}`);
  },

  // 重置密码
  resetPassword(id: string, password: string): Promise<void> {
    return request.putWithMsg(`/admin/system/user/${id}/password`, { password });
  },

  // 修改用户状态
  updateStatus(id: string, status: string): Promise<void> {
    return request.putWithMsg(`/admin/system/user/${id}/status`, { status });
  },

  // 获取部门树
  deptTree(): Promise<any[]> {
    return request.get('/admin/system/dept/tree');
  },
};

// 角色管理
export const roleApi = {
  // 获取角色列表
  list(params?: any): Promise<Role[]> {
    return request.get('/admin/system/role/list', { params });
  },

  // 获取角色详情
  detail(id: string): Promise<Role> {
    return request.get(`/admin/system/role/${id}`);
  },

  // 新增角色
  add(data: Partial<Role>): Promise<void> {
    return request.postWithMsg('/admin/system/role', data);
  },

  // 更新角色
  update(data: Partial<Role>): Promise<void> {
    return request.putWithMsg('/admin/system/role', data);
  },

  // 删除角色
  remove(id: string): Promise<void> {
    return request.deleteWithMsg(`/admin/system/role/${id}`);
  },

  // 分配权限
  assignPermissions(roleId: string, permissions: string[]): Promise<void> {
    return request.putWithMsg(`/admin/system/role/${roleId}/permissions`, { permissions });
  },
};

// 菜单管理
export const menuApi = {
  // 获取菜单树
  tree(): Promise<Menu[]> {
    return request.get('/admin/system/menu/tree');
  },

  // 获取菜单列表
  list(): Promise<Menu[]> {
    return request.get('/admin/system/menu/list');
  },

  // 获取菜单详情
  detail(id: string): Promise<Menu> {
    return request.get(`/admin/system/menu/${id}`);
  },

  // 新增菜单
  add(data: Partial<Menu>): Promise<void> {
    return request.postWithMsg('/admin/system/menu', data);
  },

  // 更新菜单
  update(data: Partial<Menu>): Promise<void> {
    return request.putWithMsg('/admin/system/menu', data);
  },

  // 删除菜单
  remove(id: string): Promise<void> {
    return request.deleteWithMsg(`/admin/system/menu/${id}`);
  },

  // 获取用户菜单
  userMenus(): Promise<Menu[]> {
    return request.get('/admin/system/menu/user-menus');
  },
};

// 字典管理
export const dictApi = {
  // 获取字典类型列表
  typeList(params?: any): Promise<PageResult<DictType>> {
    return request.get('/admin/system/dict/type/list', { params });
  },

  // 获取字典类型详情
  typeDetail(id: string): Promise<DictType> {
    return request.get(`/admin/system/dict/type/${id}`);
  },

  // 新增字典类型
  typeAdd(data: Partial<DictType>): Promise<void> {
    return request.postWithMsg('/admin/system/dict/type', data);
  },

  // 更新字典类型
  typeUpdate(data: Partial<DictType>): Promise<void> {
    return request.putWithMsg('/admin/system/dict/type', data);
  },

  // 删除字典类型
  typeRemove(id: string): Promise<void> {
    return request.deleteWithMsg(`/admin/system/dict/type/${id}`);
  },

  // 获取字典数据列表
  dataList(dictCode: string): Promise<DictData[]> {
    return request.get(`/admin/system/dict/data/list/${dictCode}`);
  },

  // 新增字典数据
  dataAdd(data: Partial<DictData>): Promise<void> {
    return request.postWithMsg('/admin/system/dict/data', data);
  },

  // 更新字典数据
  dataUpdate(data: Partial<DictData>): Promise<void> {
    return request.putWithMsg('/admin/system/dict/data', data);
  },

  // 删除字典数据
  dataRemove(id: string): Promise<void> {
    return request.deleteWithMsg(`/admin/system/dict/data/${id}`);
  },
};
