/**
 * 认证中心数据存储管理
 */

export interface CertContent {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  trainingPlan?: string;
  evaluationPlan?: string;
  gradeAnnouncement?: string;
  registrationConsult: string;
  trialFlight?: string;
  classPlan?: string;
  pmpInfo?: string;
  npdpInfo?: string;
}

const CERT_STORAGE_KEY = 'portal_certifications';

// 默认认证数据
const defaultCerts: Record<string, CertContent> = {
  ai_trainer: {
    id: 'ai_trainer',
    title: '人工智能训练师认证',
    content: '<p>人工智能训练师是新兴职业，负责设计、训练和优化AI模型。随着AI技术的快速发展，该职业需求量持续增长。</p><p>本认证课程涵盖机器学习基础、深度学习框架、数据处理、模型训练与优化等核心技能。</p>',
    coverImage: 'https://picsum.photos/seed/ai-trainer/400/200',
    evaluationPlan: '<p><strong>评价方式：</strong></p><p>1. 理论知识考试（40%）</p><p>2. 实操考核（60%）</p><p>考试时间：每年4次，分别在3/6/9/12月</p>',
    gradeAnnouncement: '<p>成绩将在考试结束后7个工作日内公示，考生可登录官网查询。</p>',
    registrationConsult: '<p><strong>报名咨询：</strong></p><p>电话：400-123-4567</p><p>邮箱：ai@example.com</p><p>工作时间：周一至周五 9:00-18:00</p>',
  },
  ai_engineer: {
    id: 'ai_engineer',
    title: '人工智能工程技术人员认证',
    content: '<p>人工智能工程技术人员专注于AI系统的工程化落地，包括模型部署、性能优化、系统架构设计等。</p><p>适合有一定编程基础，希望从事AI工程化工作的技术人员。</p>',
    trainingPlan: '<p><strong>培训计划：</strong></p><p>• 培训周期：3个月</p><p>• 学习方式：线上+线下结合</p><p>• 项目实战：3个完整项目</p><p>• 导师指导：每周1次直播答疑</p>',
    registrationConsult: '<p><strong>报名咨询：</strong></p><p>请发送邮件至：ai-engineer@example.com</p><p>邮件主题请注明"AI工程师认证报名"</p>',
  },
  caac_drone: {
    id: 'caac_drone',
    title: 'CAAC无人机执照认证',
    content: '<p>CAAC无人机执照是从事无人机飞行作业的必备证书，由中国民航局颁发。</p><p>本认证提供多旋翼、固定翼等多种机型培训，帮助学员掌握专业飞行技能。</p>',
    registrationConsult: '<p><strong>报名咨询：</strong></p><p>请联系当地授权培训中心</p><p>全国热线：400-888-9999</p>',
    trialFlight: '<p><strong>免费试飞体验：</strong></p><p>每周六下午2:00-4:00开放免费试飞</p><p>需提前3天预约</p><p>预约电话：400-888-9999</p>',
  },
  tech_broker: {
    id: 'tech_broker',
    title: '技术经纪人认证',
    content: '<p>技术经纪人连接技术创新与市场需求，推动科技成果转化，是产学研合作的重要桥梁。</p><p>适合从事技术转移、成果转化、产学研合作等相关工作的人员。</p>',
    classPlan: '<p><strong>开班计划：</strong></p><p>每月开设一期培训班</p><p>小班教学，每班限30人</p><p>培训地点：北京、上海、深圳</p>',
    registrationConsult: '<p><strong>报名咨询：</strong></p><p>请关注微信公众号"技术经纪人"</p><p>或扫描二维码咨询</p>',
  },
  other: {
    id: 'other',
    title: '其他认证项目',
    content: '<p>我们提供多种专业认证项目，助力您的职业发展。</p>',
    pmpInfo: '<p><strong>PMP项目管理专业人士认证</strong></p><p>全球认可的项目管理专业资格认证</p><p>适合有3年以上项目管理经验的人员</p>',
    npdpInfo: '<p><strong>NPDP产品经理国际认证</strong></p><p>新产品开发专业认证</p><p>提升产品管理能力的国际认证</p>',
    registrationConsult: '<p><strong>报名咨询：</strong></p><p>电话：400-999-6666</p><p>邮箱：cert@example.com</p>',
  },
};

/**
 * 初始化认证数据
 */
export function initCertData() {
  const existing = localStorage.getItem(CERT_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(defaultCerts));
  }
}

/**
 * 获取所有认证数据
 */
export function getAllCerts(): Record<string, CertContent> {
  initCertData();
  const data = localStorage.getItem(CERT_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * 获取单个认证数据
 */
export function getCertByKey(key: string): CertContent | undefined {
  const certs = getAllCerts();
  return certs[key];
}

/**
 * 获取认证列表（用于Tab配置）
 */
export function getCertList() {
  return [
    { key: 'ai_trainer', label: '人工智能训练师' },
    { key: 'ai_engineer', label: '人工智能工程技术人员' },
    { key: 'caac_drone', label: 'CAAC无人机执照' },
    { key: 'tech_broker', label: '技术经纪人' },
    { key: 'other', label: '其他' },
  ];
}

/**
 * 保存认证数据
 */
export function saveCert(key: string, cert: CertContent) {
  const certs = getAllCerts();
  certs[key] = cert;
  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));
}

// 自动初始化
initCertData();
