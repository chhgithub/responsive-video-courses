# IM 渠道接入方案

## 目录

- [1. 方案概述](#1-方案概述)
- [2. 架构设计](#2-架构设计)
- [3. 飞书/Lark 接入](#3飞书lark-接入)
- [4. WhatsApp 接入](#4-whatsapp-接入)
- [5. 统一消息服务实现](#5-统一消息服务实现)
- [6. Webhook 回调处理](#6-webhook-回调处理)
- [7. 部署配置](#7-部署配置)
- [8. 测试与监控](#8-测试与监控)

---

## 1. 方案概述

### 1.1 目标

实现统一的消息推送服务，支持以下渠道：

- **飞书**（国内版）
- **Lark**（国际版）
- **WhatsApp**（全球用户）

### 1.2 技术栈

- **后端**：Node.js + TypeScript
- **HTTP 客户端**：axios
- **Webhook 服务**：Express / Fastify
- **配置管理**：环境变量
- **日志**：winston / pino

### 1.3 渠道对比

| 渠道     | 适用场景 | 消息类型                 | 速率限制  | 审核要求  |
| -------- | -------- | ------------------------ | --------- | --------- |
| 飞书     | 国内企业 | 丰富（文本、卡片、文件） | QPS 20-50 | 企业认证  |
| Lark     | 海外企业 | 同飞书                   | QPS 20-50 | 企业认证  |
| WhatsApp | 全球用户 | 文本、模板、媒体         | 1000+/天  | Meta 审核 |

---

## 2. 架构设计

### 2.1 系统架构

```
┌────────────────────────────────────────────────────────────────────┐
│                         业务系统                                    │
│  - 用户注册                                                        │
│  - 订单通知                                                        │
│  - 学习提醒                                                        │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    IM 统一服务层                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              MessageService (统一接口)                      │   │
│  │  - sendText(channel, userId, content)                      │   │
│  │  - sendCard(channel, userId, card)                         │   │
│  │  - sendMedia(channel, userId, media)                       │   │
│  │  - getUserInfo(channel, userId)                            │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  FeishuAdapter   │  │   LarkAdapter    │  │ WhatsAppAdapter  │
│                  │  │                  │  │                  │
│ - Token管理      │  │ - Token管理      │  │ - Token管理      │
│ - 消息发送       │  │ - 消息发送       │  │ - 消息发送       │
│ - 消息接收       │  │ - 消息接收       │  │ - 消息接收       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 2.2 项目结构

```
src/
├── services/
│   └── im/
│       ├── core/
│       │   ├── message.service.ts      # 统一消息服务
│       │   ├── message.types.ts        # 类型定义
│       │   └── webhook.handler.ts      # Webhook 处理
│       ├── adapters/
│       │   ├── base.adapter.ts         # 基础适配器
│       │   ├── feishu.adapter.ts       # 飞书适配器
│       │   ├── lark.adapter.ts         # Lark 适配器
│       │   └── whatsapp.adapter.ts     # WhatsApp 适配器
│       ├── config/
│       │   └── im.config.ts            # 配置管理
│       └── routes/
│           └── webhook.routes.ts        # Webhook 路由
```

---

## 3. 飞书/Lark 接入

### 3.1 前置准备

#### 3.1.1 创建应用

1. 访问开放平台
   - 飞书：https://open.feishu.cn/
   - Lark：https://open.larksuite.com/

2. 创建自建应用，获取：
   - `App ID`
   - `App Secret`

3. 配置权限：
   - `im:message` (发送消息)
   - `im:message:group_at_msg` (群消息)
   - `im:chat` (获取会话)
   - `contact:user.base:readonly` (获取用户信息)

4. 发布应用并获取凭证

### 3.2 核心实现

#### 3.2.1 类型定义

```typescript
// src/services/im/core/message.types.ts

export enum IMChannel {
  FEISHU = 'feishu',
  LARK = 'lark',
  WHATSAPP = 'whatsapp',
}

export enum MessageType {
  TEXT = 'text',
  CARD = 'card',
  IMAGE = 'image',
  FILE = 'file',
}

export interface BaseMessage {
  channel: IMChannel;
  userId: string;
  type: MessageType;
}

export interface TextMessage extends BaseMessage {
  type: MessageType.TEXT;
  content: string;
}

export interface CardElement {
  tag: 'div' | 'hr' | 'img' | 'button' | 'action';
  text?: { content: string; tag: 'plain_text' | 'lark_md' };
  href?: string;
  content?: string;
}

export interface CardMessage extends BaseMessage {
  type: MessageType.CARD;
  content: {
    title?: { content: string; tag: 'plain_text' };
    content: CardElement[];
  };
}

export interface MediaMessage extends BaseMessage {
  type: MessageType.IMAGE | MessageType.FILE;
  fileKey: string;
  fileName?: string;
}

export type IMessage = TextMessage | CardMessage | MediaMessage;

export interface IMAdapter {
  sendMessage(
    message: IMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
  getUserInfo(userId: string): Promise<{ name: string; avatar?: string }>;
}
```

#### 3.2.2 飞书适配器

```typescript
// src/services/im/adapters/feishu.adapter.ts

import axios, { AxiosInstance } from 'axios';
import { IMessage, IMAdapter } from '../core/message.types';

interface FeishuTokenResponse {
  code: number;
  tenant_access_token: string;
  expire: number;
}

interface FeishuMessageResponse {
  code: number;
  msg: string;
  data?: {
    msg_id: string;
  };
}

export class FeishuAdapter implements IMAdapter {
  private client: AxiosInstance;
  private appId: string;
  private appSecret: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(config: { appId: string; appSecret: string; baseURL: string }) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 10000,
    });
  }

  /**
   * 获取 Tenant Access Token
   */
  private async getAccessToken(): Promise<string> {
    // 如果 token 未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 获取新 token
    const response = await this.client.post<FeishuTokenResponse>(
      '/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: this.appId,
        app_secret: this.appSecret,
      },
    );

    if (response.data.code !== 0) {
      throw new Error(`Failed to get access token: ${response.data.code}`);
    }

    this.accessToken = response.data.tenant_access_token;
    // 提前 5 分钟过期
    this.tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;

    return this.accessToken;
  }

  /**
   * 发送消息
   */
  async sendMessage(
    message: IMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const token = await this.getAccessToken();

      let msgType: string;
      let content: string;

      switch (message.type) {
        case 'text':
          msgType = 'text';
          content = JSON.stringify({ text: message.content });
          break;

        case 'card':
          msgType = 'interactive';
          content = JSON.stringify({
            config: { wide_screen_mode: true },
            header: message.content.title
              ? { title: message.content.title }
              : undefined,
            elements: message.content.content,
          });
          break;

        case 'image':
          msgType = 'image';
          content = JSON.stringify({
            image_key: (message as any).fileKey,
          });
          break;

        case 'file':
          msgType = 'file';
          content = JSON.stringify({
            file_key: (message as any).fileKey,
          });
          break;

        default:
          return { success: false, error: 'Unsupported message type' };
      }

      const response = await this.client.post<FeishuMessageResponse>(
        '/open-apis/message/v4/send',
        {
          msg_type: msgType,
          content: content,
          receive_id: message.userId,
          receive_id_type: 'open_id',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.code === 0) {
        return {
          success: true,
          messageId: response.data.data?.msg_id,
        };
      }

      return {
        success: false,
        error: `Feishu API error: ${response.data.code} - ${response.data.msg}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(
    userId: string,
  ): Promise<{ name: string; avatar?: string }> {
    const token = await this.getAccessToken();

    const response = await this.client.get(
      `/open-apis/contact/v3/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          user_id_type: 'open_id',
        },
      },
    );

    if (response.data.code === 0) {
      const user = response.data.data.user;
      return {
        name: user.name,
        avatar: user.avatar?.avatar_240,
      };
    }

    throw new Error(`Failed to get user info: ${response.data.code}`);
  }
}
```

#### 3.2.3 Lark 适配器

```typescript
// src/services/im/adapters/lark.adapter.ts

// Lark 适配器与飞书几乎相同，只是 API 地址不同
// 可以直接继承 FeishuAdapter 或创建独立实现

import { FeishuAdapter } from './feishu.adapter';

export class LarkAdapter extends FeishuAdapter {
  // Lark API 与飞书 API 完全兼容
  // 只需要在初始化时传入正确的 baseURL 即可
  // baseURL: 'https://open.larksuite.com'
}
```

---

## 4. WhatsApp 接入

### 4.1 前置准备

#### 4.1.1 创建 Meta 应用

1. 访问 [Meta for Developers](https://developers.facebook.com/)

2. 创建新应用：
   - 选择「业务」类型
   - 添加「WhatsApp」产品

3. 配置 WhatsApp：
   - 添加测试号码（或申请正式号码）
   - 获取 `Phone Number ID`
   - 生成 `Access Token`（永久有效）

4. 提交审核（正式环境需要）

### 4.2 核心实现

#### 4.2.1 WhatsApp 适配器

```typescript
// src/services/im/adapters/whatsapp.adapter.ts

import axios, { AxiosInstance } from 'axios';
import { IMessage, IMAdapter, MessageType } from '../core/message.types';

interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }];
}

interface WhatsAppTemplate {
  name: string;
  language: { code: string };
  components?: Array<{
    type: string;
    parameters?: Array<{ type: string; text: string }>;
  }>;
}

export class WhatsAppAdapter implements IMAdapter {
  private client: AxiosInstance;
  private accessToken: string;
  private phoneNumberId: string;
  private baseURL: string;

  constructor(config: {
    accessToken: string;
    phoneNumberId: string;
    baseURL?: string;
  }) {
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.baseURL = config.baseURL || 'https://graph.facebook.com/v19.0';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  /**
   * 格式化手机号
   */
  private formatPhoneNumber(phone: string): string {
    // 移除所有非数字字符
    let cleaned = phone.replace(/\D/g, '');

    // 如果没有国家代码，默认添加中国 +86
    if (!cleaned.startsWith('86') && cleaned.length === 11) {
      cleaned = '86' + cleaned;
    }

    return cleaned;
  }

  /**
   * 发送文本消息
   */
  async sendMessage(message: IMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const userId = this.formatPhoneNumber(message.userId);

      let payload: any = {
        messaging_product: 'whatsapp',
        to: userId,
        type: 'text',
        text: { body: '' },
      };

      switch (message.type) {
        case MessageType.TEXT:
          payload.text.body = message.content;
          break;

        case MessageType.CARD:
          // WhatsApp 不支持卡片，使用带按钮的模板消息
          return this.sendTemplateMessage(userId, message);

        case MessageType.IMAGE:
          payload = {
            messaging_product: 'whatsapp',
            to: userId,
            type: 'image',
            image: {
              link: (message as any).fileKey,
            },
          };
          break;

        case MessageType.FILE:
          payload = {
            messaging_product: 'whatsapp',
            to: userId,
            type: 'document',
            document: {
              link: (message as any).fileKey,
              filename: (message as any).fileName || 'document',
            },
          };
          break;

        default:
          return { success: false, error: 'Unsupported message type' };
      }

      const response = await this.client.post<WhatsAppMessageResponse>(
        `/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.data.messages && response.data.messages.length > 0) {
        return {
          success: true,
          messageId: response.data.messages[0].id,
        };
      }

      return {
        success: false,
        error: 'No message ID returned',
      };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      return {
        success: false,
        error: `WhatsApp API error: ${errorMsg}`,
      };
    }
  }

  /**
   * 发送模板消息
   */
  private async sendTemplateMessage(
    userId: string,
    message: IMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // 将卡片转换为模板消息
    const cardContent = message.content as any;
    const templateName = 'notification_card'; // 需要提前在 WhatsApp 中创建模板

    const template: WhatsAppTemplate = {
      name: templateName,
      language: { code: 'zh_CN' },
    };

    const response = await this.client.post<WhatsAppMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: userId,
        type: 'template',
        template: template,
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (response.data.messages && response.data.messages.length > 0) {
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    }

    return {
      success: false,
      error: 'Failed to send template message',
    };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<{ name: string; avatar?: string }> {
    try {
      const response = await this.client.get(
        `/${this.formatPhoneNumber(userId)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return {
        name: response.data.name || response.data.profile_name || '',
      };
    } catch (error) {
      // WhatsApp 可能无法获取用户名，返回默认值
      return {
        name: 'User',
      };
    }
  }
}
```

---

## 5. 统一消息服务实现

### 5.1 消息服务

```typescript
// src/services/im/core/message.service.ts

import { IMChannel, IMessage } from './message.types';
import { FeishuAdapter } from '../adapters/feishu.adapter';
import { LarkAdapter } from '../adapters/lark.adapter';
import { WhatsAppAdapter } from '../adapters/whatsapp.adapter';

export class MessageService {
  private adapters: Map<IMChannel, any>;

  constructor(config: {
    feishu?: { appId: string; appSecret: string; baseURL: string };
    lark?: { appId: string; appSecret: string; baseURL: string };
    whatsapp?: { accessToken: string; phoneNumberId: string; baseURL?: string };
  }) {
    this.adapters = new Map();

    // 初始化适配器
    if (config.feishu) {
      this.adapters.set(IMChannel.FEISHU, new FeishuAdapter(config.feishu));
    }

    if (config.lark) {
      this.adapters.set(IMChannel.LARK, new LarkAdapter(config.lark));
    }

    if (config.whatsapp) {
      this.adapters.set(
        IMChannel.WHATSAPP,
        new WhatsAppAdapter(config.whatsapp),
      );
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(
    message: IMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const adapter = this.adapters.get(message.channel);

    if (!adapter) {
      return {
        success: false,
        error: `No adapter found for channel: ${message.channel}`,
      };
    }

    return adapter.sendMessage(message);
  }

  /**
   * 批量发送消息
   */
  async sendBatch(
    messages: IMessage[],
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
    const promises = messages.map((msg) => this.sendMessage(msg));
    return Promise.all(promises);
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(channel: IMChannel, userId: string) {
    const adapter = this.adapters.get(channel);

    if (!adapter) {
      throw new Error(`No adapter found for channel: ${channel}`);
    }

    return adapter.getUserInfo(userId);
  }
}
```

### 5.2 配置管理

```typescript
// src/services/im/config/im.config.ts

export const imConfig = {
  feishu: {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    baseURL: process.env.FEISHU_API_URL || 'https://open.feishu.cn',
  },
  lark: {
    appId: process.env.LARK_APP_ID || '',
    appSecret: process.env.LARK_APP_SECRET || '',
    baseURL: process.env.LARK_API_URL || 'https://open.larksuite.com',
  },
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    baseURL: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0',
  },
};
```

### 5.3 导出服务实例

```typescript
// src/services/im/index.ts

import { MessageService } from './core/message.service';
import { imConfig } from './config/im.config';

export const messageService = new MessageService({
  feishu: imConfig.feishu.appId ? imConfig.feishu : undefined,
  lark: imConfig.lark.appId ? imConfig.lark : undefined,
  whatsapp: imConfig.whatsapp.accessToken ? imConfig.whatsapp : undefined,
});

export * from './core/message.types';
export { MessageService } from './core/message.service';
```

---

## 6. Webhook 回调处理

### 6.1 Webhook 处理器

```typescript
// src/services/im/core/webhook.handler.ts

import { Request, Response } from 'express';
import crypto from 'crypto';

interface WebhookEvent {
  channel: string;
  eventType: string;
  data: any;
}

export class WebhookHandler {
  private verifyToken: string;
  private eventHandlers: Map<string, Array<(event: WebhookEvent) => void>>;

  constructor(verifyToken: string) {
    this.verifyToken = verifyToken;
    this.eventHandlers = new Map();
  }

  /**
   * 注册事件处理器
   */
  on(eventType: string, handler: (event: WebhookEvent) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * 验证 Webhook 请求
   */
  private verifySignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return signature === `sha256=${digest}`;
  }

  /**
   * 处理飞书 Webhook
   */
  async handleFeishu(req: Request, res: Response): Promise<void> {
    // 验证挑战（首次验证）
    if (req.body.type === 'url_verification') {
      res.json({ challenge: req.body.challenge });
      return;
    }

    // 处理消息事件
    if (req.body.header?.event_type) {
      const event: WebhookEvent = {
        channel: 'feishu',
        eventType: req.body.header.event_type,
        data: req.body,
      };

      this.emit(event);
    }

    res.json({ code: 0, msg: 'success' });
  }

  /**
   * 处理 Lark Webhook
   */
  async handleLark(req: Request, res: Response): Promise<void> {
    // Lark 与飞书处理逻辑相同
    await this.handleFeishu(req, res);
  }

  /**
   * 处理 WhatsApp Webhook
   */
  async handleWhatsApp(req: Request, res: Response): Promise<void> {
    // 验证 Webhook
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken) {
      res.send(challenge);
      return;
    }

    // 处理消息事件
    if (req.body.entry) {
      for (const entry of req.body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const event: WebhookEvent = {
              channel: 'whatsapp',
              eventType: 'message',
              data: change.value,
            };

            this.emit(event);
          }
        }
      }
    }

    res.status(200).send('OK');
  }

  /**
   * 触发事件处理器
   */
  private emit(event: WebhookEvent) {
    const handlers = this.eventHandlers.get(event.eventType) || [];
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
      }
    });
  }
}
```

### 6.2 Webhook 路由

```typescript
// src/services/im/routes/webhook.routes.ts

import { Router } from 'express';
import { WebhookHandler } from '../core/webhook.handler';

export function createWebhookRoutes(handler: WebhookHandler): Router {
  const router = Router();

  // 飞书 Webhook
  router.post('/feishu', (req, res) => handler.handleFeishu(req, res));

  // Lark Webhook
  router.post('/lark', (req, res) => handler.handleLark(req, res));

  // WhatsApp Webhook
  router.get('/whatsapp', (req, res) => handler.handleWhatsApp(req, res));
  router.post('/whatsapp', (req, res) => handler.handleWhatsApp(req, res));

  return router;
}
```

---

## 7. 部署配置

### 7.1 环境变量

```bash
# .env.example

# 飞书配置
FEISHU_APP_ID=your_feishu_app_id
FEISHU_APP_SECRET=your_feishu_app_secret
FEISHU_API_URL=https://open.feishu.cn

# Lark 配置
LARK_APP_ID=your_lark_app_id
LARK_APP_SECRET=your_lark_app_secret
LARK_API_URL=https://open.larksuite.com

# WhatsApp 配置
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_URL=https://graph.facebook.com/v19.0

# Webhook 配置
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WEBHOOK_SECRET=your_webhook_secret
```

### 7.2 应用集成示例

```typescript
// 在现有应用中使用
import { messageService, IMChannel, MessageType } from '@/services/im';

// 发送文本消息
await messageService.sendMessage({
  channel: IMChannel.FEISHU,
  userId: 'ou_xxxxxxxxxxxxxxxx',
  type: MessageType.TEXT,
  content: '您有新的课程更新！',
});

// 发送卡片消息
await messageService.sendMessage({
  channel: IMChannel.FEISHU,
  userId: 'ou_xxxxxxxxxxxxxxxx',
  type: MessageType.CARD,
  content: {
    title: { content: '课程通知', tag: 'plain_text' },
    content: [
      {
        tag: 'div',
        text: {
          content: '您的课程《Vue3 实战》已更新新章节',
          tag: 'lark_md',
        },
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { content: '立即查看', tag: 'plain_text' },
            type: 'primary',
            url: 'https://your-domain.com/courses/123',
          },
        ],
      },
    ],
  },
});

// 发送 WhatsApp 消息
await messageService.sendMessage({
  channel: IMChannel.WHATSAPP,
  userId: '8613800138000',
  type: MessageType.TEXT,
  content: 'Your course has been updated!',
});
```

### 7.3 Express 集成

```typescript
// app.ts 或 main.ts
import express from 'express';
import { createWebhookRoutes } from '@/services/im/routes/webhook.routes';
import { WebhookHandler } from '@/services/im/core/webhook.handler';

const app = express();

// 创建 Webhook 处理器
const webhookHandler = new WebhookHandler(
  process.env.WEBHOOK_VERIFY_TOKEN || 'default_token',
);

// 注册事件处理器
webhookHandler.on('message', (event) => {
  console.log('Received message:', event);
  // 处理接收到的消息
});

// 挂载 Webhook 路由
app.use('/webhook/im', createWebhookRoutes(webhookHandler));

app.listen(3000);
```

---

## 8. 测试与监控

### 8.1 单元测试

```typescript
// tests/im/feishu.adapter.test.ts

import { FeishuAdapter } from '@/services/im/adapters/feishu.adapter';
import { MessageType } from '@/services/im/core/message.types';

describe('FeishuAdapter', () => {
  let adapter: FeishuAdapter;

  beforeEach(() => {
    adapter = new FeishuAdapter({
      appId: 'test_app_id',
      appSecret: 'test_app_secret',
      baseURL: 'https://mock.feishu.cn',
    });
  });

  test('should send text message', async () => {
    const result = await adapter.sendMessage({
      channel: 'feishu',
      userId: 'test_user',
      type: MessageType.TEXT,
      content: 'Test message',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
```

### 8.2 监控指标

建议监控以下指标：

- **发送成功率**：各渠道消息发送成功比例
- **响应时间**：API 调用耗时
- **错误率**：失败请求比例
- **Token 刷新次数**：认证 token 刷新频率
- **Webhook 接收量**：接收到的回调数量

### 8.3 日志记录

```typescript
// 添加日志中间件
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'im-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'im-combined.log' }),
  ],
});

// 在发送消息时记录
logger.info('IM message sent', {
  channel: message.channel,
  userId: message.userId,
  type: message.type,
  success: result.success,
  messageId: result.messageId,
});
```

---

## 9. 常见问题

### Q1: 飞书消息发送失败，返回 99999999 错误？

**A**: 这是权限不足错误，检查：

1. 应用是否已发布
2. 是否已授予 `im:message` 权限
3. 用户是否在应用的可访问范围内

### Q2: WhatsApp 模板消息被拒绝？

**A**: 模板消息需要提前审核：

1. 在 Meta Business Suite 中创建模板
2. 等待审核通过（通常 24-48 小时）
3. 使用审核通过的模板名称

### Q3: Webhook 验证失败？

**A**: 检查：

1. 飞书/Lark：`Encrypt Key` 是否正确配置
2. WhatsApp：`Verify Token` 是否一致
3. 服务器是否可从公网访问

### Q4: 如何处理用户 ID 映射？

**A**: 建议建立用户 ID 映射表：

```typescript
interface UserIMMapping {
  userId: string; // 系统用户 ID
  feishuOpenId?: string; // 飞书 Open ID
  larkOpenId?: string; // Lark Open ID
  whatsappPhone?: string; // WhatsApp 手机号
}
```

---

## 10. 参考资料

- [飞书开放平台文档](https://open.feishu.cn/document/server-docs/introduction)
- [Lark 开发者文档](https://developer.larksuite.com/doc/)
- [WhatsApp Cloud API 文档](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [飞书消息卡片开发指南](https://open.feishu.cn/document/ukTMukTMukTM/uEjNwUjLxYDM14SM2ATN)

---

**文档版本**: v1.0.0 **最后更新**: 2025-02-09
