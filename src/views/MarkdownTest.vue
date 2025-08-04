<template>
  <div class="markdown-test-page">
    <n-card title="Markdown 渲染测试" :bordered="false">
      <n-space vertical :size="20">
        <!-- 测试内容输入 -->
        <n-input
          v-model:value="testContent"
          type="textarea"
          placeholder="输入 Markdown 内容进行测试..."
          :rows="8"
        />
        
        <!-- 渲染结果 -->
        <n-card title="渲染结果" size="small">
          <MarkdownRenderer :content="testContent" />
        </n-card>
        
        <!-- 预设测试内容 -->
        <n-space>
          <n-button @click="loadSample1">加载示例1</n-button>
          <n-button @click="loadSample2">加载示例2</n-button>
          <n-button @click="loadSample3">加载示例3</n-button>
          <n-button @click="clearContent">清空</n-button>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const testContent = ref(`# 这是一个标题

这是一段普通文本，包含 **粗体** 和 *斜体* 文字。

## 代码示例

这是一个内联代码：\`console.log('Hello World')\`

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`)
  return \`Welcome to GoQGo!\`
}

greet('Developer')
\`\`\`

## 列表

### 无序列表
- 项目1
- 项目2
  - 子项目A
  - 子项目B
- 项目3

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 引用

> 这是一个引用块
> 
> 可以包含多行内容

## 链接

这是一个 [链接示例](https://github.com/zhoushoujianwork/GOQGO-WEB)

## 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown渲染 | ✅ | 支持标准语法 |
| 代码高亮 | ✅ | 支持多种语言 |
| 表格 | ✅ | 支持基本表格 |

---

测试完成！✨`)

const loadSample1 = () => {
  testContent.value = `# AI Agent 消息示例

你好！我是 **GoQGo AI助手**，很高兴为你服务！

## 我可以帮你做什么？

- 📝 **代码编写和优化**
- 🐛 **Bug调试和修复** 
- 📚 **技术文档编写**
- 🔍 **代码审查**

### 代码示例

\`\`\`typescript
interface Agent {
  id: string
  name: string
  status: 'running' | 'idle' | 'error'
  role: string
}

const createAgent = async (data: CreateAgentRequest): Promise<Agent> => {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
\`\`\`

> 💡 **提示**: 你可以随时 @我 来获取帮助！`
}

const loadSample2 = () => {
  testContent.value = `## 🚀 项目进度更新

### 已完成功能
- [x] 用户认证系统
- [x] 聊天室基础功能
- [x] Markdown消息渲染
- [x] 代码高亮显示

### 进行中
- [ ] 文件上传功能
- [ ] 消息搜索
- [ ] 主题切换

### 技术栈

\`\`\`json
{
  "frontend": {
    "framework": "Vue 3",
    "ui": "Naive UI", 
    "state": "Pinia",
    "build": "Vite"
  },
  "backend": {
    "language": "Go",
    "framework": "Gin",
    "database": "PostgreSQL",
    "cache": "Redis"
  }
}
\`\`\`

### 性能指标

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| 首屏加载时间 | 1.2s | < 1s |
| 消息发送延迟 | 50ms | < 100ms |
| 内存使用 | 45MB | < 50MB |

---
*最后更新: ${new Date().toLocaleString()}*`
}

const loadSample3 = () => {
  testContent.value = `# 🔧 系统状态报告

## 服务状态 ✅

所有核心服务运行正常：

\`\`\`bash
# 检查服务状态
kubectl get pods -n goqgo-system

NAME                    READY   STATUS    RESTARTS   AGE
api-server-7d4b8f9c-x2k1    1/1     Running   0          2h
chat-service-5f6g7h8-y3m2   1/1     Running   0          2h
web-frontend-9a1b2c3-z4n5   1/1     Running   0          1h
\`\`\`

## 监控数据

### CPU 使用率
- API Server: **12%**
- Chat Service: **8%** 
- Frontend: **5%**

### 内存使用
- API Server: **256MB** / 512MB
- Chat Service: **128MB** / 256MB
- Frontend: **64MB** / 128MB

## 最近日志

\`\`\`log
2025-08-03 11:20:15 [INFO] Chat message sent successfully
2025-08-03 11:20:16 [INFO] User connected: user_12345
2025-08-03 11:20:17 [INFO] Markdown content rendered
2025-08-03 11:20:18 [INFO] WebSocket connection established
\`\`\`

> ⚠️ **注意**: 系统将在今晚 23:00 进行例行维护，预计持续 30 分钟。

---
**系统管理员** | *GoQGo Team*`
}

const clearContent = () => {
  testContent.value = ''
}
</script>

<style scoped lang="scss">
.markdown-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
