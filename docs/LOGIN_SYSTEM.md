# 登录系统设计文档

## 🎯 功能概述

GoQGo Web应用现在支持基于Token的用户认证系统，确保只有授权用户才能访问系统资源。

## 🔐 认证方式

### 1. Token登录（已实现）
- **输入方式**: 用户输入访问令牌
- **验证逻辑**: 前端验证token格式，后台解析用户信息
- **存储方式**: localStorage持久化存储
- **有效期**: 24小时（可配置）

### 2. AD登录（预留）
- **状态**: 开发中，界面已预留
- **功能**: Active Directory集成登录
- **计划**: 后续版本实现

## 🎨 界面设计

### 布局结构
```
┌─────────────────────────────────────────────────────────┐
│  左侧品牌展示区域（2/3）    │  右侧登录区域（1/3）      │
│  ┌─────────────────────┐    │  ┌─────────────────────┐  │
│  │ GoQGo Logo          │    │  │ 登录表单            │  │
│  │ 品牌标题            │    │  │ - Token登录         │  │
│  │ 功能特性介绍        │    │  │ - AD登录(预留)      │  │
│  │ 版本信息            │    │  │ 帮助说明            │  │
│  └─────────────────────┘    │  └─────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 主题适配
- **深色模式**: 自动适配系统主题
- **响应式设计**: 支持移动端和桌面端
- **现代化UI**: 使用Naive UI组件库

## 🔧 技术实现

### 路由守卫
```typescript
// 路由保护逻辑
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false
  const hideForAuth = to.meta.hideForAuth === true
  
  if (requiresAuth && !userStore.isAuthenticated) {
    next('/login') // 跳转到登录页
  } else if (hideForAuth && userStore.isAuthenticated) {
    next('/') // 已登录用户跳转到首页
  } else {
    next() // 允许访问
  }
})
```

### 用户Store
```typescript
// 主要功能
- loginWithToken(token: string) // Token登录
- loginWithAD(username, password) // AD登录（预留）
- logout() // 登出
- restoreAuth() // 恢复登录状态
- fetchCurrentUser() // 获取用户信息
```

### 状态管理
```typescript
interface User {
  id: string
  username: string
  displayName?: string
  email?: string
  avatar?: string
  role?: string
  permissions?: string[]
}
```

## 🛡️ 安全特性

### Token验证
- **格式检查**: 最小长度10字符
- **前缀验证**: 支持`goqgo_`前缀token
- **过期检查**: 24小时自动过期
- **本地存储**: 安全的localStorage存储

### 权限控制
- **页面级权限**: 路由守卫保护
- **功能级权限**: 基于用户角色和权限
- **API级权限**: 后台token解析用户身份

## 📋 使用流程

### 用户登录流程
1. 访问任意需要认证的页面
2. 自动跳转到 `/login` 页面
3. 选择Token登录方式
4. 输入访问令牌
5. 点击登录按钮
6. 验证成功后跳转到首页

### 获取Token
- 联系系统管理员获取个人访问令牌
- 令牌用于身份验证和资源访问控制
- 请妥善保管令牌，不要与他人分享

### 登出流程
1. 点击右上角用户头像
2. 选择"退出登录"
3. 确认退出
4. 清除本地认证信息
5. 跳转到登录页面

## 🔄 状态恢复

### 自动登录
- 页面刷新时自动恢复登录状态
- 从localStorage读取保存的token和用户信息
- 验证token有效性
- 失败时自动跳转到登录页

### 会话管理
- 24小时token有效期
- 自动过期检查
- 支持token刷新（预留）

## 🧪 测试说明

### Token格式测试
```javascript
// 有效token示例
"goqgo_abc123def456ghi789"
"1234567890abcdefghijklmnopqrstuvwxyz"

// 无效token示例
"123" // 太短
"" // 空字符串
```

### 登录测试用例
1. **正常登录**: 输入有效token，验证登录成功
2. **无效token**: 输入无效token，显示错误提示
3. **空token**: 不输入token，显示验证错误
4. **网络错误**: 模拟网络异常，显示错误处理
5. **自动跳转**: 未登录访问保护页面，自动跳转登录
6. **重复登录**: 已登录用户访问登录页，跳转首页

## 📁 相关文件

### 核心文件
- `src/views/LoginView.vue` - 登录页面组件
- `src/stores/user.ts` - 用户状态管理
- `src/router/index.ts` - 路由配置和守卫
- `src/components/UserInfo.vue` - 用户信息组件

### 样式文件
- 登录页面样式集成在组件内
- 支持深色模式和响应式设计
- 使用CSS变量适配主题

## 🚀 后续计划

### 短期计划
- [ ] 集成真实的后台API
- [ ] 实现token刷新机制
- [ ] 添加记住登录状态选项
- [ ] 优化错误提示和用户体验

### 长期计划
- [ ] 实现AD登录功能
- [ ] 支持多因素认证
- [ ] 添加登录日志和安全审计
- [ ] 实现SSO单点登录

## 🔗 API接口

### 登录接口（待实现）
```typescript
POST /api/v1/auth/login
{
  "token": "user_access_token"
}

Response:
{
  "user": {
    "id": "user_123",
    "username": "xops",
    "displayName": "开发者",
    "email": "user@goqgo.com",
    "role": "developer",
    "permissions": ["chat:read", "chat:write"]
  },
  "token": "jwt_token_here",
  "expiresAt": "2025-08-02T02:30:00Z"
}
```

### 用户信息接口（待实现）
```typescript
GET /api/v1/users/me
Authorization: Bearer {token}

Response:
{
  "id": "user_123",
  "username": "xops",
  "displayName": "开发者",
  "email": "user@goqgo.com",
  "role": "developer",
  "permissions": ["chat:read", "chat:write"],
  "lastLoginAt": "2025-08-01T02:30:00Z"
}
```

---

登录系统已完成基础实现，支持Token认证和完整的用户会话管理！🎉
