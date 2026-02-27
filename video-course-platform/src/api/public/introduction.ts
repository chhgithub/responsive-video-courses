/**
 * 前台展示 - 介绍信息API
 * 基于LocalStorage的原型实现
 */

import { introductionStorage } from '@/utils/introduction-storage';
import type {
  CourseIntroInfo,
  CertInfo,
  CertModule,
  AboutUsInfo,
  AboutUsAll,
  TeacherInfo,
  ContactInfo,
  CertType,
  FacultyApplication,
  FacultyConsultation,
  FacultyApplicationConfig,
  FacultyConsultationConfig,
} from '@/types/introduction';

// ==================== 课程介绍 ====================

export const publicCourseIntroApi = {
  /**
   * 获取已发布的课程介绍
   */
  getCourseIntro(): Promise<CourseIntroInfo | null> {
    return Promise.resolve(introductionStorage.courseIntro.getPublished());
  },
};

// ==================== 认证中心 ====================

export const publicCertCenterApi = {
  /**
   * 获取所有已发布的认证项目
   */
  getCertList(): Promise<CertInfo[]> {
    const all = introductionStorage.certCenter.list();
    return Promise.resolve(all.filter(cert => cert.isPublished));
  },

  /**
   * 根据认证类型获取详情（仅返回已发布的模块）
   */
  getCertDetail(certType: CertType): Promise<CertInfo | null> {
    const cert = introductionStorage.certCenter.getByCertType(certType);
    if (!cert) return Promise.resolve(null);

    // 过滤出已发布的模块
    const publishedCert: CertInfo = {
      ...cert,
      modules: cert.modules.filter(m => m.isPublished).sort((a, b) => a.sortOrder - b.sortOrder),
    };
    return Promise.resolve(publishedCert);
  },

  /**
   * 获取指定认证项目的所有模块（包括未发布的，用于管理）
   */
  getAllModules(certType: CertType): Promise<CertModule[]> {
    const cert = introductionStorage.certCenter.getByCertType(certType);
    return Promise.resolve(cert?.modules || []);
  },
};

// ==================== 关于我们 ====================

export const publicAboutUsApi = {
  /**
   * 获取所有已发布的关于我们信息
   */
  getAboutUsAll(): Promise<AboutUsAll> {
    const published = introductionStorage.aboutUs.getAllPublished();
    return Promise.resolve({
      research: published['research'] || null,
      digital: published['digital'] || null,
      education: published['education'] || null,
      contact: published['contact'] || null,
    });
  },

  /**
   * 获取关于研究院
   */
  getResearch(): Promise<AboutUsInfo | null> {
    return Promise.resolve(introductionStorage.aboutUs.getBySubCategory('research'));
  },

  /**
   * 获取关于数字创新中心
   */
  getDigital(): Promise<AboutUsInfo | null> {
    return Promise.resolve(introductionStorage.aboutUs.getBySubCategory('digital'));
  },

  /**
   * 获取关于教育培训中心
   */
  getEducation(): Promise<AboutUsInfo | null> {
    return Promise.resolve(introductionStorage.aboutUs.getBySubCategory('education'));
  },

  /**
   * 获取联系我们
   */
  getContact(): Promise<AboutUsInfo | null> {
    return Promise.resolve(introductionStorage.aboutUs.getBySubCategory('contact'));
  },

  /**
   * 获取联系方式信息
   */
  getContactInfo(): Promise<ContactInfo | undefined> {
    const contact = introductionStorage.aboutUs.getBySubCategory('contact');
    return Promise.resolve(contact?.contactInfo);
  },
};

// ==================== 师资队伍 ====================

export const publicFacultyApi = {
  /**
   * 获取已发布的讲师列表
   */
  getTeachers(): Promise<TeacherInfo[]> {
    return Promise.resolve(introductionStorage.faculty.getPublishedTeachers());
  },

  /**
   * 根据ID获取讲师详情
   */
  getTeacherById(id: string): Promise<TeacherInfo | null> {
    const teacher = introductionStorage.faculty.getTeacherById(id);
    // 只有已发布的讲师才能在前台查看
    if (teacher && !teacher.isPublished) {
      return Promise.resolve(null);
    }
    return Promise.resolve(teacher);
  },

  /**
   * 提交师资申请
   */
  submitApplication(data: Omit<FacultyApplication, 'id' | 'applyTime' | 'status'>): Promise<FacultyApplication> {
    const application = introductionStorage.faculty.addApplication(data);
    ElMessage.success('申请已提交，请等待审核');
    return Promise.resolve(application);
  },

  /**
   * 提交师资咨询
   */
  submitConsultation(data: Omit<FacultyConsultation, 'id' | 'consultTime' | 'status'>): Promise<FacultyConsultation> {
    const consultation = introductionStorage.faculty.addConsultation(data);
    ElMessage.success('咨询已提交，我们将尽快回复');
    return Promise.resolve(consultation);
  },

  /**
   * 获取师资申请配置
   */
  getApplicationConfig(): Promise<FacultyApplicationConfig> {
    return Promise.resolve(introductionStorage.faculty.getApplicationConfig());
  },

  /**
   * 获取师资咨询配置
   */
  getConsultationConfig(): Promise<FacultyConsultationConfig> {
    return Promise.resolve(introductionStorage.faculty.getConsultationConfig());
  },
};

// ==================== 统一导出 ====================

export const publicIntroductionApi = {
  courseIntro: publicCourseIntroApi,
  certCenter: publicCertCenterApi,
  aboutUs: publicAboutUsApi,
  faculty: publicFacultyApi,
};

// 兼容旧的API命名
export const introductionApi = {
  getCourseIntro: publicCourseIntroApi.getCourseIntro,
  getCertCenter: () => publicCertCenterApi.getCertList().then(list => list[0] || null),
  getAboutResearch: publicAboutUsApi.getResearch,
  getAboutDigital: publicAboutUsApi.getDigital,
  getAboutEducation: publicAboutUsApi.getEducation,
  getContact: publicAboutUsApi.getContact,
  getFaculty: publicFacultyApi.getTeachers,
  getAboutUsAll: publicAboutUsApi.getAboutUsAll,
};

export default publicIntroductionApi;
