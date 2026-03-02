/**
 * 通识教育数据存储管理
 */

import type {
  Organization,
  OrganizationType,
  RedemptionCode,
  RedemptionCodeStatus,
  RedemptionCodeTargetType,
  GeneralEducationIntro,
  GeneralCategory,
  GeneralContentType,
  RedemptionRecord,
  UserCourseAccess,
  UserOrganization,
  AccessSource,
  GeneralEducationStorage,
} from '@/types/general-education';
import { getPublishedCourses } from '@/utils/portal-course-adapter';

const STORAGE_KEY = 'general_education_data';
const STORAGE_VERSION = '1.0';

// ==================== 工具函数 ====================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getCurrentTime(): string {
  return new Date().toISOString();
}

function getStorage(): GeneralEducationStorage {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    console.log('初始化通识教育数据...');
    const initData = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initData));
    return initData;
  }

  const data = JSON.parse(existing) as GeneralEducationStorage;

  // 版本检查和数据迁移
  if (data.version !== STORAGE_VERSION) {
    console.log('通识教育数据版本更新，执行数据迁移...');
    data = migrateData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // 兼容性检查：确保 userOrganizations 字段存在
  if (!data.userOrganizations) {
    data.userOrganizations = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
}

// 数据迁移函数
function migrateData(data: any): GeneralEducationStorage {
  const migrated = { ...getDefaultData() };

  // 迁移单位数据
  if (data.organizations) {
    migrated.organizations = data.organizations;
  }

  // 迁移兑换码数据（旧格式 -> 新格式）
  if (data.redemptionCodes) {
    migrated.redemptionCodes = data.redemptionCodes.map((code: any) => {
      // 检查是否是新格式
      if (code.targetType && code.targetIds) {
        return code as RedemptionCode;
      }

      // 旧格式转换
      return {
        id: code.id,
        code: code.code,
        organizationId: code.organizationId,
        organizationName: code.organizationName,
        targetType: 'course' as RedemptionCodeTargetType,
        targetIds: [code.courseId],
        targetName: code.courseName, // 保留旧数据
        codeExpireTime: code.expireTime,
        accessValidDays: 30,
        status: code.status,
        usedBy: code.usedBy,
        usedTime: code.usedTime,
        note: code.note,
        createTime: code.createTime,
      };
    });
  }

  // 迁移兑换记录
  if (data.redemptionRecords) {
    migrated.redemptionRecords = data.redemptionRecords;
  }

  // 迁移介绍内容
  if (data.intros) {
    migrated.intros = data.intros;
  }

  // 迁移用户课程访问权限
  if (data.userCourseAccess) {
    migrated.userCourseAccess = data.userCourseAccess;
  }

  // 初始化用户单位绑定关系
  migrated.userOrganizations = [];

  console.log('数据迁移完成');
  return migrated;
}

function setStorage(data: GeneralEducationStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefaultData(): GeneralEducationStorage {
  return {
    version: STORAGE_VERSION,
    organizations: [],
    redemptionCodes: [],
    redemptionRecords: [],
    intros: [],
    userCourseAccess: [],
    userOrganizations: [],
  };
}

// ==================== 单位管理 ====================

export function getAllOrganizations(): Organization[] {
  return getStorage().organizations;
}

export function getOrganizationById(id: string): Organization | undefined {
  return getStorage().organizations.find(o => o.id === id);
}

export function getOrganizationByCode(code: string): Organization | undefined {
  return getStorage().organizations.find(o => o.code === code);
}

export function addOrganization(data: Omit<Organization, 'id' | 'createTime'>): Organization {
  const storage = getStorage();

  // 检查编码是否重复
  if (storage.organizations.some(o => o.code === data.code)) {
    throw new Error('单位编码已存在');
  }

  const newOrg: Organization = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime(),
  };

  storage.organizations.push(newOrg);
  setStorage(storage);

  return newOrg;
}

export function updateOrganization(id: string, data: Partial<Organization>): boolean {
  const storage = getStorage();
  const index = storage.organizations.findIndex(o => o.id === id);

  if (index === -1) return false;

  // 如果修改编码，检查是否重复
  if (data.code && data.code !== storage.organizations[index].code) {
    if (storage.organizations.some(o => o.id !== id && o.code === data.code)) {
      throw new Error('单位编码已存在');
    }
  }

  storage.organizations[index] = { ...storage.organizations[index], ...data };
  setStorage(storage);

  return true;
}

export function deleteOrganization(id: string): boolean {
  const storage = getStorage();
  const index = storage.organizations.findIndex(o => o.id === id);

  if (index === -1) return false;

  // 检查是否有关联的兑换码
  const hasCodes = storage.redemptionCodes.some(c => c.organizationId === id);
  if (hasCodes) {
    throw new Error('该单位下还有兑换码，无法删除');
  }

  storage.organizations.splice(index, 1);
  setStorage(storage);

  return true;
}

// ==================== 兑换码管理 ====================

export function getAllRedemptionCodes(): RedemptionCode[] {
  return getStorage().redemptionCodes;
}

export function getRedemptionCodeById(id: string): RedemptionCode | undefined {
  return getStorage().redemptionCodes.find(c => c.id === id);
}

export function getRedemptionCodeByCode(code: string): RedemptionCode | undefined {
  return getStorage().redemptionCodes.find(c => c.code === code);
}

export function getRedemptionCodesByOrganization(organizationId: string): RedemptionCode[] {
  return getStorage().redemptionCodes.filter(c => c.organizationId === organizationId);
}

/**
 * 批量生成兑换码
 */
export function generateRedemptionCodes(params: {
  organizationId: string;
  organizationName: string;
  targetType: RedemptionCodeTargetType; // 目标类型：课程/套餐
  targetIds: string[];                 // 目标ID列表（支持多个）
  targetName?: string;                 // 目标名称（可选，兼容旧数据）
  codeExpireDays?: number;            // 兑换码有效期天数（空=永不过期）
  accessValidDays?: number;            // 兑换后有效期天数（空=永不过期）
  count: number;
  note?: string;
}): RedemptionCode[] {
  const storage = getStorage();
  const codes: RedemptionCode[] = [];
  const now = new Date();

  // 计算兑换码过期时间
  let codeExpireTime: string | undefined;
  if (params.codeExpireDays) {
    codeExpireTime = new Date(now.getTime() + params.codeExpireDays * 24 * 60 * 60 * 1000).toISOString();
  }

  for (let i = 0; i < params.count; i++) {
    const code: RedemptionCode = {
      id: generateId(),
      code: generateCode(),
      organizationId: params.organizationId,
      organizationName: params.organizationName,
      targetType: params.targetType,
      targetIds: params.targetIds,
      codeExpireTime,
      accessValidDays: params.accessValidDays,
      status: 'unused',
      note: params.note,
      createTime: getCurrentTime(),
    };
    codes.push(code);
  }

  storage.redemptionCodes.push(...codes);
  setStorage(storage);

  return codes;
}

function generateCode(): string {
  // 生成12位兑换码：大写字母+数字
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字符
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function updateRedemptionCodeStatus(
  id: string,
  status: RedemptionCodeStatus,
  usedBy?: string
): boolean {
  const storage = getStorage();
  const index = storage.redemptionCodes.findIndex(c => c.id === id);

  if (index === -1) return false;

  storage.redemptionCodes[index].status = status;
  if (usedBy) {
    storage.redemptionCodes[index].usedBy = usedBy;
    storage.redemptionCodes[index].usedTime = getCurrentTime();
  }

  setStorage(storage);
  return true;
}

export function deleteRedemptionCode(id: string): boolean {
  const storage = getStorage();
  const index = storage.redemptionCodes.findIndex(c => c.id === id);

  if (index === -1) return false;

  // 已使用的兑换码不能删除
  if (storage.redemptionCodes[index].status === 'used') {
    throw new Error('已使用的兑换码不能删除');
  }

  storage.redemptionCodes.splice(index, 1);
  setStorage(storage);

  return true;
}

// ==================== 介绍内容管理 ====================

export function getAllIntros(): GeneralEducationIntro[] {
  return getStorage().intros;
}

export function getIntroById(id: string): GeneralEducationIntro | undefined {
  return getStorage().intros.find(i => i.id === id);
}

export function getIntroByCategoryAndType(
  category: GeneralCategory,
  type: GeneralContentType
): GeneralEducationIntro | undefined {
  return getStorage().intros.find(
    i => i.category === category && i.type === type && i.isPublished
  );
}

export function getPublishedIntros(): GeneralEducationIntro[] {
  return getStorage().intros.filter(i => i.isPublished);
}

export function addIntro(data: Omit<GeneralEducationIntro, 'id' | 'createTime'>): GeneralEducationIntro {
  const storage = getStorage();

  const newIntro: GeneralEducationIntro = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime(),
  };

  storage.intros.push(newIntro);
  setStorage(storage);

  return newIntro;
}

export function updateIntro(id: string, data: Partial<GeneralEducationIntro>): boolean {
  const storage = getStorage();
  const index = storage.intros.findIndex(i => i.id === id);

  if (index === -1) return false;

  storage.intros[index] = { ...storage.intros[index], ...data };
  setStorage(storage);

  return true;
}

export function deleteIntro(id: string): boolean {
  const storage = getStorage();
  const index = storage.intros.findIndex(i => i.id === id);

  if (index === -1) return false;

  storage.intros.splice(index, 1);
  setStorage(storage);

  return true;
}

// ==================== 兑换记录 ====================

export function getAllRedemptionRecords(): RedemptionRecord[] {
  return getStorage().redemptionRecords;
}

export function getRedemptionRecordsByUserId(userId: string): RedemptionRecord[] {
  return getStorage().redemptionRecords.filter(r => r.userId === userId);
}

export function getRedemptionRecordsByOrganization(organizationId: string): RedemptionRecord[] {
  return getStorage().redemptionRecords.filter(r => r.organizationId === organizationId);
}

// ==================== 用户课程权限 ====================

export function getUserCourseAccess(userId: string): UserCourseAccess[] {
  return getStorage().userCourseAccess.filter(a => a.userId === userId);
}

export function checkUserCourseAccess(userId: string, courseId: string): boolean {
  const access = getStorage().userCourseAccess.find(
    a => a.userId === userId && a.courseId === courseId
  );

  // 检查是否过期
  if (!access) return false;

  if (access.expireTime) {
    const now = new Date();
    const expire = new Date(access.expireTime);
    if (now > expire) return false;
  }

  return true;
}

/**
 * 获取用户已兑换的课程列表
 */
export function getUserRedeemedCourses(userId: string): UserCourseAccess[] {
  const storage = getStorage();
  const accessRecords = storage.userCourseAccess.filter(a => a.userId === userId);

  // 过滤掉已过期的权限
  const now = new Date();
  return accessRecords.filter(access => {
    if (!access.expireTime) return true;
    const expire = new Date(access.expireTime);
    return now <= expire;
  });
}

/**
 * 添加用户课程访问权限
 */
export function addUserCourseAccess(data: Omit<UserCourseAccess, 'id'>): UserCourseAccess {
  const storage = getStorage();

  // 检查是否已有权限
  const existing = storage.userCourseAccess.find(
    a => a.userId === data.userId && a.courseId === data.courseId
  );
  if (existing) {
    return existing;
  }

  const newAccess: UserCourseAccess = {
    ...data,
    id: generateId(),
  };

  storage.userCourseAccess.push(newAccess);
  setStorage(storage);

  return newAccess;
}

/**
 * 创建兑换记录
 */
export function createRedemptionRecord(data: Omit<RedemptionRecord, 'id' | 'redeemTime'>): RedemptionRecord {
  const storage = getStorage();

  const record: RedemptionRecord = {
    ...data,
    id: generateId(),
    redeemTime: getCurrentTime(),
  };

  storage.redemptionRecords.push(record);
  setStorage(storage);

  return record;
}

// ==================== 用户-单位绑定关系 ====================

/**
 * 获取用户绑定的所有单位
 */
export function getUserOrganizations(userId: string): UserOrganization[] {
  const storage = getStorage();
  return storage.userOrganizations.filter(uo => uo.userId === userId);
}

/**
 * 确保用户与单位绑定（如果未绑定则创建）
 */
export function ensureUserOrganizationBinding(
  userId: string,
  organizationId: string,
  organizationName: string
): UserOrganization {
  const storage = getStorage();
  let binding = storage.userOrganizations.find(
    uo => uo.userId === userId && uo.organizationId === organizationId
  );

  if (!binding) {
    binding = {
      id: generateId(),
      userId,
      organizationId,
      organizationName,
      bindTime: getCurrentTime(),
      redeemCount: 1,
    };
    storage.userOrganizations.push(binding);
    setStorage(storage);
  } else {
    // 更新兑换次数
    binding.redeemCount++;
    setStorage(storage);
  }

  return binding;
}

// ==================== 兑换功能（前台使用） ====================

/**
 * 验证兑换码
 */
export function validateRedemptionCode(code: string): {
  valid: boolean;
  code?: RedemptionCode;
  error?: string;
} {
  const allCodes = getAllRedemptionCodes();
  const targetCode = allCodes.find(c => c.code === code);

  if (!targetCode) {
    return { valid: false, error: '兑换码不存在' };
  }

  if (targetCode.status === 'used') {
    return { valid: false, error: '兑换码已被使用' };
  }

  if (targetCode.status === 'expired') {
    return { valid: false, error: '兑换码已失效' };
  }

  // 检查兑换码是否过期（如果设置了过期时间）
  if (targetCode.codeExpireTime) {
    const now = new Date();
    const expire = new Date(targetCode.codeExpireTime);
    if (now > expire) {
      return { valid: false, error: '兑换码已过期' };
    }
  }

  return { valid: true, code: targetCode };
}

/**
 * 兑换课程/套餐（支持双重校验）
 */
export function redeemCourse(userId: string, userName: string, code: string, selectedOrganizationId?: string): {
  success: boolean;
  error?: string;
  items?: any[];
  targetType?: RedemptionCodeTargetType;
} {
  // 1. 验证兑换码
  const validation = validateRedemptionCode(code);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const redemptionCode = validation.code!;

  // 2. 双重校验：如果选择了单位，检查是否匹配
  if (selectedOrganizationId && redemptionCode.organizationId !== selectedOrganizationId) {
    return { success: false, error: '兑换码与选择的单位不匹配' };
  }

  // 3. 根据类型获取内容
  let items: any[] = [];
  let allCourseIds: string[] = [];

  // 动态获取目标名称
  let targetName = redemptionCode.targetName;
  if (!targetName) {
    if (redemptionCode.targetType === 'course') {
      if (redemptionCode.targetIds.length === 1) {
        const { getPortalCourseById } = require('@/utils/portal-course-adapter');
        const course = getPortalCourseById(redemptionCode.targetIds[0]);
        targetName = course?.title || '未知课程';
      } else {
        targetName = `${redemptionCode.targetIds.length}个课程`;
      }
    } else {
      if (redemptionCode.targetIds.length === 1) {
        const { getPackageById } = require('@/utils/course-package-storage');
        const pkg = getPackageById(parseInt(redemptionCode.targetIds[0]));
        targetName = pkg?.packageName || '未知套餐';
      } else {
        targetName = `${redemptionCode.targetIds.length}个套餐`;
      }
    }
  }

  if (redemptionCode.targetType === 'course') {
    const { getPortalCourseById } = require('@/utils/portal-course-adapter');
    for (const targetId of redemptionCode.targetIds) {
      const course = getPortalCourseById(targetId);
      if (course) {
        items.push(course);
        allCourseIds.push(course.id);
      }
    }
  } else {
    const { getPackageById } = require('@/utils/course-package-storage');
    for (const targetId of redemptionCode.targetIds) {
      const pkg = getPackageById(parseInt(targetId));
      if (pkg) {
        items.push(pkg);
        pkg.courses.forEach((c: any) => {
          if (!allCourseIds.includes(c.courseId.toString())) {
            allCourseIds.push(c.courseId.toString());
          }
        });
      }
    }
  }

  if (items.length === 0) {
    return { success: false, error: '课程/套餐不存在' };
  }

  // 4. 检查用户是否已有重复的课程
  const existingCourses = allCourseIds.filter(courseId => checkUserCourseAccess(userId, courseId));
  if (existingCourses.length > 0) {
    return { success: false, error: '您已拥有部分课程，无法重复兑换' };
  }

  // 5. 执行兑换
  updateRedemptionCodeStatus(redemptionCode.id, 'used', userId);

  // 6. 计算过期时间
  let expireTime: string | undefined;
  if (redemptionCode.accessValidDays) {
    const now = new Date();
    expireTime = new Date(now.getTime() + redemptionCode.accessValidDays * 24 * 60 * 60 * 1000).toISOString();
  }

  // 7. 添加课程访问权限
  for (const courseId of allCourseIds) {
    addUserCourseAccess({
      userId,
      courseId,
      packageName: redemptionCode.targetType === 'package' ? targetName : undefined,
      accessSource: 'redeem',
      redemptionCode: code,
      organizationId: redemptionCode.organizationId,
      organizationName: redemptionCode.organizationName,
      acquireTime: getCurrentTime(),
      expireTime,
    });
  }

  // 8. 记录兑换历史
  createRedemptionRecord({
    codeId: redemptionCode.id,
    code,
    organizationId: redemptionCode.organizationId,
    organizationName: redemptionCode.organizationName,
    courseId: redemptionCode.targetIds.join(','),
    courseName: targetName,
    userId,
    userName,
  });

  // 9. 更新用户-单位绑定关系
  ensureUserOrganizationBinding(userId, redemptionCode.organizationId, redemptionCode.organizationName);

  return { success: true, items, targetType: redemptionCode.targetType };
}

// ==================== 统计信息 ====================

export function getOrganizationStats(organizationId: string) {
  const codes = getRedemptionCodesByOrganization(organizationId);
  const records = getRedemptionRecordsByOrganization(organizationId);

  return {
    totalCodes: codes.length,
    unusedCodes: codes.filter(c => c.status === 'unused').length,
    usedCodes: codes.filter(c => c.status === 'used').length,
    expiredCodes: codes.filter(c => c.status === 'expired').length,
    totalRedemptions: records.length,
  };
}

// ==================== 初始化示例数据 ====================

/**
 * 初始化通识教育介绍示例数据
 * 如果不存在已发布的介绍内容，则创建示例内容
 */
export function initializeSampleIntros(): void {
  const storage = getStorage();
  const now = getCurrentTime();

  // 检查是否已有已发布的家庭教育介绍
  const hasFamilyIntro = storage.intros.some(
    i => i.category === 'family' && i.type === 'intro' && i.isPublished
  );

  // 检查是否已有已发布的校园教育介绍
  const hasSchoolIntro = storage.intros.some(
    i => i.category === 'school' && i.type === 'intro' && i.isPublished
  );

  // 如果都没有，添加示例数据
  if (!hasFamilyIntro || !hasSchoolIntro) {
    console.log('初始化通识教育介绍示例数据...');

    if (!hasFamilyIntro) {
      storage.intros.push({
        id: generateId(),
        category: 'family',
        type: 'intro',
        title: '家庭教育介绍',
        content: `<h2>什么是家庭教育？</h2>
<p>家庭教育是指在家庭生活中，由家长（或其他监护人）通过对子女的<span style="color: #ff6b6b; font-weight: bold;">言传身教、生活实践和情感交流</span>，对其施加的教育影响活动。它是学校教育和社会教育的基础，对人的一生发展起着至关重要的作用。</p>

<h3>家庭教育的特点</h3>
<ul>
<li><strong>启蒙性：</strong>家庭是孩子最早接受教育的场所，父母是孩子的第一任老师</li>
<li><strong>长期性：</strong>家庭教育贯穿于人的整个生命周期，具有持久的影响力</li>
<li><strong>情感性：</strong>基于亲情纽带的教育，更容易被孩子接受和内化</li>
<li><strong>灵活性：</strong>不受时间和地点限制，可以在日常生活中随时进行</li>
<li><strong>针对性：</strong>家长最了解自己的孩子，能够因材施教</li>
</ul>

<h3>家庭教育的重要性</h3>
<p>著名教育家苏霍姆林斯基曾说：<blockquote>"家庭是人生的第一所学校，家长是孩子的第一任老师。"</blockquote></p>

<p>良好的家庭教育能够：</p>
<ol>
<li>培养孩子健全的人格和良好的品德</li>
<li>促进孩子智力的开发和创造力的发展</li>
<li>帮助孩子建立正确的人生观、价值观和世界观</li>
<li>增强孩子的社会适应能力和人际交往能力</li>
<li>为孩子终身学习和发展奠定坚实基础</li>
</ol>

<h3>如何做好家庭教育？</h3>
<p><strong>1. 营造和谐的家庭氛围</strong></p>
<p>家庭是孩子成长的港湾，和谐、温馨的家庭环境能给孩子带来安全感和幸福感，促进其身心健康发展。</p>

<p><strong>2. 以身作则，言传身教</strong></p>
<p>父母的言行举止是孩子最好的榜样。要求孩子做到的，父母首先要做到。</p>

<p><strong>3. 尊重孩子，平等沟通</strong></p>
<p>要学会倾听孩子的心声，理解他们的需求和感受，建立良好的亲子关系。</p>

<p><strong>4. 适度引导，不包办代替</strong></p>
<p>要给孩子适当的自主空间，让他们在实践中学会独立思考和解决问题。</p>

<p><strong>5. 注重习惯养成</strong></p>
<p>从小培养孩子良好的生活习惯、学习习惯和道德品质，将使他们受益终身。</p>

<h3>结语</h3>
<p>家庭教育是一项长期而艰巨的任务，需要家长们付出大量的时间和精力。但每一个用心陪伴的孩子，都将在未来绽放出独特的光芒。让我们携手共进，为孩子创造更美好的成长环境！</p>`,
        isPublished: true,
        sortOrder: 0,
        createTime: now,
      });
    }

    if (!hasSchoolIntro) {
      storage.intros.push({
        id: generateId(),
        category: 'school',
        type: 'intro',
        title: '校园教育介绍',
        content: `<h2>什么是校园教育？</h2>
<p>校园教育是指在<span style="color: #4ecdc4; font-weight: bold;">专门的教育机构（学校）中</span>，由受过专业训练的教师，根据国家教育方针和课程标准，有目的、有计划、有组织地对受教育者施加系统教育影响的活动。它是现代教育体系的核心组成部分。</p>

<h3>校园教育的功能</h3>
<ul>
<li><strong>知识传授：</strong>系统传授科学文化知识，构建完整的知识体系</li>
<li><strong>能力培养：</strong>发展学生的思维能力、实践能力和创新能力</li>
<li><strong>品德塑造：</strong>培养学生的道德品质、法治观念和公民意识</li>
<li><strong>身心健康：</strong>关注学生的身体素质和心理健康发展</li>
<li><strong>社会适应：</strong>帮助学生建立良好的人际关系，增强团队协作能力</li>
</ul>

<h3>校园教育的优势</h3>
<p>相比于家庭教育和社会教育，校园教育具有以下独特优势：</p>

<table>
<thead>
<tr>
<th>优势</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>系统性</strong></td>
<td>按照科学的课程体系进行教学，知识结构完整</td>
</tr>
<tr>
<td><strong>专业性</strong></td>
<td>教师具备专业知识和教学技能</td>
</tr>
<tr>
<td><strong>规范性</strong></td>
<td>遵循国家教育标准和教学大纲</td>
</tr>
<tr>
<td><strong>集体性</strong></td>
<td>同学之间相互学习、共同进步</td>
</tr>
<tr>
<td><strong>评估性</strong></td>
<td>定期考核检验学习效果</td>
</tr>
</tbody>
</table>

<h3>新时代校园教育的发展方向</h3>
<p>随着社会的进步和科技的发展，校园教育正在发生深刻的变革：</p>

<p><strong>1. 素质教育的全面推进</strong></p>
<p>从应试教育向素质教育转变，注重学生德智体美劳全面发展。</p>

<p><strong>2. 信息技术深度融合</strong></p>
<p>利用互联网、大数据、人工智能等技术手段，创新教学模式，提高教学效率。</p>

<p><strong>3. 个性化学习路径</strong></p>
<p>尊重学生个体差异，为每个学生制定个性化的学习方案。</p>

<p><strong>4. 核心素养导向</strong></p>
<p>注重培养学生的批判性思维、创新能力和终身学习能力。</p>

<p><strong>5. 家校协同育人</strong></p>
<p>建立家校合作机制，形成教育合力，共同促进学生的全面发展。</p>

<h3>如何更好地接受校园教育？</h3>
<p>对于学生而言，要珍惜在校学习的机会：</p>
<ol>
<li>树立明确的学习目标，保持积极的学习态度</li>
<li>养成主动学习的习惯，善于思考和研究</li>
<li>积极参与课堂互动，大胆提问和表达</li>
<li>合理安排时间，平衡学习与休息</li>
<li>多参加课外活动，拓展视野和兴趣</li>
<li>与同学友好相处，建立良好的同学关系</li>
<li>尊重老师，虚心向老师请教问题</li>
</ol>

<h3>结语</h3>
<p>校园是知识的殿堂，是梦想的摇篮。在这里，每一个孩子都能找到属于自己的光芒，开启美好的人生旅程。让我们一起努力，用教育点亮未来！</p>`,
        isPublished: true,
        sortOrder: 0,
        createTime: now,
      });
    }

    setStorage(storage);
    console.log('通识教育介绍示例数据初始化完成！');
  }
}

/**
 * 初始化默认单位数据
 * 如果不存在单位数据，则创建默认单位
 */
export function initializeDefaultOrganizations(): void {
  const storage = getStorage();

  // 检查是否已有单位
  if (storage.organizations.length === 0) {
    console.log('初始化默认单位数据...');

    const defaultOrganization: Organization = {
      id: 'test-org-001',
      name: '测试单位',
      code: 'test001',
      type: 'family',
      contactPerson: '张三',
      contactPhone: '13800138000',
      description: '这是一个测试单位，用于原型展示',
      createTime: getCurrentTime(),
    };

    storage.organizations.push(defaultOrganization);

    // 生成一些测试兑换码
    const testCodes: RedemptionCode[] = [];
    const courses = getPublishedCourses();

    for (let i = 0; i < 5; i++) {
      const course = courses[i % courses.length];
      const now = new Date();
      const codeExpireTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

      testCodes.push({
        id: generateId(),
        code: generateCode(),
        organizationId: defaultOrganization.id,
        organizationName: defaultOrganization.name,
        targetType: 'course',
        targetIds: [course.id],
        targetName: course.title,
        codeExpireTime,
        accessValidDays: 90, // 兑换后90天有效
        status: 'unused',
        createTime: getCurrentTime(),
      });
    }

    storage.redemptionCodes.push(...testCodes);

    // 生成一些测试兑换记录（模拟用户已兑换课程）
    const testRecords: RedemptionRecord[] = [];
    for (let i = 0; i < 3; i++) {
      const userId = `100${i + 1}`; // 使用测试学员ID
      const codeIndex = i;
      const testRecord: RedemptionRecord = {
        id: generateId(),
        codeId: testCodes[codeIndex].id,
        userId: userId,
        organizationId: defaultOrganization.id,
        organizationName: defaultOrganization.name,
        courseId: testCodes[codeIndex].targetIds[0],
        courseName: testCodes[codeIndex].targetName,
        redemptionTime: getCurrentTime(),
      };
      testRecords.push(testRecord);

      // 更新兑换码状态为已使用
      testCodes[codeIndex].status = 'used';
      testCodes[codeIndex].usedBy = userId;
      testCodes[codeIndex].usedTime = getCurrentTime();
    }

    storage.redemptionRecords.push(...testRecords);

    // 生成一些测试课程访问记录（用于学习进度展示）
    const testAccess: UserCourseAccess[] = [];
    for (let i = 0; i < 3; i++) {
      const userId = `100${i + 1}`;
      const now = new Date();
      const expireTime = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      testAccess.push({
        id: generateId(),
        userId: userId,
        courseId: testCodes[i].targetIds[0],
        organizationId: defaultOrganization.id,
        organizationName: defaultOrganization.name,
        accessSource: 'redeem',
        packageName: null,
        acquireTime: getCurrentTime(),
        expireTime: expireTime.toISOString(),
      });
    }

    storage.userCourseAccess.push(...testAccess);

    setStorage(storage);
    console.log('默认单位数据初始化完成！');
  }
}


