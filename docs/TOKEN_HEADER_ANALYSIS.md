# Token Header问题分析总结

## 问题描述

用户登录后，token可能没有正确添加到HTTP请求的Authorization header中。

## 分析结果

### ✅ 正确的实现

经过分析，系统中已经有完整的token header添加机制：

#### 1. Token存储机制
```typescript
// userStore.setToken方法会同时保存到两个位置
const setToken = (newToken: string) => {
  token.value = newToken
  // 统一使用goqgo_token作为key
  localStorage.setItem('goqgo_token', newToken)
  // 为了兼容性，也保存到auth_token
  localStorage.setItem('auth_token', newToken)
  console.log('🔑 Token已设置')
}
```

#### 2. Token获取机制
```typescript
// authManager.getToken方法有优先级顺序
getToken(): string | null {
  // 优先使用goqgo_token，然后是auth_token作为备选
  return localStorage.getItem('goqgo_token') || 
         localStorage.getItem('auth_token') || 
         null
}
```

#### 3. Axios拦截器自动添加Header
```typescript
// axios请求拦截器会自动添加Authorization header
if (!authManager.shouldSkipAuth(url)) {
  const token = authManager.getToken() || localStorage.getItem('auth_token')
  
  if (token && authManager.validateTokenFormat(token)) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
    console.log('✅ 已添加Authorization header到请求:', url)
  }
}
```

### 🔧 修复的问题

#### 1. 重复保存Token
**问题**: 在useLogin中，token被重复保存到localStorage
```typescript
// 修复前 - 重复保存
userStore.setToken(loginResponse.bearer_token)
localStorage.setItem('auth_token', loginResponse.bearer_token)  // 重复

// 修复后 - 避免重复
userStore.setToken(loginResponse.bearer_token)
// userStore.setToken已经会保存到localStorage，不需要重复保存
```

#### 2. 缺少调试信息
添加了详细的token保存和使用日志，便于调试。

## 验证方法

### 1. 检查Token存储状态
```javascript
// 在浏览器控制台中
window.tokenHeaderTest.checkTokenStorage()
```

### 2. 测试API请求Header
```javascript
// 测试axios拦截器是否正确添加header
await window.tokenHeaderTest.testAxiosInterceptor()
```

### 3. 完整测试流程
```javascript
// 运行完整的token header测试
await window.tokenHeaderTest.runFullTest()
```

### 4. 手动验证
```javascript
// 检查当前token
const token = localStorage.getItem('goqgo_token')
console.log('当前token:', token ? token.substring(0, 20) + '...' : 'null')

// 检查axios默认headers
import axios from '@/utils/axios'
console.log('Axios默认headers:', axios.defaults.headers)
```

## Token流程图

```
用户登录
    ↓
API返回bearer_token
    ↓
userStore.setToken(bearer_token)
    ↓
保存到localStorage (goqgo_token + auth_token)
    ↓
后续API请求
    ↓
axios拦截器检查认证
    ↓
authManager.getToken()获取token
    ↓
添加Authorization: Bearer {token}到请求头
    ↓
发送请求到后端
```

## 可能的问题场景

### 1. Token未保存
**症状**: 登录成功但后续API请求返回401
**检查方法**:
```javascript
window.tokenHeaderTest.checkTokenStorage()
```

### 2. Token格式错误
**症状**: token存在但请求仍然返回401
**检查方法**:
```javascript
const token = localStorage.getItem('goqgo_token')
console.log('Token格式检查:', token?.startsWith('eyJ') ? '✅ JWT格式' : '❌ 非JWT格式')
```

### 3. 拦截器未生效
**症状**: token存在但未添加到请求头
**检查方法**:
```javascript
await window.tokenHeaderTest.testApiRequestHeaders()
```

### 4. 跳过认证的路径配置错误
**症状**: 某些需要认证的请求被错误跳过
**检查方法**:
```javascript
import { authManager } from '@/utils/auth'
console.log('是否跳过认证:', authManager.shouldSkipAuth('/ns/default/agents'))
```

## 调试步骤

### 步骤1: 检查登录流程
```javascript
// 1. 检查登录响应
console.log('登录响应检查')

// 2. 检查token保存
window.tokenHeaderTest.checkTokenStorage()
```

### 步骤2: 检查请求拦截
```javascript
// 1. 测试axios拦截器
await window.tokenHeaderTest.testAxiosInterceptor()

// 2. 检查请求headers
await window.tokenHeaderTest.testApiRequestHeaders()
```

### 步骤3: 检查网络请求
1. 打开浏览器开发者工具
2. 切换到Network面板
3. 发送API请求
4. 检查请求头中是否包含`Authorization: Bearer xxx`

### 步骤4: 检查服务器响应
1. 查看API响应状态码
2. 如果是401，检查token是否有效
3. 如果是403，检查用户权限

## 常见问题解决

### Q1: 登录成功但API请求返回401
**可能原因**:
- Token未正确保存
- Token格式错误
- Token已过期
- 拦截器未生效

**解决方案**:
```javascript
// 检查token状态
window.tokenHeaderTest.checkTokenStorage()

// 重新登录
window.logout()
// 然后重新登录
```

### Q2: 某些API请求没有Authorization header
**可能原因**:
- 路径被错误地添加到跳过认证列表
- 拦截器配置问题

**解决方案**:
```javascript
// 检查是否被跳过认证
import { authManager } from '@/utils/auth'
console.log('跳过认证检查:', authManager.shouldSkipAuth('/your/api/path'))
```

### Q3: Token存在但格式不正确
**可能原因**:
- 后端返回的token格式变化
- Token被意外修改

**解决方案**:
```javascript
// 检查token格式
const token = localStorage.getItem('goqgo_token')
console.log('Token:', token)
console.log('是否JWT格式:', token?.startsWith('eyJ'))
```

## 最佳实践

### 1. Token管理
- 使用统一的token存储和获取方法
- 提供token过期检查和自动刷新
- 实现安全的token清理机制

### 2. 请求拦截
- 确保所有需要认证的请求都添加Authorization header
- 提供详细的调试日志
- 实现请求重试机制

### 3. 错误处理
- 统一处理401/403错误
- 提供用户友好的错误提示
- 实现自动跳转到登录页

### 4. 调试支持
- 提供完整的调试工具
- 记录详细的操作日志
- 支持开发环境的测试功能

## 测试用例

### 自动化测试
```javascript
// 完整的token header测试套件
const runTokenTests = async () => {
  console.log('🧪 开始Token Header测试')
  
  // 1. 存储测试
  window.tokenHeaderTest.checkTokenStorage()
  
  // 2. 拦截器测试
  await window.tokenHeaderTest.testAxiosInterceptor()
  
  // 3. 请求头测试
  await window.tokenHeaderTest.testApiRequestHeaders()
  
  console.log('✅ Token Header测试完成')
}

// 运行测试
runTokenTests()
```

### 手动测试
1. **登录测试**: 使用有效凭据登录，检查token是否保存
2. **API测试**: 发送需要认证的API请求，检查是否包含Authorization header
3. **过期测试**: 使用过期token，检查是否正确处理401错误
4. **权限测试**: 使用无权限token，检查是否正确处理403错误

通过以上分析和测试工具，可以确保用户登录后的token正确添加到HTTP请求的Authorization header中。
