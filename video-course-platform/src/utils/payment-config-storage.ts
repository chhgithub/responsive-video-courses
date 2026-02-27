/**
 * 支付配置存储工具
 * 用于管理支付宝和微信支付的配置信息
 */

const STORAGE_KEY = 'payment_config';
const STORAGE_VERSION = '1.0';

// 支付类型
export type PaymentType = 'alipay' | 'wechat';

// 支付配置接口
export interface AlipayConfig {
  partnerId: string;        // 商户ID
  appId: string;            // 应用ID
  privateKey: string;       // 应用私钥
  alipayPublicKey: string;  // 支付宝公钥
  gatewayUrl: string;       // 网关URL
  signType: string;         // 签名方式
  enabled: boolean;         // 是否启用
}

export interface WechatPayConfig {
  mchId: string;           // 商户号
  appId: string;           // 应用ID
  apiKey: string;          // API密钥 (v3)
  serialNo: string;         // API证书序列号
  certPath?: string;        // 商户证书路径
  keyPath?: string;         // 商户私钥路径
  apiVersion: string;      // API版本
  enabled: boolean;        // 是否启用
}

export interface PaymentConfig {
  version: string;
  alipay: AlipayConfig;
  wechat: WechatPayConfig;
  updatedAt: string;
}

// 工具函数
function generateId(): string {
  return `${Date.now()}`;
}

function getCurrentTime(): string {
  return new Date().toISOString();
}

/**
 * 获取存储数据
 */
function getStorage(): PaymentConfig | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (data.version !== STORAGE_VERSION) {
      console.log('Payment config version mismatch, reinitializing...');
      return initStorage();
    }
    return data;
  } catch (error) {
    console.error('Failed to parse payment config:', error);
    return initStorage();
  }
}

/**
 * 保存存储数据
 */
function setStorage(data: PaymentConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 初始化默认支付配置
 */
function initStorage(): PaymentConfig {
  const defaultConfig: PaymentConfig = {
    version: STORAGE_VERSION,
    alipay: {
      partnerId: '',
      appId: '',
      privateKey: '',
      alipayPublicKey: '',
      gatewayUrl: 'https://openapi.alipay.com/gateway.do',
      signType: 'RSA2',
      enabled: false,
    },
    wechat: {
      mchId: '',
      appId: '',
      apiKey: '',
      serialNo: '',
      apiVersion: 'v3',
      enabled: false,
    },
    updatedAt: getCurrentTime(),
  };

  setStorage(defaultConfig);
  return defaultConfig;
}

// ==================== 导出接口 ====================

export const paymentConfigStorage = {
  /**
   * 获取所有支付配置
   */
  getAll(): PaymentConfig {
    const config = getStorage();
    if (!config) {
      return initStorage();
    }
    return config;
  },

  /**
   * 获取支付宝配置
   */
  getAlipayConfig(): AlipayConfig {
    const config = this.getAll();
    return config.alipay;
  },

  /**
   * 获取微信支付配置
   */
  getWechatConfig(): WechatPayConfig {
    const config = this.getAll();
    return config.wechat;
  },

  /**
   * 更新支付宝配置
   */
  updateAlipayConfig(data: Partial<AlipayConfig>): PaymentConfig {
    const config = this.getAll();
    config.alipay = { ...config.alipay, ...data };
    config.updatedAt = getCurrentTime();
    setStorage(config);
    return config;
  },

  /**
   * 更新微信支付配置
   */
  updateWechatConfig(data: Partial<WechatPayConfig>): PaymentConfig {
    const config = this.getAll();
    config.wechat = { ...config.wechat, ...data };
    config.updatedAt = getCurrentTime();
    setStorage(config);
    return config;
  },

  /**
   * 启用/禁用支付宝
   */
  toggleAlipay(enabled: boolean): PaymentConfig {
    return this.updateAlipayConfig({ enabled });
  },

  /**
   * 启用/禁用微信支付
   */
  toggleWechat(enabled: boolean): PaymentConfig {
    return this.updateWechatConfig({ enabled });
  },

  /**
   * 测试支付宝配置
   */
  testAlipayConfig(): { success: boolean; message: string } {
    const config = this.getAlipayConfig();

    if (!config.partnerId || !config.appId || !config.privateKey) {
      return {
        success: false,
        message: '配置不完整，请检查必填项'
      };
    }

    if (!config.enabled) {
      return {
        success: false,
        message: '支付宝支付未启用'
      };
    }

    // 这里可以添加实际的测试请求
    return {
      success: true,
      message: '支付宝配置测试通过'
    };
  },

  /**
   * 测试微信支付配置
   */
  testWechatConfig(): { success: boolean; message: string } {
    const config = this.getWechatConfig();

    if (!config.mchId || !config.appId || !config.apiKey) {
      return {
        success: false,
        message: '配置不完整，请检查必填项'
      };
    }

    if (!config.enabled) {
      return {
        success: false,
        message: '微信支付未启用'
      };
    }

    // 这里可以添加实际的测试请求
    return {
      success: true,
      message: '微信支付配置测试通过'
    };
  },

  /**
   * 获取已启用的支付方式列表
   */
  getEnabledPaymentTypes(): PaymentType[] {
    const config = this.getAll();
    const types: PaymentType[] = [];

    if (config.alipay.enabled) {
      types.push('alipay');
    }
    if (config.wechat.enabled) {
      types.push('wechat');
    }

    return types;
  },
};

export default paymentConfigStorage;
