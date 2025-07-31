# 版本管理系统

GoQGo Web 项目集成了自动化版本管理系统，支持自动获取版本信息、构建时间戳和更新检查功能。

## 功能特性

### 🏷️ 自动版本获取
- 自动从 Git 标签获取版本号
- 支持从 package.json 获取备用版本
- 记录构建时间和提交信息

### 🔄 版本更新检查
- 自动检查 GitHub 远程版本
- 比较本地和远程版本
- 提供更新提醒和下载链接

### 📊 版本信息展示
- 界面右上角显示当前版本
- 点击查看详细版本信息
- 支持开发版和生产版标识

## 使用方法

### 构建脚本

```bash
# 生成版本信息
npm run build:version

# 构建项目（自动生成版本）
npm run build

# 生产环境构建
npm run build:prod

# 检查版本信息
npm run version:check
```

### 版本标签管理

```bash
# 创建新版本标签
git tag v1.0.1

# 推送标签到远程
git push origin v1.0.1

# 查看所有标签
git tag -l

# 删除标签
git tag -d v1.0.1
```

## 文件结构

```
├── scripts/
│   └── build-version.js          # 版本构建脚本
├── src/
│   ├── components/
│   │   └── VersionInfo.vue       # 版本信息组件
│   ├── utils/
│   │   └── version.ts            # 版本管理工具
│   └── version.json              # 生成的版本信息文件
└── docs/
    └── VERSION_MANAGEMENT.md     # 本文档
```

## 版本信息结构

### 本地版本信息 (version.json)
```json
{
  "version": "v1.0.0",
  "buildTime": "2025-07-31T15:01:54.545Z",
  "commitHash": "a3af059",
  "commitDate": "2025-07-31",
  "environment": "development"
}
```

### 远程版本信息 (GitHub API)
```json
{
  "tag_name": "v1.0.1",
  "name": "Release v1.0.1",
  "published_at": "2025-07-31T15:00:00Z",
  "html_url": "https://github.com/mikas/GOQGO-WEB/releases/tag/v1.0.1",
  "body": "更新说明..."
}
```

## API 接口

### 版本工具函数

```typescript
// 获取本地版本信息
const localVersion = await getLocalVersion()

// 检查远程版本
const remoteVersion = await checkRemoteVersion('mikas', 'GOQGO-WEB')

// 检查更新
const updateInfo = await checkForUpdates()

// 比较版本号
const comparison = compareVersions('v1.0.1', 'v1.0.0') // 返回 1

// 格式化版本显示
const displayVersion = formatVersionDisplay(versionInfo)

// 格式化构建时间
const buildTime = formatBuildTime(versionInfo.buildTime)
```

## 组件使用

### VersionInfo 组件
```vue
<template>
  <VersionInfo />
</template>

<script setup>
import VersionInfo from '@/components/VersionInfo.vue'
</script>
```

### 功能特性
- 🔍 点击版本号查看详细信息
- 🔄 自动检查更新（启动时）
- 📱 响应式设计
- 🎨 现代化UI界面
- 🔗 直接跳转到GitHub发布页

## 版本号规范

采用语义化版本控制 (Semantic Versioning)：

- **主版本号**：不兼容的API修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

格式：`v主版本号.次版本号.修订号`

示例：
- `v1.0.0` - 首个正式版本
- `v1.1.0` - 新增功能
- `v1.1.1` - 修复问题
- `v2.0.0` - 重大更新

## 开发环境标识

- **development**: 开发版本，显示为 `v1.0.0-dev.a3af059`
- **production**: 生产版本，显示为 `v1.0.0`

## 自动化流程

### 构建时自动执行
1. 读取 Git 标签或 package.json 版本
2. 获取提交信息和构建时间
3. 生成 `src/version.json` 文件
4. 更新 HTML 模板中的版本信息
5. 编译到最终构建产物

### 运行时自动检查
1. 页面加载时读取本地版本信息
2. 静默检查 GitHub 远程版本
3. 比较版本号判断是否有更新
4. 显示更新提示和下载链接

## 注意事项

1. **网络依赖**：更新检查需要访问 GitHub API
2. **标签规范**：建议使用 `v` 前缀的标签格式
3. **权限要求**：需要 Git 仓库的读取权限
4. **缓存策略**：版本信息在构建时生成，运行时缓存

## 故障排除

### 常见问题

**Q: 版本显示为 "unknown"**
A: 检查是否有 Git 标签或 package.json 版本信息

**Q: 更新检查失败**
A: 检查网络连接和 GitHub API 访问权限

**Q: 构建脚本执行失败**
A: 确保 Git 仓库初始化且有提交记录

**Q: 版本组件不显示**
A: 检查组件导入和 version.json 文件是否生成

### 调试方法

```bash
# 检查 Git 标签
git tag -l

# 检查最新标签
git describe --tags --abbrev=0

# 检查提交信息
git log -1 --format="%h %cd" --date=short

# 手动运行版本脚本
npm run build:version
```

## 未来规划

- [ ] 支持自动更新下载
- [ ] 集成 CI/CD 自动发布
- [ ] 版本变更日志自动生成
- [ ] 多环境版本管理
- [ ] 版本回滚功能
