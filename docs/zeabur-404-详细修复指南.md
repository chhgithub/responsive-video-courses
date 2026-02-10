# Zeabur 404 问题修复 - 详细步骤

## 问题诊断

访问 Zeabur 部署的地址出现 404 错误，这是因为 Vue Router 使用 HTML5 History 模式，需要服务器配置将所有路由重定向到 index.html。

---

## 解决方案（按优先级）

### 方案一：在 Zeabur 控制台配置路由（推荐）

#### 步骤 1：访问 Zeabur 服务设置

1. 打开 https://zeabur.com 并登录
2. 找到 `responsive-video-courses` 项目并点击
3. 点击您的服务卡片（通常显示为 web-antd 或类似名称）

#### 步骤 2：配置 Nginx 或路由规则

**方式 A：如果服务使用 Nginx**

1. 在服务页面，找到 "Settings" 或 "配置" 标签
2. 找到 "Nginx Config" 或 "Nginx 配置" 部分
3. 添加以下配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

4. 点击 "Save" 或 "保存"
5. 点击 "Redeploy" 重新部署

**方式 B：如果使用 Static Site（静态站点）**

1. 在服务页面点击 "Settings"
2. 找到 "Routing" 或 "路由" 设置
3. 添加重写规则：

```
Source: /*
Destination: /index.html
Status: 200
```

4. 保存并重新部署

#### 步骤 3：如果找不到上述选项

有些 Zeabur 服务可能不直接支持这些配置。此时需要：

**选项 A：删除服务并重新创建**

1. 在 Zeabur 控制台删除当前服务
2. 点击 "Add Service" 或 "添加服务"
3. 选择 "Prebuilt" 或 "Dockerfile" 类型（而不是 "Static Site"）
4. 配置：
   - **Build Command**: `pnpm run build:antd`
   - **Output Directory**: `apps/web-antd/dist`
   - **Nginx Config**（如果有）: 添加上面的配置

**选项 B：使用 Dockerfile 部署**

如果上述方法都不行，可以使用 Dockerfile 方式部署。

---

### 方案二：修改项目使用 Dockerfile 部署

让我为您创建一个适配 web-antd 的 Dockerfile 配置。

---

## 验证步骤

配置完成后：

1. **访问根路径**：`https://your-domain.zeabur.app`
   - 应该能看到首页

2. **刷新页面**：按 F5 刷新
   - 应该还是正常显示（不出现 404）

3. **直接访问子路由**：`https://your-domain.zeabur.app/login`
   - 应该能直接显示登录页面

如果以上都正常，说明配置成功！

---

## 如果还是 404

请检查以下几点：

### 1. 检查构建产物

在 Zeabur Dashboard → 项目 → 点击最新的部署记录 → "Logs" 标签

查找是否有以下内容：
- 构建成功：`Build completed successfully`
- 输出目录：`apps/web-antd/dist`
- index.html 文件存在

### 2. 检查服务类型

确认您的服务类型是否正确：
- ❌ Static Site（可能不支持路由重写）
- ✅ Prebuilt（推荐）
- ✅ Dockerfile（推荐）
- ✅ Nginx（推荐）

### 3. 查看 Zeabur 文档

访问 Zeabur 官方文档了解更多配置方式：
https://zeabur.com/docs/deploy/static-site

---

## 快速测试命令

配置完成后，可以推送一个空提交来触发重新部署：

```bash
git commit --allow-empty -m "测试 Zeabur 配置"
git push origin main
```

然后在 Zeabur Dashboard 观察部署过程。

---

## 联系支持

如果以上所有方法都无法解决，可以：

1. 在 Zeabur Dashboard 创建 Support Ticket
2. 加入 Zeabur Discord 社区求助
3. 查看 Zeabur GitHub Issues

---

## 截图参考（手动操作指南）

### Zeabur 控制台查找路径：

1. **服务设置入口**：
   - Dashboard → 点击项目
   - 找到服务卡片（方形图标，显示服务名称）
   - 点击进入服务详情

2. **配置选项位置**：
   - 在服务详情页，顶部通常有标签：Overview | Deployments | Settings | Logs
   - 点击 "Settings" 标签

3. **常见配置项名称**：
   - Nginx Config / Nginx 配置
   - Routing / 路由
   - Rewrite Rules / 重写规则
   - Environment Variables / 环境变量

---

## 需要帮助？

如果需要我提供更具体的指导，请告诉我：
1. 您在 Zeabur 控制台看到了哪些选项？
2. 您的服务类型是什么？（Static Site / Prebuilt / Dockerfile 等）
3. 有没有截图可以分享？

我会根据具体情况提供更详细的解决方案。
