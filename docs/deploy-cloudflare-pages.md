# Cloudflare Pages 部署指南

本文档说明如何将项目部署到 Cloudflare Pages。

## 前置条件

- GitHub/GitLab 账号（项目已推送到远程仓库）
- Cloudflare 账号（免费）
- 项目代码已推送到 GitHub

## 部署步骤

### 1. 登录 Cloudflare

访问 [Cloudflare Dashboard](https://dash.cloudflare.com) 并登录。

### 2. 创建 Pages 项目

1. 在左侧菜单找到 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

### 3. 连接 Git 仓库

1. 选择 **GitHub**（需要授权）
2. 从列表中选择你的项目仓库
3. 如果是私有仓库，确保 Cloudflare 有访问权限

### 4. 配置构建设置

在 **Set up builds and deployments** 页面填写以下信息：

| 配置项                     | 值                                     |
| -------------------------- | -------------------------------------- |
| **Project name**           | `responsive-video-courses`（或自定义） |
| **Production branch**      | `main`                                 |
| **Framework preset**       | `None`                                 |
| **Build command**          | `pnpm run build:antd`                  |
| **Build output directory** | `apps/web-antd/dist`                   |

### 5. 配置环境变量

在 **Environment variables** 部分添加：

| 变量名         | 值   | 环境                 |
| -------------- | ---- | -------------------- |
| `NODE_VERSION` | `22` | Production + Preview |

### 6. 开始部署

点击 **Save and Deploy**，Cloudflare 会自动：

1. 克隆你的代码
2. 安装依赖（使用 pnpm）
3. 运行构建命令
4. 部署到全球 CDN

### 7. 获取访问地址

部署完成后（通常 2-5 分钟），你会获得：

- **生产环境**: `https://responsive-video-courses.pages.dev`
- **预览环境**: `https://xxx-yyy.pages.dev`（每次 PR 都会生成）

## 配置自定义域名（可选）

如果你有自己的域名：

1. 在 Cloudflare Pages 项目中，点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `app.yourdomain.com`）
4. Cloudflare 会自动配置 DNS

## 自动部署

配置完成后，以下操作会触发自动部署：

- 推送代码到 `main` 分支 → 部署到生产环境
- 创建 Pull Request → 部署到预览环境
- 合并 PR → 更新生产环境

## 本地验证构建

在部署前，可以本地验证构建是否成功：

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build:antd

# 预览构建结果
pnpm run preview --filter=@vben/web-antd
```

## 常见问题

### Q: 构建失败，提示 pnpm 找不到？

**A:** Cloudflare Pages 默认支持 pnpm，确保 `package.json` 中包含 `packageManager` 字段：

```json
{
  "packageManager": "pnpm@10.10.0"
}
```

### Q: 构建超时？

**A:** Cloudflare Pages 构建时间限制：

- 免费版：10 分钟
- Pro 版：30 分钟

本项目构建时间约 2-3 分钟，免费版足够。

### Q: 国内访问速度？

**A:** Cloudflare 在中国有节点，访问速度一般。如果需要更快的速度，可以考虑：

- 腾讯云静态网站托管
- 阿里云 OSS + CDN

### Q: 如何回滚版本？

**A:** 在 Cloudflare Pages 项目中：

1. 点击 **Deployments**
2. 找到之前的版本
3. 点击 **Rollback** 即可

## 项目文件说明

- `apps/web-antd/public/_redirects` - SPA 路由配置
- `apps/web-antd/public/_headers` - 安全响应头配置
- `vercel.json` - Vercel 配置（不影响 Cloudflare Pages）

## 更新部署

推送代码到 GitHub 后，Cloudflare 会自动部署：

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

## 成本

- **免费额度**：
  - 无限请求
  - 无限带宽
  - 500 次构建/月
  - 单个项目

对于原型展示完全免费！

## 下一步

部署成功后，可以：

1. 将访问地址分享给团队成员
2. 配置自定义域名
3. 设置访问密码（Cloudflare Access）
4. 配置 CI/CD 自动测试
