/**
 * 消息中心测试数据初始化
 * 用于原型展示
 */

import { sendMessageToUser } from './message-storage';

// 模拟用户ID - 根据实际登录用户调整
const MOCK_USER_ID = 'mock_user_001';

// 基础时间偏移（分钟）
const NOW = new Date().toISOString();

/**
 * 初始化测试消息数据
 * @param userId 用户ID，如果不传则使用默认的 MOCK_USER_ID
 */
export function initMockMessageData(userId?: string) {
  const targetUserId = userId || MOCK_USER_ID;

  // 1. 咨询回复 - 包含多轮对话
  initConsultationMessages(targetUserId);

  // 2. 系统通知
  initSystemMessages(targetUserId);

  // 3. 公告
  initAnnouncementMessages(targetUserId);
}

/**
 * 咨询回复（模拟多轮对话）
 */
function initConsultationMessages(userId: string = MOCK_USER_ID) {
  // 第一条咨询 - 多轮回复
  sendMessageToUser({
    userId: userId,
    type: 'consultation',
    title: '关于Python基础课程的咨询',
    content: '您好，我想咨询一下Python基础课程。请问这门课程适合零基础学员吗？需要提前学习什么知识吗？',
    priority: 'normal',
    sourceId: 'consult_001',
    sourceType: 'consultation',
  });

  // 回复1
  setTimeout(() => {
    sendMessageToUser({
      userId: userId,
      type: 'consultation',
      title: '关于Python基础课程的咨询 - 讲师回复',
      content: '同学您好！Python基础课程非常适合零基础学员。课程从最基础的语法开始讲解，不需要提前学习其他知识。',
      priority: 'normal',
      sourceId: 'consult_001',
      sourceType: 'consultation',
    });
  }, 100);

  // 回复2
  setTimeout(() => {
    sendMessageToUser({
      userId: userId,
      type: 'consultation',
      title: '关于Python基础课程的咨询 - 讲师回复',
      content: '如果您有编程兴趣但完全没有经验，建议先观看我们的免费入门视频，对编程有个基本了解后再开始正式学习，效果会更好。',
      priority: 'normal',
      sourceId: 'consult_001',
      sourceType: 'consultation',
    });
  }, 200);

  // 第二条咨询 - 单次回复
  sendMessageToUser({
    userId: userId,
    type: 'consultation',
    title: '机器学习课程咨询',
    content: '请问机器学习课程需要什么数学基础？我对高等数学掌握得不够扎实。',
    priority: 'normal',
    sourceId: 'consult_002',
    sourceType: 'consultation',
  });

  setTimeout(() => {
    sendMessageToUser({
      userId: userId,
      type: 'consultation',
      title: '机器学习课程咨询 - 讲师回复',
      content: '您好！机器学习课程需要一定的数学基础，主要包括线性代数、概率论和微积分。不过我们在课程开始前提供了数学基础预习资料，您可以根据需要学习。如果对某些概念不理解，也可以随时在课程讨论区提问，助教老师会及时解答。',
      priority: 'normal',
      sourceId: 'consult_002',
      sourceType: 'consultation',
    });
  }, 100);

  // 第三条咨询 - 未回复
  sendMessageToUser({
    userId: userId,
    type: 'consultation',
    title: '课程证书认证问题',
    content: '请问完成课程后会颁发什么类型的证书？证书在社会上的认可度如何？',
    priority: 'normal',
    sourceId: 'consult_003',
    sourceType: 'consultation',
  });
}

/**
 * 系统通知
 */
function initSystemMessages(userId: string = MOCK_USER_ID) {
  // 系统通知1 - 重要
  sendMessageToUser({
    userId: userId,
    type: 'system',
    title: '系统维护通知',
    content: '尊敬的用户，我们将于2025年3月8日 02:00-06:00 进行系统升级维护，期间平台将暂停服务。请您提前合理安排学习时间，给您带来的不便敬请谅解。',
    priority: 'high',
  });

  // 系统通知2
  sendMessageToUser({
    userId: userId,
    type: 'system',
    title: '课程进度同步提醒',
    content: '检测到您的学习进度数据存在异常，系统已自动修复。如仍有问题，请联系客服。',
    priority: 'normal',
  });

  // 系统通知3
  sendMessageToUser({
    userId: userId,
    type: 'system',
    title: '账号安全提醒',
    content: '您的账号于近期在新设备上登录，如非本人操作，请立即修改密码。',
    priority: 'high',
  });

  // 系统通知4 - 课程相关
  sendMessageToUser({
    userId: userId,
    type: 'course',
    title: '新章节上线通知',
    content: '您正在学习的《Python全栈开发实战》课程新增了"Flask框架开发"章节，共8课时，快去学习吧！',
    priority: 'normal',
    sourceId: 'course_001',
    sourceType: 'course',
    actionUrl: '/course-learn?id=course_001',
  });

  // 系统通知5 - 订单相关
  sendMessageToUser({
    userId: userId,
    type: 'order',
    title: '支付成功通知',
    content: '您购买的课程《机器学习实战》支付成功，订单号：ORD20250305001',
    priority: 'normal',
    sourceId: 'order_001',
    sourceType: 'order',
  });
}

/**
 * 公告
 */
function initAnnouncementMessages(userId: string = MOCK_USER_ID) {
  // 公告1 - 重要
  sendMessageToUser({
    userId: userId,
    type: 'announcement',
    title: '【重要通知】平台全新升级，学习体验全面升级！',
    content: '亲爱的学员们：\n\n为了提供更好的学习体验，我们将于近期对平台进行全面升级。\n\n升级亮点：\n1. 新增AI智能助教，24小时在线答疑\n2. 优化视频播放器，支持倍速、画中画等功能\n3. 新增学习笔记功能，随时记录学习心得\n4. 升级社区讨论区，互动交流更便捷\n\n感谢您一直以来的支持！',
    priority: 'high',
  });

  // 公告2
  sendMessageToUser({
    userId: userId,
    type: 'announcement',
    title: '【活动通知】春季特惠，课程低至5折！',
    content: '春天到了，学习正当时！平台推出春季特惠活动：\n\n- 全部课程享受5-8折优惠\n- 购买课程包立省更多\n- 新学员注册即送100元优惠券\n\n活动时间：2025年3月1日 - 3月31日\n\n机会难得，不要错过！',
    priority: 'normal',
  });

  // 公告3
  sendMessageToUser({
    userId: userId,
    type: 'announcement',
    title: '【新课程】区块链技术入门课程上线啦！',
    content: '好消息！我们的全新课程《区块链技术入门》正式上线！\n\n课程内容：\n- 区块链基础概念\n- 智能合约开发\n- 去中心化应用（DApp）实践\n- 行业案例分析\n\n适合人群：\n- 对区块链技术感兴趣的初学者\n- 希望转型区块链开发的程序员\n- 想了解行业前景的投资人\n\n现在报名享早鸟优惠！',
    priority: 'normal',
  });

  // 公告4
  sendMessageToUser({
    userId: userId,
    type: 'announcement',
    title: '【学习提醒】课程学习进度排行榜活动开启！',
    content: '为激励大家积极学习，我们推出了学习进度排行榜活动！\n\n活动规则：\n- 每月统计学习时长，前10名学员可获得奖励\n- 第1名：500元学习基金 + 荣誉证书\n- 第2-3名：300元学习基金\n- 第4-10名：100元优惠券\n\n本月榜单将在月底公布，加油学习吧！',
    priority: 'normal',
  });
}

/**
 * 在浏览器控制台调用此函数来初始化测试数据
 * 使用方法：
 * 1. 打开浏览器控制台（F12）
 * 2. 复制下面的代码并粘贴到控制台
 * 3. 刷新页面即可看到测试消息
 */
export const CONSOLE_INIT_CODE = `
// 初始化测试消息数据
import { initMockMessageData } from '/src/utils/mock-message-data';
initMockMessageData();
console.log('测试消息数据初始化完成！');
location.reload();
`;

/**
 * 初始化标记（避免重复初始化）
 */
export const MOCK_DATA_INIT_KEY = 'mock_message_data_initialized';

/**
 * 检查是否已初始化
 */
export function isMockDataInitialized(): boolean {
  return localStorage.getItem(MOCK_DATA_INIT_KEY) === 'true';
}

/**
 * 设置初始化标记
 */
export function setMockDataInitialized() {
  localStorage.setItem(MOCK_DATA_INIT_KEY, 'true');
}
