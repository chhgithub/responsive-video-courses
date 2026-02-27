# 视频课程平台

基于 Vue 3 + Element Plus + Pinia + SCSS 的视频课程平台。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 组件库
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue 官方路由
- **SCSS** - CSS 预处理器
- **Axios** - HTTP 客户端

## 项目结构

```
video-course-platform/
├── public/                          # 静态资源
├── src/
│   ├── api/                         # API 层
│   │   ├── public/                  # 前台 API
│   │   ├── admin/                   # 后台 API
│   │   └── types/                   # 类型定义
│   ├── assets/
│   │   └── styles/                  # 样式文件
│   ├── components/                  # 组件
│   │   ├── common/                  # 通用组件
│   │   ├── portal/                  # 前台组件
│   │   └── admin/                   # 后台组件
│   ├── composables/                 # 组合式函数
│   ├── layouts/                     # 布局组件
│   │   ├── EmptyLayout.vue          # 空布局
│   │   ├── PortalLayout.vue         # 前台布局
│   │   └── admin/                   # 后台布局
│   ├── router/                      # 路由配置
│   ├── stores/                      # Pinia 状态管理
│   ├── utils/                       # 工具函数
│   ├── views/                       # 页面视图
│   │   ├── portal/                  # 前台页面
│   │   ├── member/                  # 会员中心
│   │   ├── admin/                   # 后台管理
│   │   └── error/                   # 错误页面
│   ├── App.vue                      # 根组件
│   └── main.ts                      # 应用入口
├── index.html                       # HTML 模板
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
└── package.json                     # 项目配置
```

## 安装依赖

### 使用 npm

```bash
cd video-course-platform
npm install
```

### 使用 pnpm

```bash
cd video-course-platform
pnpm install
```

### 使用 yarn

```bash
cd video-course-platform
yarn install
```

> 如果遇到权限问题，请尝试以管理员身份运行终端

## 开发

启动开发服务器：

```bash
npm run dev
```

或

```bash
pnpm dev
```

项目将在 `http://localhost:3000` 运行。

## 构建

构建生产版本：

```bash
npm run build
```

或

```bash
pnpm build
```

## 预览

预览生产构建：

```bash
npm run preview
```

或

```bash
pnpm preview
```

## 功能模块

### 前台网站

- ✅ 首页（Banner 轮播、精选课程、平台特色）
- ✅ 课程中心
- ✅ 课程详情
- ✅ 认证中心
- ✅ 师资队伍
- ✅ 关于我们（研究院、数字创新中心、教育培训中心、联系我们）
- ✅ 用户登录/注册

### 后台管理

- ✅ 仪表盘
- ✅ 课程管理
- ✅ 介绍信息管理（课程介绍、认证中心、关于我们、师资）
- ✅ 系统管理（用户、角色、菜单、字典）

## 路由说明

### 前台路由

- `/portal` - 首页
- `/portal/courses` - 课程中心
- `/portal/course/:id` - 课程详情
- `/portal/cert` - 认证中心
- `/portal/teachers` - 师资队伍
- `/portal/about/*` - 关于我们
- `/login` - 登录
- `/register` - 注册

### 后台路由

- `/admin/login` - 后台登录
- `/admin/dashboard` - 仪表盘
- `/admin/course/list` - 课程管理
- `/admin/introduction/*` - 介绍信息管理
- `/admin/system/*` - 系统管理

### 测试账号

**后台管理系统**
- 用户名: `admin`
- 密码: `123456`

## 开发说明

### 样式系统

项目使用 SCSS 预处理器，所有样式变量定义在 `src/assets/styles/variables.scss`。

常用 mixins 定义在 `src/assets/styles/mixins.scss`。

### 状态管理

使用 Pinia 进行状态管理，Store 模块：

- `useAuthStore` - 认证状态
- `useAppStore` - 应用配置

### 组件规范

- 组件文件名使用 PascalCase（如 `CourseCard.vue`）
- 视图文件名使用 kebab-case（如 `course-detail.vue`）
- 组合式函数使用 camelCase + `use` 前缀（如 `useAuth.ts`）

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT

## 联系方式

如有问题，请联系：info@example.com
