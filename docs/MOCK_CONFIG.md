# Mock 配置说明

## 概述

GoQGo Web 支持 Mock 模式，用于在没有后端服务的情况下进行前端开发和演示。

## 配置方式

Mock 模式完全通过环境变量控制，保持页面界面的简洁性。

### 环境变量配置

在对应的环境配置文件中设置：

```bash
# 启用 Mock 模式
VITE_MOCK_ENABLED=true

# 禁用 Mock 模式（默认）
VITE_MOCK_ENABLED=false
```

### 配置文件位置

- **开发环境**: `.env.development`
- **生产环境**: `.env.production`
- **本地覆盖**: `.env.local` (优先级最高，不会被提交到 git)

## Mock 功能范围

### 1. API Mock
- 用户认证 (登录/登出)
- Agent 管理 (创建/删除/重启)
- 聊天消息
- 文件上传
- 系统状态

### 2. WebSocket Mock
- 实时聊天消息
- Agent 状态更新
- 系统通知
- 心跳检测

### 3. 数据特性
- 模拟真实的 API 响应格式
- 可配置的延迟时间
- 随机数据生成
- 状态变化模拟

## 开发工具

在开发环境下，Mock 系统会在浏览器控制台暴露开发工具：

```javascript
// 查看当前 Mock 状态
window.mockDevTools.getState()

// 重置 Mock 数据
window.mockDevTools.resetData()

// 生成随机数据
window.mockDevTools.generateRandomData()
```

## 配置示例

### 开发环境 - 启用 Mock
```bash
# .env.development
VITE_MOCK_ENABLED=true
VITE_MOCK_DELAY=300
```

### 开发环境 - 连接真实后端
```bash
# .env.development
VITE_MOCK_ENABLED=false
VITE_API_BASE_URL=http://localhost:8080
```

### 生产环境
```bash
# .env.production
VITE_MOCK_ENABLED=false
VITE_API_BASE_URL=https://api.goqgo.com
```

## 切换 Mock 模式

1. **修改环境变量**：
   ```bash
   # 编辑 .env.development
   VITE_MOCK_ENABLED=true  # 或 false
   ```

2. **重启开发服务器**：
   ```bash
   npm run dev
   ```

3. **验证状态**：
   - 查看浏览器控制台的启动日志
   - 检查 `window.mockDevTools.getState()`

## 注意事项

1. **环境变量优先级**：
   - `.env.local` > `.env.development` > `.env`

2. **重启要求**：
   - 修改环境变量后需要重启开发服务器

3. **生产环境**：
   - 生产环境应始终禁用 Mock 模式
   - 确保 `VITE_MOCK_ENABLED=false`

4. **调试信息**：
   - Mock 模式下会在控制台显示详细的调试信息
   - 生产环境会自动禁用调试信息

## 故障排除

### Mock 模式未生效
1. 检查环境变量设置
2. 确认已重启开发服务器
3. 查看控制台启动日志

### API 请求失败
1. 确认后端服务是否运行
2. 检查 API 地址配置
3. 验证网络连接

### WebSocket 连接问题
1. 检查 WebSocket 地址配置
2. 确认防火墙设置
3. 查看浏览器网络面板
