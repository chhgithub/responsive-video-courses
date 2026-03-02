/**
 * 用户标签系统数据存储
 */

// 用户标签接口
export interface UserTag {
  tagId: string;
  tagName: string;
  tagColor: string;          // 标签颜色
  description?: string;       // 标签描述
  userCount: number;          // 标签用户数量
  createdAt: string;
}

// 用户-标签关联接口
export interface UserTagRelation {
  userId: string;
  tagId: string;
  assignedAt: string;
  assignedBy: string;        // 分配人
}

const TAG_STORAGE_KEY = 'user_tags';
const TAG_RELATION_KEY = 'user_tag_relations';

// 默认标签数据
const defaultTags: UserTag[] = [
  {
    tagId: 'tag_1',
    tagName: 'VIP用户',
    tagColor: '#ff4757',
    description: '高价值用户',
    userCount: 5,
    createdAt: '2024-01-15',
  },
  {
    tagId: 'tag_2',
    tagName: '新注册',
    tagColor: '#409eff',
    description: '最近注册的用户',
    userCount: 12,
    createdAt: '2024-01-14',
  },
  {
    tagId: 'tag_3',
    tagName: '活跃用户',
    tagColor: '#67c23a',
    description: '经常活跃的用户',
    userCount: 8,
    createdAt: '2024-01-13',
  },
];

// 初始化标签数据
export function initTagData() {
  const existing = localStorage.getItem(TAG_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(defaultTags));
  }
  if (!localStorage.getItem(TAG_RELATION_KEY)) {
    localStorage.setItem(TAG_RELATION_KEY, JSON.stringify([]));
  }
}

// 获取所有标签
export function getAllTags(): UserTag[] {
  initTagData();
  const data = localStorage.getItem(TAG_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 根据ID获取标签
export function getTagById(tagId: string): UserTag | null {
  const tags = getAllTags();
  return tags.find(t => t.tagId === tagId) || null;
}

// 创建标签
export function createTag(tag: Omit<UserTag, 'tagId', 'userCount', 'createdAt'>): UserTag {
  const list = getAllTags();

  const newTag: UserTag = {
    ...tag,
    tagId: `tag_${Date.now()}`,
    userCount: 0,
    createdAt: new Date().toISOString(),
  };

  list.push(newTag);
  localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(list));

  return newTag;
}

// 更新标签
export function updateTag(tagId: string, data: Partial<UserTag>): void {
  const list = getAllTags();
  const index = list.findIndex(t => t.tagId === tagId);

  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(list));
  }
}

// 删除标签
export function deleteTag(tagId: string): void {
  const list = getAllTags();
  const newList = list.filter(t => t.tagId !== tagId);
  localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(newList));

  // 删除标签的同时，删除关联关系
  const relations = JSON.parse(localStorage.getItem(TAG_RELATION_KEY) || '[]');
  const newRelations = relations.filter((r: UserTagRelation) => r.tagId !== tagId);
  localStorage.setItem(TAG_RELATION_KEY, JSON.stringify(newRelations));
}

// 获取所有用户-标签关联
export function getAllTagRelations(): UserTagRelation[] {
  initTagData();
  const data = localStorage.getItem(TAG_RELATION_KEY);
  return data ? JSON.parse(data) : [];
}

// 为用户打标签
export function tagUser(userId: string, tagId: string, operator: string): void {
  const relations = getAllTagRelations();

  // 检查是否已存在
  const exists = relations.find((r: UserTagRelation) => r.userId === userId && r.tagId === tagId);
  if (exists) return;

  const relation: UserTagRelation = {
    userId,
    tagId,
    assignedAt: new Date().toISOString(),
    assignedBy: operator,
  };

  relations.push(relation);
  localStorage.setItem(TAG_RELATION_KEY, JSON.stringify(relations));

  // 更新标签的用户数量
  updateTagUserCount(tagId);
}

// 批量打标签
export function batchTagUsers(userIds: string[], tagId: string, operator: string): void {
  const relations = getAllTagRelations();

  const newRelations: UserTagRelation[] = userIds
    .filter(userId => !relations.find((r: UserTagRelation) => r.userId === userId && r.tagId === tagId))
    .map(userId => ({
      userId,
      tagId,
      assignedAt: new Date().toISOString(),
      assignedBy: operator,
    }));

  relations.push(...newRelations);
  localStorage.setItem(TAG_RELATION_KEY, JSON.stringify(relations));

  updateTagUserCount(tagId);
}

// 移除用户标签
export function untagUser(userId: string, tagId: string): void {
  const relations = getAllTagRelations();
  const index = relations.findIndex((r: UserTagRelation) => r.userId === userId && r.tagId === tagId);

  if (index !== -1) {
    relations.splice(index, 1);
    localStorage.setItem(TAG_RELATION_KEY, JSON.stringify(relations));

    // 更新标签的用户数量
    updateTagUserCount(tagId);
  }
}

// 获取用户的标签
export function getUserTags(userId: string): UserTag[] {
  const relations = getAllTagRelations();
  const tags = getAllTags();

  const userTagIds = relations
    .filter((r: UserTagRelation) => r.userId === userId)
    .map((r: UserTagRelation) => r.tagId);

  return tags.filter((t: UserTag) => userTagIds.includes(t.tagId));
}

// 根据标签获取用户
export function getUsersByTag(tagId: string): string[] {
  const relations = getAllTagRelations();
  return relations
    .filter((r: UserTagRelation) => r.tagId === tagId)
    .map((r: UserTagRelation) => r.userId);
}

// 更新标签用户数量
function updateTagUserCount(tagId: string): void {
  const relations = getAllTagRelations();
  const count = relations.filter((r: UserTagRelation) => r.tagId === tagId).length;
  updateTag(tagId, { userCount: count });
}

// 自动初始化
initTagData();
