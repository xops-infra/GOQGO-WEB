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
- 真实API集成，支持与后端GoQGo API Server完全交互
- 智能fallback机制，API失败时自动使用模拟数据
- 实例管理功能：创建、删除、发送消息、查看日志
- **完整的Namespace管理功能**：
  - 右上角namespace选择器和管理按钮
  - 支持创建、删除、切换命名空间
  - 命名空间列表管理界面，显示状态和创建时间
  - 删除确认机制，防止误删重要命名空间
  - 自动切换namespace时重新加载对应的agents
  - 与后端API完全集成，支持真实的namespace CRUD操作
- 响应式设计和主题切换

### Fixed
- 修复useMessage在setup中使用导致的空白页面问题
- 移除对naive-ui message provider的依赖，使用console输出替代
- 修复ChatView.vue中的导入错误
- **修复API数据结构处理问题**：
  - 修复namespaces.value.map错误，正确处理API返回的{items: []}格式
  - 更新Agent类型定义，匹配后端API实际返回的数据结构
  - 修复agents和namespaces store中的数据处理逻辑
  - 更新模拟数据结构，与真实API保持一致
- **修复useMessage错误**：
  - 移除ChatRoom组件中未使用的useMessage导入和变量定义
  - 避免在没有message-provider的情况下使用useMessage

### Changed
- 完全重新设计界面布局，符合Q Chat Manager设计规范
- 简化路由结构，使用单页面布局
- 更新API接口，支持完整的GoQGo后端功能
- 重构状态管理，分离namespace和agents管理
