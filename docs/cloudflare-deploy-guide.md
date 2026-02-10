# Cloudflare Pages 部署修复指南

## 问题
Cloudflare Pages 构建失败，因为缺少 `pnpm install` 步骤。

## 解决方案

### 方法 1：在 Cloudflare Dashboard 中修改配置

1. 打开 https://dash.cloudflare.com
2. 进入 **Workers & Pages** → **responsive-video-courses**
3. 点击 **Settings** 标签
4. 找到 **Build & deployments** 部分
5. 点击 **Edit configuration**

修改以下设置：

```
Framework preset: None
Build command: pnpm install --no-frozen-lockfile && pnpm run build:antd
Build output directory: apps/web-antd/dist
Root directory: (留空)
```

6. 在 **Environment variables** 中添加：
   - `NODE_VERSION` = `22`
   - `PNPM_VERSION` = `10.10.0`

7. 点击 **Save**

8. 触发新的部署（点击 **Retry deployment** 或推送新代码）

### 方法 2：删除项目重新创建

如果上述方法不行，删除现有项目并重新创建：

1. 在项目设置中点击 **Delete project**
2. 重新创建时使用以下配置：

```
Connect to: GitHub
Repository: chhgithub/responsive-video-courses
Project name: responsive-video-courses
Production branch: main
Framework preset: None
Build command: pnpm install --no-frozen-lockfile && pnpm run build:antd
Build output directory: apps/web-antd/dist
Environment variables:
  - NODE_VERSION = 22
```

## Vercel vs Cloudflare 配置差异

| 配置项 | Vercel | Cloudflare Pages |
|--------|--------|------------------|
| 安装命令 | `installCommand` 单独配置 | 需要合并到 `build_command` 中 |
| Node 版本 | `build.env.NODE_VERSION` | `Environment variables: NODE_VERSION` |

## 关键差异

**Vercel 配置 (vercel.json):**
```json
{
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm run build:antd",
  "build": {
    "env": {
      "NODE_VERSION": "22"
    }
  }
}
```

**Cloudflare Pages 等效配置:**
```
Build command: pnpm install --no-frozen-lockfile && pnpm run build:antd
Environment variables: NODE_VERSION=22
```

## 验证部署

部署成功后，访问：
- 主页: https://responsive-video-courses.pages.dev
- 前台: https://responsive-video-courses.pages.dev/portal
- 后台: https://responsive-video-courses.pages.dev/admin
