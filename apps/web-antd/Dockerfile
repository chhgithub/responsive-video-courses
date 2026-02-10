# Zeabur 部署用 Dockerfile
FROM node:22-slim AS builder

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

# 安装 pnpm
RUN npm i -g corepack && corepack enable

WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages packages
COPY apps apps
COPY internal internal

# 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 构建 web-antd
RUN pnpm run build:antd

RUN echo "Build Success!"

# 生产环境 - 使用 Nginx
FROM nginx:stable-alpine AS production

# 复制构建产物
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.zeabur.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
