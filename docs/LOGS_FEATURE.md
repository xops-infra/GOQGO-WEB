# 日志功能更新文档

## 概述

基于最新的 WebSocket 接口文档，重新设计了实例日志查看功能，提供更现代化的用户体验和更强大的功能。

## 新功能特性

### 1. 现代化按钮设计
- 重新设计了控制按钮组，采用更现代化的原生设计风格
- 实时跟踪状态按钮采用渐变色设计，状态更直观
- 按钮支持悬停动画效果，提升交互体验
- 响应式设计，适配移动端设备

### 2. WebSocket 接口支持
按照最新的 WebSocket 接口文档实现了以下功能：

#### 加载历史记录
```javascript
// 连接WebSocket
const ws = new WebSocket('/ws/namespaces/my-namespace/agents/my-agent/logs');

// 请求更多历史记录
ws.send(JSON.stringify({
    type: 'load_history',
    data: {
        offset: 100,  // 从第100行开始
        lines: 50     // 获取50行
    }
}));
```

#### 切换实时跟踪
```javascript
// 切换实时跟踪
ws.send(JSON.stringify({
    type: 'toggle_follow',
    data: {
        follow: false  // 停止实时跟踪
    }
}));
```

#### 刷新日志
```javascript
// 刷新日志
ws.send(JSON.stringify({
    type: 'refresh',
    data: {
        lines: 200  // 刷新显示200行
    }
}));
```

### 3. 增强的用户交互

#### 按钮功能
- **实时跟踪**: 开启/关闭实时日志追踪，状态实时同步
- **加载历史**: 手动加载更多历史日志，支持分页加载
- **刷新**: 刷新当前日志显示，获取最新内容
- **清空**: 清空当前显示的日志内容
- **复制**: 一键复制所有日志内容到剪贴板
- **关闭**: 关闭日志窗口

#### 自动功能
- **滚动加载**: 滚动到顶部时自动加载历史日志
- **实时追踪**: 新日志自动滚动到底部（可切换）
- **去重处理**: 自动过滤重复的日志条目
- **状态同步**: WebSocket 状态与 UI 状态实时同步

### 4. 错误处理和超时保护
- 加载超时保护，防止界面卡死
- 连接断开自动重连机制
- 错误状态友好提示
- 网络异常处理

## 组件架构

### 核心组件
1. **AgentLogsModal.vue** - 主日志窗口组件
2. **LogsControlButtons.vue** - 现代化按钮控制组件
3. **LogsIcon.vue** - 简单的 SVG 图标组件
4. **LogSocket.ts** - WebSocket 连接管理类

### 新增方法
- `loadHistory(offset, lines)` - 加载历史记录
- `toggleFollow(follow)` - 切换实时跟踪
- `refresh(lines)` - 刷新日志

### 回调接口
```typescript
interface LogSocketCallbacks {
  onInitial?: (logs: LogEntry[]) => void
  onAppend?: (log: LogEntry) => void
  onHistory?: (logs: LogEntry[], hasMore: boolean) => void
  onRefreshed?: (lines: number) => void
  onFollowToggled?: (data: { follow: boolean }) => void
  onSessionClosed?: (message: string) => void
  onError?: (error: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
}
```

## 使用方法

### 1. 基本使用
```vue
<template>
  <AgentLogsModal
    v-model:show="showLogs"
    :agent="selectedAgent"
    @close="showLogs = false"
  />
</template>
```

### 2. 测试页面
访问 `/test/logs` 可以测试新的日志功能：
- 测试 WebSocket 连接
- 测试加载历史记录
- 测试切换跟踪状态
- 测试刷新功能

### 3. 手动控制
```javascript
// 创建 LogSocket 实例
const logSocket = new LogSocket(
  'namespace',
  'agent-name',
  { lines: 1000, follow: true },
  {
    onConnect: () => console.log('连接成功'),
    onHistory: (logs, hasMore) => console.log('历史日志:', logs.length),
    // ... 其他回调
  }
)

// 连接
await logSocket.connect()

// 加载历史
logSocket.loadHistory(0, 50)

// 切换跟踪
logSocket.toggleFollow(false)

// 刷新
logSocket.refresh(200)
```

## 样式特性

### 现代化设计
- 渐变色按钮设计
- 悬停动画效果
- 圆角按钮样式
- 响应式布局

### 状态指示
- 实时跟踪状态颜色区分
- 连接状态实时显示
- 加载状态动画
- 禁用状态样式

### 移动端适配
- 按钮大小自适应
- 文字大小调整
- 布局自动换行
- 触摸友好设计

## 性能优化

### 日志处理
- 自动去重算法
- 滚动位置保持
- 内存使用优化
- 大量日志处理

### 网络优化
- 心跳保活机制
- 断线重连策略
- 超时保护机制
- 错误恢复处理

## 兼容性

- 支持现代浏览器的 WebSocket API
- 支持 Clipboard API 复制功能
- 降级方案支持旧版浏览器
- 移动端浏览器兼容

## 开发说明

### 环境要求
- Node.js >= 16
- Vue 3 + TypeScript
- Naive UI 组件库
- WebSocket 支持

### 构建和测试
```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 访问测试页面
http://localhost:3000/test/logs
```

## 更新日志

### v0.2.0 (2025-08-08)
- ✨ 重新设计日志查看功能
- ✨ 实现新的 WebSocket 接口支持
- ✨ 添加现代化按钮控制组件
- ✨ 增强用户交互体验
- 🐛 修复日志重复显示问题
- 🐛 修复连接状态同步问题
- 🎨 优化界面设计和动画效果
- 📱 添加移动端适配支持
