# 更新日志

## 2025-07-31

### 新功能
- 🎉 **版本管理系统**：完整的自动化版本管理解决方案
  - 自动从Git标签获取版本号，支持package.json备用版本
  - 构建时自动生成版本信息文件（version.json）
  - 集成GitHub API检查远程版本更新
  - 智能版本号比较和更新提醒
  - 现代化版本信息展示组件，支持详细信息弹窗
  - 支持开发版和生产版环境标识
  - 构建脚本自动化：`npm run build:version`、`npm run build:prod`
- 新增文件链接智能渲染：支持图片、视频、音频、PDF、文档等多种文件类型的可视化显示
- 新增内联图片预览：`[图片]URL`格式自动渲染为可点击的图片预览
- 新增文件类型图标：不同文件类型显示对应的emoji图标和渐变背景

### 修复
- 修复图片发送后预览显示错误：正确解析和渲染`[图片]URL`格式的文件链接
- 修复文件上传后光标位置插入文本失败的问题：增强DOM元素访问的兼容性和错误处理
- 修复文件上传响应处理错误：正确处理axios响应拦截器返回的数据结构
- 修复MessageSearch组件setup函数错误：添加缺失的useUserStore导入和完善的错误处理
- 修复Vue编译错误：解决`files`变量重复声明问题，使用不同的变量名区分不同上下文
- 修复Vue编译错误：移除重复的`isDragOver`变量声明
- 修复ChatRoom组件中重复的代码块导致的编译错误

### 优化
- 增强formatMessageContent函数：支持解析`[类型]URL`格式并生成相应的HTML结构
- 优化文件链接样式：现代化卡片设计，悬停效果，响应式布局
- 增强insertTextAtCursor函数：支持多种DOM元素访问方式，添加详细的调试日志
- 添加appendTextToEnd辅助函数：提供可靠的文本追加备用方案
- 更新UploadResponse接口以匹配后端实际返回的数据结构（包含originalName、relativePath等字段）
- 增强文件上传API的错误处理和调试日志
- 增强MessageSearch组件的错误处理和数据验证，提升组件稳定性
- 为MessageSearch组件添加详细的错误日志，便于问题排查和调试

### 技术改进
- 📁 **新增文件结构**：
  - `scripts/build-version.js` - 版本构建脚本
  - `src/components/VersionInfo.vue` - 版本信息组件
  - `src/utils/version.ts` - 版本管理工具类
  - `src/version.json` - 自动生成的版本信息文件
  - `docs/VERSION_MANAGEMENT.md` - 版本管理文档
- 🔧 **构建流程优化**：集成版本信息生成到构建流程
- 🌐 **API集成**：GitHub Releases API用于版本更新检查
- 📱 **用户体验**：点击版本号查看详细信息，自动更新提醒
