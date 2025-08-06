# 401未授权错误修复总结

## 问题描述

在Mock模式下仍然出现401未授权错误：

```
GET http://localhost:3000/api/v1/roles 401 (Unauthorized)
GET http://localhost:3000/api/v1/namespaces 500 (Internal Server Error)
```

## 根本原因

1. **API缺少Mock支持**：部分API（如角色、命名空间）没有Mock版本，仍然尝试连接真实后端
2. **WebSocket连接问题**：即使在Mock模式下，WebSocket仍然尝试连接真实服务器
3. **认证拦截器触发**：未登录状态下访问需要认证的API会触发401错误

## 修复内容

### 1. 创建带Mock的API包装器

#### 角色API (`src/api/rolesWithMock.ts`)
- 创建了 `rolesApiWithMock` 包装器
- 自动根据Mock模式切换真实API和Mock服务
- 修复了Mock服务中的方法名不匹配问题

#### 命名空间API (`src/api/namespacesWithMock.ts`)
- 创建了 `namespaceApiWithMock` 包装器
- 实现了完整的CRUD操作Mock支持
- 统一了API响应格式

### 2. 修复Mock服务方法

#### Mock角色服务 (`src/mock/services.ts`)
```typescript
// 修复前
async getRoles() { ... }
async getRole(id: string) { ... }

// 修复后
async getList() { ... }
async getRole(roleName: string) { ... }
async getRoleDisplayName(roleName: string) { ... }
async checkRoleExists(roleName: string) { ... }
```

#### Mock命名空间服务 (`src/mock/services.ts`)
```typescript
// 修复前
async getNamespaces() { ... }
async getNamespace(name: string) { ... }

// 修复后
async getList() { ... }
async get(name: string) { ... }
async create(data: any) { ... }
async update(name: string, data: any) { ... }
async delete(name: string) { ... }
```

### 3. 修复WebSocket连接

#### `src/composables/useChatConnection.ts`
- 在Mock模式下跳过真实WebSocket连接
- 模拟连接状态和消息发送
- 提供完整的Mock WebSocket体验

```typescript
// Mock模式下的连接处理
if (isMockMode()) {
  mockLogger.info('Mock模式下跳过WebSocket连接', { namespace })
  connectionStatus.value = 'connected'
  isConnected.value = true
  console.log('🎭 Mock模式：模拟WebSocket连接成功')
  return
}
```

### 4. 更新API引用

更新了以下文件使用带Mock的API：

- `src/composables/useAgentsView.ts`
- `src/components/AgentCreateModal.vue`
- `src/components/Layout.vue`
- `src/components/RoleSelector.vue`
- `src/components/RoleDetail.vue`
- `src/views/RolesView.vue`
- `src/stores/namespaces.ts`
- `src/api/roles.ts`

### 5. 增强Mock测试工具

#### `src/utils/mock-test.ts` (新文件)
- 创建了Mock模式验证脚本
- 在开发环境下自动运行测试
- 提供浏览器控制台调试工具

## 修复结果

### ✅ 解决的问题

1. **401错误消除**：Mock模式下不再出现未授权错误
2. **WebSocket连接正常**：Mock模式下模拟WebSocket连接成功
3. **API调用统一**：所有API都支持Mock和真实模式切换
4. **开发体验改善**：Mock模式下完整的功能体验

### 🎯 Mock模式功能

- ✅ **角色管理**：完整的角色列表、详情、检查功能
- ✅ **命名空间管理**：CRUD操作完全支持
- ✅ **聊天功能**：WebSocket连接和消息发送模拟
- ✅ **用户认证**：跳过真实认证流程
- ✅ **Agent管理**：已有完整Mock支持

## 使用方法

### 启用Mock模式
```bash
# 启用Mock模式
npm run mock:enable

# 重启开发服务器
npm run dev

# 验证Mock状态
npm run mock:check
```

### 禁用Mock模式
```bash
# 禁用Mock模式
npm run mock:disable

# 重启开发服务器
npm run dev

# 确保后端服务运行
# 后端API: http://localhost:8000
# WebSocket: ws://localhost:8000
```

### 浏览器调试
```javascript
// 在浏览器控制台运行
window.mockTest.test()  // 测试Mock配置
window.mockDevTools.getState()  // 查看Mock状态
```

## 认证流程

### Mock模式下
- 🎭 **跳过认证**：所有API请求跳过token验证
- 🎭 **模拟登录**：自动模拟用户登录状态
- 🎭 **无401错误**：不会触发未授权错误

### 真实模式下
- 🔐 **需要登录**：401错误会自动跳转到登录页
- 🔐 **Token验证**：严格的token格式和有效性检查
- 🔐 **自动刷新**：token过期时自动处理

## 注意事项

1. **环境变量优先级**：`.env.local` > `.env.development` > `.env`
2. **重启要求**：修改Mock配置后需要重启开发服务器
3. **数据持久性**：Mock数据在页面刷新后重置
4. **WebSocket限制**：Mock模式下WebSocket功能有限

## 后续优化建议

1. **Mock数据持久化**：使用localStorage保存Mock数据
2. **更真实的延迟**：模拟网络延迟和错误情况
3. **Mock数据管理**：提供Mock数据的增删改查界面
4. **自动化测试**：基于Mock数据的自动化测试套件
