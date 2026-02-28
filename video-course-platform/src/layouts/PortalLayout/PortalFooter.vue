<script setup lang="ts">
// 前台页脚组件
</script>

<template>
  <footer class="portal-footer">
    <div class="container">
      <div class="footer-content">
        <!-- 关于我们 -->
        <div class="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><router-link to="/portal/about/research">关于研究院</router-link></li>
            <li><router-link to="/portal/about/digital">数字创新中心</router-link></li>
            <li><router-link to="/portal/about/education">教育培训中心</router-link></li>
            <li><router-link to="/portal/about/contact">联系我们</router-link></li>
          </ul>
        </div>

        <!-- 课程中心 -->
        <div class="footer-section">
          <h3>课程中心</h3>
          <ul>
            <li><router-link to="/portal/courses">全部课程</router-link></li>
            <li><router-link to="/portal/cert">认证中心</router-link></li>
            <li><router-link to="/portal/teachers">师资队伍</router-link></li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div class="footer-section">
          <h3>联系方式</h3>
          <ul>
            <li>电话：400-123-4567</li>
            <li>邮箱：info@example.com</li>
            <li>地址：某市某区某街道123号</li>
          </ul>
        </div>

        <!-- 关注我们 -->
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <el-button circle>
              <el-icon><Platform /></el-icon>
            </el-button>
            <el-button circle>
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 视频课程平台. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.portal-footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding: $spacing-extra-extra-large 0 $spacing-large;
  margin-top: auto;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 $spacing-large;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-extra-large;
  margin-bottom: $spacing-extra-large;
}

.footer-section {
  h3 {
    font-size: $font-size-large;
    margin-bottom: $spacing-large;
    color: #fff;
  }

  ul {
    list-style: none;
    li {
      margin-bottom: $spacing-small;
      a {
        color: #bdc3c7;
        text-decoration: none;
        transition: $transition-base;

        &:hover {
          color: $--el-color-primary;
        }
      }
    }
  }

  .social-links {
    display: flex;
    gap: $spacing-base;
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: $spacing-large;
  text-align: center;
  color: #95a5a6;
}
</style>
