# CHANGELOG

## [1.0.0] - 2025-07-30

### Fixed
- **Agent自动选择功能**：
  - 获取agents列表后自动选择第一个agent，避免显示"选择一个实例来观察"
  - 创建新agent后自动选择该agent
  - 删除agent后智能选择下一个可用的agent
  - 切换namespace时自动选择该namespace下的第一个agent
- **Namespace选择器显示问题**：
  - 修复Naive UI组件未正确注册导致的渲染问题
  - 在main.ts中正确配置naive-ui全局注册
- **Namespace agents数量显示错误**：
  - 动态获取每个namespace下的真实agents数量
  - 修复选择器显示"(0)"但实际有agents的问题
- **默认namespace选择逻辑**：
  - 首次访问时自动选择第一个可用的namespace
  - 正确记住用户上次选择的namespace到localStorage
  - 当保存的namespace不存在时，自动切换到第一个可用的
- **完整的Namespace管理功能**：
  - 通过API获取namespace列表，显示agents数量和状态
  - 支持创建新namespace，包含名称验证和描述
  - 支持删除namespace（保护default namespace）
  - 智能的namespace选择器，显示agents数量
  - 完整的namespace管理界面，支持切换、查看详情
- **数据关联和自动更新**：
  - 切换namespace时自动更新agents列表
  - 通过CustomEvent实现跨组件通信
  - 创建/删除agents时自动更新namespace的agents计数
- **用户体验优化**：
  - localStorage记住用户选择的namespace
  - 切换namespace时显示loading状态
  - 完善的错误处理和fallback机制
  - 空状态提示和引导用户创建
  - 删除确认对话框，防止误操作
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
- **修复API路径重复问题**：
  - 修复axios baseURL配置，避免/api/api/v1路径重复
  - 更新为直接连接后端API服务器http://localhost:8080/api
- **修复页面布局问题**：
  - 恢复正确的标题"AI助手管理平台"
  - 移除不必要的聊天室按钮，保持原有设计
  - 清理未使用的导入和方法
- **增强聊天功能容错性**：
  - 为不存在的聊天API添加fallback机制
  - 提供模拟聊天历史和在线用户数据
  - 确保即使后端聊天服务不可用，前端也能正常工作

### Changed
- 完全重新设计界面布局，符合Q Chat Manager设计规范
- 简化路由结构，使用单页面布局
- 更新API接口，支持完整的GoQGo后端功能
- 重构状态管理，分离namespace和agents管理
## [2025-07-30] 图片聊天功能

### 新增功能
- 支持图片粘贴：用户可直接粘贴剪贴板图片到聊天
- 支持文件拖拽：用户可拖拽图片文件到聊天窗口上传
- 图片上传按钮：点击选择本地图片文件
- 图片消息展示：聊天窗口中显示图片消息
- 图片全屏预览：点击图片可放大查看
- 图片路径格式：`[图片](/path/to/image.png)` 格式支持

### 技术实现
- 新增 `ImageMessage.vue` 组件处理图片展示
- 新增 `imageUtils.ts` 工具函数处理图片操作
- 更新 `ChatMessage` 接口支持图片类型
- 更新 `ChatRoom.vue` 组件支持图片粘贴和上传
- 更新 `ChatSocket` 类支持图片消息传输

### 修复问题
- 修复Vue组件中粘贴事件监听器绑定问题
- 添加多种DOM元素查找方式确保事件正确绑定
- 增加详细的调试日志便于问题排查
- 优化事件监听器的添加时机和方式

### 拖拽功能
- 支持拖拽图片文件到聊天窗口
- 拖拽时显示视觉反馈覆盖层
- 自动识别图片文件类型
- 支持 PNG, JPG, GIF, WebP, BMP 等格式
