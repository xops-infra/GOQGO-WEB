# GoQGo Web Mock功能使用指南

## 🎭 Mock功能概述

为了在API服务器重构期间能够正常开发和演示，我们为GoQGo Web项目添加了完整的Mock功能支持。Mock功能提供了模拟的后端服务，让你可以在没有真实API服务器的情况下体验完整的应用功能。

## 🚀 快速开始

### 1. 启动应用

```bash
# 克隆项目
git clone https://github.com/zhoushoujianwork/GOQGO-WEB.git
cd GOQGO-WEB

# 安装依赖
npm install

# 启动开发服务器（Mock模式默认启用）
npm run dev
```

### 2. 访问应用

打开浏览器访问：http://localhost:3002

### 3. 使用测试账户登录

Mock模式提供了两个测试账户：

**管理员账户**
- 用户名：`admin`
- 密码：`admin123`

**演示账户**
- 用户名：`demo`
- 密码：`demo123`

## 🎯 Mock功能特性

### ✅ 已支持的功能

1. **用户认证**
   - 登录/登出
   - Token验证
   - 用户信息获取

2. **Agent管理**
   - Agent列表查看
   - Agent详情查看
   - Agent创建/删除
   - Agent重启/停止
   - 批量操作

3. **命名空间管理**
   - 命名空间列表
   - 命名空间创建/删除
   - 命名空间切换

4. **聊天系统**
   - 消息发送/接收
   - @提及功能
   - 消息历史

5. **实时通信**
   - WebSocket连接模拟
   - 实时消息推送
   - 连接状态管理

6. **日志系统**
   - Agent日志查看
   - 实时日志流
   - 日志搜索

7. **文件上传**
   - 图片上传模拟
   - 文件上传模拟

### 📊 Mock数据

Mock系统包含以下预设数据：

- **3个命名空间**：default、development、testing
- **5个Agent实例**：不同状态和角色
- **5种角色**：后端工程师、前端工程师、数据工程师等
- **7条聊天消息**：包含@提及和系统消息
- **完整的日志数据**：每个Agent都有详细的日志记录

## 🛠️ Mock控制面板

在开发模式下，右上角会显示Mock控制面板，提供以下功能：

- **启用/禁用Mock模式**：实时切换
- **重置数据**：恢复到初始状态
- **生成随机数据**：创建随机的测试数据
- **模拟断线**：测试WebSocket重连机制

## ⚙️ 配置选项

### 环境变量配置

在 `.env.development` 文件中：

```env
# 启用Mock模式
VITE_MOCK_ENABLED=true

# Mock延迟时间（毫秒）
VITE_MOCK_DELAY=300
```

### 代码中的配置

在 `src/mock/config.ts` 中可以调整：

```typescript
export const mockConfig = {
  enabled: true,           // 是否启用Mock
  delays: {
    auth: 500,            // 认证延迟
    api: 300,             // API延迟
    upload: 1000,         // 上传延迟
    logs: 400             // 日志延迟
  },
  websocket: {
    enabled: true,        // WebSocket Mock
    reconnectDelay: 3000, // 重连延迟
    heartbeatInterval: 30000 // 心跳间隔
  }
}
```

## 🔧 开发者工具

### 浏览器控制台

Mock系统在浏览器控制台提供了丰富的调试信息：

```javascript
// 全局Mock开发工具
window.mockDevTools.toggle()      // 切换Mock模式
window.mockDevTools.getState()    // 获取Mock状态
window.mockDevTools.resetData()   // 重置数据
```

### Mock日志

所有Mock操作都会在控制台输出详细日志：

```
🎭 [Mock Info] 使用Mock登录服务 admin
🎭 [Mock Info] 使用Mock获取Agent列表 {namespace: "default"}
🎭 [Mock Info] 使用Mock WebSocket URL {namespace: "default"}
```

## 📱 功能演示

### 1. 登录流程

1. 访问登录页面
2. 右上角会显示Mock登录提示
3. 点击"快速填入"按钮自动填入测试账户
4. 点击登录按钮（模拟500ms延迟）
5. 成功登录后跳转到主界面

### 2. Agent管理

1. 在主界面可以看到5个预设的Agent
2. 不同的Agent有不同的状态（运行中、空闲、错误等）
3. 可以点击Agent查看详情
4. 支持重启、停止、删除等操作
5. 支持批量选择和操作

### 3. 聊天功能

1. 在聊天界面可以看到历史消息
2. 支持发送新消息
3. 支持@提及其他Agent
4. WebSocket连接状态实时显示

### 4. 日志查看

1. 点击Agent的"查看日志"按钮
2. 可以看到详细的日志记录
3. 支持实时日志流（每2秒新增一条）
4. 支持日志搜索和过滤

## 🔄 Mock与真实API切换

### 自动切换

Mock系统会自动检测API服务器状态：

- 如果API服务器可用，自动使用真实API
- 如果API服务器不可用，自动切换到Mock模式

### 手动切换

通过控制面板或代码手动切换：

```javascript
// 启用Mock模式
window.mockDevTools.toggle()

// 或者在代码中
import { mockState } from '@/mock/config'
mockState.enabled = true
```

## 🚨 注意事项

### 数据持久性

- Mock数据存储在内存中，刷新页面会重置
- 用户偏好设置会保存到localStorage
- Mock模式状态会记住用户的选择

### 性能考虑

- Mock模式下所有操作都有适当的延迟模拟
- WebSocket连接使用定时器模拟，不会产生真实网络请求
- 大量数据操作时性能优于真实API

### 安全提醒

- Mock模式仅用于开发和演示
- 不要在生产环境启用Mock模式
- Mock账户密码仅用于测试，不代表真实安全标准

## 🐛 故障排除

### 常见问题

**Q: Mock模式没有启用？**
A: 检查环境变量 `VITE_MOCK_ENABLED=true` 是否设置正确

**Q: 登录失败？**
A: 确认使用正确的测试账户：admin/admin123 或 demo/demo123

**Q: WebSocket连接失败？**
A: Mock WebSocket是模拟的，不需要真实服务器，检查控制台是否有错误

**Q: 数据没有更新？**
A: 尝试使用控制面板的"重置数据"功能

### 调试技巧

1. 打开浏览器开发者工具
2. 查看Console标签页的Mock日志
3. 使用Network标签页确认没有真实网络请求
4. 使用Mock控制面板测试各种场景

## 📞 技术支持

如果在使用Mock功能时遇到问题：

1. 查看浏览器控制台的错误信息
2. 检查Mock配置是否正确
3. 尝试重置Mock数据
4. 提交Issue到GitHub仓库

## 🎉 总结

Mock功能为GoQGo Web项目提供了完整的离线开发和演示能力。无论是开发新功能、演示给客户，还是在API服务器不可用时继续工作，Mock系统都能提供可靠的支持。

通过Mock系统，你可以：
- ✅ 完整体验所有功能
- ✅ 进行前端开发和测试
- ✅ 演示项目给客户或团队
- ✅ 在API重构期间继续工作
- ✅ 测试各种边界情况和错误场景

Mock功能让开发更加高效，演示更加流畅！🚀
