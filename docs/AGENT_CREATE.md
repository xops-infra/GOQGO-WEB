# Agent创建功能

## 功能概述

实现了完整的Agent创建功能，支持通过Web界面创建新的智能体实例。功能包括表单验证、角色选择、API调用和错误处理。

## 功能特性

### 1. 表单字段

- **名称** (必填): Agent实例名称
- **角色** (必填): 从API动态获取的角色列表
- **命名空间** (必填): Agent所属的命名空间，默认为'default'
- **工作目录** (可选): Agent的工作目录路径
- **上下文** (可选): Agent的上下文信息和提示

### 2. 角色管理

- 从 `/api/v1/roles` 端点动态获取角色列表
- 支持显示角色的显示名称和描述
- 如果API获取失败，使用默认角色列表作为备选

### 3. API集成

- 调用 `/api/v1/namespaces/{namespace}/agents` POST接口创建Agent
- 支持错误处理和用户友好的错误提示
- API失败时提供模拟成功响应（开发阶段）

### 4. 用户体验

- 表单验证确保必填字段完整
- 创建过程中显示加载状态
- 成功/失败消息提示
- 创建成功后自动刷新Agent列表
- 支持Terminal风格和普通风格两种界面

## API接口

### 创建Agent

```http
POST /api/v1/namespaces/{namespace}/agents
Content-Type: application/json

{
  "name": "agent-name",
  "role": "assistant",
  "namespace": "default",
  "context": "Agent上下文信息",
  "workDir": "/path/to/workdir"
}
```

### 获取角色列表

```http
GET /api/v1/roles

Response:
{
  "roles": [
    {
      "name": "assistant",
      "displayName": "通用助手",
      "description": "通用AI助手",
      "prompt": "..."
    }
  ],
  "total": 4
}
```

## 代码结构

### 1. 主要组件

- `src/views/AgentsView.vue` - 主要的Agent管理页面，包含创建功能
- `src/views/AgentCreateTest.vue` - 创建功能测试页面

### 2. API层

- `src/api/agents.ts` - Agent相关API调用
- `src/api/roles.ts` - 角色相关API调用

### 3. 类型定义

```typescript
export interface CreateAgentRequest {
  name: string
  namespace: string
  role: string
  context?: string
  workDir?: string
  env?: string[]
}

export interface Agent {
  id?: string
  name: string
  user?: string
  username?: string
  namespace: string
  status: 'running' | 'idle' | 'error' | 'Creating' | 'Terminating' | 'Stopped'
  role: string
  age?: string
  workDir?: string
  sessionName?: string
  restartCount?: number
  env?: string[]
  context?: string
}
```

## 使用方式

### 1. 在Agent列表页面

1. 点击"创建智能体"按钮
2. 填写必要信息：
   - 输入Agent名称
   - 选择角色（从API动态加载）
   - 确认命名空间
   - 可选：设置工作目录和上下文
3. 点击"创建"按钮
4. 等待创建完成，查看结果

### 2. 测试页面

访问 `/test/agent-create` 页面进行功能测试：
- 查看可用角色列表
- 测试表单验证
- 查看API调用结果
- 测试错误处理

## 错误处理

### 1. 表单验证

- 名称不能为空
- 角色必须选择
- 命名空间不能为空

### 2. API错误

- 网络错误：显示连接失败提示
- 服务器错误：显示具体错误信息
- 权限错误：提示权限不足

### 3. 降级处理

- 角色API失败时使用默认角色列表
- 创建API失败时提供模拟成功响应（开发阶段）

## 安全考虑

### 1. 输入验证

- 前端表单验证
- 输入内容trim处理
- 防止空值提交

### 2. 权限控制

- 基于用户登录状态
- 管理员和普通用户权限区分
- API层面的权限验证

## 开发和测试

### 1. 开发模式

```bash
# 启动开发服务器
npm run dev

# 访问主页面
http://localhost:3000/agents

# 访问测试页面
http://localhost:3000/test/agent-create
```

### 2. 测试功能

- 表单验证测试
- API调用测试
- 错误处理测试
- 用户权限测试

### 3. 调试信息

- 控制台输出详细的创建过程
- API请求和响应日志
- 错误信息追踪

## 后续优化

### 1. 功能增强

- [ ] 支持批量创建Agent
- [ ] 添加Agent模板功能
- [ ] 支持从配置文件导入
- [ ] 添加创建历史记录

### 2. 用户体验

- [ ] 表单自动保存草稿
- [ ] 创建进度指示器
- [ ] 更丰富的错误提示
- [ ] 支持快速创建模式

### 3. 技术优化

- [ ] 表单数据持久化
- [ ] API缓存优化
- [ ] 更好的错误边界处理
- [ ] 性能监控和优化

## 注意事项

1. **Git地址选择**: 当前版本暂不支持Git地址选择功能，该功能需要后端API支持
2. **权限控制**: 创建的Agent归属于当前登录用户
3. **命名空间**: 确保目标命名空间存在且用户有权限访问
4. **资源限制**: 注意Agent创建的资源消耗和数量限制
