# GoQGo Web

[![Version](https://img.shields.io/badge/version-v0.1.0-blue.svg)](https://github.com/zhoushoujianwork/GOQGO-WEB/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/zhoushoujianwork/GOQGO-WEB.svg)](https://github.com/zhoushoujianwork/GOQGO-WEB/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/zhoushoujianwork/GOQGO-WEB.svg)](https://github.com/zhoushoujianwork/GOQGO-WEB/issues)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](DOCKER.md)

GoQGo AI智能体协助开发平台的Web前端界面 - 一个集成项目管理、实时聊天和AI助手的开发协作平台。

## 🌟 功能特性

- 🤖 **AI智能体管理** - 多智能体协同开发支持
- 💬 **实时聊天系统** - 类似微信的群聊功能，支持开发团队实时沟通
- 📁 **项目管理** - 统一管理backend、frontend等多个项目模块
- 🔄 **实时同步** - WebSocket连接确保信息实时更新
- 📊 **开发监控** - 实时查看项目状态和开发进度
- 🎨 **现代化UI** - 简洁美观的用户界面设计
- 📋 **版本管理** - 自动版本获取、更新检查、GitHub集成
- 🐳 **容器化部署** - 支持Docker一键部署

## 🚀 快速开始

### 方式一：Docker部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/zhoushoujianwork/GOQGO-WEB.git
cd GOQGO-WEB

# 2. 构建并运行
./docker/docker-build.sh
./docker/docker-run.sh

# 访问应用
open http://localhost:3000
```

### 方式二：本地开发

#### 环境要求
- Node.js >= 16
- npm >= 8

#### 安装和运行
```bash
# 克隆项目
git clone https://github.com/zhoushoujianwork/GOQGO-WEB.git

# 进入项目目录
cd GOQGO-WEB

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🐳 Docker部署

### 快速部署
```bash
# 使用脚本快速部署
npm run docker:build  # 构建镜像
npm run docker:run    # 运行容器

# 或使用docker-compose
npm run docker:up     # 启动服务
npm run docker:down   # 停止服务
```

### 手动部署
```bash
# 构建镜像
docker build -f docker/Dockerfile -t goqgo-web:latest .

# 运行容器
docker run -d -p 3000:80 --name goqgo-web goqgo-web:latest

# 查看日志
docker logs -f goqgo-web
```

详细的Docker部署说明请参考：[docker/DOCKER.md](docker/DOCKER.md)

## 🔧 技术栈

### 前端核心
- **Vue 3** + Composition API + TypeScript - 现代化前端框架
- **Naive UI** - 现代化UI组件库
- **Pinia** - 状态管理解决方案
- **Vite** - 快速构建工具

### 网络通信
- **Axios** - HTTP客户端，处理API请求
- **Socket.io** - WebSocket连接，实现实时聊天和数据同步
- **统一API配置** - 集中管理所有API接口地址

### 部署方案
- **Docker** - 容器化部署
- **Nginx** - 静态文件服务和反向代理
- **多阶段构建** - 优化镜像大小

### 开发工具
- **ESLint** + **Prettier** - 代码质量和格式化
- **TypeScript** - 类型安全开发
- **Vue Router** - 单页面应用路由管理

## 📁 项目结构

```
GOQGO-WEB/
├── src/
│   ├── components/     # 通用组件
│   ├── views/         # 页面组件
│   ├── stores/        # Pinia状态管理
│   ├── utils/         # 工具函数
│   ├── api/           # API接口
│   └── types/         # TypeScript类型定义
├── scripts/           # 构建脚本
├── docs/             # 文档
├── public/           # 静态资源
├── Dockerfile        # Docker构建文件
├── docker-compose.yml # Docker编排文件
└── package.json      # 项目依赖
```

## 🎯 核心功能模块

- **聊天系统** - 基于Socket.io的实时群聊功能
- **智能体管理** - AI助手配置和交互界面
- **项目监控** - 实时显示各项目模块状态
- **用户管理** - 团队成员权限和角色管理
- **文件管理** - 支持多种文件类型的上传和预览
- **版本管理** - 自动版本获取和更新检查
- **统一API配置** - 环境自适应的API地址管理

## 📋 版本管理

项目集成了完整的版本管理系统：

```bash
# 生成版本信息
npm run build:version

# 检查版本
npm run version:check

# 生产环境构建
npm run build:prod
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- **GitHub仓库**: https://github.com/zhoushoujianwork/GOQGO-WEB
- **Docker部署文档**: [docker/DOCKER.md](docker/DOCKER.md)
- **API配置文档**: [docs/API_CONFIG.md](docs/API_CONFIG.md)
- **发布说明**: [RELEASE_NOTES.md](RELEASE_NOTES.md)
- **版本管理文档**: [docs/VERSION_MANAGEMENT.md](docs/VERSION_MANAGEMENT.md)
- **问题反馈**: [GitHub Issues](https://github.com/zhoushoujianwork/GOQGO-WEB/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

如果你觉得这个项目有用，请给我们一个 ⭐️！
