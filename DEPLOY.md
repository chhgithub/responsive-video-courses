# 🚀 部署指南

## 快速部署

### 方案一：Vercel 部署（推荐）

1. 访问 [vercel.com](https://vercel.com) 并登录/注册
2. 导入 GitHub 仓库：`https://github.com/chhgithub/responsive-video-courses`
3. 自动检测配置，点击 **Deploy** 按钮
4. 等待部署完成（约 2-3 分钟）

部署完成后，Vercel 会提供一个类似 `https://responsive-video-courses.vercel.app` 的访问地址。

### 方案二：Netlify 部署

1. 访问 [netlify.com](https://netlify.com) 并登录/注册
2. 点击 "Add new site" → "Import an existing project"
3. 连接 GitHub 仓库
4. 构建设置：
   - **Build command**: `cd apps/web-antd && pnpm run build`
   - **Publish directory**: `apps/web-antd/dist`
   - **Node version**: `22`
5. 点击 "Deploy site"

### 方案三：Docker 部署

1. 构建镜像：
```bash
docker build -t video-courses:latest .
```

2. 运行容器：
```bash
docker run -d -p 8080:80 video-courses:latest
```

访问：http://localhost:8080

### 方案四：静态托管服务

1. 构建项目：
```bash
cd apps/web-antd
pnpm run build
```

2. 将 `dist` 目录上传到任何静态托管服务：
   - GitHub Pages
   - Cloudflare Pages
   - 阿里云 OSS + CDN
   - 腾讯云 COS + CDN

## 环境变量（可选）

如需配置 API 地址等环境变量，在部署平台添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_URL` | https://api.example.com | API 基础地址 |
| `VITE_APP_TITLE` | 视频课程平台 | 应用标题 |

## 访问地址

- **GitHub 仓库**: https://github.com/chhgithub/responsive-video-courses
- **本地开发**: http://localhost:5666
- **Vercel 部署后**: 自动生成（如 https://responsive-video-courses.vercel.app）
