# Agent 思考内容显示修复

## 概述

修复了 `agent_thinking_stream` 思考过程内容的显示问题，确保实际的思考内容能够正确替换 "正在思考..." 的占位符文字。

## 问题描述

### 原始问题
根据用户提供的截图，聊天界面中显示的是静态的 "正在思考..." 文字，而不是 `agent_thinking_stream` 中的实际思考内容。

### 问题分析
通过代码分析发现了以下问题：

1. **内容覆盖问题**：在 `handleAgentThinkingStream` 函数中，当同时有 `content` 和 `progress` 时，`progress` 会覆盖实际的思考内容
2. **显示逻辑正确**：`MessageItem.vue` 中的显示逻辑是正确的，会显示 `message.thinkingContent` 的内容
3. **数据流完整**：从 WebSocket 到 Store 再到组件的数据流是完整的

## 修复方案

### 1. 修复内容更新逻辑

**修复前**：
```typescript
// 更新思考内容
if (content !== undefined) {
  thinkingMessage.thinkingContent = content
}

// 更新进度（如果有的话）
if (progress !== undefined) {
  thinkingMessage.thinkingContent = `正在思考... (${Math.round(progress * 100)}%)`
}
```

**修复后**：
```typescript
// 更新思考内容
if (content !== undefined) {
  // 如果有实际的思考内容，直接使用
  thinkingMessage.thinkingContent = content
} else if (progress !== undefined) {
  // 只有在没有实际内容时才显示进度
  thinkingMessage.thinkingContent = `正在思考... (${Math.round(progress * 100)}%)`
}
```

### 2. 优化日志输出

添加了更详细的调试信息：
```typescript
console.log('🤖 更新Agent思考内容:', {
  searchMethod,
  conversationId,
  tempId,
  content: thinkingMessage.thinkingContent,
  progress,
  hasContent: content !== undefined,
  hasProgress: progress !== undefined
})
```

## 技术实现

### 数据流程

1. **WebSocket 接收**：
   ```typescript
   case 'agent_thinking_stream': {
     console.log('🤖 Agent思考流式更新:', data.data)
     const { conversationId, content, progress, tempId } = data.data
     if (conversationId) {
       this.callbacks.onAgentThinkingStream?.({
         conversationId,
         content,
         progress,
         tempId
       })
     }
     break
   }
   ```

2. **Store 处理**：
   ```typescript
   onAgentThinkingStream: (data) => {
     console.log('🤖 Agent思考流式更新:', data)
     handleAgentThinkingStream(data)
   }
   ```

3. **内容更新**：
   ```typescript
   const handleAgentThinkingStream = (data) => {
     // 查找对应的思考消息
     // 更新思考内容
     // 触发响应式更新
   }
   ```

4. **UI 显示**：
   ```vue
   <span class="thinking-text">
     {{ cleanThinkingContent(message.thinkingContent) || '正在思考...' }}
   </span>
   ```

### 消息查找策略

为了准确找到需要更新的思考消息，使用了多重查找策略：

1. **通过 conversationId 查找**（优先）
2. **通过 tempId 查找**（备选）
3. **通过 Agent 名称查找**（兜底）

```typescript
// 优先通过conversationId查找
if (conversationId) {
  thinkingMessageIndex = messages.value.findIndex(
    msg => msg.conversationId === conversationId && msg.isThinking
  )
}

// 如果没找到，尝试通过tempId查找
if (thinkingMessageIndex === -1 && tempId) {
  thinkingMessageIndex = messages.value.findIndex(
    msg => msg.tempId === tempId && msg.isThinking
  )
}

// 最后尝试通过Agent名称查找
if (thinkingMessageIndex === -1 && agentName) {
  thinkingMessageIndex = messages.value.findIndex(
    msg => msg.isThinking && (
      msg.senderName === agentName || 
      msg.senderName.startsWith(agentName + '.') ||
      msg.senderName.includes(agentName)
    )
  )
}
```

### 内容清理

使用 `cleanThinkingContent` 函数清理 ANSI 转义序列：

```typescript
const cleanThinkingContent = (content: string | undefined): string => {
  if (!content) return '正在思考...'
  
  // 移除ANSI转义序列
  return content
    .replace(/\u001B\[[?]?[0-9;]*[a-zA-Z]/g, '') // 移除ANSI转义序列
    .replace(/\u001B\[[?]?[0-9;]*[hlm]/g, '')    // 移除其他控制序列
    .replace(/[\u0000-\u001F\u007F]/g, '')       // 移除其他控制字符
    .trim() || '正在思考...'
}
```

## 功能特性

### 1. 实时内容更新
- ✅ 接收 `agent_thinking_stream` 的实际思考内容
- ✅ 实时更新显示，替换 "正在思考..." 占位符
- ✅ 支持流式更新，内容逐步显示

### 2. 进度显示
- ✅ 当没有具体内容时显示进度百分比
- ✅ 有实际内容时优先显示内容而不是进度
- ✅ 进度格式：`正在思考... (85%)`

### 3. 内容清理
- ✅ 自动清理 ANSI 转义序列
- ✅ 移除控制字符
- ✅ 保持内容的可读性

### 4. 错误处理
- ✅ 多重查找策略确保消息能被找到
- ✅ 详细的调试日志便于问题排查
- ✅ 防护机制避免丢失思考内容

## 用户体验改进

### 修复前
```
[Agent] default-sys.default
● ● ● ● 正在思考...
```

### 修复后
```
[Agent] default-sys.default
● ● ● ● 我正在分析这个问题，需要考虑以下几个方面：
1. 用户的具体需求
2. 技术实现的可行性
3. 最佳的解决方案...
```

## 调试信息

### 启用详细日志
修复后的代码包含了详细的调试信息：

```typescript
console.log('🤖 处理思考流式更新:', { conversationId, content, progress, tempId })
console.log('🔍 查找思考消息结果:', {
  conversationId,
  tempId,
  thinkingMessageIndex,
  searchMethod,
  totalMessages: messages.value.length
})
console.log('🤖 更新Agent思考内容:', {
  searchMethod,
  conversationId,
  tempId,
  content: thinkingMessage.thinkingContent,
  progress,
  hasContent: content !== undefined,
  hasProgress: progress !== undefined
})
```

### 常见问题排查

1. **思考内容不显示**：
   - 检查 WebSocket 连接是否正常
   - 查看控制台是否有 `🤖 Agent思考流式更新` 日志
   - 确认 `conversationId` 或 `tempId` 是否正确

2. **内容被进度覆盖**：
   - 已修复：现在优先显示实际内容
   - 只有在没有内容时才显示进度

3. **消息找不到**：
   - 使用多重查找策略
   - 检查 Agent 名称是否匹配
   - 查看调试日志中的查找结果

## 兼容性

### WebSocket 消息格式
支持以下格式的 `agent_thinking_stream` 消息：

```json
{
  "type": "agent_thinking_stream",
  "data": {
    "conversationId": "conv_1234567890_user_agent_hash",
    "content": "实际的思考内容...",
    "progress": 0.75,
    "tempId": "temp_1234567890"
  }
}
```

### 向后兼容
- ✅ 保持原有的进度显示功能
- ✅ 兼容没有思考内容的情况
- ✅ 保持原有的 UI 样式和动画

## 测试建议

### 手动测试
1. 发送消息给 Agent
2. 观察思考状态的显示
3. 确认实际思考内容是否显示
4. 检查内容是否实时更新

### 自动化测试
```typescript
// 模拟 agent_thinking_stream 消息
const mockThinkingStream = {
  type: 'agent_thinking_stream',
  data: {
    conversationId: 'test_conv_id',
    content: '我正在思考这个问题...',
    progress: 0.5,
    tempId: 'test_temp_id'
  }
}

// 验证内容更新
expect(thinkingMessage.thinkingContent).toBe('我正在思考这个问题...')
```

## 更新日志

### v0.2.9 (2025-08-08)
- 🐛 修复 `agent_thinking_stream` 思考内容显示问题
- ✨ 优化内容更新逻辑，避免进度覆盖实际内容
- 📝 增加详细的调试日志
- 🔍 改进消息查找策略
- 🧹 优化代码结构和错误处理

## 总结

通过这次修复，`agent_thinking_stream` 的实际思考内容现在能够正确显示在聊天界面中，替换原来的静态 "正在思考..." 文字。用户可以实时看到 Agent 的思考过程，大大提升了交互体验和透明度。

修复的核心是确保当有实际思考内容时，不会被进度信息覆盖，同时保持了原有的进度显示功能作为备选方案。
