# Agent过滤功能调试指南

## 问题描述

Agent用户过滤功能可能没有按预期工作，需要通过控制台日志和调试页面来排查问题。

## 调试工具

### 1. 控制台调试信息

已在以下位置添加了详细的调试日志：

#### AgentsView.vue - filteredAgents计算属性
- 显示原始Agent数据
- 显示当前用户信息
- 显示每个Agent的过滤检查过程
- 显示最终过滤结果

#### AgentsView.vue - refreshAgents方法
- 显示API调用过程
- 显示获取到的Agent数据
- 显示模拟数据使用情况

#### UserStore - isAdmin计算属性
- 显示用户权限检查过程
- 显示管理员判断逻辑

### 2. 调试页面

访问 `/test/agent-filter-debug` 页面进行可视化调试：

- **用户信息面板**: 显示当前登录用户的详细信息
- **原始数据面板**: 显示未过滤的Agent数据
- **过滤控制面板**: 手动测试过滤功能
- **过滤结果面板**: 显示过滤后的数据和匹配原因
- **调试日志面板**: 实时显示过滤过程日志

## 调试步骤

### 1. 检查用户登录状态

```javascript
// 在浏览器控制台执行
console.log('用户状态:', {
  isAuthenticated: userStore.isAuthenticated,
  username: userStore.username,
  displayName: userStore.displayName,
  isAdmin: userStore.isAdmin,
  currentUser: userStore.currentUser
})
```

### 2. 检查Agent数据

访问 `/agents` 页面，查看控制台输出：

```
🔍 [Agent过滤] 原始Agent数据: {...}
🔍 [Agent过滤] 用户信息: {...}
🔍 [Agent过滤] 检查Agent: {...}
🔍 [Agent过滤] 最终结果: {...}
```

### 3. 使用调试页面

1. 访问 `/test/agent-filter-debug`
2. 检查用户信息是否正确
3. 加载模拟数据
4. 观察过滤结果
5. 查看调试日志

### 4. 常见问题排查

#### 问题1: 用户信息不正确
- 检查是否正确登录
- 检查localStorage中的用户数据
- 检查userStore的状态

#### 问题2: 过滤逻辑不生效
- 检查Agent数据中是否有username字段
- 检查用户名大小写是否匹配
- 检查管理员权限判断逻辑

#### 问题3: API数据格式问题
- 检查API返回的数据结构
- 确认username字段存在且正确
- 检查模拟数据是否与API格式一致

## 预期行为

### 普通用户 (非管理员)
- 只能看到username字段与当前用户名匹配的Agent
- 大小写不敏感比较
- 用户名过滤器不可用

### 管理员用户
- 可以看到所有Agent
- 可以使用用户名过滤器进一步筛选
- 界面显示"(已过滤: 用户名)"提示

## 调试输出示例

### 正常工作的输出
```
🔍 [Agent过滤] 原始Agent数据: {total: 4, agents: [...]}
🔍 [Agent过滤] 用户信息: {currentUsername: "zhoushoujian", isAdminUser: false}
🔍 [Agent过滤] 检查Agent: {agentName: "user-agent-1", agentUsername: "zhoushoujian", match: true}
🔍 [Agent过滤] 用户权限过滤结果: {beforeFilter: 4, afterFilter: 2}
🔍 [Agent过滤] 最终结果: {total: 2, agents: [...]}
```

### 问题输出示例
```
🔍 [Agent过滤] 用户信息: {currentUsername: "", isAdminUser: false}  // 用户名为空
🔍 [Agent过滤] 检查Agent: {agentUsername: undefined, match: false}  // Agent没有username字段
```

## 修复建议

### 1. 用户名为空
- 检查登录流程
- 确认token解析正确
- 检查用户数据存储

### 2. Agent数据缺少username字段
- 检查API返回格式
- 更新模拟数据结构
- 确认后端数据正确

### 3. 管理员权限判断错误
- 检查用户角色字段
- 确认管理员判断逻辑
- 更新权限检查条件

## 清理调试信息

调试完成后，可以移除或注释掉调试日志：

```javascript
// 将详细的console.log改为简单的日志
console.log('🔍 [Agent过滤] 最终结果:', result.length)
```

或者使用环境变量控制：

```javascript
if (import.meta.env.DEV) {
  console.log('🔍 [Agent过滤] 调试信息:', ...)
}
```
