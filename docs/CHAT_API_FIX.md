# 聊天 API 修复总结

## 问题描述

在聊天功能中出现以下错误：

```
useChatMessages.ts:121 加载历史消息失败: TypeError: chatApi.getMessages is not a function
    at loadHistoryMessages (useChatMessages.ts:99:45)
    at Proxy.connectToChat (chat.ts:60:11)
    at async initializeChatRoom (useChatRoom.ts:209:7)
```

## 根本原因

1. **API方法不匹配**：`useChatMessages.ts` 中调用了不存在的 `chatApi.getMessages` 方法
2. **参数格式错误**：`sendMessage` 方法的参数格式与实际API不匹配
3. **Mock服务不一致**：Mock服务中的方法名与真实API不一致

## 修复内容

### 1. 修复 API 方法调用

#### `src/composables/useChatMessages.ts`
- **修复前**：`chatApi.getMessages(namespace, { limit, before })`
- **修复后**：`chatApi.getChatHistory(namespace, 'default', limit, before)`

- **修复前**：`chatApi.sendMessage(messageData)`
- **修复后**：`chatApi.sendMessage(namespace, 'default', messageData)`

### 2. 创建统一的 API 包装器

#### `src/api/chatWithMock.ts` (新文件)
- 创建了 `chatApiWithMock` 包装器
- 自动根据 Mock 模式切换真实 API 和 Mock 服务
- 统一了方法签名和参数格式

### 3. 修复 Mock 服务

#### `src/mock/services.ts`
- **修复前**：`getMessages(namespace, options)`
- **修复后**：`getChatHistory(namespace, chatName, limit, before)`

### 4. 更新导入引用

#### `src/composables/useChatMessages.ts`
- **修复前**：`import { chatApi } from '@/api/chat'`
- **修复后**：`import { chatApiWithMock as chatApi } from '@/api/chatWithMock'`

## API 方法对照表

| 功能 | 旧方法 | 新方法 | 参数格式 |
|------|--------|--------|----------|
| 获取历史消息 | `getMessages(namespace, options)` | `getChatHistory(namespace, chatName, limit, before)` | 分离参数 |
| 发送消息 | `sendMessage(messageData)` | `sendMessage(namespace, chatName, data)` | 分离命名空间 |

## Mock 模式支持

新的 `chatApiWithMock` 包装器支持：

- ✅ **自动切换**：根据 `VITE_MOCK_ENABLED` 环境变量自动切换
- ✅ **统一接口**：Mock 和真实 API 使用相同的方法签名
- ✅ **调试日志**：Mock 模式下提供详细的调试信息
- ✅ **类型安全**：完整的 TypeScript 类型支持

## 验证结果

修复后的功能：

- ✅ **历史消息加载**：`loadHistoryMessages()` 正常工作
- ✅ **消息发送**：`sendMessage()` 正常工作
- ✅ **Mock 模式**：Mock 和真实 API 模式都正常工作
- ✅ **类型检查**：TypeScript 编译无错误
- ✅ **开发服务器**：正常启动无错误

## 使用示例

### 启用 Mock 模式测试
```bash
# 启用 Mock 模式
npm run mock:enable

# 重启开发服务器
npm run dev

# 在浏览器控制台查看 Mock 日志
```

### 禁用 Mock 模式连接真实 API
```bash
# 禁用 Mock 模式
npm run mock:disable

# 重启开发服务器
npm run dev

# 确保后端 API 服务运行在 http://localhost:8000
```

## 相关文件

- `src/api/chatWithMock.ts` - 新的 API 包装器
- `src/composables/useChatMessages.ts` - 修复的聊天消息逻辑
- `src/mock/services.ts` - 修复的 Mock 服务
- `src/api/chat.ts` - 原始 API 定义（保持不变）

## 注意事项

1. **命名空间参数**：所有聊天 API 现在都需要明确的命名空间参数
2. **聊天室名称**：当前使用 'default' 作为默认聊天室名称
3. **Mock 数据**：Mock 模式下会返回预定义的测试数据
4. **错误处理**：保持了原有的错误处理逻辑

## 后续优化建议

1. **动态聊天室名称**：支持多个聊天室而不是硬编码 'default'
2. **缓存机制**：添加消息缓存以提高性能
3. **离线支持**：在网络断开时使用本地存储
4. **消息分页**：优化大量历史消息的加载性能
