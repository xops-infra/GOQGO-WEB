# Git 实例创建功能修复

## 问题描述
新建实例时 Git 选项看起来不可选择，用户无法使用 Git 仓库作为工作目录。

## 问题原因
1. **API 参数不匹配**: 前端使用 `workingDirectory` 对象，但后端 API 期望的是 `workDir` 字符串字段
2. **验证逻辑过严**: Git URL 验证正则表达式过于严格，不支持多种常见格式
3. **UI 样式问题**: Git 选项在视觉上不够突出，用户体验不佳

## 修复内容

### 1. API 参数格式修复
**文件**: `src/components/AgentCreateModal.vue`, `src/stores/agents.ts`, `src/api/agents.ts`

修复前:
```javascript
const createData = {
  workingDirectory: {
    type: formData.value.directoryType,
    path: formData.value.path.trim()
  }
}
```

修复后:
```javascript
const createData = {
  workDir: formData.value.path.trim(), // 直接使用后端支持的字段
  context: formData.value.directoryType === 'git' 
    ? `工作在Git仓库: ${formData.value.path.trim()}` 
    : `工作在本地目录: ${formData.value.path.trim()}`
}
```

### 2. Git URL 验证改进
支持多种 Git URL 格式:
- HTTPS: `https://github.com/user/repo.git`
- SSH: `git@github.com:user/repo.git`
- SSH with protocol: `ssh://git@github.com/user/repo.git`
- Git protocol: `git://github.com/user/repo.git`

### 3. UI 样式优化
- 为 Git 和本地路径选项添加了明显的边框和图标
- 选中状态有清晰的视觉反馈
- 改进了提示文本，更加友好和详细

### 4. 路径验证放宽
- 本地路径支持相对路径和绝对路径
- Git 地址支持带或不带 `.git` 后缀

## 使用方法

### 创建 Git 实例
1. 点击"新建实例"按钮
2. 选择"Git 地址"选项
3. 输入 Git 仓库地址，例如:
   - `https://github.com/username/repo.git`
   - `git@github.com:username/repo.git`
   - `https://gitlab.com/username/repo`
4. 填写其他可选信息
5. 点击"创建实例"

### 创建本地实例
1. 选择"本地路径"选项
2. 输入本地目录路径，例如:
   - `/Users/username/project` (绝对路径)
   - `./my-project` (相对路径)
3. 或点击"浏览"按钮选择目录
4. 填写其他信息并创建

## 技术细节

### API 格式
后端 API 期望的创建请求格式:
```json
{
  "name": "my-agent",
  "role": "frontend-engineer",
  "workDir": "https://github.com/user/repo.git",
  "namespace": "default",
  "context": "工作在Git仓库: https://github.com/user/repo.git"
}
```

### 支持的 Git URL 格式
```javascript
const gitUrlPatterns = [
  /^https?:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+(\.git)?$/,  // HTTPS
  /^git@[\w.-]+:[\w.-]+\/[\w.-]+(\.git)?$/,         // SSH
  /^ssh:\/\/git@[\w.-]+\/[\w.-]+\/[\w.-]+(\.git)?$/, // SSH with protocol
  /^git:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+(\.git)?$/      // Git protocol
]
```

## 测试验证
修复后的功能已通过以下测试:
- ✅ Git HTTPS 地址创建实例
- ✅ Git SSH 地址创建实例
- ✅ 本地绝对路径创建实例
- ✅ 本地相对路径创建实例
- ✅ UI 交互体验优化
- ✅ 错误提示友好化

## 注意事项
1. Git 仓库需要确保网络可访问
2. SSH 格式需要配置好 SSH 密钥
3. 本地路径需要确保目录存在且有访问权限
4. 实例创建后会自动选择新创建的实例
