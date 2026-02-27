/**
 * 介绍信息统一存储工具
 * 使用 LocalStorage 持久化所有介绍信息数据
 */

import type {
  IntroductionStorage,
  CourseIntroInfo,
  CertInfo,
  AboutUsInfo,
  FacultyAll,
  TeacherInfo,
  FacultyApplication,
  FacultyConsultation,
  FacultyApplicationConfig,
  FacultyConsultationConfig,
  CertModule,
  CertType,
  ContactInfo,
  CertModuleId,
} from '@/types/introduction';

const STORAGE_KEY = 'introduction_data';
const STORAGE_VERSION = '1.2'; // 数据版本号

// ==================== 工具函数 ====================

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取当前时间字符串
 */
function getCurrentTime(): string {
  return new Date().toISOString();
}

/**
 * 从LocalStorage获取数据（带版本检查）
 */
function getStorage(): IntroductionStorage {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initStorage();
  }

  try {
    const data = JSON.parse(raw);
    // 检查版本，如果版本不匹配则重新初始化
    if (data.version !== STORAGE_VERSION) {
      console.log('Storage version mismatch, reinitializing...');
      return initStorage();
    }
    return data;
  } catch (error) {
    console.error('Failed to parse storage, reinitializing...', error);
    return initStorage();
  }
}

/**
 * 保存数据到LocalStorage
 */
function setStorage(data: IntroductionStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ==================== 初始化 ====================

/**
 * 初始化默认数据（带版本号）
 */
function initStorage(): IntroductionStorage {
  const defaultData: IntroductionStorage = {
    version: STORAGE_VERSION,
    courseIntro: [],
    certCenter: getDefaultCertData(),
    aboutUs: getDefaultAboutUsData(),
    faculty: getDefaultFacultyData(),
  };
  setStorage(defaultData);
  console.log('Initialized introduction storage with version:', STORAGE_VERSION);
  return defaultData;
}

/**
 * 获取默认认证中心数据（全部已发布状态）
 */
function getDefaultCertData(): CertInfo[] {
  return [
    {
      id: generateId(),
      certType: 'ai_trainer',
      certTitle: '人工智能训练师',
      description: '培养具有人工智能技术训练能力、能够指导人工智能应用开发的专业人才。获取国家认可的职业资格证书，提升职业竞争力。',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=400&fit=crop',
      modules: [
        {
          id: 'evalPlan',
          title: '评价计划',
          content: `
            <h2>评价体系介绍</h2>
            <p>人工智能训练师评价体系采用理论考试与实践操作相结合的方式，全面评估学员的专业能力。</p>

            <h3>评价内容</h3>
            <ul>
              <li><strong>理论考试（40%）</strong>：涵盖人工智能基础理论、机器学习算法、数据处理与分析等知识点</li>
              <li><strong>实操考核（40%）</strong>：包括模型训练、数据预处理、特征工程等实际操作能力</li>
              <li><strong>项目评审（20%）</strong>：综合运用AI技术解决实际问题的项目展示与答辩</li>
            </ul>

            <h3>评价标准</h3>
            <p>• 理论知识：掌握AI核心概念、算法原理和应用场景</p>
            <p>• 实践能力：能够独立完成AI模型的训练、优化和部署</p>
            <p>• 项目经验：具备实际AI项目开发经验，能够解决复杂问题</p>

            <h3>评价流程</h3>
            <ol>
              <li>提交评价申请</li>
              <li>资格审核</li>
              <li>理论考试</li>
              <li>实操考核</li>
              <li>项目评审</li>
              <li>综合评定</li>
              <li>颁发证书</li>
            </ol>
          `,
          isPublished: true,
          sortOrder: 1,
        },
        {
          id: 'gradePublic',
          title: '成绩公示',
          content: `
            <h2>2024年度成绩公示</h2>
            <p>恭喜以下学员通过人工智能训练师认证考试！</p>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f7fa;">
                  <th style="padding: 12px; border: 1px solid #ddd;">姓名</th>
                  <th style="padding: 12px; border: 1px solid #ddd;">理论成绩</th>
                  <th style="padding: 12px; border: 1px solid #ddd;">实操成绩</th>
                  <th style="padding: 12px; border: 1px solid #ddd;">综合成绩</th>
                  <th style="padding: 12px; border: 1px solid #ddd;">评定结果</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">张三</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">85分</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">90分</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">87分</td>
                  <td style="padding: 12px; border: 1px solid #ddd; color: #67c23a;">优秀</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">李四</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">88分</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">85分</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">86分</td>
                  <td style="padding: 12px; border: 1px solid #ddd; color: #67c23a;">优秀</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd;">王五</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">82分</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">88分</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">85分</td>
                  <td style="padding: 12px; border: 1px solid #ddd; color: #e6a23c;">良好</td>
                </tr>
              </tbody>
            </table>

            <p style="margin-top: 20px; color: #909399;">* 成绩公示期为30天，如有异议请联系评价中心</p>
          `,
          isPublished: true,
          sortOrder: 2,
        },
        {
          id: 'register',
          title: '报名咨询',
          content: `
            <h2>报名条件</h2>
            <p>• 具有大专及以上学历，计算机相关专业优先</p>
            <p>• 具备一定的编程基础，了解Python或JavaScript</p>
            <p>• 对人工智能技术有浓厚兴趣</p>
            <p>• 能够保证培训和学习时间</p>

            <h2>报名材料</h2>
            <ul>
              <li>身份证复印件</li>
              <li>学历证书复印件</li>
              <li>工作证明（如有）</li>
              <li>近期免冠证件照2张</li>
              <li>报名申请表</li>
            </ul>

            <h2>培训安排</h2>
            <p><strong>培训周期：</strong>3个月（周末班）/ 2个月（全日制班）</p>
            <p><strong>培训时间：</strong>每周六、周日 9:00-17:00</p>
            <p><strong>培训地点：</strong>在线直播 + 线下实操</p>
            <p><strong>培训费用：</strong>¥12,800（含教材、考试费）</p>

            <h2>联系方式</h2>
            <p><strong>咨询电话：</strong>010-12345678</p>
            <p><strong>咨询邮箱：</strong>cert@example.com</p>
            <p><strong>微信咨询：</strong>AI_Trainer_Cert</p>
          `,
          isPublished: true,
          sortOrder: 3,
        },
      ],
      isPublished: true,
      sortOrder: 1,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      certType: 'ai_engineer',
      certTitle: '人工智能工程技术人员',
      description: '培养掌握人工智能工程技术，能够设计、开发和部署AI应用系统的专业工程师。',
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=400&fit=crop',
      modules: [
        {
          id: 'trainingPlan',
          title: '培训计划',
          content: `
            <h2>培训目标</h2>
            <p>培养具备AI系统工程实践能力，能够独立完成AI项目设计、开发和部署的专业人才。</p>

            <h2>课程体系</h2>
            <h3>第一阶段：基础理论（4周）</h3>
            <ul>
              <li>Python编程进阶</li>
              <li>数据结构与算法</li>
              <li>数据库原理与应用</li>
              <li>Linux系统管理</li>
            </ul>

            <h3>第二阶段：核心技术（8周）</h3>
            <ul>
              <li>机器学习框架（TensorFlow/PyTorch）</li>
              <li>深度学习模型设计</li>
              <li>自然语言处理技术</li>
              <li>计算机视觉应用</li>
            </ul>

            <h3>第三阶段：工程实践（8周）</h3>
            <ul>
              <li>AI模型部署与优化</li>
              <li>AI系统架构设计</li>
              <li>MLOps与模型监控</li>
              <li>项目实战演练</li>
            </ul>

            <h2>培训方式</h2>
            <p>• 线下面授：专家讲师授课，实时答疑</p>
            <p>• 实战项目：真实企业项目案例</p>
            <p>• 小班教学：每班不超过30人</p>
            <p>• 就业指导：简历优化、面试辅导</p>
          `,
          isPublished: true,
          sortOrder: 1,
        },
        {
          id: 'register',
          title: '报名咨询',
          content: `
            <h2>报名条件</h2>
            <p>• 本科及以上学历，计算机、数学、统计等相关专业</p>
            <p>• 具有1年以上Python或Java开发经验</p>
            <p>• 熟悉常用机器学习框架者优先</p>

            <h2>报名流程</h2>
            <ol>
              <li>在线提交报名表</li>
              <li>提交技术作品或项目经验证明</li>
              <li>参加技术面试</li>
              <li>缴纳培训费用</li>
              <li>发放学习资料</li>
            </ol>

            <h2>费用说明</h2>
            <p>培训费用：¥18,800</p>
            <p>包含：培训费、教材费、实验费、考试费</p>
            <p>不包含：食宿费、交通费</p>

            <h2>咨询方式</h2>
            <p><strong>咨询电话：</strong>010-87654321</p>
            <p><strong>咨询时间：</strong>周一至周五 9:00-18:00</p>
          `,
          isPublished: true,
          sortOrder: 2,
        },
      ],
      isPublished: true,
      sortOrder: 2,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      certType: 'drone',
      certTitle: 'CAAC无人机执照',
      description: '中国民航局（CAAC）颁发的无人机驾驶员执照，合法合规从事无人机飞行活动。',
      coverImage: 'https://images.unsplash.com/photo-1527977785344-32aada25aa0?w=1200&h=400&fit=crop',
      modules: [
        {
          id: 'register',
          title: '报名咨询',
          content: `
            <h2>执照类别</h2>
            <p><strong>视距内驾驶员执照：</strong>适用于飞行高度低于120米，距离不超过500米的飞行活动</p>
            <p><strong>超视距驾驶员执照：</strong>适用于视距外飞行，需要通过相应考试</p>
            <p><strong>植保驾驶员执照：</strong>专用于农业植保作业</p>

            <h2>报名条件</h2>
            <p>• 年满16周岁，具有完全民事行为能力</p>
            <p>• 无妨碍安全飞行的疾病</p>
            <p>• 初中学历及以上学历</p>

            <h2>所需材料</h2>
            <ul>
              <li>身份证原件及复印件</li>
              <li>学历证明</li>
              <li>体检合格证明（3个月内有效）</li>
              <li>近期1寸白底照片5张</li>
              <li>报名申请表</li>
            </ul>

            <h2>培训周期</h2>
            <p>• 视距内：15-20天</p>
            <p>• 超视距：30-45天</p>
            <p>• 植保：10-15天</p>

            <h2>收费标准</h2>
            <p>培训费：¥5,800起（根据执照类型）</p>
            <p>考试费：¥300</p>
            <p>执照办理费：¥200</p>
          `,
          isPublished: true,
          sortOrder: 1,
        },
        {
          id: 'trialFlight',
          title: '试飞体验',
          content: `
            <h2>免费试飞体验活动</h2>
            <p>我们提供免费的无人机试飞体验，让您在报名培训前亲身感受无人机飞行的乐趣！</p>

            <h2>体验内容</h2>
            <ul>
              <li>无人机基础知识讲解（15分钟）</li>
              <li>模拟器体验（15分钟）</li>
              <li>真机飞行体验（30分钟）</li>
              <li>飞行轨迹录制与分享</li>
            </ul>

            <h2>体验地点</h2>
            <p><strong>主场地：</strong>北京市朝阳区无人机训练基地</p>
            <p><strong>备选场地：</strong>天津市西青区无人机公园</p>

            <h2>体验时间</h2>
            <p>• 周末：10:00-12:00, 14:00-16:00</p>
            <p>• 工作日：需提前预约</p>

            <h2>预约方式</h2>
            <p><strong>电话预约：</strong>400-123-4567</p>
            <p><strong>微信预约：</strong>扫描二维码添加客服微信</p>
            <p><strong>预约时间：</strong>提前1-3天</p>

            <p style="margin-top: 20px; padding: 15px; background: #ecf5ff; border-left: 4px solid #409eff;">
              <strong>温馨提示：</strong>试飞体验需携带身份证，体验当天请穿着运动鞋和休闲服装。恶劣天气将暂停体验活动。
            </p>
          `,
          isPublished: true,
          sortOrder: 2,
        },
      ],
      isPublished: true,
      sortOrder: 3,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      certType: 'tech_broker',
      certTitle: '技术经纪人',
      description: '培养掌握技术转移、技术评估、技术经纪等专业技能，促进科技成果转化的专业人才。',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc80b5?w=1200&h=400&fit=crop',
      modules: [
        {
          id: 'register',
          title: '报名咨询',
          content: `
            <h2>技术经纪人职责</h2>
            <p>技术经纪人是连接技术创新与市场需求的重要桥梁，主要职责包括：</p>
            <ul>
              <li>技术成果评估与价值判断</li>
              <li>技术交易撮合与谈判</li>
              <li>技术转移项目管理</li>
              <li>知识产权运营</li>
              <li>技术咨询与服务</li>
            </ul>

            <h2>报考条件</h2>
            <p>• 本科及以上学历，理工科专业优先</p>
            <p>• 3年以上技术转移或相关工作经验</p>
            <p>• 具备良好的沟通协调能力</p>
            <p>• 通过技术经纪人资格考试</p>

            <h2>培训内容</h2>
            <p><strong>理论培训：</strong>技术经纪理论、知识产权法律法规、技术市场分析</p>
            <p><strong>实务培训：</strong>技术评估实践、交易模拟、合同撰写</p>
            <p><strong>案例分析：</strong>真实技术转移案例研讨</p>

            <h2>费用信息</h2>
            <p>培训费：¥8,800</p>
            <p>考试费：¥500</p>
            <p>认证费：¥300</p>
            <p><strong>早鸟优惠：</strong>提前30天报名享9折优惠</p>
          `,
          isPublished: true,
          sortOrder: 1,
        },
        {
          id: 'classPlan',
          title: '开班计划',
          content: `
            <h2>2024年度开班计划</h2>

            <h3>第一期（已结业）</h3>
            <p>时间：2024年3月 - 5月</p>
            <p>地点：北京 · 中关村创业大街</p>
            <p>人数：25人</p>

            <h3>第二期（招生中）</h3>
            <p>时间：2024年9月 - 11月</p>
            <p>地点：上海 · 张江高科园区</p>
            <p>人数：30人（剩余12个名额）</p>

            <h3>第三期（计划中）</h3>
            <p>时间：2025年3月 - 5月</p>
            <p>地点：深圳 · 南山科技园</p>
            <p>人数：30人</p>

            <h2>课程安排</h2>
            <p><strong>培训模式：</strong>线上直播 + 线下面授</p>
            <p><strong>课程时长：</strong>3个月（共96学时）</p>
            <p><strong>上课时间：</strong>周末班（周六日 9:00-17:00）</p>
            <p><strong>考核方式：</strong>课程作业 + 闭卷考试 + 项目报告</p>

            <h2>报名方式</h2>
            <p><strong>在线报名：</strong><a href="#">点击填写报名表</a></p>
            <p><strong>电话报名：</strong>400-888-9999</p>
            <p><strong>报名截止：</strong>开班前一周</p>
          `,
          isPublished: true,
          sortOrder: 2,
        },
      ],
      isPublished: true,
      sortOrder: 4,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      certType: 'other',
      certTitle: '其他认证项目',
      description: '提供更多专业化认证培训服务，助力职业发展。',
      coverImage: 'https://images.unsplash.com/photo-1450101499163-c884246d2aa0?w=1200&h=400&fit=crop',
      modules: [
        {
          id: 'pmp',
          title: 'PMP项目管理',
          content: `
            <h2>PMP®项目管理专业人士认证</h2>
            <p>PMP（Project Management Professional）是美国项目管理协会（PMI）推出的全球公认的项目管理专业人士资格认证。</p>

            <h3>认证价值</h3>
            <ul>
              <li>全球公认的黄金标准</li>
              <li>提升项目管理专业能力</li>
              <li>增强职业竞争力</li>
              <li>扩展职业网络</li>
              <li>提高薪酬水平</li>
            </ul>

            <h3>报考要求</h3>
            <p>• 学历要求：本科及以上学历</p>
            <p>• 项目经验：35小时/7500小时</p>
            <p>• 项目管理培训：35小时</p>
            <p>• 通过PMP考试</p>

            <h3>培训服务</h3>
            <p><strong>培训周期：</strong>2个月（周末班）</p>
            <p><strong>培训方式：</strong>线下面授 + 在线练习</p>
            <p><strong>培训费用：</strong>¥5,800（含教材）</p>
            <p><strong>考试费：</strong>¥3,900（PMI官方）</p>

            <h3>服务流程</h3>
            <ol>
              <li>免费咨询与评估</li>
              <li>定制学习计划</li>
              <li>提供培训资料</li>
              <li>考前模拟测试</li>
              <li>考试报名协助</li>
              <li>持续指导与答疑</li>
            </ol>
          `,
          isPublished: true,
          sortOrder: 1,
        },
        {
          id: 'npdp',
          title: 'NPDP产品管理',
          content: `
            <h2>NPDP®新产品开发专业人士认证</h2>
            <p>NPDP（New Product Development Professional）是美国产品开发与管理协会（PDMA）推出的产品管理专业认证。</p>

            <h3>认证收益</h3>
            <ul>
              <li>掌握国际先进的产品开发方法论</li>
              <li>提升产品创新设计能力</li>
              <li>学习世界500强企业实践</li>
              <li>加入产品经理专业社群</li>
              <li>拓展国际视野</li>
            </ul>

            <h3>考试内容</h3>
            <p><strong>NPDP认证考试涵盖六大知识领域：</strong></p>
            <ul>
              <li>新产品战略（20%）</li>
              <li>新产品流程（20%）</li>
              <li>市场研究（20%）</li>
              <li>工具与度量（20%）</li>
              <li>生命周期管理（10%）</li>
li>跨职能团队（10%）</li>
            </ul>

            <h3>培训安排</h3>
            <p><strong>培训时长：</strong>3个月</p>
            <p><strong>学习方式：</strong>在线课程 + 精讲直播</p>
            <p><strong>培训费：</strong>¥6,800</p>
            <p><strong>考试费：</strong>¥4,900（PDMA官方）</p>

            <h3>报名咨询</h3>
            <p>如需了解更多详情或报名咨询，请联系我们：</p>
            <p>电话：010-9999-8888</p>
            <p>邮箱：npdp@example.com</p>
          `,
          isPublished: true,
          sortOrder: 2,
        },
      ],
      isPublished: true,
      sortOrder: 5,
      createTime: getCurrentTime(),
    },
  ];
}

/**
 * 获取默认关于我们数据
 */
function getDefaultAboutUsData(): AboutUsInfo[] {
  return [
    {
      id: generateId(),
      categoryId: 'about',
      subCategoryId: 'research',
      title: '关于研究院',
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop',
      content: `
        <h2>研究院简介</h2>
        <p>我们是一所专注于前沿技术研究和创新的综合性研究机构，致力于推动科技进步与产业发展。研究院依托强大的研发团队和先进的实验设备，在人工智能、大数据、云计算等领域取得了丰硕的研究成果。</p>

        <h2>研究方向</h2>
        <ul>
          <li><strong>人工智能：</strong>深度学习、计算机视觉、自然语言处理、智能决策系统</li>
          <li><strong>大数据技术：</strong>数据分析、数据挖掘、机器学习平台、数据可视化</li>
          <li><strong>云计算：</strong>分布式系统、容器技术、微服务架构、云原生应用</li>
          <li><strong>物联网：</strong>智能传感器、边缘计算、工业互联网、智慧城市</li>
        </ul>

        <h2>科研成果</h2>
        <p>研究院成立以来，已承担国家级科研项目20余项，省部级科研项目50余项，发表高水平学术论文300余篇，申请发明专利100余项，软件著作权200余项。多项研究成果已成功转化为产业应用，创造了显著的经济效益和社会价值。</p>

        <h2>团队实力</h2>
        <p>研究院拥有一支高水平的研发团队，包括教授级研究员30人，副教授级研究员50人，博士研究生100余人。团队成员多来自国内外知名高校和科研院所，具有丰富的科研经验和创新能力。</p>

        <h2>合作交流</h2>
        <p>研究院积极开展国内外合作交流，与多所知名高校和企业建立了长期稳定的合作关系。定期举办学术讲座、技术研讨和成果发布会，促进产学研深度融合。</p>
      `,
      isPublished: true,
      sortOrder: 1,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      categoryId: 'about',
      subCategoryId: 'digital',
      title: '关于数字创新中心',
      coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop',
      content: `
        <h2>中心简介</h2>
        <p>数字创新中心是专注于数字化转型和创新的专业服务机构，致力于帮助企业实现数字化转型升级，提升核心竞争力。中心汇聚了一批数字化领域的专家和技术骨干，具备丰富的项目实施经验和成功案例。</p>

        <h2>核心业务</h2>
        <ul>
          <li><strong>数字化转型咨询：</strong>为企业提供全方位的数字化转型战略规划和实施路径设计</li>
          <li><strong>智能化升级改造：</strong>帮助企业引入人工智能、大数据等技术，实现业务流程智能化</li>
          <li><strong>数字平台建设：</strong>搭建企业级数字化平台，支撑业务创新和管理升级</li>
          <li><strong>数据分析服务：</strong>提供专业的数据分析、挖掘和可视化服务，助力数据驱动决策</li>
          <li><strong>数字人才培养：</strong>开展数字化技能培训，培养企业数字化人才队伍</li>
        </ul>

        <h2>技术优势</h2>
        <p>中心在云计算、大数据、人工智能、区块链等前沿技术领域具有深厚积累，能够为客户提供端到端的数字化解决方案。我们采用敏捷开发和快速迭代的方法论，确保项目快速交付和价值实现。</p>

        <h2>成功案例</h2>
        <p>已为金融、制造、零售、医疗、教育等多个行业的上百家企业提供了数字化转型服务，帮助他们实现了业务创新、效率提升和成本降低。多个项目获得行业创新奖项和最佳实践案例。</p>

        <h2>合作伙伴</h2>
        <p>与国内外领先的科技企业建立了战略合作伙伴关系，包括阿里云、腾讯云、华为、微软等，共同为客户提供更优质的数字化产品和服务。</p>
      `,
      isPublished: true,
      sortOrder: 2,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      categoryId: 'about',
      subCategoryId: 'education',
      title: '关于教育培训中心',
      coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
      content: `
        <h2>中心简介</h2>
        <p>教育培训中心是专业从事职业技能培训和继续教育的机构，致力于培养高素质的技术人才和管理人才。中心拥有完善的教学设施、经验丰富的师资队伍和科学的教学管理体系，为学员提供优质的培训服务。</p>

        <h2>培训特色</h2>
        <ul>
          <li><strong>实战导向：</strong>课程内容紧密结合实际工作场景，注重实践能力培养</li>
          <li><strong>小班教学：</strong>采用小班制教学，确保每位学员都能得到充分指导</li>
          <li><strong>名师授课：</strong>邀请行业专家和资深讲师授课，传授实用技能和经验</li>
          <li><strong>项目实训：</strong>通过真实项目实战，提升学员的项目经验和问题解决能力</li>
          <li><strong>就业服务：</strong>提供就业指导、简历优化、企业对接等全方位就业服务</li>
        </ul>

        <h2>课程体系</h2>
        <p>中心开设了人工智能、大数据、云计算、区块链、物联网、信息安全等热门技术课程，以及项目管理、产品经理、数字化营销等管理类课程。课程涵盖初级、中级、高级不同层次，满足不同学员的学习需求。</p>

        <h2>培训方式</h2>
        <ul>
          <li><strong>线下面授：</strong>在专业培训教室进行面对面授课，便于互动交流</li>
          <li><strong>在线直播：</strong>通过网络平台实时授课，突破地域限制</li>
          <li><strong>录播课程：</strong>预先录制的高质量课程，支持随时随地点播学习</li>
          <li><strong>企业内训：</strong>根据企业需求定制培训方案，提供上门培训服务</li>
        </ul>

        <h2>培训成果</h2>
        <p>中心已累计培训学员超过10000人次，学员就业率保持在95%以上。学员遍布各大知名互联网企业、金融机构、制造业企业等，获得了用人单位的一致好评。</p>

        <h2>认证资质</h2>
        <p>中心是经政府部门批准设立的正规培训机构，具备职业教育培训资质。同时也是多个国际IT厂商的授权培训中心，可以颁发权威认证证书。</p>
      `,
      isPublished: true,
      sortOrder: 3,
      createTime: getCurrentTime(),
    },
    {
      id: generateId(),
      categoryId: 'about',
      subCategoryId: 'contact',
      title: '联系我们',
      coverImage: 'https://images.unsplash.com/photo-1497366811353-697fce868c0f?w=1200&h=400&fit=crop',
      content: `
        <h2>联系方式</h2>
        <p>如果您有任何问题或建议，欢迎随时与我们联系。我们将竭诚为您服务！</p>

        <h2>到访地址</h2>
        <p>地址：北京市海淀区中关村科技园区创新大厦A座15层</p>
        <p>邮编：100080</p>

        <h2>联系方式</h2>
        <ul>
          <li><strong>咨询电话：</strong>010-88888888</li>
          <li><strong>咨询邮箱：</strong>contact@example.com</li>
          <li><strong>微信公众号：</strong>数字创新研究院</li>
        </ul>

        <h2>工作时间</h2>
        <p>周一至周五：上午 9:00-12:00，下午 13:30-18:00</p>
        <p>周末及法定节假日休息</p>

        <h2>交通指南</h2>
        <ul>
          <li><strong>地铁：</strong>4号线中关村站A口出，步行约5分钟</li>
          <li><strong>公交：</strong>多条线路可达，中关村站下车</li>
          <li><strong>自驾：</strong>大厦地下停车场提供充足车位</li>
        </ul>

        <h2>在线咨询</h2>
        <p>您也可以通过我们的官方网站、微信公众号等在线渠道进行咨询和反馈。我们会尽快回复您的咨询。</p>

        <h2>商务合作</h2>
        <p>欢迎各类企业和机构与我们探讨合作机会，共同推进技术创新和人才培养。</p>
        <p>商务合作热线：010-66666666</p>
        <p>商务邮箱：business@example.com</p>
      `,
      contactInfo: {
        phone: '010-88888888',
        email: 'contact@example.com',
        address: '北京市海淀区中关村科技园区创新大厦A座15层',
        qrCode: 'https://via.placeholder.com/200',
        coordinates: '116.3131,39.9830',
        workingHours: '周一至周五 9:00-18:00',
        wechatAccount: '数字创新研究院',
      },
      isPublished: true,
      sortOrder: 4,
      createTime: getCurrentTime(),
    },
  ];
}

/**
 * 获取默认师资队伍数据
 */
function getDefaultFacultyData(): FacultyAll {
  return {
    teachers: [
      {
        id: generateId(),
        name: '张教授',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        title: '首席人工智能专家',
        specialties: ['深度学习', '计算机视觉', '自然语言处理'],
        intro: '<p>张教授是人工智能领域的知名专家，拥有15年以上的研发和教学经验。曾在多家知名互联网企业担任技术顾问，发表SCI论文50余篇，主持国家级科研项目10余项。</p><p>主要研究方向包括深度学习算法优化、计算机视觉应用、自然语言处理等。在人工智能教育领域有着丰富的经验，培养了大批优秀AI工程师。</p>',
        achievements: [
          '国家杰出青年科学基金获得者',
          'IEEE高级会员',
          '人工智能学会常务理事',
          '2023年度AI教育领军人物'
        ],
        isPublished: true,
        sortOrder: 1,
        createTime: getCurrentTime(),
      },
      {
        id: generateId(),
        name: '李博士',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        title: '大数据架构师',
        specialties: ['大数据处理', '数据仓库', '实时计算'],
        intro: '<p>李博士是大数据技术领域的资深专家，曾任职于阿里云、腾讯等一线互联网公司，主导过多个PB级大数据平台建设项目。精通Hadoop、Spark、Flink等主流大数据技术栈。</p><p>在数据仓库设计、实时计算平台搭建、数据分析与挖掘等方面有深厚的技术积累和丰富的实战经验。</p>',
        achievements: [
          'Apache Spark贡献者',
          '大数据技术联盟专家委员会委员',
          '出版技术专著3部',
          '主导建设项目获国家科技进步奖'
        ],
        isPublished: true,
        sortOrder: 2,
        createTime: getCurrentTime(),
      },
      {
        id: generateId(),
        name: '王老师',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        title: '云计算高级讲师',
        specialties: ['云原生', '容器技术', '微服务架构'],
        intro: '<p>王老师是云计算和云原生技术领域的资深专家，拥有10年以上的云计算架构设计和教学经验。曾为多家世界500强企业提供云转型咨询服务。</p><p>精通Kubernetes、Docker、Istio等云原生技术栈，在微服务架构设计、DevOps实践、云安全等方面有深入研究和丰富经验。</p>',
        achievements: [
          'CKA/CKS认证讲师',
          '云原生计算基金会CNCF会员',
          '腾讯云最具价值专家',
          '累计培训学员超5000人'
        ],
        isPublished: true,
        sortOrder: 3,
        createTime: getCurrentTime(),
      },
      {
        id: generateId(),
        name: '陈工程师',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        title: '区块链技术专家',
        specialties: ['区块链技术', '智能合约', '去中心化应用'],
        intro: '<p>陈工程师是区块链技术领域的先行者，从2013年开始涉足区块链行业，参与过多个知名公链和联盟链项目的设计与开发。在区块链底层架构、共识算法、跨链技术等方面有深入研究。</p><p>拥有丰富的区块链项目实战经验，曾主导多个DeFi、NFT等去中心化应用的开发。授课风格生动有趣，善于将复杂的技术概念讲解得通俗易懂。</p>',
        achievements: [
          '以太坊认证开发者',
          '区块链技术国家标准制定组成员',
          '主导项目获区块链创新应用奖',
          '发表区块链技术论文20余篇'
        ],
        isPublished: true,
        sortOrder: 4,
        createTime: getCurrentTime(),
      },
      {
        id: generateId(),
        name: '赵老师',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        title: '物联网技术专家',
        specialties: ['物联网', '边缘计算', '工业互联网'],
        intro: '<p>赵老师是物联网和工业互联网领域的资深专家，拥有12年的物联网系统设计和教学经验。曾主导设计多个智慧城市、工业互联网平台的整体架构。</p><p>精通物联网通信协议、边缘计算架构、工业数据采集与分析等技术。在智能制造、智慧城市、智慧交通等领域有大量成功案例。</p>',
        achievements: [
          '工业互联网产业联盟专家',
          '物联网标准制定组核心成员',
          '主导项目入选工信部试点示范',
          '获得物联网技术专利15项'
        ],
        isPublished: true,
        sortOrder: 5,
        createTime: getCurrentTime(),
      },
      {
        id: generateId(),
        name: '刘博士',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
        title: '网络安全专家',
        specialties: ['网络安全', '渗透测试', '安全运维'],
        intro: '<p>刘博士是网络安全领域的权威专家，拥有16年网络安全从业经验。曾在国家网络安全相关机构担任技术负责人，参与过多起重大网络安全事件的应急处置。</p><p>精通渗透测试、漏洞挖掘、安全运维、应急响应等安全技术。持有CISSP、CEH、OSCP等多项国际安全认证，在网络安全攻防对抗方面经验丰富。</p>',
        achievements: [
          '国家网络安全优秀人才',
          'CISSP/CEH/OSCP认证',
          '网络安全协会技术委员会副主任',
          '出版网络安全专著5部'
        ],
        isPublished: true,
        sortOrder: 6,
        createTime: getCurrentTime(),
      },
    ],
    applicationConfig: {
      isOpen: true,
      description: `
        <h2>加入我们的师资团队</h2>
        <p>我们正在寻找热爱教育事业、技术功底扎实的专业人才加入我们的讲师团队！</p>
        <p>作为我们的讲师，您将有机会：</p>
        <ul>
          <li>分享您的专业知识和技术经验</li>
          <li>培养下一代的IT技术人才</li>
          <li>与行业顶尖专家交流合作</li>
          <li>参与前沿技术课程研发</li>
          <li>获得具有竞争力的课酬报酬</li>
        </ul>
        <p>我们提供完善的培训体系和灵活的授课方式，支持线上直播、线下面授等多种教学形式。</p>
      `,
      requirements: `
        <h2>申请条件</h2>
        <ul>
          <li><strong>学历要求：</strong>本科及以上学历，计算机相关专业优先</li>
          <li><strong>工作经验：</strong>具有5年以上相关技术领域工作经验</li>
          <li><strong>教学经验：</strong>具有2年以上技术培训或教学经验者优先</li>
          <li><strong>专业能力：</strong>在特定技术领域有深入研究和丰富的项目经验</li>
          <li><strong>沟通能力：</strong>具备良好的语言表达能力和逻辑思维能力</li>
          <li><strong>教学热情：</strong>热爱教育事业，愿意投入时间和精力进行教学准备</li>
          <li><strong>时间保障：</strong>能够保证稳定的教学时间投入</li>
        </ul>
        <p><strong>优先考虑：</strong>在知名互联网企业任职、拥有技术专利、发表过技术专著或高水平论文的申请者</p>
      `,
      materials: `
        <h2>申请材料</h2>
        <p>请准备以下材料：</p>
        <ol>
          <li><strong>个人简历：</strong>详细说明教育背景、工作经历、项目经验</li>
          <li><strong>学历证书：</strong>本科及以上学历证书扫描件</li>
          <li><strong>职称证书：</strong>如有高级职称，请提供证书扫描件</li>
          <li><strong>专业认证：</strong>相关技术认证证书（如PMP、AWS、Azure等）</li>
          <li><strong>教学成果：</strong>过往教学经历证明、学员评价等</li>
          <li><strong>技术成果：</strong>技术专利、论文发表、技术博客等证明材料</li>
          <li><strong>试讲视频：</strong>10-15分钟的教学视频（可选，有助于我们了解您的教学风格）</li>
        </ol>
        <p>所有材料请打包发送至邮箱：faculty@example.com，邮件主题注明"应聘讲师-姓名-专业领域"</p>
      `,
    },
    consultationConfig: {
      isOpen: true,
      description: `
        <h2>师资咨询</h2>
        <p>如果您对加入我们的师资团队有任何疑问，或者想了解更多关于合作模式、课酬标准、课程研发等信息，欢迎随时与我们联系！</p>
        <p>我们会尽快回复您的咨询，并为您提供详细的解答。</p>
        <p><strong>咨询热线：</strong>010-12345678</p>
        <p><strong>咨询邮箱：</strong>faculty@example.com</p>
        <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
      `,
    },
    applications: [],
    consultations: [],
  };
}

// ==================== 课程介绍 ====================

export const courseIntroStorage = {
  /**
   * 获取所有课程介绍
   */
  list(): CourseIntroInfo[] {
    const data = getStorage();
    return data.courseIntro;
  },

  /**
   * 获取已发布的课程介绍
   */
  getPublished(): CourseIntroInfo | null {
    const data = getStorage();
    return data.courseIntro.find(item => item.isPublished) || null;
  },

  /**
   * 根据ID获取课程介绍
   */
  getById(id: string): CourseIntroInfo | null {
    const data = getStorage();
    return data.courseIntro.find(item => item.id === id) || null;
  },

  /**
   * 添加课程介绍
   */
  add(info: Omit<CourseIntroInfo, 'id' | 'createTime' | 'sortOrder'>): CourseIntroInfo {
    const data = getStorage();
    const newInfo: CourseIntroInfo = {
      ...info,
      id: generateId(),
      createTime: getCurrentTime(),
      sortOrder: data.courseIntro.length + 1,
    };
    data.courseIntro.push(newInfo);
    setStorage(data);
    return newInfo;
  },

  /**
   * 更新课程介绍
   */
  update(id: string, updates: Partial<CourseIntroInfo>): boolean {
    const data = getStorage();
    const index = data.courseIntro.findIndex(item => item.id === id);
    if (index === -1) return false;

    data.courseIntro[index] = {
      ...data.courseIntro[index],
      ...updates,
      updateTime: getCurrentTime(),
    };
    setStorage(data);
    return true;
  },

  /**
   * 删除课程介绍
   */
  remove(id: string): boolean {
    const data = getStorage();
    const index = data.courseIntro.findIndex(item => item.id === id);
    if (index === -1) return false;

    data.courseIntro.splice(index, 1);
    setStorage(data);
    return true;
  },

  /**
   * 切换发布状态
   */
  togglePublish(id: string): boolean {
    const data = getStorage();
    const item = data.courseIntro.find(item => item.id === id);
    if (!item) return false;

    // 如果要发布，先取消其他已发布的
    if (!item.isPublished) {
      data.courseIntro.forEach(i => (i.isPublished = false));
    }

    item.isPublished = !item.isPublished;
    item.updateTime = getCurrentTime();
    if (item.isPublished) {
      item.publishTime = getCurrentTime();
    }
    setStorage(data);
    return true;
  },
};

// ==================== 认证中心 ====================

export const certCenterStorage = {
  /**
   * 获取所有认证项目
   */
  list(): CertInfo[] {
    const data = getStorage();
    return data.certCenter.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * 根据认证类型获取认证信息
   */
  getByCertType(certType: CertType): CertInfo | null {
    const data = getStorage();
    return data.certCenter.find(item => item.certType === certType) || null;
  },

  /**
   * 更新认证项目基本信息
   */
  updateCert(certType: CertType, updates: Partial<Omit<CertInfo, 'id' | 'certType' | 'modules'>>): boolean {
    const data = getStorage();
    const cert = data.certCenter.find(item => item.certType === certType);
    if (!cert) return false;

    Object.assign(cert, updates, { updateTime: getCurrentTime() });
    setStorage(data);
    return true;
  },

  /**
   * 更新认证模块
   */
  updateModule(certType: CertType, moduleId: string, updates: Partial<CertModule>): boolean {
    const data = getStorage();
    const cert = data.certCenter.find(item => item.certType === certType);
    if (!cert) return false;

    const module = cert.modules.find(m => m.id === moduleId);
    if (!module) return false;

    Object.assign(module, updates);
    cert.updateTime = getCurrentTime();
    setStorage(data);
    return true;
  },

  /**
   * 切换模块发布状态
   */
  toggleModulePublish(certType: CertType, moduleId: string): boolean {
    const data = getStorage();
    const cert = data.certCenter.find(item => item.certType === certType);
    if (!cert) return false;

    const module = cert.modules.find(m => m.id === moduleId);
    if (!module) return false;

    module.isPublished = !module.isPublished;
    cert.updateTime = getCurrentTime();
    setStorage(data);
    return true;
  },

  /**
   * 切换认证项目发布状态
   */
  toggleCertPublish(certType: CertType): boolean {
    const data = getStorage();
    const cert = data.certCenter.find(item => item.certType === certType);
    if (!cert) return false;

    cert.isPublished = !cert.isPublished;
    cert.updateTime = getCurrentTime();
    setStorage(data);
    return true;
  },

  /**
   * 获取所有已发布的模块
   */
  getPublishedModules(certType: CertType): CertModule[] {
    const cert = this.getByCertType(certType);
    if (!cert) return [];
    return cert.modules.filter(m => m.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
  },
};

// ==================== 关于我们 ====================

export const aboutUsStorage = {
  /**
   * 获取所有关于我们信息
   */
  list(): AboutUsInfo[] {
    const data = getStorage();
    return data.aboutUs.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * 根据子类别获取信息
   */
  getBySubCategory(subCategory: string): AboutUsInfo | null {
    const data = getStorage();
    return data.aboutUs.find(item => item.subCategoryId === subCategory) || null;
  },

  /**
   * 获取所有已发布的关于我们信息
   */
  getAllPublished(): Record<string, AboutUsInfo> {
    const data = getStorage();
    const result: Record<string, AboutUsInfo> = {};
    data.aboutUs.filter(item => item.isPublished).forEach(item => {
      result[item.subCategoryId] = item;
    });
    return result;
  },

  /**
   * 更新关于我们信息
   */
  update(subCategory: string, updates: Partial<AboutUsInfo>): boolean {
    const data = getStorage();
    const item = data.aboutUs.find(i => i.subCategoryId === subCategory);
    if (!item) return false;

    Object.assign(item, updates, { updateTime: getCurrentTime() });
    setStorage(data);
    return true;
  },

  /**
   * 更新联系方式
   */
  updateContactInfo(contactInfo: ContactInfo): boolean {
    const data = getStorage();
    const item = data.aboutUs.find(i => i.subCategoryId === 'contact');
    if (!item) return false;

    item.contactInfo = contactInfo;
    item.updateTime = getCurrentTime();
    setStorage(data);
    return true;
  },

  /**
   * 切换发布状态
   */
  togglePublish(subCategory: string): boolean {
    const data = getStorage();
    const item = data.aboutUs.find(i => i.subCategoryId === subCategory);
    if (!item) return false;

    item.isPublished = !item.isPublished;
    item.updateTime = getCurrentTime();
    if (item.isPublished) {
      item.publishTime = getCurrentTime();
    }
    setStorage(data);
    return true;
  },
};

// ==================== 师资队伍 ====================

export const facultyStorage = {
  /**
   * 获取师资队伍完整数据
   */
  getAll(): FacultyAll {
    const data = getStorage();
    return data.faculty;
  },

  // ==================== 讲师管理 ====================

  /**
   * 获取所有讲师
   */
  getTeachers(): TeacherInfo[] {
    const data = getStorage();
    return data.faculty.teachers.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * 获取已发布的讲师（用于前台展示）
   */
  getPublishedTeachers(): TeacherInfo[] {
    const data = getStorage();
    return data.faculty.teachers
      .filter(t => t.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * 根据ID获取讲师
   */
  getTeacherById(id: string): TeacherInfo | null {
    const data = getStorage();
    return data.faculty.teachers.find(t => t.id === id) || null;
  },

  /**
   * 添加讲师
   */
  addTeacher(teacher: Omit<TeacherInfo, 'id' | 'createTime' | 'sortOrder'>): TeacherInfo {
    const data = getStorage();
    const newTeacher: TeacherInfo = {
      ...teacher,
      id: generateId(),
      createTime: getCurrentTime(),
      sortOrder: data.faculty.teachers.length + 1,
    };
    data.faculty.teachers.push(newTeacher);
    setStorage(data);
    return newTeacher;
  },

  /**
   * 更新讲师
   */
  updateTeacher(id: string, updates: Partial<TeacherInfo>): boolean {
    const data = getStorage();
    const teacher = data.faculty.teachers.find(t => t.id === id);
    if (!teacher) return false;

    Object.assign(teacher, updates, { updateTime: getCurrentTime() });
    setStorage(data);
    return true;
  },

  /**
   * 删除讲师
   */
  removeTeacher(id: string): boolean {
    const data = getStorage();
    const index = data.faculty.teachers.findIndex(t => t.id === id);
    if (index === -1) return false;

    data.faculty.teachers.splice(index, 1);
    setStorage(data);
    return true;
  },

  /**
   * 切换讲师展示状态
   */
  toggleTeacherDisplay(id: string): boolean {
    const data = getStorage();
    const teacher = data.faculty.teachers.find(t => t.id === id);
    if (!teacher) return false;

    teacher.isPublished = !teacher.isPublished;
    teacher.updateTime = getCurrentTime();
    setStorage(data);
    return true;
  },

  // ==================== 申请管理 ====================

  /**
   * 获取申请配置
   */
  getApplicationConfig(): FacultyApplicationConfig {
    const data = getStorage();
    return data.faculty.applicationConfig;
  },

  /**
   * 更新申请配置
   */
  updateApplicationConfig(config: Partial<FacultyApplicationConfig>): void {
    const data = getStorage();
    Object.assign(data.faculty.applicationConfig, config);
    setStorage(data);
  },

  /**
   * 获取所有申请
   */
  getApplications(): FacultyApplication[] {
    const data = getStorage();
    return data.faculty.applications.sort((a, b) =>
      new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime()
    );
  },

  /**
   * 添加申请
   */
  addApplication(application: Omit<FacultyApplication, 'id' | 'applyTime' | 'status'>): FacultyApplication {
    const data = getStorage();
    const newApplication: FacultyApplication = {
      ...application,
      id: generateId(),
      applyTime: getCurrentTime(),
      status: 'pending',
    };
    data.faculty.applications.push(newApplication);
    setStorage(data);
    return newApplication;
  },

  /**
   * 更新申请状态
   */
  updateApplicationStatus(id: string, status: 'approved' | 'rejected', reviewer?: string, rejectReason?: string): boolean {
    const data = getStorage();
    const application = data.faculty.applications.find(a => a.id === id);
    if (!application) return false;

    application.status = status;
    application.reviewTime = getCurrentTime();
    application.reviewer = reviewer;
    if (rejectReason) {
      application.rejectReason = rejectReason;
    }
    setStorage(data);
    return true;
  },

  /**
   * 删除申请
   */
  removeApplication(id: string): boolean {
    const data = getStorage();
    const index = data.faculty.applications.findIndex(a => a.id === id);
    if (index === -1) return false;

    data.faculty.applications.splice(index, 1);
    setStorage(data);
    return true;
  },

  // ==================== 咨询管理 ====================

  /**
   * 获取咨询配置
   */
  getConsultationConfig(): FacultyConsultationConfig {
    const data = getStorage();
    return data.faculty.consultationConfig;
  },

  /**
   * 更新咨询配置
   */
  updateConsultationConfig(config: Partial<FacultyConsultationConfig>): void {
    const data = getStorage();
    Object.assign(data.faculty.consultationConfig, config);
    setStorage(data);
  },

  /**
   * 获取所有咨询
   */
  getConsultations(): FacultyConsultation[] {
    const data = getStorage();
    return data.faculty.consultations.sort((a, b) =>
      new Date(b.consultTime).getTime() - new Date(a.consultTime).getTime()
    );
  },

  /**
   * 添加咨询
   */
  addConsultation(consultation: Omit<FacultyConsultation, 'id' | 'consultTime' | 'status'>): FacultyConsultation {
    const data = getStorage();
    const newConsultation: FacultyConsultation = {
      ...consultation,
      id: generateId(),
      consultTime: getCurrentTime(),
      status: 'pending',
    };
    data.faculty.consultations.push(newConsultation);
    setStorage(data);
    return newConsultation;
  },

  /**
   * 回复咨询
   */
  replyConsultation(id: string, reply: string): boolean {
    const data = getStorage();
    const consultation = data.faculty.consultations.find(c => c.id === id);
    if (!consultation) return false;

    consultation.status = 'resolved';
    consultation.reply = reply;
    consultation.replyTime = getCurrentTime();
    setStorage(data);
    return true;
  },

  /**
   * 删除咨询
   */
  removeConsultation(id: string): boolean {
    const data = getStorage();
    const index = data.faculty.consultations.findIndex(c => c.id === id);
    if (index === -1) return false;

    data.faculty.consultations.splice(index, 1);
    setStorage(data);
    return true;
  },
};

// ==================== 导出 ====================

export const introductionStorage = {
  init: initStorage,
  getAll: getStorage,

  courseIntro: courseIntroStorage,
  certCenter: certCenterStorage,
  aboutUs: aboutUsStorage,
  faculty: facultyStorage,
};

export default introductionStorage;
