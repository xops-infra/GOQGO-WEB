# CHANGELOG

## [1.0.0] - 2025-07-30

### Added
- 项目初始化，基于Vue 3 + TypeScript + Naive UI
- 聊天管理功能，支持多会话实时聊天
- 智能体管理功能，支持创建、删除、监控AI智能体
- 系统设置页面，支持主题切换和API配置
- 响应式布局设计，支持侧边栏折叠
- Pinia状态管理，统一管理应用状态
- Axios HTTP客户端，处理API请求
- ESLint + Prettier 代码规范配置
- 集成GoQGo.svg作为项目logo，应用于侧边栏和favicon

### Fixed
- 修复useMessage在setup中使用导致的空白页面问题
- 添加模拟数据，确保页面有内容显示
- 移除对naive-ui message provider的依赖，使用console输出替代
