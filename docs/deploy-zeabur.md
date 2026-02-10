# Zeabur 部署指南

## 为什么选择 Zeabur？

- ✅ 国内团队开发，国内访问速度快
- ✅ 配置简单，类似 Vercel
- ✅ 支持GitHub自动部署
- ✅ 免费额度充足（每月 $5）
- ✅ 支持自定义域名
- ✅ 无需翻墙

---

## 快速部署（3 分钟）

### 1. 注册并登录 Zeabur

访问：https://zeabur.com
- 点击右上角 **"Sign in with GitHub"**
- 授权 Zeabur 访问你的 GitHub

### 2. 创建新项目

1. 登录后会自动跳转到 Dashboard
2. 点击 **"New Project"** 或 **"+ New Project"**
3. 选择 **"Deploy from GitHub repository"**

### 3. 选择仓库

1. 在列表中找到 `responsive-video-courses`
2. 如果没看到，点击 "Configure GitHub apps" 授权
3. 点击仓库右侧的 **"Deploy"** 或 **"Import"**

### 4. 配置服务（重要！）

Zeabur 会自动检测项目类型，但需要手动调整：

#### 基本配置

```
Service Name: responsive-video-courses
Service Type: Static Site (Presets) 或 Vite
```

#### 构建配置

```
Build Command: pnpm run build:antd
Publish Directory: apps/web-antd/dist
```

#### 环境变量

在 **Environment Variables** 中添加：

| Key | Value |
|-----|-------|
| `NODE_VERSION` | `22` |
| `PNPM_VERSION` | `10.10.0` |

### 5. 开始部署

点击 **"Deploy"** 按钮

Zeabur 会：
1. 克隆你的代码
2. 安装依赖（pnpm）
3. 构建项目
4. 部署到全球 CDN

---

## 部署完成

### 获取访问地址

部署成功后（约 2-5 分钟），你会得到：

- **主域名**: `https://responsive-video-courses.zeabur.app`
- 或者自定义的临时域名

### 访问路径

- **主页**: `https://responsive-video-courses.zeabur.app`
- **前台**: `https://responsive-video-courses.zeabur.app/portal`
- **后台**: `https://responsive-video-courses.zeabur.app/admin`
- **登录**: `https://responsive-video-courses.zeabur.app/login`

---

## 自定义域名（可选）

### 1. 准备域名

如果你有自己的域名（如 `yourdomain.com`）

### 2. 在 Zeabur 添加域名

1. 进入项目 → 点击 **"Domains"**
2. 点击 **"Add Custom Domain"**
3. 输入你的域名（如 `app.yourdomain.com`）

### 3. 配置 DNS

Zeabur 会提供 CNAME 记录：
```
Type: CNAME
Name: app (或你的子域名)
Value: [Zeabur 提供的值]
```

在你的域名注册商（阿里云、腾讯云等）添加 DNS 记录。

---

## 自动部署

配置完成后，每次推送代码到 GitHub：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Zeabur 会自动检测并重新部署。

---

## 常见问题

### Q: 构建失败怎么办？

**A:** 检查以下几点：
1. 构建命令是否为 `pnpm run build:antd`
2. 发布目录是否为 `apps/web-antd/dist`
3. Node 版本是否设置为 22

### Q: 如何查看部署日志？

**A:** 在 Zeabur Dashboard → 项目 → 点击部署记录 → 查看 "Logs"

### Q: 国内访问速度如何？

**A:** Zeabur 在国内有节点，访问速度很快，通常 1-2 秒加载。

### Q: 免费额度够用吗？

**A:** 对于原型展示完全够用：
- 每月 $5 免费额度
- 支持无限请求
- 带宽充足

### Q: 如何回滚版本？

**A:** 在项目页面点击 "Deployments" → 选择之前的版本 → 点击 "Redeploy"

---

## 与其他平台对比

| 功能 | Zeabur | Vercel | Cloudflare Pages |
|------|--------|--------|------------------|
| 国内访问 | ⭐⭐⭐⭐⭐ 快 | ⭐⭐ 需翻墙 | ⭐⭐⭐ 较快 |
| 配置难度 | ⭐⭐⭐⭐⭐ 简单 | ⭐⭐⭐⭐⭐ 简单 | ⭐⭐⭐ 一般 |
| 免费额度 | $5/月 | 有限 | 充足 |
| 自动部署 | ✅ | ✅ | ✅ |
| 中文支持 | ✅ | ❌ | ❌ |

---

## 下一步

1. 访问 https://zeabur.com 开始部署
2. 部署成功后分享链接给同事
3. 推送代码自动更新

---

需要帮助？查看 Zeabur 文档：https://zeabur.com/docs
