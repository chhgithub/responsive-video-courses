# Zeabur 404 问题修复指南

## 问题说明

如果您访问 Zeabur 部署的地址时出现 404 错误，这是因为 SPA (单页应用) 需要配置路由重定向。

## 解决方案

### 方法一：在 Zeabur 控制台配置（推荐）

1. **访问 Zeabur Dashboard**
   打开 https://zeabur.com 并登录

2. **进入您的项目**
   点击 `responsive-video-courses` 项目

3. **进入域名设置**
   点击服务卡片 → "Domains" 标签

4. **配置路由重定向**

   找到 "Routing" 或 "Rewrite Rules" 设置，添加以下规则：

   ```
   /*    /index.html    200
   ```

   或者在 Nginx 配置中添加：

   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

5. **保存并重新部署**
   保存设置后，点击 "Redeploy" 重新部署服务

### 方法二：修改服务类型

1. 在 Zeabur 控制台
2. 点击服务 → Settings
3. 将服务类型改为 **"Prebuilt"** 或 **"Dockerfile"**
4. 设置：
   - **Build Command**: `pnpm run build:antd`
   - **Output Directory**: `apps/web-antd/dist`

### 方法三：使用 Nginx 容器（高级）

如果以上方法无效，可以使用 Docker 方式部署：

1. 确保 `Dockerfile` 和 `nginx.conf` 配置正确
2. 在 Zeabur 中选择 Dockerfile 部署方式
3. nginx.conf 应包含：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 验证修复

配置完成后：

1. **访问根路径**：`https://your-domain.zeabur.app`
2. **刷新页面**：应该能正常加载
3. **直接访问子路由**：如 `https://your-domain.zeabur.app/login` 也应该能正常加载

## 快速重新部署

如果修改了配置，需要手动触发重新部署：

1. Zeabur Dashboard → 项目 → Deployments
2. 点击最新部署记录右侧的 "···"
3. 选择 "Redeploy"

## 常见问题

### Q: 配置后还是 404？

**A:** 检查以下几点：
1. 是否保存了配置
2. 是否重新部署了服务
3. 查看部署日志，确认 `_redirects` 文件是否在 dist 目录中

### Q: 如何查看构建日志？

**A:** Zeabur Dashboard → 项目 → 点击部署记录 → "Logs" 标签

### Q: 首页能访问，但刷新后 404？

**A:** 这是典型的 SPA 路由问题，需要配置 Rewrite Rules（如方法一所述）

## 联系支持

如果以上方法都无法解决，请联系 Zeabur 支持：
- 文档：https://zeabur.com/docs
- Discord：https://discord.gg/zeabur
- GitHub Issues：https://github.com/zeabur/zeabur/issues
