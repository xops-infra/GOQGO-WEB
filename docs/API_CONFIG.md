# API配置统一管理

## 概述

为了解决项目中API接口地址不统一的问题，我们创建了统一的API配置管理系统。所有的API地址现在都通过 `src/config/api.ts` 文件进行统一管理。

## 配置文件结构

### 主配置文件：`src/config/api.ts`

```typescript
// API配置接口
export interface ApiConfig {
  baseURL: string      // HTTP API基础地址
  wsBaseURL: string    // WebSocket基础地址
  timeout: number      // 请求超时时间
}

// 根据环境自动选择配置
export const apiConfig = getApiConfig()

// 预定义的API端点
export const API_ENDPOINTS = {
  AUTH: { ... },
  NAMESPACES: { ... },
  AGENTS: { ... },
  FILES: { ... },
  USERS: { ... },
  WEBSOCKET: { ... }
}
```

### 环境变量配置

#### 开发环境 (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080
```

#### 生产环境 (`.env.production`)
```env
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
```

## 使用方法

### 1. HTTP API调用

```typescript
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'

// 使用预定义端点
const response = await axios.get(API_ENDPOINTS.AGENTS.LIST('default'))

// 构建自定义URL
const customUrl = buildApiUrl('/api/v1/custom/endpoint')
```

### 2. WebSocket连接

```typescript
import { buildWsUrl, API_ENDPOINTS } from '@/config/api'

// 使用预定义端点
const wsUrl = buildWsUrl(API_ENDPOINTS.WEBSOCKET.CHAT(namespace, token))

// 构建自定义WebSocket URL
const customWsUrl = buildWsUrl('/ws/custom/endpoint')
```

### 3. 在组件中使用

```vue
<script setup lang="ts">
import { buildApiUrl, apiConfig } from '@/config/api'

// 获取配置信息
const baseURL = apiConfig.baseURL

// 构建完整URL
const imageUrl = `${apiConfig.baseURL}/path/to/image.jpg`
</script>
```

## 已更新的文件

### 核心配置文件
- ✅ `src/config/api.ts` - 新增统一配置文件
- ✅ `.env.development` - 开发环境配置
- ✅ `.env.production` - 生产环境配置

### 工具类文件
- ✅ `src/utils/axios.ts` - 使用统一baseURL配置
- ✅ `src/utils/chatSocket.ts` - 使用统一WebSocket配置
- ✅ `src/utils/logSocket.ts` - 使用统一WebSocket配置
- ✅ `src/utils/messageParser.ts` - 使用统一API配置

### API接口文件
- ✅ `src/api/agents.ts` - 使用预定义端点
- ✅ `src/api/files.ts` - 使用预定义端点
- ✅ `src/api/namespaces.ts` - 使用预定义端点
- ✅ `src/api/users.ts` - 使用预定义端点
- ✅ `src/api/upload.ts` - 使用统一配置

### 状态管理
- ✅ `src/stores/user.ts` - 使用统一配置

### 组件文件
- ✅ `src/components/AgentLogsModal.vue` - 使用统一配置
- ✅ `src/components/ChatRoom.vue` - 使用统一配置

## 环境适配

### 开发环境
- 自动使用 `http://localhost:8080` 作为API地址
- 自动使用 `ws://localhost:8080` 作为WebSocket地址

### 生产环境
- 自动使用当前域名作为API地址
- 根据HTTPS/HTTP自动选择WSS/WS协议
- 支持通过环境变量覆盖默认配置

## 优势

1. **统一管理**: 所有API地址在一个文件中管理
2. **环境适配**: 自动根据开发/生产环境选择合适的配置
3. **类型安全**: 完整的TypeScript类型定义
4. **易于维护**: 修改API地址只需要更新配置文件
5. **灵活配置**: 支持环境变量覆盖默认配置

## 注意事项

1. 新增API端点时，建议在 `API_ENDPOINTS` 中定义
2. 组件中避免硬编码API地址，使用配置文件中的方法
3. WebSocket连接统一使用 `buildWsUrl()` 方法
4. HTTP请求统一使用 `buildApiUrl()` 方法或预定义端点

## 迁移指南

如果需要添加新的API调用：

```typescript
// ❌ 不推荐：硬编码
const response = await fetch('http://localhost:8080/api/v1/new-endpoint')

// ✅ 推荐：使用统一配置
import { buildApiUrl } from '@/config/api'
const response = await fetch(buildApiUrl('/api/v1/new-endpoint'))

// ✅ 更推荐：在API_ENDPOINTS中定义
// 1. 在 src/config/api.ts 中添加端点定义
// 2. 使用预定义端点
const response = await fetch(API_ENDPOINTS.NEW_FEATURE.ENDPOINT)
```
