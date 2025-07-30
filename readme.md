# GoQGo Web

GoQGo AI智能体协助开发平台的Web前端界面 - 一个集成项目管理、实时聊天和AI助手的开发协作平台。

## 功能特性

- 🤖 **AI智能体管理** - 多智能体协同开发支持
- 💬 **实时聊天系统** - 类似微信的群聊功能，支持开发团队实时沟通
- 📁 **项目管理** - 统一管理backend、frontend等多个项目模块
- 🔄 **实时同步** - WebSocket连接确保信息实时更新
- 📊 **开发监控** - 实时查看项目状态和开发进度
- 🎨 **现代化UI** - 简洁美观的用户界面设计

## 技术栈

### 前端核心
- **Vue 3** + Composition API + TypeScript - 现代化前端框架
- **Naive UI** - 现代化UI组件库
- **Pinia** - 状态管理解决方案
- **Vite** - 快速构建工具

### 网络通信
- **Axios** - HTTP客户端，处理API请求
- **Socket.io** - WebSocket连接，实现实时聊天和数据同步

### 开发工具
- **ESLint** + **Prettier** - 代码质量和格式化
- **TypeScript** - 类型安全开发
- **Vue Router** - 单页面应用路由管理

## 项目结构

```
GOQGO-WEB/
├── src/
│   ├── components/     # 通用组件
│   ├── views/         # 页面组件
│   ├── stores/        # Pinia状态管理
│   ├── utils/         # 工具函数
│   ├── api/           # API接口
│   └── types/         # TypeScript类型定义
├── public/            # 静态资源
└── package.json       # 项目依赖
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 核心功能模块

- **聊天系统** - 基于Socket.io的实时群聊功能
- **智能体管理** - AI助手配置和交互界面
- **项目监控** - 实时显示各项目模块状态
- **用户管理** - 团队成员权限和角色管理
