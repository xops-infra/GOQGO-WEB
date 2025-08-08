# 日志功能终端化更新

## 概述

按照要求重新设计了日志渲染系统，使用终端解释器直接处理终端输出，删除了老的日志处理方案，提供更原生的终端体验。

## 主要更新

### ✨ 新增功能

1. **终端日志渲染器 (TerminalLogRenderer.vue)**
   - 直接处理 ANSI 转义序列
   - 支持终端颜色和样式
   - 保持原始终端输出格式
   - 自动滚动和历史加载

2. **ANSI 转义序列支持**
   - 前景色：黑、红、绿、黄、蓝、洋红、青、白
   - 背景色：支持所有标准背景色
   - 文本样式：粗体、斜体、下划线、反转
   - 亮色支持：bright-* 系列颜色

3. **终端样式主题**
   - 使用现有的终端主题样式
   - 单色字体显示
   - 终端风格的滚动条
   - 暗色背景配色

### 🗑️ 删除的老方案

1. **删除的组件**
   - `LogEntry.vue` - 单条日志组件
   - `LogsFilter.vue` - 日志过滤器
   - `LogsContent.vue` - 日志内容组件
   - `LogsModalHeader.vue` - 日志模态框头部
   - `LogsModalContainer.vue` - 日志模态框容器
   - `LogsModalFooter.vue` - 日志模态框底部

2. **删除的处理逻辑**
   - 复杂的日志级别解析
   - 自定义日志格式化
   - 多种日志源样式处理
   - 手动文本选择处理

3. **删除的样式**
   - 自定义日志行样式
   - 日志级别颜色区分
   - 复杂的选择状态样式
   - 多层嵌套的容器样式

## 技术实现

### 核心组件架构

```
AgentLogsModal.vue (主窗口)
├── LogsControlButtons.vue (控制按钮)
├── TerminalLogRenderer.vue (终端渲染器)
└── LogsIcon.vue (图标)
```

### ANSI 转义序列处理

```typescript
// 支持的 ANSI 颜色映射
const ANSI_COLORS: Record<string, string> = {
  '0': 'reset',
  '1': 'bold',
  '31': 'red',
  '32': 'green',
  '33': 'yellow',
  '34': 'blue',
  // ... 更多颜色
}

// 处理 ANSI 转义序列
const processAnsiCodes = (text: string): string => {
  // 解析 \x1b[XXXm 格式的转义序列
  // 转换为对应的 CSS 类名
  // 返回带样式的 HTML
}
```

### 日志数据流

```
WebSocket 原始数据
    ↓
LogSocket 解析 (保持原始格式)
    ↓
TerminalLogRenderer 渲染
    ↓
ANSI 转义序列处理
    ↓
HTML 输出显示
```

## 使用示例

### 基本使用

```vue
<template>
  <TerminalLogRenderer
    :logs="logs"
    :is-loading="isConnecting"
    :auto-scroll="true"
    :max-lines="10000"
  />
</template>
```

### 测试 ANSI 颜色

```javascript
// 添加彩色日志
const colorLog = {
  timestamp: new Date().toISOString(),
  level: 'info',
  message: '\x1b[32m✓ Success:\x1b[0m Operation completed',
  source: 'terminal'
}
```

### 支持的 ANSI 序列

```bash
# 颜色示例
echo -e "\x1b[31mRed text\x1b[0m"
echo -e "\x1b[32mGreen text\x1b[0m"
echo -e "\x1b[1mBold text\x1b[0m"
echo -e "\x1b[4mUnderlined text\x1b[0m"

# 背景色示例
echo -e "\x1b[41m\x1b[37mWhite on red\x1b[0m"
```

## 样式特性

### 终端风格

- **字体**: JetBrains Mono 等宽字体
- **背景**: 深色终端背景 (#0d1117)
- **文本**: 终端白色文本 (#f0f6fc)
- **滚动条**: 终端风格滚动条

### ANSI 颜色支持

- **标准色**: 8 种基本颜色
- **亮色**: bright-* 系列
- **背景色**: bg-* 系列
- **样式**: 粗体、斜体、下划线等

### 响应式设计

- 移动端字体大小调整
- 自适应容器高度
- 触摸友好的滚动

## 性能优化

### 渲染优化

- 虚拟滚动支持 (最大行数限制)
- HTML 转义防止 XSS
- 高效的 ANSI 解析算法

### 内存管理

- 自动清理超出限制的日志
- 去重处理避免重复渲染
- 懒加载历史日志

## 测试功能

访问 `/test/logs` 页面可以测试：

1. **WebSocket 连接测试**
2. **终端日志渲染测试**
3. **ANSI 颜色显示测试**
4. **历史日志加载测试**

### 测试用例

```javascript
// 添加普通日志
addTestLog()

// 添加 ANSI 彩色日志
addAnsiLog()

// 清空测试日志
clearTestLogs()
```

## 兼容性

- **现代浏览器**: 完全支持
- **移动端**: 响应式适配
- **终端输出**: 原生 ANSI 序列支持
- **WebSocket**: 实时日志流

## 开发指南

### 添加新的 ANSI 支持

```typescript
// 在 ANSI_COLORS 中添加新的映射
const ANSI_COLORS: Record<string, string> = {
  // ... 现有映射
  '38;5;196': 'color-196', // 256色支持
}

// 在 CSS 中添加对应样式
.ansi-color-196 {
  color: #ff0000;
}
```

### 自定义终端主题

```scss
// 覆盖终端颜色变量
:root {
  --terminal-bg: #1a1a1a;
  --terminal-text: #ffffff;
  --ansi-red: #ff6b6b;
  --ansi-green: #51cf66;
  // ... 更多颜色
}
```

## 更新日志

### v0.2.1 (2025-08-08)
- ✨ 新增终端日志渲染器
- ✨ 完整的 ANSI 转义序列支持
- 🗑️ 删除老的日志处理方案
- 🎨 采用终端风格设计
- 🐛 修复日志格式化问题
- ⚡ 优化渲染性能
- 📱 改进移动端体验

## 总结

新的终端日志渲染系统提供了：

- **更原生的体验**: 直接处理终端输出
- **更好的性能**: 简化的渲染流程
- **更强的兼容性**: 标准 ANSI 序列支持
- **更简洁的代码**: 删除了复杂的老方案

这个更新使得日志显示更接近真实的终端体验，同时保持了现代 Web 应用的交互性和美观性。
