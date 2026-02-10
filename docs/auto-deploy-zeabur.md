# Zeabur 自动部署配置指南

## 方式一：Zeabur GitHub 集成（推荐，最简单）

只需配置一次，以后完全自动！

### 步骤 1：在 Zeabur 创建项目

1. 访问 https://zeabur.com
2. 点击 **"Sign in with GitHub"** 登录
3. 点击 **"New Project"** → **"Deploy from GitHub repository"**
4. 选择 `responsive-video-courses` 仓库
5. 点击 **"Import"** 或 **"Deploy"**

### 步骤 2：等待首次部署完成

Zeabur 会自动读取 `zeabur.yml` 配置文件，包括：
- 构建命令：`pnpm run build:antd`
- 发布目录：`apps/web-antd/dist`
- Node 版本：22

### 步骤 3：获取访问地址

部署成功后（约 2-5 分钟），您会得到：
```
https://responsive-video-courses.zeabur.app
```

### 步骤 4：享受自动部署！

配置完成后，每次推送代码到 main 分支，Zeabur 会自动部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

**无需任何手动操作！**

---

## 方式二：使用 GitHub Actions（已配置）

项目已配置 `.github/workflows/deploy-zeabur.yml`，需要先获取 Token：

### 步骤 1：获取 Zeabur Token

1. 登录 https://zeabur.com
2. 点击右上角头像 → **Settings** → **Tokens**
3. 点击 **"Create New Token"**
4. 复制生成的 Token

### 步骤 2：添加到 GitHub Secrets

1. 访问：https://github.com/chhgithub/responsive-video-courses/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 添加以下内容：

| Name | Secret |
|------|--------|
| `ZEABUR_TOKEN` | `粘贴你复制的 Token` |

### 步骤 3：触发部署

推送任意代码或创建空提交：

```bash
git commit --allow-empty -m "测试 Zeabur 部署"
git push origin main
```

---

## 访问地址

部署成功后，通过以下地址访问：

- **主页**：https://responsive-video-courses.zeabur.app
- **前台**：https://responsive-video-courses.zeabur.app/portal
- **后台**：https://responsive-video-courses.zeabur.app/admin

---

## 工作流程

```
推送代码到 GitHub
       ↓
Zeabur 自动检测
       ↓
安装依赖 (pnpm install)
       ↓
构建项目 (pnpm run build:antd)
       ↓
部署到 Zeabur CDN
       ↓
✅ 部署成功，立即可访问
```

---

## 两种方式对比

| 特性 | 方式一（GitHub 集成） | 方式二（GitHub Actions） |
|------|---------------------|------------------------|
| 配置难度 | ⭐⭐⭐⭐⭐ 超简单 | ⭐⭐⭐ 需要配置 Token |
| 部署速度 | ⭐⭐⭐⭐⭐ 快 | ⭐⭐⭐⭐ 较快 |
| 日志查看 | Zeabur Dashboard | GitHub Actions |
| 推荐度 | ✅ 强烈推荐 | ✅ 可选 |

---

## 常见问题

### Q: 如何查看部署状态？

**A:** 访问 Zeabur Dashboard：https://zeabur.com → 点击项目 → 查看 Deployments

### Q: 部署失败怎么办？

**A:** 在 Zeabur Dashboard 查看构建日志，常见问题：
- Node 版本不匹配
- 构建命令错误
- 依赖安装失败

### Q: 国内访问速度如何？

**A:** Zeabur 在国内有节点，访问速度很快，通常 1-2 秒加载完成。

### Q: 如何回滚版本？

**A:** Zeabur Dashboard → Deployments → 选择旧版本 → 点击 Redeploy

---

## 下一步

1. 访问 https://zeabur.com 开始配置
2. 首次部署完成后分享链接给同事
3. 以后推送代码自动更新，无需任何操作

---

需要帮助？查看 Zeabur 文档：https://zeabur.com/docs
