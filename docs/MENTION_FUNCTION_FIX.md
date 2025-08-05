# @功能修复说明

## 问题描述

原来的ChatInput组件中，@功能在只有一个agent时会失效，并且缺少默认@sys agent的功能。

## 修复内容

### 1. 修复单Agent时@功能失效

**原问题代码:**
```javascript
// 如果只有一个实例，不显示选择器
if (agents.value.length <= 1) {
  console.log('❌ agents数量不足，隐藏选择器')
  hideMentionSelector()
  return
}
```

**修复后代码:**
```javascript
// 如果没有agents，隐藏选择器
if (agents.value.length === 0) {
  console.log('❌ 没有可用的agents，隐藏选择器')
  hideMentionSelector()
  return
}

// 如果只有一个agent，自动选择它
if (agents.value.length === 1) {
  console.log('✅ 只有一个agent，自动选择:', agents.value[0].name)
  // 自动完成@提及
  const agent = agents.value[0]
  const currentValue = inputMessage.value
  const beforeMention = currentValue.substring(0, lastAtIndex)
  const afterMention = currentValue.substring(lastAtIndex + 1 + queryText.length)
  
  // 插入@提及
  const newValue = `${beforeMention}@${agent.name} ${afterMention}`
  inputMessage.value = newValue
  
  // 设置光标位置
  nextTick(() => {
    const input = getInputElement()
    if (input) {
      const newCursorPos = lastAtIndex + agent.name.length + 2 // @name + space
      input.setSelectionRange(newCursorPos, newCursorPos)
      input.focus()
    }
  })
  
  hideMentionSelector()
  return
}
```

### 2. 添加默认@sys agent功能

**新增功能:**
```javascript
// 查找sys agent
const findSysAgent = () => {
  // 查找名称包含'sys'的agent，优先级：default-sys > xxx-sys > sys
  const sysAgents = agents.value.filter(agent => 
    agent.name.toLowerCase().includes('sys')
  )
  
  if (sysAgents.length === 0) {
    return null
  }
  
  // 优先选择default-sys
  const defaultSys = sysAgents.find(agent => 
    agent.name.toLowerCase() === 'default-sys'
  )
  if (defaultSys) {
    return defaultSys
  }
  
  // 其次选择以sys结尾的agent
  const endWithSys = sysAgents.find(agent => 
    agent.name.toLowerCase().endsWith('-sys')
  )
  if (endWithSys) {
    return endWithSys
  }
  
  // 最后选择包含sys的第一个agent
  return sysAgents[0]
}

// 自动添加@sys agent
const autoAddSysAgent = (message: string) => {
  // 检查消息是否已经包含@提及
  const hasAtMention = /@\w+/.test(message)
  if (hasAtMention) {
    console.log('🔍 消息已包含@提及，不自动添加sys')
    return message
  }
  
  // 查找sys agent
  const sysAgent = findSysAgent()
  if (!sysAgent) {
    console.log('🔍 未找到sys agent，不自动添加')
    return message
  }
  
  console.log('🤖 自动添加@sys agent:', sysAgent.name)
  return `@${sysAgent.name} ${message}`
}
```

**集成到发送消息流程:**
```javascript
const handleSendMessage = async () => {
  if (!canSendMessage.value) return

  let text = inputMessage.value.trim()
  if (!text) return

  try {
    // 自动添加@sys agent（如果消息中没有@提及）
    text = autoAddSysAgent(text)
    
    // 解析Agent提及
    const agentMentions = AgentMentionParser.extractUniqueAgents(text)
    const mentionedAgentNames = agentMentions.map(mention => `${mention.agentName}.${mention.namespace}`)

    console.log('📤 发送消息:', {
      originalText: inputMessage.value.trim(),
      finalText: text,
      mentionedAgents: mentionedAgentNames
    })

    // 发送消息，包含Agent提及信息
    emit('send', text, mentionedAgentNames)
    inputMessage.value = ''
    hideMentionSelector()
    hideAgentAutocomplete()
  } catch (error) {
    console.error('❌ 发送过程中出错:', error)
  }
}
```

## 功能特性

### 1. 智能@提及

- **多Agent场景**: 显示选择器，用户可以选择要@的agent
- **单Agent场景**: 自动完成@提及，无需显示选择器
- **无Agent场景**: 不显示选择器，避免错误

### 2. 默认@sys功能

- **自动检测**: 如果消息中没有@提及，自动添加@sys
- **智能选择**: 按优先级选择sys agent：
  1. `default-sys`
  2. 以`-sys`结尾的agent
  3. 包含`sys`的第一个agent
- **避免重复**: 如果消息已包含@提及，不会重复添加

### 3. 用户体验优化

- **光标定位**: @提及完成后，光标自动定位到正确位置
- **键盘导航**: 支持方向键、Enter、Tab、Escape等快捷键
- **实时反馈**: 控制台输出详细的调试信息

## 测试页面

访问 `http://localhost:3000/test/mention-function` 进行功能测试：

### 测试内容

1. **Agents信息展示**:
   - 显示当前可用的agents
   - 显示检测到的sys agents
   - 显示默认选择的sys agent

2. **@功能测试**:
   - 实际的ChatInput组件
   - 可以测试@触发和自动完成
   - 实时显示发送消息记录

3. **手动测试按钮**:
   - 测试自动@sys功能
   - 测试单Agent@功能
   - 刷新agents数据

### 测试场景

#### 场景1: 多个Agent
1. 输入`@`符号
2. 应该显示agent选择器
3. 可以用键盘导航选择
4. 选择后自动完成@提及

#### 场景2: 单个Agent
1. 输入`@`符号
2. 应该自动完成@提及，不显示选择器
3. 光标定位到@提及后面

#### 场景3: 无@提及的消息
1. 输入普通消息（不包含@）
2. 发送时应该自动添加@sys
3. 最终消息格式：`@default-sys 原消息内容`

#### 场景4: 已有@提及的消息
1. 输入包含@的消息
2. 发送时不应该重复添加@sys
3. 保持原有的@提及

## 调试信息

### 控制台输出示例

```javascript
// @触发检测
🔍 checkMentionTrigger 被调用
📝 检查的值: @test
🤖 当前agents数量: 1
✅ 只有一个agent，自动选择: default-sys

// 自动@sys功能
🔍 消息已包含@提及，不自动添加sys
// 或
🤖 自动添加@sys agent: default-sys

// 发送消息
📤 发送消息: {
  originalText: "hello world",
  finalText: "@default-sys hello world", 
  mentionedAgents: ["default-sys.default"]
}
```

## 兼容性

- 保持与现有AgentMentionParser的兼容性
- 支持新旧两种@语法
- 不影响现有的Agent自动补全功能

## 注意事项

1. **Sys Agent检测**: 如果没有找到包含'sys'的agent，自动@功能将不生效
2. **命名空间**: 自动添加的@提及会包含正确的命名空间信息
3. **性能**: 只在发送消息时进行@sys检测，不影响输入性能
4. **用户体验**: 用户可以通过手动添加@来覆盖自动@sys行为

## 后续优化

1. **配置化**: 可以考虑将默认@的agent设为可配置
2. **智能选择**: 根据上下文或用户习惯选择默认@的agent
3. **批量@**: 支持@多个agent的场景
4. **@历史**: 记住用户常用的@提及，提供快速选择
