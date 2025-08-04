# Docker 部署文件

本目录包含了 GoQGo Web 项目的所有 Docker 相关配置文件和脚本。

## 📁 文件说明

### Docker 配置文件
- `Dockerfile` - 标准 Docker 镜像构建文件
- `Dockerfile.standalone` - 独立部署版本的 Docker 文件
- `docker-compose.yml` - Docker Compose 编排文件
- `.dockerignore` - Docker 构建忽略文件

### Nginx 配置文件
- `nginx.conf` - 标准 Nginx 配置
- `nginx-standalone.conf` - 独立部署版本的 Nginx 配置

### 部署脚本
- `docker-build.sh` - Docker 镜像构建脚本
- `docker-run.sh` - Docker 容器快速启动脚本
- `deploy.sh` - 一键部署脚本

### 文档
- `DOCKER.md` - 详细的 Docker 部署文档
- `README.md` - 本文件

## 🚀 快速开始

### 方式一：使用构建脚本（推荐）

```bash
# 1. 构建镜像
./docker/docker-build.sh

# 2. 运行容器
./docker/docker-run.sh
```

### 方式二：使用 Docker Compose

```bash
# 启动服务
cd docker && docker-compose up -d

# 停止服务
cd docker && docker-compose down
```

### 方式三：一键部署

```bash
# 自动构建并部署
./docker/deploy.sh
```

### 方式四：使用 npm 脚本

```bash
# 构建镜像
npm run docker:build

# 运行容器
npm run docker:run

# 使用 docker-compose
npm run docker:up
npm run docker:down
npm run docker:logs
```

## 🔧 手动部署

### 构建镜像

```bash
# 标准版本
docker build -f docker/Dockerfile -t goqgo-web:latest .

# 独立版本
docker build -f docker/Dockerfile.standalone -t goqgo-web:latest .
```

### 运行容器

```bash
# 运行容器
docker run -d -p 3000:80 --name goqgo-web goqgo-web:latest

# 查看日志
docker logs -f goqgo-web

# 停止容器
docker stop goqgo-web

# 删除容器
docker rm goqgo-web
```

## 📋 环境变量

可以通过环境变量配置应用：

```bash
docker run -d \
  -p 3000:80 \
  -e NODE_ENV=production \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_WS_BASE_URL=wss://api.example.com \
  --name goqgo-web \
  goqgo-web:latest
```

## 🔍 健康检查

容器包含健康检查功能：

```bash
# 检查容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}"

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' goqgo-web
```

## 📊 监控和日志

```bash
# 查看容器状态
docker stats goqgo-web

# 查看实时日志
docker logs -f goqgo-web

# 进入容器
docker exec -it goqgo-web sh
```

## 🛠️ 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 使用不同端口
   docker run -d -p 3001:80 --name goqgo-web goqgo-web:latest
   ```

2. **镜像构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   ./docker/docker-build.sh
   ```

3. **容器启动失败**
   ```bash
   # 查看详细错误信息
   docker logs goqgo-web
   
   # 检查容器配置
   docker inspect goqgo-web
   ```

## 📝 注意事项

1. 确保 Docker 已正确安装并运行
2. 构建镜像需要网络连接以下载依赖
3. 生产环境建议使用 `docker-compose` 进行部署
4. 定期更新基础镜像以获得安全补丁

## 🔗 相关链接

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 配置文档](https://nginx.org/en/docs/)

---

如需更详细的部署说明，请参考 [DOCKER.md](./DOCKER.md) 文件。
