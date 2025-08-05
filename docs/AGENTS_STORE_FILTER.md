# Agents Store 用户过滤功能

## 功能概述

将Agent用户过滤逻辑从组件层面移到了store层面，实现了集中化的数据管理和过滤。这样做的好处是：

1. **统一过滤逻辑**: 所有使用agents数据的组件都会自动应用用户过滤
2. **减少重复代码**: 不需要在每个组件中重复实现过滤逻辑
3. **更好的性能**: 过滤在数据获取时就完成，避免重复计算
4. **集中管理**: 过滤规则的修改只需要在store中进行

## 实现方案

### 1. Agents Store 结构

```typescript
// src/stores/agents.ts
export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<Agent[]>([])  // 已过滤的agents列表
  const loading = ref(false)
  const selectedAgent = ref<Agent | null>(null)

  // 获取其他stores
  const userStore = useUserStore()
  
  // 过滤函数
  const filterAgentsByUser = (agents: Agent[], currentUser: any): Agent[] => {
    // 用户权限过滤逻辑
  }
  
  // 获取数据时自动过滤
  const performFetch = async (targetNamespace: string) => {
    const data = await agentApi.getList(targetNamespace)
    const rawAgents = data.items || []
    
    // 执行用户权限过滤
    const filteredAgents = filterAgentsByUser(rawAgents, userStore.currentUser)
    agents.value = filteredAgents
  }
})
```

### 2. 过滤逻辑

```typescript
const filterAgentsByUser = (agents: Agent[], currentUser: any): Agent[] => {
  if (!currentUser) {
    return []
  }

  const username = currentUser.username || currentUser.displayName?.toLowerCase() || ''
  const isAdmin = currentUser.role === 'admin' || currentUser.displayName === 'zhoushoujian'

  // 管理员看到所有Agent
  if (isAdmin) {
    return agents
  }

  // 普通用户只看到自己的Agent
  return agents.filter(agent => {
    return agent.username && 
           agent.username.toLowerCase() === username.toLowerCase()
  })
}
```

### 3. 组件使用

```vue
<!-- src/views/AgentsView.vue -->
<script setup lang="ts">
import { useAgentsStore } from '@/stores/agents'

const agentsStore = useAgentsStore()

// 直接使用store中已过滤的数据
const agents = computed(() => agentsStore.agents)
const loading = computed(() => agentsStore.loading)

// 只需要处理额外的搜索过滤
const filteredAgents = computed(() => {
  let result = agents.value
  
  // 用户名搜索过滤（可选）
  if (usernameFilter.value) {
    result = result.filter(agent => 
      agent.username?.toLowerCase().includes(usernameFilter.value.toLowerCase())
    )
  }
  
  return result
})

// 刷新数据
const refreshAgents = async () => {
  await agentsStore.fetchAgents(selectedNamespace.value)
}
</script>
```

## 调试信息

### Store层调试
```javascript
🔍 [Agent过滤] 开始过滤: {totalAgents: 3, currentUser: {...}}
🔍 [Agent过滤] 检查Agent: {agentName: "default-sys", agentUsername: "admin", match: false}
🔍 [Agent过滤] 检查Agent: {agentName: "user-agent", agentUsername: "zhoushoujian", match: true}
🔍 [Agent过滤] 过滤完成: {原始数量: 3, 过滤后数量: 1}
```

### 组件层调试
```javascript
🔍 [AgentsView过滤] 开始过滤: {原始数量: 1, 用户名过滤器: ""}
🔍 [AgentsView过滤] 最终结果: {total: 1, agents: [...]}
```

## 用户数据修复

为了解决用户数据中缺少username字段的问题，添加了自动修复功能：

### 1. 用户Store更新

```typescript
// src/stores/user.ts
const username = computed(() => {
  const user = currentUser.value
  if (!user) return ''
  
  // 优先使用实际用户名，如果没有则使用displayName的小写版本
  return user.username || user.displayName?.toLowerCase() || ''
})

// 登录时保存username字段
const user: User = {
  username: response.data.username || response.data.displayName?.toLowerCase(),
  displayName: response.data.displayName,
  email: response.data.email,
  role: response.data.role
}
```

### 2. 自动修复工具

```typescript
// src/utils/fixUserData.ts
export const autoFixUserData = (): void => {
  if (checkUserDataNeedsFix()) {
    const fixed = fixUserDataInStorage()
    if (fixed) {
      console.log('🔧 用户数据自动修复完成')
    }
  }
}
```

## 测试页面

### 1. 用户数据修复测试
```
http://localhost:3000/test/user-data-fix
```
- 检查用户数据结构
- 手动修复缺失的username字段
- 测试Agent匹配逻辑

### 2. Agent过滤调试
```
http://localhost:3000/test/agent-filter-debug
```
- 可视化过滤过程
- 实时调试日志
- 模拟数据测试

## 使用流程

### 1. 首次访问
1. 访问 `http://localhost:3000/test/user-data-fix`
2. 检查用户数据是否包含username字段
3. 如果缺失，点击"手动修复数据"
4. 刷新页面或重新登录

### 2. 验证过滤
1. 访问 `http://localhost:3000/agents`
2. 查看控制台输出，确认过滤逻辑正常
3. 普通用户应该只看到自己的Agent
4. 管理员可以看到所有Agent

### 3. 调试问题
1. 访问 `http://localhost:3000/test/agent-filter-debug`
2. 查看详细的过滤过程
3. 检查用户信息和Agent匹配情况

## 优势对比

### 之前的方案（组件层过滤）
```vue
<!-- 每个组件都需要重复实现 -->
const filteredAgents = computed(() => {
  let result = agents.value
  
  if (!userStore.isAdmin && userStore.username) {
    result = result.filter(agent => 
      agent.username?.toLowerCase() === userStore.username.toLowerCase()
    )
  }
  
  return result
})
```

### 现在的方案（Store层过滤）
```vue
<!-- 组件直接使用已过滤的数据 -->
const agents = computed(() => agentsStore.agents)  // 已经过滤过了

<!-- 只需要处理额外的搜索过滤 -->
const filteredAgents = computed(() => {
  return agents.value.filter(agent => 
    agent.username?.includes(searchText.value)
  )
})
```

## 注意事项

1. **数据一致性**: Store中的agents数据始终是已过滤的，确保所有组件看到的数据一致
2. **权限变更**: 如果用户权限发生变化，需要重新获取数据以应用新的过滤规则
3. **命名空间切换**: 切换命名空间时会自动重新获取和过滤数据
4. **错误处理**: API失败时不会显示其他用户的数据，确保安全性

## 扩展性

这种架构便于后续扩展：

1. **添加新的过滤条件**: 只需要在store的过滤函数中添加
2. **支持多种过滤模式**: 可以根据不同场景应用不同的过滤规则
3. **缓存优化**: 可以在store层添加缓存机制
4. **权限细化**: 可以支持更复杂的权限控制逻辑
