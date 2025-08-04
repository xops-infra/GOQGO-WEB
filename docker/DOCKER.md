# GoQGo Web Docker 部署指南

## 🐳 快速开始

### 方式一：使用构建脚本（推荐）

```bash
# 1. 构建镜像
./docker-build.sh

# 2. 运行容器
./docker-run.sh
```

### 方式二：使用 npm 脚本

```bash
# 构建镜像
npm run docker:build

# 运行容器
npm run docker:run

# 使用 docker-compose
npm run docker:up
```

### 方式三：手动 Docker 命令

```bash
# 构建镜像
docker build -t goqgo-web:latest .

# 运行容器
docker run -d -p 3000:80 --name goqgo-web goqgo-web:latest
```

## 📋 部署选项

### 单独部署前端

```bash
docker run -d \
  --name goqgo-web \
  -p 3000:80 \
  --restart unless-stopped \
  goqgo-web:latest
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

```bash
# 使用自定义端口
docker run -d \
  --name goqgo-web-prod \
  -p 80:80 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  goqgo-web:latest
```

## 🔧 配置说明

### 环境变量

- `NODE_ENV`: 运行环境 (development/production)
- `API_BASE_URL`: 后端API地址 (默认通过nginx代理)

### 端口映射

- 容器内端口：`80` (nginx)
- 默认映射端口：`3000`
- 可自定义映射：`-p <host_port>:80`

### 数据卷挂载

如需自定义nginx配置：

```bash
docker run -d \
  --name goqgo-web \
  -p 3000:80 \
  -v $(pwd)/custom-nginx.conf:/etc/nginx/nginx.conf \
  goqgo-web:latest
```

## 🔍 容器管理

### 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看容器详情
docker inspect goqgo-web
```

### 日志管理

```bash
# 查看实时日志
docker logs -f goqgo-web

# 查看最近100行日志
docker logs --tail 100 goqgo-web

# 查看特定时间段日志
docker logs --since "2024-01-01T00:00:00" goqgo-web
```

### 容器操作

```bash
# 停止容器
docker stop goqgo-web

# 启动容器
docker start goqgo-web

# 重启容器
docker restart goqgo-web

# 删除容器
docker rm goqgo-web

# 进入容器
docker exec -it goqgo-web sh
```

## 🚀 镜像管理

### 查看镜像

```bash
# 查看本地镜像
docker images goqgo-web

# 查看镜像详情
docker inspect goqgo-web:latest
```

### 清理镜像

```bash
# 删除指定镜像
docker rmi goqgo-web:latest

# 清理未使用的镜像
docker image prune

# 清理所有未使用的资源
docker system prune -a
```

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   
   # 使用其他端口
   docker run -d -p 3001:80 --name goqgo-web goqgo-web:latest
   ```

2. **容器启动失败**
   ```bash
   # 查看详细错误信息
   docker logs goqgo-web
   
   # 检查容器状态
   docker inspect goqgo-web
   ```

3. **API请求失败**
   - 检查后端服务是否运行
   - 确认nginx代理配置正确
   - 检查网络连接

### 健康检查

```bash
# 检查应用健康状态
curl http://localhost:3000/health

# 检查容器健康状态
docker inspect --format='{{.State.Health.Status}}' goqgo-web
```

## 📊 性能优化

### 镜像优化

- 使用多阶段构建减小镜像大小
- 使用Alpine Linux基础镜像
- 合理配置.dockerignore

### 运行时优化

```bash
# 限制内存使用
docker run -d --memory="512m" -p 3000:80 goqgo-web:latest

# 限制CPU使用
docker run -d --cpus="1.0" -p 3000:80 goqgo-web:latest
```

## 🔐 安全建议

1. **使用非root用户运行**
2. **定期更新基础镜像**
3. **扫描镜像漏洞**
4. **使用HTTPS**
5. **配置防火墙规则**

## 📝 更新部署

```bash
# 1. 停止旧容器
docker stop goqgo-web

# 2. 删除旧容器
docker rm goqgo-web

# 3. 重新构建镜像
./docker-build.sh

# 4. 启动新容器
./docker-run.sh
```

访问地址：http://localhost:3000
