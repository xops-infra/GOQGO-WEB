# WebSocket 消息协议文档

## 概述

前端聊天系统使用 WebSocket 与后台进行实时通信，支持消息发送确认机制。

## 连接地址

```
ws://localhost:8080/ws/namespaces/{namespace}/chat?username={username}
```

## 消息格式

所有 WebSocket 消息都使用 JSON 格式，包含 `type` 和 `data` 字段：

```json
{
  "type": "消息类型",
  "data": {
    // 消息数据
  }
}
```

## 前端发送的消息类型

### 1. 聊天消息 (chat)

前端发送聊天消息时的格式：

```json
{
  "type": "chat",
  "data": {
    "tempId": "temp_1722470400000_abc123",
    "content": "消息内容",
    "type": "text"
  }
}
```

**字段说明：**
- `tempId`: 临时消息ID，用于消息确认
- `content`: 消息内容
- `type`: 消息类型 (`text`, `image`, `file`)

### 2. 历史消息请求 (history_request)

```json
{
  "type": "history_request",
  "data": {
    "limit": 20,
    "before": "message_id_123"
  }
}
```

### 3. 输入状态 (typing)

```json
{
  "type": "typing",
  "data": {
    "isTyping": true,
    "username": "用户名"
  }
}
```

### 4. 心跳 (ping)

```json
{
  "type": "ping"
}
```

## 后台需要返回的消息类型

### 1. 消息发送确认 (message_confirm)

**重要：** 后台收到前端的聊天消息后，应该立即返回发送确认，**必须包含前端发送的 tempId**：

```json
{
  "type": "message_confirm",
  "data": {
    "tempId": "temp_1722470400000_abc123",
    "messageId": "msg_1722470400001_def456"
  },
  "timestamp": "2025-08-01T08:25:22.584715+08:00",
  "from": "system"
}
```

**字段说明：**
- `tempId`: **必须** - 前端发送的临时ID，用于匹配待确认的消息
- `messageId`: 后台生成的真实消息ID
- `timestamp`: 确认时间戳
- `from`: 消息来源（通常为 "system"）

**超时机制：**
- 前端发送消息后，如果10秒内没有收到确认，消息状态将自动变为 "error"
- 后台应该尽快返回确认消息，建议在1秒内响应

### 2. 聊天消息广播 (chat)

后台处理完消息后，广播给所有连接的客户端：

```json
{
  "type": "chat",
  "data": {
    "id": "msg_1722470400001_def456",
    "username": "发送者用户名",
    "content": "消息内容",
    "timestamp": "2025-08-01T00:00:00Z",
    "type": "user"
  }
}
```

**字段说明：**
- `id`: 消息唯一ID
- `username`: 发送者用户名
- `content`: 消息内容
- `timestamp`: 消息时间戳 (ISO 8601 格式)
- `type`: 发送者类型 (`user`, `agent`, `system`)

### 3. 错误消息 (error)

当消息发送失败时：

```json
{
  "type": "error",
  "data": {
    "tempId": "temp_1722470400000_abc123",
    "error": "错误描述",
    "code": "ERROR_CODE"
  }
}
```

**字段说明：**
- `tempId`: 前端发送的临时ID（可选，用于标记失败的消息）
- `error`: 错误描述
- `code`: 错误代码

### 4. 消息处理完成确认 (message_delivered)

**可选：** 如果需要显示"已送达"状态：

```json
{
  "type": "message_delivered",
  "data": {
    "messageId": "msg_1722470400001_def456"
  }
}
```

### 4. 历史消息响应 (history)

```json
{
  "type": "history",
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "username": "用户名",
        "content": "消息内容",
        "timestamp": "2025-08-01T00:00:00Z",
        "type": "user"
      }
    ],
    "hasMore": true
  }
}
```

### 5. 用户加入/离开

```json
{
  "type": "user_join",
  "data": {
    "username": "用户名"
  }
}
```

```json
{
  "type": "user_leave",
  "data": {
    "username": "用户名"
  }
}
```

### 6. 输入状态广播

```json
{
  "type": "typing",
  "data": {
    "username": "用户名",
    "isTyping": true
  }
}
```

### 7. 心跳响应

```json
{
  "type": "pong"
}
```

### 8. 错误消息

```json
{
  "type": "error",
  "data": {
    "message": "错误描述",
    "code": "ERROR_CODE"
  }
}
```

## 消息状态流程

前端消息状态变化流程：

1. **发送中 (sending)** - 前端发送消息后立即显示
2. **已发送 (sent)** - 收到后台的 `message_sent` 确认
3. **已送达 (delivered)** - 收到后台的 `message_delivered` 确认（可选）

## 实现要点

### 后台必须实现的功能：

1. **立即确认** - 收到消息后立即返回 `message_sent`
2. **消息广播** - 将消息广播给所有连接的客户端
3. **ID映射** - 正确映射临时ID和真实ID

### 可选功能：

1. **处理确认** - 发送 `message_delivered` 表示消息已完全处理
2. **错误处理** - 发送错误消息给客户端

## 测试页面

可以使用以下页面测试 WebSocket 功能：

- `/test/websocket` - WebSocket 原始消息调试
- `/test/chat` - 聊天功能测试

## 示例时序图

### 成功发送消息流程：

```
前端                    后台
 |                       |
 |-- chat (tempId) ----->|
 |                       |-- message_confirm (tempId, messageId)
 |<-- message_confirm ---|  (状态: sending -> sent)
 |                       |
 |                       |-- chat (广播给所有客户端)
 |<-- chat (broadcast) --|
 |                       |
 |                       |-- message_delivered (可选)
 |<-- message_delivered -|  (状态: sent -> delivered)
```

### 发送失败流程：

```
前端                    后台
 |                       |
 |-- chat (tempId) ----->|
 |                       |-- error (tempId, error)
 |<-- error -------------|  (状态: sending -> error)
```

### 超时失败流程：

```
前端                    后台
 |                       |
 |-- chat (tempId) ----->|
 |                       |  (后台无响应)
 |                       |
 |-- 10秒超时 ---------->|
 |  (状态: sending -> error)
```

### 前端集成示例：

```javascript
// 前端可以这样处理
websocket.onmessage = function(event) {
  const msg = JSON.parse(event.data);
  
  switch(msg.type) {
    case 'message_confirm':
      // 消息发送成功确认 - 必须包含tempId
      console.log('消息发送成功:', msg.data.messageId);
      updateMessageStatus(msg.data.tempId, 'sent', msg.data.messageId);
      break;
      
    case 'error':
      // 消息发送失败
      console.error('消息发送失败:', msg.data.error);
      updateMessageStatus(msg.data.tempId, 'error');
      showErrorMessage(msg.data.error);
      break;
      
    case 'chat':
      // 接收到的聊天消息（包括自己的消息广播）
      displayMessage(msg.data);
      break;
      
    case 'message_delivered':
      // 消息已送达确认
      updateMessageStatus(msg.data.messageId, 'delivered');
      break;
  }
};

// 超时处理（前端自动处理）
setTimeout(() => {
  // 如果10秒内没有收到确认，自动标记为失败
  updateMessageStatus(tempId, 'error');
}, 10000);
```

**重要提醒：**
1. 后台必须在收到消息后立即返回 `message_confirm`，包含原始的 `tempId`
2. 建议在1秒内响应，最多不超过10秒
3. 如果处理失败，应该返回 `error` 消息而不是不响应

这样可以确保用户发送消息后立即看到反馈，提供良好的用户体验。
