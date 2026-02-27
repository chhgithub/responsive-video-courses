<script setup lang="ts">
import { ref } from 'vue';

const contactInfo = ref({
  title: '联系我们',
  phone: '400-123-4567',
  fax: '010-12345678',
  email: 'contact@example.com',
  website: 'https://www.example.com',
  address: '北京市海淀区中关村科技园',
  zipCode: '100080',
  workingHours: {
    weekdays: '周一至周五 9:00 - 18:00',
    weekend: '周六至周日 休息',
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
});

const formData = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
});

function handleSubmit() {
  ElMessage.success('感谢您的留言，我们会尽快回复！');
  formData.value = { name: '', email: '', phone: '', message: '' };
}
</script>

<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1>{{ contactInfo.title }}</h1>
        <p>我们随时为您提供帮助</p>
      </div>
    </div>

    <!-- 联系方式 -->
    <el-card class="contact-info-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="12" :sm="6" v-if="contactInfo.phone">
          <div class="contact-item orange">
            <div class="contact-icon">📞</div>
            <p class="contact-label">咨询电话</p>
            <p class="contact-value">{{ contactInfo.phone }}</p>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" v-if="contactInfo.fax">
          <div class="contact-item blue">
            <div class="contact-icon">📠</div>
            <p class="contact-label">传真号码</p>
            <p class="contact-value">{{ contactInfo.fax }}</p>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" v-if="contactInfo.email">
          <div class="contact-item green">
            <div class="contact-icon">📧</div>
            <p class="contact-label">电子邮箱</p>
            <p class="contact-value">{{ contactInfo.email }}</p>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" v-if="contactInfo.website">
          <div class="contact-item purple">
            <div class="contact-icon">🌐</div>
            <p class="contact-label">官方网站</p>
            <p class="contact-value">{{ contactInfo.website }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 地址信息 -->
    <el-card v-if="contactInfo.address" class="address-card" shadow="never">
      <div class="address-info">
        <p class="address-text">📍 {{ contactInfo.address }}</p>
        <p v-if="contactInfo.zipCode" class="zip-text">📮 邮政编码：{{ contactInfo.zipCode }}</p>
      </div>
    </el-card>

    <!-- 工作时间 -->
    <el-card v-if="contactInfo.workingHours" class="hours-card" shadow="never">
      <h3>⏰ 工作时间</h3>
      <div class="hours-info">
        <p v-if="contactInfo.workingHours.weekdays">{{ contactInfo.workingHours.weekdays }}</p>
        <p v-if="contactInfo.workingHours.weekend">{{ contactInfo.workingHours.weekend }}</p>
      </div>
    </el-card>

    <!-- 办事处 -->
    <el-card v-if="contactInfo.offices && contactInfo.offices.length > 0" class="offices-card" shadow="never">
      <h2>办事处地址</h2>
      <el-row :gutter="24" class="offices-grid">
        <el-col :xs="24" :sm="12" :md="8" v-for="office in contactInfo.offices" :key="office.city">
          <div class="office-item">
            <h3>{{ office.city }}</h3>
            <p class="office-address">📍 {{ office.address }}</p>
            <p class="office-phone">📞 {{ office.phone }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 二维码 -->
    <el-card v-if="contactInfo.qrcodes && contactInfo.qrcodes.length > 0" class="qrcode-card" shadow="never">
      <h2>关注我们</h2>
      <el-row :gutter="24" class="qrcode-grid">
        <el-col :xs="24" :sm="12" :md="8" v-for="social in contactInfo.qrcodes" :key="social.name">
          <div class="social-item">
            <el-image v-if="social.image" :src="social.image" :alt="social.name" class="qrcode-image" fit="cover" />
            <div class="social-icon">📱</div>
            <p class="social-name">{{ social.name }}</p>
            <p v-if="social.followers" class="social-followers">粉丝数：{{ social.followers }}</p>
            <p class="social-hint">扫码关注</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 在线留言 -->
    <el-card class="message-card" shadow="never">
      <h2>在线留言</h2>
      <el-form :model="formData" label-width="100px" class="message-form">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" required>
              <el-input v-model="formData.name" placeholder="请输入您的姓名" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" required>
              <el-input v-model="formData.phone" placeholder="请输入您的联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="电子邮箱" required>
          <el-input v-model="formData.email" placeholder="请输入您的邮箱" />
        </el-form-item>
        <el-form-item label="留言内容" required>
          <el-input v-model="formData.message" type="textarea" :rows="4" placeholder="请输入您的留言内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="handleSubmit" style="width: 100%">提交留言</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.contact-page {
  min-height: calc(100vh - $navbar-height - $footer-height);
  background: $background-color-base;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.hero-section {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: #fff;
  padding: $spacing-extra-extra-large 0;
  text-align: center;
  margin-bottom: $spacing-extra-large;

  h1 {
    font-size: 48px;
    margin-bottom: $spacing-base;
  }

  p {
    font-size: $font-size-large;
    opacity: 0.9;
  }
}

.contact-info-card {
  margin-bottom: $spacing-extra-large;

  .contact-item {
    text-align: center;
    padding: $spacing-extra-large;
    border-radius: $border-radius-large;

    &.orange {
      background: #fff7ed;
    }

    &.blue {
      background: #eff6ff;
    }

    &.green {
      background: #f0fdf4;
    }

    &.purple {
      background: #faf5ff;
    }

    .contact-icon {
      font-size: 48px;
      margin-bottom: $spacing-base;
    }

    .contact-label {
      font-size: $font-size-small;
      color: $text-color-secondary;
      margin-bottom: $spacing-small;
    }

    .contact-value {
      font-size: $font-size-large;
      font-weight: 600;
      margin: 0;

      @include respond-to($breakpoint-sm) {
        font-size: $font-size-base;
      }
    }
  }
}

.address-card {
  margin-bottom: $spacing-extra-large;

  .address-info {
    text-align: center;

    .address-text {
      font-size: $font-size-large;
      color: $text-color-primary;
      margin-bottom: $spacing-small;
    }

    .zip-text {
      font-size: $font-size-base;
      color: $text-color-secondary;
      margin: 0;
    }
  }
}

.hours-card {
  margin-bottom: $spacing-extra-large;

  h3 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .hours-info {
    text-align: center;

    p {
      font-size: $font-size-base;
      color: $text-color-regular;
      margin-bottom: $spacing-small;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.offices-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .offices-grid {
    .office-item {
      padding: $spacing-large;
      background: #f9fafc;
      border-radius: $border-radius-large;

      h3 {
        font-size: $font-size-large;
        font-weight: 600;
        color: $text-color-primary;
        margin-bottom: $spacing-base;
      }

      .office-address {
        font-size: $font-size-base;
        color: $text-color-regular;
        margin-bottom: $spacing-small;
      }

      .office-phone {
        font-size: $font-size-base;
        color: $text-color-secondary;
        margin: 0;
      }
    }
  }
}

.qrcode-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .qrcode-grid {
    .social-item {
      text-align: center;
      padding: $spacing-large;
      border: 2px solid $border-color-light;
      border-radius: $border-radius-large;
      transition: border-color 0.3s;

      &:hover {
        border-color: $--el-color-primary;
      }

      .qrcode-image {
        width: 120px;
        height: 120px;
        margin: 0 auto $spacing-base;
      }

      .social-icon {
        font-size: 64px;
        margin-bottom: $spacing-base;
      }

      .social-name {
        font-size: $font-size-medium;
        font-weight: 600;
        color: $text-color-primary;
        margin-bottom: $spacing-small;
      }

      .social-followers {
        font-size: $font-size-small;
        color: $text-color-secondary;
        margin-bottom: $spacing-small;
      }

      .social-hint {
        font-size: $font-size-extra-small;
        color: $text-color-placeholder;
        margin: 0;
      }
    }
  }
}

.message-card {
  margin-bottom: $spacing-extra-large;

  h2 {
    font-size: 24px;
    margin-bottom: $spacing-large;
    text-align: center;
  }

  .message-form {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
