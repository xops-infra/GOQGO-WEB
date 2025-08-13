# 日志显示问题诊断指南

## 问题描述
用户反馈日志窗口显示为空，没有调用日志API接口。

## 可能的原因和解决方案

### 1. 认证问题 🔑

#### 问题：缺少API Token
**症状**：日志窗口空白，控制台显示401认证错误

**解决方案**：
```bash
# 方法1：设置环境变量（推荐）
export GOQGO_API_TOKEN=AT-1a58ecec070c86938b566d00d5630513

# 方法2：在.env.local文件中添加
echo "VITE_API_TOKEN=AT-1a58ecec070c86938b566d00d5630513" >> .env.local
```

#### 问题：Token格式错误
**检查方法**：
```javascript
// 在浏览器控制台执行
console.log('Token:', localStorage.getItem('goqgo_token'))
console.log('Env Token:', import.meta.env.VITE_API_TOKEN)
```

### 2. API服务器连接问题 🌐

#### 问题：GoQGo API服务器未启动
**检查方法**：
```bash
# 检查API服务器状态
curl http://localhost:8080/health

# 启动API服务器
./bin/goqgo apiserver --port 8080
```

#### 问题：端口冲突或配置错误
**检查配置**：
```javascript
// 在浏览器控制台执行
console.log('API Config:', {
  baseURL: import.meta.env.VITE_API_BASE_URL || window.location.origin,
  isDev: import.meta.env.DEV
})
```

### 3. Agent状态问题 🤖

#### 问题：Agent不存在或未运行
**检查方法**：
```bash
# 检查Agent列表
goqgo agent list --namespace default

# 检查特定Agent状态
goqgo agent describe <agent-name> --namespace default
```

#### 问题：Agent日志文件不存在
**检查日志文件**：
```bash
# 检查tmux会话
tmux list-sessions | grep <agent-name>

# 检查日志文件
ls -la ~/.goqgo/schedule/runtime/sessions/*/default/
```

### 4. 前端代码问题 💻

#### 问题：API调用失败
**调试方法**：
```javascript
// 在浏览器控制台执行API测试
testLogsApi('default', 'your-agent-name')
```

#### 问题：组件状态异常
**检查组件状态**：
```javascript
// 检查LogManager状态
console.log('LogManager:', window.logManagerInstance)

// 检查网络请求
// 打开开发者工具 -> Network 标签页，查看是否有日志API请求
```

## 诊断步骤

### 第一步：基础检查
1. 确认GoQGo API服务器正在运行
2. 确认Agent存在且状态正常
3. 确认浏览器控制台没有错误信息

### 第二步：认证检查
1. 检查环境变量中的API Token
2. 检查浏览器localStorage中的认证信息
3. 测试API连接

### 第三步：网络检查
1. 打开浏览器开发者工具
2. 切换到Network标签页
3. 打开日志窗口，观察是否有API请求
4. 检查请求状态码和响应内容

### 第四步：详细调试
1. 在控制台执行 `testLogsApi('namespace', 'agent-name')`
2. 查看详细的调试输出
3. 根据错误信息进行针对性修复

## 常见错误码

| 状态码 | 含义 | 解决方案 |
|--------|------|----------|
| 401 | 未授权 | 检查API Token |
| 403 | 权限不足 | 检查用户权限 |
| 404 | Agent不存在 | 检查Agent名称和namespace |
| 500 | 服务器错误 | 检查API服务器日志 |

## 最新修复

### 2025-08-12 修复内容：
1. ✅ 添加环境变量API Token支持
2. ✅ 修复buildApiUrl导入问题
3. ✅ 增强LogManager调试信息
4. ✅ 添加API测试工具
5. ✅ 优化认证管理器

### 修复后的功能：
- 支持通过环境变量设置API Token
- 详细的API调用日志
- 自动API诊断测试
- 更好的错误提示

## 验证修复

### 测试步骤：
1. 设置环境变量：`VITE_API_TOKEN=AT-1a58ecec070c86938b566d00d5630513`
2. 重新构建前端：`npm run build`
3. 启动API服务器：`./bin/goqgo apiserver`
4. 创建测试Agent：`goqgo agent create test-agent`
5. 打开日志窗口，检查是否显示日志内容

### 预期结果：
- 日志窗口显示Agent的实际日志内容
- 控制台显示详细的API调用信息
- 没有认证错误或网络错误

## 联系支持

如果按照以上步骤仍无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. GoQGo API服务器的日志
3. Agent的状态信息
4. 网络请求的详细信息（开发者工具Network标签页）
