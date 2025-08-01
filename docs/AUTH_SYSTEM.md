# 认证系统说明

## 概述

GoQGo Web 应用实现了统一的认证管理系统，确保所有API请求和WebSocket连接都能正确处理token认证，并在认证失败时自动跳转到登录页。

## 核心组件

### 1. 认证管理器 (`/src/utils/auth.ts`)

统一管理认证状态和操作的核心工具：

```typescript
import { authManager } from '@/utils/auth'

// 检查是否已认证
authManager.isAuthenticated()

// 获取当前token
authManager.getToken()

// 清除认证信息
authManager.clearAuth()

// 跳转到登录页
authManager.redirectToLogin('原因')

// 处理认证错误
authManager.handleAuthError(error)
```

### 2. Axios拦截器 (`/src/utils/axios.ts`)

自动为所有API请求添加token，并处理认证错误：

- **请求拦截器**: 自动添加 `Authorization: Bearer <token>` 头
- **响应拦截器**: 处理401错误，自动跳转登录页
- **跳过认证**: 登录、注册等API自动跳过token检查

### 3. 统一请求工具 (`/src/utils/request.ts`)

提供统一的API请求方法：

```typescript
import { get, post, put, del, upload } from '@/utils/request'

// GET请求
const data = await get('/api/v1/namespaces')

// POST请求
const result = await post('/api/v1/agents', { name: 'test' })

// 文件上传
const uploadResult = await upload('/api/v1/files', formData)
```

### 4. 用户Store (`/src/stores/user.ts`)

集成认证管理器的用户状态管理：

```typescript
const userStore = useUserStore()

// 登录
await userStore.loginWithToken(token)

// 登出
userStore.logout()

// 恢复认证状态
userStore.restoreAuth()
```

## 认证流程

### 1. 用户登录
1. 用户输入token或密码
2. 调用登录API验证
3. 保存token和用户信息到localStorage
4. 更新store状态
5. 跳转到主页

### 2. API请求认证
1. 请求拦截器检查是否需要认证
2. 从localStorage获取token
3. 验证token格式
4. 添加Authorization头
5. 发送请求

### 3. 认证失败处理
1. 响应拦截器捕获401错误
2. 清除本地认证信息
3. 自动跳转到登录页
4. 显示错误提示

### 4. WebSocket认证
1. 连接前检查token
2. 将token作为查询参数传递
3. 服务端验证token
4. 建立连接或返回错误

## 配置说明

### 跳过认证的API路径

在 `auth.ts` 中配置不需要token的API：

```typescript
const skipAuthPaths = [
  '/api/v1/users/login',
  '/api/v1/users/register',
  '/api/v1/health',
  '/api/v1/version'
]
```

### 路由守卫配置

在路由meta中配置认证要求：

```typescript
{
  path: '/protected',
  component: ProtectedView,
  meta: { 
    requiresAuth: true  // 需要认证
  }
},
{
  path: '/login',
  component: LoginView,
  meta: { 
    requiresAuth: false,  // 不需要认证
    hideForAuth: true     // 已登录用户隐藏
  }
}
```

## 错误处理

### 常见认证错误

1. **缺少token**: 自动跳转登录页
2. **token格式无效**: 清除认证信息，跳转登录页
3. **token过期**: 清除认证信息，跳转登录页
4. **权限不足**: 显示错误提示，不跳转

### 错误信息映射

```typescript
// 401错误的不同情况
if (data?.error === 'authorization header required') {
  reason = '缺少认证头'
} else if (data?.error === 'invalid token') {
  reason = 'Token无效'
} else if (data?.error === 'token expired') {
  reason = 'Token已过期'
}
```

## 测试

### 认证测试页面

访问 `/test/auth` 可以测试认证系统的各种功能：

- 查看当前认证状态
- 测试需要认证的API
- 测试公开API
- 模拟token过期
- 清除认证信息

### 测试用例

```typescript
// 测试认证API
await get('/api/v1/namespaces')  // 需要token

// 测试公开API
await get('/api/v1/health')      // 不需要token

// 模拟token过期
localStorage.setItem('goqgo_token', 'invalid_token')
await get('/api/v1/namespaces')  // 应该跳转登录页
```

## 最佳实践

### 1. API开发
- 所有需要认证的API都使用统一的请求工具
- 不要直接使用axios，使用封装的request方法
- 正确设置API路径，确保跳过认证配置生效

### 2. 组件开发
- 在组件中使用userStore获取认证状态
- 不要直接操作localStorage
- 使用computed属性响应认证状态变化

### 3. 错误处理
- 让axios拦截器处理认证错误
- 在组件中只处理业务逻辑错误
- 使用统一的错误提示方式

### 4. WebSocket连接
- 连接前检查认证状态
- 正确传递token参数
- 处理连接失败的情况

## 安全考虑

1. **Token存储**: 使用localStorage存储，考虑XSS攻击风险
2. **Token传输**: 使用HTTPS确保传输安全
3. **Token过期**: 实现自动刷新机制
4. **权限控制**: 前端验证+后端验证双重保护

## 故障排除

### 常见问题

1. **无限重定向**: 检查路由守卫配置和认证状态
2. **API调用失败**: 检查token格式和有效性
3. **WebSocket连接失败**: 检查token参数传递
4. **认证状态不同步**: 检查store和localStorage一致性

### 调试方法

1. 查看浏览器控制台的认证日志
2. 检查Network面板的请求头
3. 使用认证测试页面验证功能
4. 检查localStorage中的认证信息

## 更新日志

- **v1.0.0**: 初始版本，基本认证功能
- **v1.1.0**: 添加统一请求工具和认证管理器
- **v1.2.0**: 完善WebSocket认证和错误处理
- **v1.3.0**: 添加认证测试页面和文档
