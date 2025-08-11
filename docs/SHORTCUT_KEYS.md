# 日志页面快捷键图标功能

## 概述

在设备的查看日志页面中新增了快捷键图标支持，用户可以通过点击图标快速发送常用的控制命令到Agent。快捷键现在集成在底栏中，布局更加简洁，只保留最常用的两个快捷键。

## 功能特性

### 🎯 支持的快捷键

目前支持2个最常用的快捷键：

1. **Ctrl+C** - 中断信号
   - 图标：停止符号
   - 功能：发送中断信号，通常用于停止正在运行的进程

2. **Enter** - 回车键
   - 图标：向下箭头
   - 功能：发送回车键，确认或执行命令

### 🔧 技术实现

#### API端点
```typescript
// 发送原始命令
POST /api/v1/namespaces/{namespace}/agents/{agentname}/raw-command
Content-Type: application/json
Authorization: Bearer {token}

{
  "command": "C-c"  // 或其他命令
}
```

#### 前端实现
- **组件位置**: `src/components/AgentLogsModal.vue` (底栏区域)
- **事件处理**: 直接调用 `handleSendCommand` 方法
- **API调用**: `src/api/agents.ts`

#### 命令格式
- `C-c`: Ctrl+C
- `Enter`: 回车键

### 🎨 用户界面

#### 布局设计
- **集成位置**: 快捷键现在集成在底栏中间区域
- **布局结构**: 
  - 左侧：连接状态、实时追踪、日志数量等信息
  - 中间：快捷键区域
  - 右侧：最后更新时间

#### 交互特性
- 图标只在Agent连接状态下可用
- 悬停时显示工具提示说明功能
- 点击后立即发送命令并显示反馈
- 快捷键按钮采用紧凑的20x20像素设计

#### 样式特点
- **底栏风格**: 使用浅色背景，与底栏整体风格保持一致
- **图标设计**: 简洁的图标设计，白色背景配深色图标
- **布局紧凑**: 图标和标签水平排列，节省空间
- **响应式**: 支持不同屏幕尺寸的适配

### 📱 响应式支持

#### 桌面端
- 底栏三栏布局：左-中-右
- 快捷键居中显示
- 标准间距和大小

#### 移动端
- 自动换行布局
- 紧凑的图标间距
- 较小的字体大小

## 使用方法

### 1. 基本操作
1. 打开Agent日志窗口
2. 确保Agent已连接（状态显示为"已连接"）
3. 在底栏中间区域找到快捷键图标
4. 点击对应的快捷键图标
5. 系统会显示命令发送成功的提示

### 2. 测试命令
可以使用以下curl命令测试API功能：
```bash
# 发送Ctrl+C
curl -X POST "http://localhost:8080/api/v1/namespaces/default/agents/test-agent/raw-command" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOQGO_API_TOKEN" \
  -d '{"command":"C-c"}'

# 发送Enter
curl -X POST "http://localhost:8080/api/v1/namespaces/default/agents/test-agent/raw-command" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOQGO_API_TOKEN" \
  -d '{"command":"Enter"}'
```

## 注意事项

### ⚠️ 使用限制
- 快捷键功能仅在Agent连接状态下可用
- 需要有效的认证token
- 命令发送后由后端Agent处理

### 🔒 安全考虑
- 所有命令都通过认证的API发送
- 命令内容会记录在日志中
- 建议在生产环境中限制可执行的命令类型

### 🐛 故障排除
- 如果快捷键图标显示为禁用状态，检查Agent连接状态
- 如果命令发送失败，查看浏览器控制台的错误信息
- 确保后端服务支持raw-command端点

## 更新历史

- **v1.0.0**: 初始版本，支持5个基本快捷键
- **v1.1.0**: 布局重构，快捷键集成到渲染器选择区域
- **v1.2.0**: 快捷键图标采用终端主题风格，黑色背景配白色图标
- **v2.0.0**: 新增分组布局，支持15个快捷键，包括方向键和功能键
- **v2.1.0**: 简化设计，只保留最常用的2个快捷键（Ctrl+C、Enter），移动到底栏
- 快捷键按功能分为4个组：控制、输入、方向、功能
- 新增Tab、Backspace、方向键、Home、End、PageUp、PageDown支持
- 快捷键现在集成在底栏中间，布局更加简洁
