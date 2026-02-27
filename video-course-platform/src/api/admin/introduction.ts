/**
 * 后台管理 - 介绍信息管理API
 * 基于LocalStorage的原型实现
 */

import { introductionStorage } from '@/utils/introduction-storage';
import type {
  CourseIntroInfo,
  CertInfo,
  AboutUsInfo,
  TeacherInfo,
  FacultyApplication,
  FacultyConsultation,
  FacultyApplicationConfig,
  FacultyConsultationConfig,
  CertModule,
  ContactInfo,
  CertType,
  TeacherForm,
} from '@/types/introduction';

// ==================== 课程介绍 ====================

export const adminCourseIntroApi = {
  /**
   * 获取课程介绍列表
   */
  list(): Promise<CourseIntroInfo[]> {
    return Promise.resolve(introductionStorage.courseIntro.list());
  },

  /**
   * 获取已发布的课程介绍
   */
  getPublished(): Promise<CourseIntroInfo | null> {
    return Promise.resolve(introductionStorage.courseIntro.getPublished());
  },

  /**
   * 根据ID获取课程介绍
   */
  detail(id: string): Promise<CourseIntroInfo | null> {
    return Promise.resolve(introductionStorage.courseIntro.getById(id));
  },

  /**
   * 添加课程介绍
   */
  add(data: Omit<CourseIntroInfo, 'id' | 'createTime' | 'sortOrder'>): Promise<CourseIntroInfo> {
    const result = introductionStorage.courseIntro.add(data);
    ElMessage.success('添加成功');
    return Promise.resolve(result);
  },

  /**
   * 更新课程介绍
   */
  update(data: CourseIntroInfo): Promise<boolean> {
    const { id, ...updates } = data;
    const result = introductionStorage.courseIntro.update(id, updates);
    if (result) {
      ElMessage.success('更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 删除课程介绍
   */
  remove(id: string): Promise<boolean> {
    const result = introductionStorage.courseIntro.remove(id);
    if (result) {
      ElMessage.success('删除成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 切换发布状态
   */
  togglePublish(id: string): Promise<boolean> {
    const result = introductionStorage.courseIntro.togglePublish(id);
    if (result) {
      ElMessage.success('状态更新成功');
    }
    return Promise.resolve(result);
  },
};

// ==================== 认证中心 ====================

export const adminCertCenterApi = {
  /**
   * 获取所有认证项目
   */
  list(): Promise<CertInfo[]> {
    return Promise.resolve(introductionStorage.certCenter.list());
  },

  /**
   * 根据认证类型获取详情
   */
  getDetail(certType: CertType): Promise<CertInfo | null> {
    return Promise.resolve(introductionStorage.certCenter.getByCertType(certType));
  },

  /**
   * 更新认证项目基本信息
   */
  updateCert(certType: CertType, data: Partial<Omit<CertInfo, 'id' | 'certType' | 'modules'>>): Promise<boolean> {
    const result = introductionStorage.certCenter.updateCert(certType, data);
    if (result) {
      ElMessage.success('更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 更新认证模块
   */
  updateModule(certType: CertType, module: CertModule): Promise<boolean> {
    const { id: moduleId, ...updates } = module;
    const result = introductionStorage.certCenter.updateModule(certType, moduleId, updates);
    if (result) {
      ElMessage.success('模块更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 切换模块发布状态
   */
  toggleModulePublish(certType: CertType, moduleId: string): Promise<boolean> {
    const result = introductionStorage.certCenter.toggleModulePublish(certType, moduleId);
    if (result) {
      ElMessage.success('状态更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 切换认证项目发布状态
   */
  toggleCertPublish(certType: CertType): Promise<boolean> {
    const result = introductionStorage.certCenter.toggleCertPublish(certType);
    if (result) {
      ElMessage.success('状态更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 获取所有已发布的模块
   */
  getPublishedModules(certType: CertType): Promise<CertModule[]> {
    return Promise.resolve(introductionStorage.certCenter.getPublishedModules(certType));
  },
};

// ==================== 关于我们 ====================

export const adminAboutUsApi = {
  /**
   * 获取所有关于我们信息
   */
  list(): Promise<AboutUsInfo[]> {
    return Promise.resolve(introductionStorage.aboutUs.list());
  },

  /**
   * 根据子类别获取信息
   */
  getDetail(subCategory: string): Promise<AboutUsInfo | null> {
    return Promise.resolve(introductionStorage.aboutUs.getBySubCategory(subCategory));
  },

  /**
   * 更新关于我们信息
   */
  update(data: AboutUsInfo): Promise<boolean> {
    const { subCategoryId, ...updates } = data;
    const result = introductionStorage.aboutUs.update(subCategoryId, updates);
    if (result) {
      ElMessage.success('更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 更新联系方式
   */
  updateContactInfo(contactInfo: ContactInfo): Promise<boolean> {
    const result = introductionStorage.aboutUs.updateContactInfo(contactInfo);
    if (result) {
      ElMessage.success('联系方式更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 切换发布状态
   */
  togglePublish(subCategory: string): Promise<boolean> {
    const result = introductionStorage.aboutUs.togglePublish(subCategory);
    if (result) {
      ElMessage.success('状态更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 获取所有已发布的信息
   */
  getAllPublished(): Promise<Record<string, AboutUsInfo>> {
    return Promise.resolve(introductionStorage.aboutUs.getAllPublished());
  },
};

// ==================== 师资队伍 ====================

export const adminFacultyApi = {
  // ==================== 讲师管理 ====================

  /**
   * 获取所有讲师
   */
  getTeachers(): Promise<TeacherInfo[]> {
    return Promise.resolve(introductionStorage.faculty.getTeachers());
  },

  /**
   * 根据ID获取讲师
   */
  getTeacherById(id: string): Promise<TeacherInfo | null> {
    return Promise.resolve(introductionStorage.faculty.getTeacherById(id));
  },

  /**
   * 添加讲师
   */
  addTeacher(data: TeacherForm): Promise<TeacherInfo> {
    const result = introductionStorage.faculty.addTeacher(data as any);
    ElMessage.success('添加成功');
    return Promise.resolve(result);
  },

  /**
   * 更新讲师
   */
  updateTeacher(data: TeacherInfo): Promise<boolean> {
    const { id, ...updates } = data;
    const result = introductionStorage.faculty.updateTeacher(id, updates);
    if (result) {
      ElMessage.success('更新成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 删除讲师
   */
  removeTeacher(id: string): Promise<boolean> {
    const result = introductionStorage.faculty.removeTeacher(id);
    if (result) {
      ElMessage.success('删除成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 切换讲师展示状态
   */
  toggleDisplay(id: string): Promise<boolean> {
    const result = introductionStorage.faculty.toggleTeacherDisplay(id);
    if (result) {
      ElMessage.success('状态更新成功');
    }
    return Promise.resolve(result);
  },

  // ==================== 申请管理 ====================

  /**
   * 获取申请配置
   */
  getApplicationConfig(): Promise<FacultyApplicationConfig> {
    return Promise.resolve(introductionStorage.faculty.getApplicationConfig());
  },

  /**
   * 更新申请配置
   */
  updateApplicationConfig(config: Partial<FacultyApplicationConfig>): Promise<void> {
    introductionStorage.faculty.updateApplicationConfig(config);
    ElMessage.success('配置更新成功');
    return Promise.resolve();
  },

  /**
   * 获取所有申请
   */
  getApplications(): Promise<FacultyApplication[]> {
    return Promise.resolve(introductionStorage.faculty.getApplications());
  },

  /**
   * 批准申请
   */
  approveApplication(id: string, reviewer: string): Promise<boolean> {
    const result = introductionStorage.faculty.updateApplicationStatus(id, 'approved', reviewer);
    if (result) {
      ElMessage.success('申请已批准');
    }
    return Promise.resolve(result);
  },

  /**
   * 拒绝申请
   */
  rejectApplication(id: string, reviewer: string, reason: string): Promise<boolean> {
    const result = introductionStorage.faculty.updateApplicationStatus(id, 'rejected', reviewer, reason);
    if (result) {
      ElMessage.success('申请已拒绝');
    }
    return Promise.resolve(result);
  },

  /**
   * 删除申请
   */
  removeApplication(id: string): Promise<boolean> {
    const result = introductionStorage.faculty.removeApplication(id);
    if (result) {
      ElMessage.success('删除成功');
    }
    return Promise.resolve(result);
  },

  // ==================== 咨询管理 ====================

  /**
   * 获取咨询配置
   */
  getConsultationConfig(): Promise<FacultyConsultationConfig> {
    return Promise.resolve(introductionStorage.faculty.getConsultationConfig());
  },

  /**
   * 更新咨询配置
   */
  updateConsultationConfig(config: Partial<FacultyConsultationConfig>): Promise<void> {
    introductionStorage.faculty.updateConsultationConfig(config);
    ElMessage.success('配置更新成功');
    return Promise.resolve();
  },

  /**
   * 获取所有咨询
   */
  getConsultations(): Promise<FacultyConsultation[]> {
    return Promise.resolve(introductionStorage.faculty.getConsultations());
  },

  /**
   * 回复咨询
   */
  replyConsultation(id: string, reply: string): Promise<boolean> {
    const result = introductionStorage.faculty.replyConsultation(id, reply);
    if (result) {
      ElMessage.success('回复成功');
    }
    return Promise.resolve(result);
  },

  /**
   * 删除咨询
   */
  removeConsultation(id: string): Promise<boolean> {
    const result = introductionStorage.faculty.removeConsultation(id);
    if (result) {
      ElMessage.success('删除成功');
    }
    return Promise.resolve(result);
  },
};

// ==================== 统一导出 ====================

export const adminIntroductionApi = {
  courseIntro: adminCourseIntroApi,
  certCenter: adminCertCenterApi,
  aboutUs: adminAboutUsApi,
  faculty: adminFacultyApi,
};

export default adminIntroductionApi;
