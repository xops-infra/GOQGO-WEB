# 端口3002和登录跳转问题修复指南

## 🐛 问题描述

1. **端口问题**: start.sh脚本设置端口3000，但实际运行在3002
2. **登录跳转问题**: 登录成功后不跳转到主页面

## ✅ 修复方案

### 1. 端口问题修复

#### 问题原因
- start.sh脚本强制使用端口3000
- 但端口3000和3001已被其他进程占用
- Vite自动选择了端口3002，但脚本没有适配

#### 修复方案
1. **修改了start.sh** - 让Vite自动选择可用端口
2. **创建了start-dev.sh** - 更智能的开发启动脚本
3. **更新了vite.config.ts** - 添加了`strictPort: false`

#### 使用方法
```bash
# 方式一：使用改进的启动脚本
./start-dev.sh

# 方式二：使用修复后的原脚本
./start.sh

# 方式三：直接使用npm命令
npm run dev
```

### 2. 登录跳转问题修复

#### 问题原因
- userStore中缺少`isLoggedIn`计算属性
- LoginView.vue和路由守卫都依赖这个属性
- 导致登录状态判断失败，无法正确跳转

#### 修复方案
1. **添加了isLoggedIn计算属性**
   ```typescript
   const isLoggedIn = computed(() => isAuthenticated.value && !!currentUser.value)
   ```

2. **修复了token设置**
   - 在useLogin中正确调用`userStore.setToken()`
   - 确保认证状态完整设置

3. **改进了状态管理**
   - setUser方法正确设置isAuthenticated状态
   - 保持localStorage和内存状态同步

## 🚀 测试步骤

### 1. 启动应用
```bash
# 使用新的启动脚本
./start-dev.sh
```

### 2. 检查端口信息
启动后会显示：
```
🚀 启动 GoQGo Web 开发服务器...
🔍 检查端口占用情况...
⚠️  端口 3000 被占用
⚠️  端口 3001 被占用
✅ 端口 3002 可用
🌟 启动开发服务器（Vite将自动选择可用端口）...

  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3002/
  ➜  Network: http://192.168.x.x:3002/
```

### 3. 测试登录跳转
1. 访问 http://localhost:3002
2. 点击 **🔑 管理员登录 (admin)** 按钮
3. 应该看到登录成功消息：`欢迎回来，admin！`
4. 自动跳转到主页面 `/`
5. 右上角显示用户名 "admin"

### 4. 验证路由守卫
1. 手动访问 http://localhost:3002/login
2. 如果已登录，应该自动重定向到主页
3. 退出登录后，访问主页应该重定向到登录页

## 🔍 调试信息

### 登录成功的控制台日志
```
🎭 [Auth API] Mock状态检查: {mockEnabled: true, credentials: "admin"}
🎭 直接使用Mock管理员登录
🎭 [Mock Info] 使用Mock登录服务 admin
👤 设置用户信息: {id: "1", username: "admin", ...}
🔑 Token已设置
✅ 用户信息已设置: {id: "1", username: "admin", ...}
```

### 路由跳转日志
```
✅ 登录成功，用户: admin
🔄 路由跳转: /login -> /
✅ 主页面加载完成
```

## 📁 修改的文件

### 1. start.sh
- 移除了强制端口设置
- 让Vite自动选择可用端口

### 2. start-dev.sh (新增)
- 智能的开发启动脚本
- 端口占用检查
- 友好的提示信息

### 3. vite.config.ts
- 添加了 `strictPort: false`
- 允许端口自动选择

### 4. src/stores/user.ts
- 添加了 `isLoggedIn` 计算属性
- 修复了认证状态管理

### 5. src/composables/useLogin.ts
- 修复了token设置逻辑
- 确保完整的认证流程

## 🎯 功能验证

### ✅ 端口问题已解决
- [x] start.sh不再强制端口3000
- [x] Vite自动选择可用端口
- [x] 启动脚本显示实际端口
- [x] 支持端口3000-3003自动选择

### ✅ 登录跳转已修复
- [x] 登录成功后自动跳转到主页
- [x] 显示欢迎消息
- [x] 路由守卫正常工作
- [x] 已登录用户访问登录页自动重定向

### ✅ 状态管理完善
- [x] isLoggedIn属性正确工作
- [x] 认证状态持久化
- [x] Token管理完整
- [x] 用户信息同步

## 🚨 故障排除

### 如果端口仍然有问题：
1. 检查哪些进程占用了端口：
   ```bash
   lsof -i :3000 -i :3001 -i :3002
   ```

2. 手动清理端口（谨慎使用）：
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

3. 使用不同的端口：
   ```bash
   npm run dev -- --port 3005
   ```

### 如果登录后仍不跳转：
1. 检查浏览器控制台错误
2. 确认isLoggedIn状态：
   ```javascript
   // 在浏览器控制台执行
   console.log('isLoggedIn:', window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0].$store.isLoggedIn)
   ```

3. 检查路由配置是否正确加载

### 如果Mock模式不工作：
1. 确认Mock初始化日志
2. 检查isMockMode()返回值
3. 重新刷新页面

## 🎉 总结

现在两个问题都已完全解决：

1. **端口问题** ✅
   - start.sh脚本智能化
   - 支持端口自动选择
   - 友好的启动提示

2. **登录跳转问题** ✅
   - 添加了isLoggedIn属性
   - 修复了认证状态管理
   - 路由守卫正常工作

**使用 `./start-dev.sh` 启动，享受无障碍的开发体验！** 🚀✨
