# 后端接口
```
我已经在 api/handlers/agent.go 文件中添加了这两个简化的方法：

#### **1. GetAgentLogsSimple**
• 支持分页参数：?lines=N&offset=N
• 默认100行，最大1000行限制
• 统一处理日志文件和tmux输出
• 返回完整的分页信息（offset, total, hasMore等）

#### **2. ControlAgentLogsSimple**
• 支持控制实时跟踪：{"action": "follow", "enabled": true/false}
• 与WebSocket会话实时同步
• 返回WebSocket活跃状态

#### **3. getLogContentWithPaging**
• 辅助方法，统一处理分页逻辑
• 优先从日志文件读取，文件不存在时从tmux获取
• 返回数据来源标识（log_file 或 tmux_capture）

### 🎯 测试验证

通过完整测试验证了：
• ✅ 历史日志分页加载正常
• ✅ 实时跟踪控制正常  
• ✅ 参数验证和边界条件处理正常
• ✅ 统一数据源处理正常

### 📋 最终接口

现在后端完全实现了设计文档要求的简化接口：

GET  /namespaces/{ns}/agents/{name}/logs     - 历史日志模式
POST /namespaces/{ns}/agents/{name}/logs     - 实时模式控制
WebSocket /ws/namespaces/{ns}/agents/{name}/logs - 实时日志流
```

# 前端要实现的
实例-查看日志-实时日志 model-默认就开启实时追踪，支持用户点击取消；支持一键复制输出内容；支持清空，不影响后续实时数据加载；