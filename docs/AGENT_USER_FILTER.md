# Agent用户过滤功能

## 功能概述

根据`goqgo agent list -A`命令返回的结果，现在Agent列表增加了用户维度（`username`字段）。前端已实现用户过滤功能，确保普通用户只能看到属于自己的Agent，管理员可以看到所有Agent。

## API数据格式

```json
{
    "items": [
        {
            "name": "default-sys",
            "username": "admin",
            "namespace": "default",
            "status": "Stopped",
            "age": "6m",
            "role": "system",
            "workDir": "/tmp",
            "sessionName": "goqgo-admin-default-default-sys-c9e4dbc2-7cecb7d4",
            "restartCount": 0,
            "context": "你是 default namespace 的系统助手，负责维护和管理该命名空间的资源。"
        },
        {
            "name": "test-agent",
            "username": "admin",
            "namespace": "default",
            "status": "Idle",
            "age": "6m",
            "role": "architect",
            "workDir": "/Users/mikas/github/GoQGo",
            "sessionName": "goqgo-admin-default-test-agent-c40ee85c",
            "restartCount": 1
        }
    ]
}
```

## 过滤逻辑

### 1. 用户权限过滤

- **普通用户**: 只显示`username`字段与当前登录用户名匹配的Agent
- **管理员用户**: 显示所有Agent
- **比较方式**: 大小写不敏感比较

```typescript
// 如果不是管理员，只显示当前用户的agents
const currentUsername = userStore.username
const isAdminUser = userStore.isAdmin

if (!isAdminUser && currentUsername) {
  result = result.filter(agent => {
    // 使用API返回的username字段进行大小写不敏感比较
    return agent.username && 
           agent.username.toLowerCase() === currentUsername.toLowerCase()
  })
}
```

### 2. 用户名搜索过滤

管理员可以通过用户名过滤器进一步筛选Agent：

```typescript
// 应用用户名过滤器（管理员可以按用户名过滤查看所有agents）
if (usernameFilter.value && usernameFilter.value.trim()) {
  const filterText = usernameFilter.value.trim().toLowerCase()
  result = result.filter(agent => {
    return agent.username && 
           agent.username.toLowerCase().includes(filterText)
  })
}
```

## 界面更新

### 1. 表格列显示

- 添加了"用户名"列，显示Agent的所属用户
- 支持Terminal风格和普通风格两种显示模式

### 2. 过滤提示

- 普通用户界面显示"(仅显示您的智能体)"提示
- 管理员使用过滤器时显示"(已过滤: 用户名)"提示

### 3. 状态支持

支持API返回的所有状态格式：
- `running` / `Running` - 运行中
- `idle` / `Idle` - 空闲
- `Stopped` - 已停止
- `error` - 错误

## 文件更新

### 1. 类型定义更新

- `src/types/api.ts` - 更新Agent接口，添加username字段
- `src/api/agents.ts` - 更新Agent接口定义

### 2. 组件更新

- `src/views/AgentsView.vue` - 主要的Agent列表页面
- `src/stores/user.ts` - 用户状态管理（已有管理员判断逻辑）

### 3. 测试页面

- `src/views/AgentFilterTest.vue` - 用户过滤功能测试页面
- 路由: `/test/agent-filter`

## 使用方式

1. **普通用户登录**: 自动只显示属于该用户的Agent
2. **管理员登录**: 显示所有Agent，可使用用户名过滤器筛选
3. **测试功能**: 访问 `/test/agent-filter` 页面查看过滤逻辑演示

## 兼容性

- 向后兼容：如果API返回的数据中没有username字段，会显示"未知"
- 状态兼容：支持首字母大写和小写的状态格式
- 权限兼容：基于现有的用户权限系统（isAdmin判断）

## 安全性

- 前端过滤仅用于界面显示，实际的权限控制应在后端API层面实现
- 建议后端API根据用户权限返回相应的Agent列表，前端过滤作为额外保障
