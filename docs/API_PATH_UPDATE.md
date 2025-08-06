# API路径更新总结 - Namespace改为NS

## 更新背景

根据最新的API文档 (http://localhost:8000/swagger/index.html#/)，所有namespace相关的接口路径已从`/namespaces/`和`/namespace/`更新为`/ns/`。

## 更新内容

### 1. 命名空间相关接口 (NAMESPACES)

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 列表 | `/namespaces` | `/ns` |
| 创建 | `/namespaces` | `/ns` |
| 获取 | `/namespace/{namespace}` | `/ns/{namespace}` |
| 更新 | `/namespace/{namespace}` | `/ns/{namespace}` |
| 删除 | `/namespace/{namespace}` | `/ns/{namespace}` |

### 2. Agent相关接口 (AGENTS)

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 列表 | `/namespaces/{ns}/agents` | `/ns/{ns}/agents` |
| 创建 | `/namespaces/{ns}/agents` | `/ns/{ns}/agents` |
| 获取 | `/namespaces/{ns}/agents/{name}` | `/ns/{ns}/agents/{name}` |
| 状态 | `/namespaces/{ns}/agents/{name}/status` | `/ns/{ns}/agents/{name}/status` |
| 删除 | `/namespaces/{ns}/agents/{name}` | `/ns/{ns}/agents/{name}` |
| 发送 | `/namespaces/{ns}/agents/{name}/send` | `/ns/{ns}/agents/{name}/send` |
| 重启 | `/namespaces/{ns}/agents/{name}/restart` | `/ns/{ns}/agents/{name}/restart` |
| 广播 | `/namespaces/{ns}/agents/broadcast` | `/ns/{ns}/agents/broadcast` |

### 3. Agent日志接口

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 日志 | `/namespaces/{ns}/agents/{name}/logs` | `/ns/{ns}/agents/{name}/logs` |
| 跟踪 | `/namespaces/{ns}/agents/{name}/logs/follow` | `/ns/{ns}/agents/{name}/logs/follow` |
| 历史 | `/namespaces/{ns}/agents/{name}/logs/history` | `/ns/{ns}/agents/{name}/logs/history` |
| 刷新 | `/namespaces/{ns}/agents/{name}/logs/refresh` | `/ns/{ns}/agents/{name}/logs/refresh` |
| 状态 | `/namespaces/{ns}/agents/{name}/logs/status` | `/ns/{ns}/agents/{name}/logs/status` |

### 4. 聊天相关接口 (CHATS)

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 列表 | `/namespaces/{ns}/chats` | `/ns/{ns}/chats` |
| 创建 | `/namespaces/{ns}/chats` | `/ns/{ns}/chats` |
| 获取 | `/namespaces/{ns}/chats/{chatName}` | `/ns/{ns}/chats/{chatName}` |
| 更新 | `/namespaces/{ns}/chats/{chatName}` | `/ns/{ns}/chats/{chatName}` |
| 删除 | `/namespaces/{ns}/chats/{chatName}` | `/ns/{ns}/chats/{chatName}` |

### 5. 聊天消息接口

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 发送消息 | `/namespaces/{ns}/chats/{chat}/messages` | `/ns/{ns}/chats/{chat}/messages` |
| 获取历史 | `/namespaces/{ns}/chats/{chat}/history` | `/ns/{ns}/chats/{chat}/history` |
| 搜索消息 | `/namespaces/{ns}/chats/{chat}/messages/search` | `/ns/{ns}/chats/{chat}/messages/search` |
| 编辑消息 | `/namespaces/{ns}/chats/{chat}/messages/{id}` | `/ns/{ns}/chats/{chat}/messages/{id}` |
| 删除消息 | `/namespaces/{ns}/chats/{chat}/messages/{id}` | `/ns/{ns}/chats/{chat}/messages/{id}` |

### 6. 工作流相关接口 (DAGS)

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 列表 | `/namespaces/{ns}/dags` | `/ns/{ns}/dags` |
| 创建 | `/namespaces/{ns}/dags` | `/ns/{ns}/dags` |
| 获取 | `/namespaces/{ns}/dags/{dagName}` | `/ns/{ns}/dags/{dagName}` |
| 更新 | `/namespaces/{ns}/dags/{dagName}` | `/ns/{ns}/dags/{dagName}` |
| 删除 | `/namespaces/{ns}/dags/{dagName}` | `/ns/{ns}/dags/{dagName}` |

### 7. 执行记录接口 (RECORDS)

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 列表 | `/namespaces/{ns}/records` | `/ns/{ns}/records` |
| 创建 | `/namespaces/{ns}/records` | `/ns/{ns}/records` |
| 获取 | `/namespaces/{ns}/records/{recordName}` | `/ns/{ns}/records/{recordName}` |
| 更新 | `/namespaces/{ns}/records/{recordName}` | `/ns/{ns}/records/{recordName}` |
| 删除 | `/namespaces/{ns}/records/{recordName}` | `/ns/{ns}/records/{recordName}` |

### 8. WebSocket接口

| 操作 | 旧路径 | 新路径 |
|------|--------|--------|
| 聊天室 | `/ws/namespaces/{ns}/chat` | `/ws/ns/{ns}/chat` |
| 聊天 | `/ws/namespaces/{ns}/chats/{chatName}` | `/ws/ns/{ns}/chats/{chatName}` |
| Agent日志 | `/ws/namespaces/{ns}/agents/{agentName}/logs` | `/ws/ns/{ns}/agents/{agentName}/logs` |

## 修改的文件

### 1. 主要配置文件
- ✅ `src/config/api.ts` - 更新所有API端点配置

### 2. 测试和工具文件
- ✅ `src/utils/sendMessage-test.ts` - 更新测试中的API路径
- ✅ `src/api/logs.ts` - 更新日志API路径

### 3. 新增测试工具
- ✅ `src/utils/api-path-test.ts` - API路径验证工具

## 验证方法

### 1. 验证API路径配置

在浏览器控制台中：
```javascript
// 验证所有API路径
window.apiPathTest.validateApiPaths()

// 检查是否还有旧路径
window.apiPathTest.checkForOldPaths()

// 新旧路径对比
window.apiPathTest.compareOldAndNewPaths()
```

### 2. 测试API连接

```javascript
// 测试实际API连接
await window.apiPathTest.testApiConnections()
```

### 3. 手动验证示例

```javascript
// 检查具体路径
import { API_ENDPOINTS } from '@/config/api'

console.log('Namespaces List:', API_ENDPOINTS.NAMESPACES.LIST)
// 应该输出: /ns

console.log('Agents List:', API_ENDPOINTS.AGENTS.LIST('default'))
// 应该输出: /ns/default/agents

console.log('Chat Messages:', API_ENDPOINTS.CHATS.SEND_MESSAGE('default', 'general'))
// 应该输出: /ns/default/chats/general/messages
```

## 影响范围

### ✅ 已更新的功能
- 命名空间管理
- Agent管理和操作
- 聊天功能
- 消息发送和接收
- 日志查看
- 工作流管理
- 执行记录
- WebSocket连接

### 🔍 需要测试的功能
- 所有涉及namespace的API调用
- WebSocket连接和实时功能
- 跨namespace的操作
- Agent日志实时跟踪

## 兼容性说明

### 向后兼容性
- ❌ **不兼容**: 旧的API路径将无法工作
- ✅ **数据兼容**: 数据结构和参数保持不变
- ✅ **功能兼容**: 所有功能保持原有行为

### 升级注意事项
1. **清除缓存**: 建议清除浏览器缓存和localStorage
2. **重新登录**: 可能需要重新登录以获取新的token
3. **检查连接**: 验证WebSocket连接是否正常

## 测试清单

### API连接测试
- [ ] 命名空间列表获取
- [ ] Agent列表获取
- [ ] 聊天列表获取
- [ ] 消息发送功能
- [ ] 日志查看功能
- [ ] WebSocket连接

### 功能测试
- [ ] 创建和管理命名空间
- [ ] 创建和管理Agent
- [ ] 发送和接收消息
- [ ] 实时日志查看
- [ ] 跨namespace操作

### 错误处理测试
- [ ] 无效namespace处理
- [ ] 网络错误处理
- [ ] 权限错误处理
- [ ] 超时处理

## 故障排除

### 常见问题

#### Q1: API调用返回404错误
**原因**: 可能使用了旧的API路径
**解决方案**:
```javascript
// 检查是否还有旧路径
window.apiPathTest.checkForOldPaths()

// 验证当前配置
window.apiPathTest.validateApiPaths()
```

#### Q2: WebSocket连接失败
**原因**: WebSocket路径可能未更新
**解决方案**:
```javascript
// 检查WebSocket路径
console.log('WebSocket paths:', {
  chatRoom: API_ENDPOINTS.WEBSOCKET.CHAT_ROOM('default'),
  chat: API_ENDPOINTS.WEBSOCKET.CHAT('default', 'general'),
  agentLogs: API_ENDPOINTS.WEBSOCKET.AGENT_LOGS('default', 'agent1')
})
```

#### Q3: 某些功能无法正常工作
**原因**: 可能有遗漏的路径未更新
**解决方案**:
1. 检查浏览器开发者工具的网络面板
2. 查看是否有404或其他错误
3. 使用测试工具验证路径

### 调试工具

```javascript
// 完整的API路径检查
window.apiPathTest.validateApiPaths()
window.apiPathTest.checkForOldPaths()
await window.apiPathTest.testApiConnections()
window.apiPathTest.compareOldAndNewPaths()
```

## 后续维护

### 1. 定期检查
- 定期验证API路径是否与后端保持一致
- 监控API调用的成功率
- 检查新增接口的路径格式

### 2. 文档更新
- 保持API文档与实际路径同步
- 更新相关的开发文档
- 维护测试用例

### 3. 版本管理
- 记录API版本变更
- 提供迁移指南
- 保持向后兼容性说明

通过这次更新，所有的API路径都已经从`/namespaces/`和`/namespace/`格式更新为更简洁的`/ns/`格式，与最新的后端API保持一致。
