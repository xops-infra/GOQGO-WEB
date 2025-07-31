# GoQGo Web v0.1.0 发布说明

🎉 **首个开源版本发布！**

GoQGo Web 是一个集成项目管理、实时聊天和AI智能体协助的现代化开发协作平台。

## 🌟 主要功能

### 🤖 AI智能体管理
- 多智能体协同开发支持
- 智能体创建、删除、状态监控
- 实时日志查看和调试
- 命名空间隔离管理

### 💬 实时聊天系统
- 类似微信的群聊功能
- WebSocket实时通信
- 支持文本、图片、文件等多种消息类型
- @mention功能
- 消息搜索和历史记录

### 📁 文件管理
- 拖拽上传文件
- 多种文件类型支持（图片、视频、音频、PDF、文档等）
- 智能文件预览
- 文件链接自动渲染

### 📊 项目监控
- 实时查看项目状态
- 开发进度监控
- 统计面板展示

### 🎨 现代化UI
- 基于Naive UI的现代化界面
- 响应式设计
- 深色/浅色主题切换
- 流畅的动画效果

## 🔧 技术栈

### 前端核心
- **Vue 3** + Composition API + TypeScript
- **Naive UI** - 现代化UI组件库
- **Pinia** - 状态管理
- **Vite** - 构建工具

### 网络通信
- **Axios** - HTTP客户端
- **Socket.io** - WebSocket实时通信

### 版本管理
- 自动版本获取和构建
- GitHub集成更新检查
- 智能版本比较

## 🚀 新功能亮点

### 📋 版本管理系统
- ✅ 自动从Git标签获取版本号
- ✅ 构建时生成版本信息
- ✅ GitHub API集成检查更新
- ✅ 现代化版本信息展示
- ✅ 一键跳转GitHub仓库

### 🖼️ 智能文件渲染
- ✅ `[图片]URL`格式自动渲染为图片预览
- ✅ 支持多种文件类型图标显示
- ✅ 文件链接卡片化展示
- ✅ 点击预览和下载功能

### 🔍 增强搜索功能
- ✅ 消息内容搜索
- ✅ 用户筛选
- ✅ 时间范围筛选
- ✅ 实时搜索结果

### 🎯 用户体验优化
- ✅ 拖拽文件上传
- ✅ 光标位置智能插入
- ✅ 消息状态指示
- ✅ 在线状态显示
- ✅ 自动滚动到底部

## 📦 安装和使用

### 环境要求
- Node.js >= 16
- npm >= 8

### 快速开始
```bash
# 克隆项目
git clone https://github.com/zhoushoujianwork/GOQGO-WEB.git

# 安装依赖
cd GOQGO-WEB
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 版本管理
```bash
# 生成版本信息
npm run build:version

# 检查版本
npm run version:check

# 生产环境构建
npm run build:prod
```

## 🔗 相关链接

- **GitHub仓库**: https://github.com/zhoushoujianwork/GOQGO-WEB
- **在线演示**: [待部署]
- **文档**: [docs/](./docs/)
- **问题反馈**: [GitHub Issues](https://github.com/zhoushoujianwork/GOQGO-WEB/issues)

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 进行类型安全开发
- 编写清晰的提交信息
- 添加必要的测试

## 🐛 已知问题

- [ ] 大文件上传可能较慢
- [ ] 某些浏览器的WebSocket连接可能不稳定
- [ ] 移动端适配还需优化

## 🗺️ 路线图

### v0.2.0 计划
- [ ] 移动端适配优化
- [ ] 更多文件类型支持
- [ ] 消息加密功能
- [ ] 插件系统

### v0.3.0 计划
- [ ] 多语言支持
- [ ] 主题自定义
- [ ] 性能优化
- [ ] 离线模式

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

特别感谢：
- Vue.js 团队提供的优秀框架
- Naive UI 团队提供的美观组件库
- 所有开源社区的贡献者

---

**GoQGo Web v0.1.0** - 让AI协助开发更简单！

如果你觉得这个项目有用，请给我们一个 ⭐️！
