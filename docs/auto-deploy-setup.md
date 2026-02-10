# 自动部署配置指南

已为你配置好 **GitHub Actions 自动部署**！

每次你推送代码到 GitHub，系统会自动：
1. ✅ 构建项目
2. ✅ 部署到 Cloudflare Pages
3. ✅ 更新访问地址

---

## 首次配置（只需 1 分钟）

### 1. 打开 GitHub 仓库设置

访问：https://github.com/chhgithub/responsive-video-courses/settings/secrets/actions

### 2. 添加 Cloudflare API Token

点击 **"New repository secret"**，添加：

| Name | Secret |
|------|--------|
| `CLOUDFLARE_API_TOKEN` | `6WuyQ0X0W7ncOP3Zv0_RmeeiTxLK0FTh0kRtKIeC` |

### 3. 添加 Cloudflare Account ID

点击 **"New repository secret"**，添加：

| Name | Secret |
|------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | `b6ca40982764dd92c13a2af853cecb8b` |

### 4. 完成！

配置完成后，推送代码即可自动触发部署。

---

## 验证自动部署

### 方式 1：查看 Actions 运行状态

访问：https://github.com/chhgithub/responsive-video-courses/actions

你会看到 "Deploy to Cloudflare Pages" 工作流正在运行（或已完成）。

### 方式 2：触发新的部署

```bash
# 在本地创建一个空提交来触发部署
git commit --allow-empty -m "触发部署"
git push origin main
```

---

## 访问地址

部署成功后（约 3-5 分钟）：

- **主页**: https://responsive-video-courses.pages.dev
- **前台**: https://responsive-video-courses.pages.dev/portal
- **后台**: https://responsive-video-courses.pages.dev/admin

---

## 工作流程

```
推送代码到 GitHub
       ↓
GitHub Actions 自动触发
       ↓
安装依赖 (pnpm install)
       ↓
构建项目 (pnpm run build:antd)
       ↓
部署到 Cloudflare Pages
       ↓
✅ 部署成功，可以访问
```

---

## 日常使用

配置完成后，以后每次推送代码都会自动部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

就这么简单！无需任何手动操作。

---

## 故障排查

### Q: Actions 运行失败怎么办？

**A:** 检查以下几点：
1. Secrets 是否正确设置（在仓库 Settings → Secrets and variables → Actions）
2. Cloudflare API Token 是否有效
3. Account ID 是否正确

### Q: 如何查看部署日志？

**A:** 访问 Actions 页面，点击具体的工作流运行记录，可以查看详细日志。

### Q: 部署需要多长时间？

**A:** 通常 3-5 分钟：
- 安装依赖：1-2 分钟
- 构建项目：1-2 分钟
- 部署：1 分钟

### Q: 如何手动触发部署？

**A:** 有两种方式：
1. 推送任意代码到 main 分支
2. 在 Actions 页面点击 "Run workflow" 按钮

---

## 相关文件

- `.github/workflows/deploy-cloudflare-pages.yml` - GitHub Actions 配置文件
- `vercel.json` - Vercel 配置（备用）
- `zeabur.yml` - Zeabur 配置（备用）
