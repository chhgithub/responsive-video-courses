/**
 * 介绍信息 Mock 数据
 */
import type { IntroductionContent } from '~/types/introduction';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** 生成时间字符串 */
function formatTime(date: Date) {
  return formatterCN.format(date);
}

/** Mock 数据列表 */
export const introductionData: IntroductionContent[] = [
  // ==================== 课程介绍 ====================
  {
    id: 1,
    categoryId: 'course_intro',
    subCategoryId: 'default',
    title: '课程介绍',
    content: '<p>我们提供优质的视频课程，涵盖前端、后端、移动端等多个技术领域。</p>',
    coverImage: 'https://picsum.photos/seed/course/400/200',
    isPublished: false,
    sortOrder: 1,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },

  // ==================== 认证中心 - 人工智能训练师 ====================
  {
    id: 2,
    categoryId: 'cert_center',
    subCategoryId: 'ai_trainer',
    title: '人工智能训练师认证',
    content: '<p>人工智能训练师是新兴职业，负责设计、训练和优化AI模型。</p>',
    coverImage: 'https://picsum.photos/seed/ai-trainer/400/200',
    extraData: {
      evaluationPlan: '<p>评价计划包括理论知识考试和实操考核两部分。</p>',
      gradeAnnouncement: '<p>成绩将在考试结束后7个工作日内公示。</p>',
      registrationConsult: '<p>报名咨询请拨打：400-123-4567</p>',
    },
    isPublished: false,
    sortOrder: 1,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 认证中心 - 人工智能工程技术人员 ====================
  {
    id: 3,
    categoryId: 'cert_center',
    subCategoryId: 'ai_engineer',
    title: '人工智能工程技术人员认证',
    content: '<p>人工智能工程技术人员专注于AI系统的工程化落地。</p>',
    coverImage: 'https://picsum.photos/seed/ai-engineer/400/200',
    extraData: {
      trainingPlan: '<p>培训计划为期3个月，包含理论学习和项目实战。</p>',
      registrationConsult: '<p>报名咨询请发送邮件至：ai@example.com</p>',
    },
    isPublished: false,
    sortOrder: 2,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 认证中心 - CAAC无人机执照 ====================
  {
    id: 4,
    categoryId: 'cert_center',
    subCategoryId: 'caac_drone',
    title: 'CAAC无人机执照认证',
    content: '<p>CAAC无人机执照是从事无人机飞行作业的必备证书。</p>',
    coverImage: 'https://picsum.photos/seed/drone/400/200',
    extraData: {
      registrationConsult: '<p>报名咨询请联系当地培训中心。</p>',
      trialFlight: '<p>提供免费试飞体验，欢迎预约。</p>',
    },
    isPublished: false,
    sortOrder: 3,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 认证中心 - 技术经纪人 ====================
  {
    id: 5,
    categoryId: 'cert_center',
    subCategoryId: 'tech_broker',
    title: '技术经纪人认证',
    content: '<p>技术经纪人连接技术创新与市场需求，推动成果转化。</p>',
    coverImage: 'https://picsum.photos/seed/broker/400/200',
    extraData: {
      registrationConsult: '<p>报名咨询请关注微信公众号。</p>',
      classPlan: '<p>每月开设一期培训班，小班教学。</p>',
    },
    isPublished: false,
    sortOrder: 4,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 认证中心 - 其他 ====================
  {
    id: 6,
    categoryId: 'cert_center',
    subCategoryId: 'other',
    title: '其他认证项目',
    content: '<p>提供多种专业认证项目，助力职业发展。</p>',
    coverImage: 'https://picsum.photos/seed/other/400/200',
    extraData: {
      pmpInfo: '<p>PMP项目管理专业人士认证，全球认可。</p>',
      npdpInfo: '<p>NPDP产品经理国际认证，提升产品管理能力。</p>',
    },
    isPublished: false,
    sortOrder: 5,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },

  // ==================== 关于我们 - 研究院 ====================
  {
    id: 7,
    categoryId: 'about_us',
    subCategoryId: 'research_institute',
    title: '关于研究院',
    content: '<p>创新教育研究院成立于2010年，是一家专注于教育创新研究与实践的专业机构。</p>',
    coverImage: 'https://picsum.photos/seed/institute/400/200',
    isPublished: false,
    sortOrder: 1,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 关于我们 - 数字创新中心 ====================
  {
    id: 8,
    categoryId: 'about_us',
    subCategoryId: 'digital_center',
    title: '关于数字创新中心',
    content: '<p>数字创新中心致力于推动数字化转型，培养数字人才。</p>',
    coverImage: 'https://picsum.photos/seed/digital/400/200',
    isPublished: false,
    sortOrder: 2,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 关于我们 - 教育培训中心 ====================
  {
    id: 9,
    categoryId: 'about_us',
    subCategoryId: 'education_center',
    title: '关于教育培训中心',
    content: '<p>教育培训中心提供全方位的教育培训服务，助力个人和企业成长。</p>',
    coverImage: 'https://picsum.photos/seed/education/400/200',
    isPublished: false,
    sortOrder: 3,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 关于我们 - 联系我们 ====================
  {
    id: 10,
    categoryId: 'about_us',
    subCategoryId: 'contact',
    title: '联系我们',
    content: '<p>欢迎联系我们，获取更多信息。</p>',
    coverImage: 'https://picsum.photos/seed/contact/400/200',
    extraData: {
      phone: '400-123-4567',
      fax: '010-12345678',
      email: 'contact@example.com',
      website: 'https://www.example.com',
      address: '北京市海淀区中关村科技园',
      zipCode: '100080',
      workingHours: {
        weekdays: '周一至周五 9:00-18:00',
        weekend: '周六至周日 10:00-17:00',
      },
      qrcodes: [
        {
          name: '微信公众号',
          image: 'https://picsum.photos/seed/wechat/200/200',
          followers: '10万+',
        },
        {
          name: '官方微博',
          image: 'https://picsum.photos/seed/weibo/200/200',
          followers: '50万+',
        },
      ],
      offices: [
        {
          city: '北京',
          address: '北京市海淀区中关村科技园',
          phone: '010-12345678',
        },
        {
          city: '上海',
          address: '上海市浦东新区张江高科',
          phone: '021-87654321',
        },
      ],
    },
    isPublished: false,
    sortOrder: 4,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },

  // ==================== 师资介绍 - 师资展示 ====================
  {
    id: 11,
    categoryId: 'faculty',
    subCategoryId: 'showcase',
    title: '师资展示',
    content: '<p>我们拥有强大的师资团队，汇聚行业顶尖专家。</p>',
    coverImage: 'https://picsum.photos/seed/faculty/400/200',
    isPublished: false,
    sortOrder: 1,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 师资介绍 - 师资申请 ====================
  {
    id: 12,
    categoryId: 'faculty',
    subCategoryId: 'application',
    title: '师资申请',
    content: '<p>欢迎优秀人才加入我们的师资团队！</p>',
    coverImage: 'https://picsum.photos/seed/apply/400/200',
    isPublished: false,
    sortOrder: 2,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
  // ==================== 师资介绍 - 师资咨询 ====================
  {
    id: 13,
    categoryId: 'faculty',
    subCategoryId: 'consultation',
    title: '师资咨询',
    content: '<p>提供专业的师资咨询服务，助力机构发展。</p>',
    coverImage: 'https://picsum.photos/seed/consult/400/200',
    isPublished: false,
    sortOrder: 3,
    createTime: formatTime(new Date('2025-02-01')),
    updateTime: formatTime(new Date('2025-02-01')),
  },
];

let nextId = 100;

/** 获取下一个ID */
export function getNextId(): number {
  return nextId++;
}
