<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { paymentConfigStorage, type AlipayConfig, type WechatPayConfig } from '@/utils/payment-config-storage';

const activeTab = ref<'alipay' | 'wechat'>('alipay');
const loading = ref(false);
const testing = ref(false);

// 支付宝配置表单
const alipayForm = ref<AlipayConfig>({
  partnerId: '',
  appId: '',
  privateKey: '',
  alipayPublicKey: '',
  gatewayUrl: 'https://openapi.alipay.com/gateway.do',
  signType: 'RSA2',
  enabled: false,
});

// 微信支付配置表单
const wechatForm = ref<WechatPayConfig>({
  mchId: '',
  appId: '',
  apiKey: '',
  serialNo: '',
  certPath: '',
  keyPath: '',
  apiVersion: 'v3',
  enabled: false,
});

// 加载配置
function loadConfig() {
  loading.value = true;
  try {
    const alipayConfig = paymentConfigStorage.getAlipayConfig();
    const wechatConfig = paymentConfigStorage.getWechatConfig();

    alipayForm.value = { ...alipayConfig };
    wechatForm.value = { ...wechatConfig };
  } catch (error: any) {
    ElMessage.error(error.message || '加载配置失败');
  } finally {
    loading.value = false;
  }
}

// 保存支付宝配置
async function handleSaveAlipay() {
  // 验证必填字段
  if (alipayForm.value.enabled) {
    if (!alipayForm.value.partnerId || !alipayForm.value.appId || !alipayForm.value.privateKey) {
      ElMessage.warning('启用支付时，商户ID、应用ID和应用私钥为必填项');
      return;
    }
  }

  try {
    paymentConfigStorage.updateAlipayConfig(alipayForm.value);
    ElMessage.success('支付宝配置保存成功');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
}

// 保存微信支付配置
async function handleSaveWechat() {
  // 验证必填字段
  if (wechatForm.value.enabled) {
    if (!wechatForm.value.mchId || !wechatForm.value.appId || !wechatForm.value.apiKey) {
      ElMessage.warning('启用支付时，商户号、应用ID和API密钥为必填项');
      return;
    }
  }

  try {
    paymentConfigStorage.updateWechatConfig(wechatForm.value);
    ElMessage.success('微信支付配置保存成功');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
}

// 测试支付宝配置
async function handleTestAlipay() {
  testing.value = true;
  try {
    const result = paymentConfigStorage.testAlipayConfig();
    if (result.success) {
      ElMessage.success(result.message);
    } else {
      ElMessage.error(result.message);
    }
  } catch (error: any) {
    ElMessage.error(error.message || '测试失败');
  } finally {
    testing.value = false;
  }
}

// 测试微信支付配置
async function handleTestWechat() {
  testing.value = true;
  try {
    const result = paymentConfigStorage.testWechatConfig();
    if (result.success) {
      ElMessage.success(result.message);
    } else {
      ElMessage.error(result.message);
    }
  } catch (error: any) {
    ElMessage.error(error.message || '测试失败');
  } finally {
    testing.value = false;
  }
}

// 切换支付宝启用状态
function handleToggleAlipay(enabled: boolean) {
  ElMessageBox.confirm(
    enabled ? '确定要启用支付宝支付吗？' : '确定要禁用支付宝支付吗？',
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    paymentConfigStorage.toggleAlipay(enabled);
    alipayForm.value.enabled = enabled;
    ElMessage.success(enabled ? '已启用支付宝支付' : '已禁用支付宝支付');
  }).catch(() => {
    // 用户取消，恢复状态
  });
}

// 切换微信支付启用状态
function handleToggleWechat(enabled: boolean) {
  ElMessageBox.confirm(
    enabled ? '确定要启用微信支付吗？' : '确定要禁用微信支付吗？',
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    paymentConfigStorage.toggleWechat(enabled);
    wechatForm.value.enabled = enabled;
    ElMessage.success(enabled ? '已启用微信支付' : '已禁用微信支付');
  }).catch(() => {
    // 用户取消，恢复状态
  });
}

// 重置支付宝配置
function handleResetAlipay() {
  loadConfig();
  ElMessage.info('已重置为保存的配置');
}

// 重置微信支付配置
function handleResetWechat() {
  loadConfig();
  ElMessage.info('已重置为保存的配置');
}

onMounted(() => {
  loadConfig();
});
</script>

<template>
  <div class="payment-config">
    <div class="page-header">
      <h2>支付配置</h2>
      <p>配置支付宝和微信支付参数，对接第三方支付体系</p>
    </div>

    <el-card v-loading="loading" class="config-card" shadow="never">
      <el-tabs v-model="activeTab" class="config-tabs">
        <!-- 支付宝配置 -->
        <el-tab-pane label="支付宝" name="alipay">
          <template #label>
            <span class="tab-label">
              <img src="https://gw.alipayobjects.com/zos/antfincdn/FLQiGjYj2A/alipay.svg" class="tab-icon" alt="支付宝" />
              支付宝
            </span>
          </template>

          <el-form :model="alipayForm" label-width="140px" label-position="left">
            <!-- 启用状态 -->
            <el-form-item label="启用状态">
              <el-switch
                v-model="alipayForm.enabled"
                active-text="已启用"
                inactive-text="已禁用"
                @change="handleToggleAlipay"
              />
              <div class="form-tip">启用后用户可以选择支付宝进行支付</div>
            </el-form-item>

            <!-- 商户ID -->
            <el-form-item label="商户ID" required>
              <el-input
                v-model="alipayForm.partnerId"
                placeholder="请输入支付宝商户ID（partner_id）"
                clearable
              />
              <div class="form-tip">支付宝签约的商户ID</div>
            </el-form-item>

            <!-- 应用ID -->
            <el-form-item label="应用ID" required>
              <el-input
                v-model="alipayForm.appId"
                placeholder="请输入应用ID（app_id）"
                clearable
              />
              <div class="form-tip">支付宝开放平台创建的应用ID</div>
            </el-form-item>

            <!-- 应用私钥 -->
            <el-form-item label="应用私钥" required>
              <el-input
                v-model="alipayForm.privateKey"
                type="textarea"
                :rows="4"
                placeholder="请输入应用私钥（RSA2）"
                clearable
              />
              <div class="form-tip">用于签名的私钥，注意保密</div>
            </el-form-item>

            <!-- 支付宝公钥 -->
            <el-form-item label="支付宝公钥">
              <el-input
                v-model="alipayForm.alipayPublicKey"
                type="textarea"
                :rows="4"
                placeholder="请输入支付宝公钥"
                clearable
              />
              <div class="form-tip">用于验签的支付宝公钥</div>
            </el-form-item>

            <!-- 网关URL -->
            <el-form-item label="网关URL">
              <el-input
                v-model="alipayForm.gatewayUrl"
                placeholder="请输入网关URL"
                clearable
              />
              <div class="form-tip">
                正式环境: https://openapi.alipay.com/gateway.do<br>
                沙箱环境: https://openapi.alipaydev.com/gateway.do
              </div>
            </el-form-item>

            <!-- 签名方式 -->
            <el-form-item label="签名方式">
              <el-radio-group v-model="alipayForm.signType">
                <el-radio label="RSA2">RSA2（推荐）</el-radio>
                <el-radio label="RSA">RSA</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button type="primary" @click="handleSaveAlipay">
                保存配置
              </el-button>
              <el-button @click="handleResetAlipay">重置</el-button>
              <el-button
                type="success"
                :loading="testing"
                @click="handleTestAlipay"
              >
                测试配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 微信支付配置 -->
        <el-tab-pane label="微信支付" name="wechat">
          <template #label>
            <span class="tab-label">
              <img src="https://res.wx.qq.com/wxdoc/dist/assets/img/wxpay_logo.eaca51d8.png" class="tab-icon" alt="微信支付" />
              微信支付
            </span>
          </template>

          <el-form :model="wechatForm" label-width="140px" label-position="left">
            <!-- 启用状态 -->
            <el-form-item label="启用状态">
              <el-switch
                v-model="wechatForm.enabled"
                active-text="已启用"
                inactive-text="已禁用"
                @change="handleToggleWechat"
              />
              <div class="form-tip">启用后用户可以选择微信支付</div>
            </el-form-item>

            <!-- 商户号 -->
            <el-form-item label="商户号" required>
              <el-input
                v-model="wechatForm.mchId"
                placeholder="请输入微信支付商户号（mch_id）"
                clearable
              />
              <div class="form-tip">微信支付分配的商户号</div>
            </el-form-item>

            <!-- 应用ID -->
            <el-form-item label="应用ID" required>
              <el-input
                v-model="wechatForm.appId"
                placeholder="请输入应用ID（appid）"
                clearable
              />
              <div class="form-tip">微信开放平台或公众号的应用ID</div>
            </el-form-item>

            <!-- API密钥 -->
            <el-form-item label="API密钥" required>
              <el-input
                v-model="wechatForm.apiKey"
                type="password"
                show-password
                placeholder="请输入API密钥（v3）"
                clearable
              />
              <div class="form-tip">微信支付API v3的密钥（32字节）</div>
            </el-form-item>

            <!-- API证书序列号 -->
            <el-form-item label="证书序列号">
              <el-input
                v-model="wechatForm.serialNo"
                placeholder="请输入API证书序列号"
                clearable
              />
              <div class="form-tip">商户API证书的序列号</div>
            </el-form-item>

            <!-- API版本 -->
            <el-form-item label="API版本">
              <el-radio-group v-model="wechatForm.apiVersion">
                <el-radio label="v3">v3（最新版）</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 商户证书路径 -->
            <el-form-item label="商户证书">
              <el-input
                v-model="wechatForm.certPath"
                placeholder="请输入商户证书路径（可选）"
                clearable
              />
              <div class="form-tip">apiclient_cert.pem 文件路径</div>
            </el-form-item>

            <!-- 商户私钥路径 -->
            <el-form-item label="商户私钥">
              <el-input
                v-model="wechatForm.keyPath"
                placeholder="请输入商户私钥路径（可选）"
                clearable
              />
              <div class="form-tip">apiclient_key.pem 文件路径</div>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button type="primary" @click="handleSaveWechat">
                保存配置
              </el-button>
              <el-button @click="handleResetWechat">重置</el-button>
              <el-button
                type="success"
                :loading="testing"
                @click="handleTestWechat"
              >
                测试配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 配置说明 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>配置说明</span>
        </div>
      </template>

      <div class="info-content">
        <h3>🔐 安全提示</h3>
        <ul>
          <li>私钥、密钥等敏感信息请妥善保管，不要泄露</li>
          <li>生产环境和测试环境建议使用不同的商户号</li>
          <li>定期更换密钥和证书以确保安全</li>
        </ul>

        <h3>📚 文档参考</h3>
        <ul>
          <li><a href="https://opendocs.alipay.com/open/02ivbs" target="_blank">支付宝开放平台文档</a></li>
          <li><a href="https://pay.weixin.qq.com/wiki/doc/api/index.html" target="_blank">微信支付开发文档</a></li>
        </ul>

        <h3>⚙️ 配置步骤</h3>
        <ol>
          <li>在支付宝/微信开放平台注册并创建应用</li>
          <li>获取商户号、应用ID等信息</li>
          <li>生成并下载密钥和证书</li>
          <li>在上方表单中填写配置信息</li>
          <li>点击"保存配置"保存设置</li>
          <li>点击"测试配置"验证配置是否正确</li>
          <li>开启启用状态，前端即可使用该支付方式</li>
        </ol>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.payment-config {
  padding: $spacing-large;

  .page-header {
    margin-bottom: $spacing-extra-large;

    h2 {
      font-size: $font-size-extra-large;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    p {
      color: $text-color-secondary;
    }
  }

  .config-card {
    margin-bottom: $spacing-large;
  }

  .config-tabs {
    .tab-label {
      display: flex;
      align-items: center;
      gap: $spacing-small;
      font-size: $font-size-medium;

      .tab-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
    }
  }

  .form-tip {
    font-size: $font-size-small;
    color: $text-color-placeholder;
    margin-top: $spacing-small;
    line-height: 1.5;
  }

  .info-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: $spacing-small;

      .el-icon {
        font-size: 20px;
        color: #409eff;
      }

      span {
        font-size: $font-size-large;
        font-weight: 600;
        color: $text-color-primary;
      }
    }
  }

  .info-content {
    h3 {
      font-size: $font-size-medium;
      font-weight: 600;
      color: $text-color-primary;
      margin: $spacing-large 0 $spacing-base;

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      list-style: none;
      padding-left: 0;
      margin-bottom: $spacing-base;

      li {
        position: relative;
        padding-left: $spacing-large + $spacing-small;
        margin-bottom: $spacing-small;
        line-height: 1.6;
        color: $text-color-secondary;

        &::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #409eff;
          font-size: 18px;
          font-weight: bold;
        }
      }
    }

    ol {
      padding-left: $spacing-large;
      margin-bottom: $spacing-base;

      li {
        margin-bottom: $spacing-small;
        line-height: 1.6;
        color: $text-color-secondary;
      }
    }

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
