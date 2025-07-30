# CHANGELOG

## [1.0.0] - 2025-07-30

### Added
- 项目初始化，基于Vue 3 + TypeScript + Naive UI
- 集成GoQGo.svg作为项目logo，应用于侧边栏和favicon
- 全新的Q Chat Manager界面布局，完全按照设计图实现：
  - 紫色渐变顶部标题栏，显示"Q Chat Manager"和"AI助手管理平台"
  - 左侧Q CLI实例列表面板，显示backend、frontend、q_cli_system等实例
  - 中间黑色终端区域，支持命令行交互
  - 右侧聊天记录面板，支持实时消息交互
  - 底部状态栏，显示命名空间、实例数量等信息
- 真实API集成，支持与后端GoQGo API Server交互
- 智能fallback机制，API失败时自动使用模拟数据
- 实例管理功能：创建、删除、发送消息、查看日志
- 命名空间切换支持
- 响应式设计和主题切换

### Fixed
- 修复useMessage在setup中使用导致的空白页面问题
- 移除对naive-ui message provider的依赖，使用console输出替代

### Changed
- 完全重新设计界面布局，符合Q Chat Manager设计规范
- 简化路由结构，使用单页面布局
- 更新API接口，支持完整的GoQGo后端功能
