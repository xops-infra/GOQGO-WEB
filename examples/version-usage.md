# 版本管理使用示例

## 快速开始

### 1. 创建版本标签
```bash
# 创建新版本标签
git tag v1.0.2

# 推送到远程（如果需要）
git push origin v1.0.2
```

### 2. 构建项目
```bash
# 自动生成版本信息并构建
npm run build

# 或者单独生成版本信息
npm run build:version
```

### 3. 查看版本信息
构建后会在界面右上角显示版本号，点击可查看详细信息。

## 版本信息展示

### 开发环境
- 显示格式：`v1.0.2-dev.a3af059`
- 包含提交哈希，便于开发调试

### 生产环境
```bash
# 生产环境构建
NODE_ENV=production npm run build
```
- 显示格式：`v1.0.2`
- 简洁的版本号显示

## 版本更新检查

### 自动检查
- 页面加载时自动检查GitHub远程版本
- 如果有新版本会显示绿色更新指示器

### 手动检查
- 点击版本号打开详情弹窗
- 点击"检查更新"按钮手动检查

## 实际使用场景

### 场景1：发布新版本
```bash
# 1. 完成开发工作
git add .
git commit -m "feat: 新增功能"

# 2. 创建版本标签
git tag v1.1.0

# 3. 构建发布版本
NODE_ENV=production npm run build

# 4. 推送标签到远程
git push origin v1.1.0
```

### 场景2：修复问题
```bash
# 1. 修复问题
git add .
git commit -m "fix: 修复关键问题"

# 2. 创建修复版本标签
git tag v1.0.3

# 3. 构建并发布
npm run build
```

### 场景3：开发调试
```bash
# 开发时直接构建，会显示开发版本信息
npm run build:version
npm run dev
```

## 版本号规范示例

```
v1.0.0 - 首个正式版本
v1.0.1 - 修复登录问题
v1.0.2 - 修复文件上传问题
v1.1.0 - 新增版本管理功能
v1.1.1 - 优化版本检查性能
v2.0.0 - 重构架构，不兼容旧版本
```

## 故障排除示例

### 问题：版本显示为 "unknown"
```bash
# 检查是否有标签
git tag -l

# 如果没有标签，创建一个
git tag v1.0.0

# 重新构建
npm run build:version
```

### 问题：更新检查失败
```bash
# 检查网络连接
curl -I https://api.github.com

# 检查仓库配置
git remote -v
```

### 问题：版本组件不显示
检查以下文件是否存在：
- `src/version.json` - 版本信息文件
- `src/components/VersionInfo.vue` - 版本组件
- `src/utils/version.ts` - 版本工具

## 高级用法

### 自定义GitHub仓库
```typescript
// 检查其他仓库的版本
const remoteVersion = await checkRemoteVersion('owner', 'repo-name')
```

### 自定义版本显示
```typescript
// 自定义版本格式
const customVersion = formatVersionDisplay(versionInfo)
```

### 版本比较
```typescript
// 比较两个版本
const result = compareVersions('v1.0.1', 'v1.0.0') // 返回 1
```
