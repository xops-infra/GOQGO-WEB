
## 安装方式

### 方式一：一键安装（推荐）

```bash
curl -fsSL https://devops-public-1251949819.cos.ap-shanghai.myqcloud.com/public/goqgo/install.sh | bash
```

### 方式二：手动下载安装

#### macOS
```bash
# 下载
curl -fsSL https://devops-public-1251949819.cos.ap-shanghai.myqcloud.com/public/goqgo/bin/goqgo_mac -o goqgo

# 安装
sudo mv goqgo /usr/local/bin/goqgo
sudo chmod +x /usr/local/bin/goqgo
```

#### Linux
```bash
# 下载
curl -fsSL https://devops-public-1251949819.cos.ap-shanghai.myqcloud.com/public/goqgo/bin/goqgo -o goqgo

# 安装
sudo mv goqgo /usr/local/bin/goqgo
sudo chmod +x /usr/local/bin/goqgo
```

#### Windows
```bash
# 下载到当前目录
curl -fsSL https://devops-public-1251949819.cos.ap-shanghai.myqcloud.com/public/goqgo/bin/goqgo.exe -o goqgo.exe

# 手动添加到 PATH 环境变量
```

## 安装脚本功能

### 自动检测
- ✅ 系统类型检测（macOS/Linux）
- ✅ 架构检测（amd64/arm64）
- ✅ 旧版本检测和备份

### 安装过程
- ✅ 下载对应平台的二进制文件
- ✅ 安装到 `/usr/local/bin/goqgo`
- ✅ 创建配置目录 `~/.goqgo`
- ✅ 生成启动脚本 `~/.goqgo/start.sh`
- ✅ 验证安装结果

### 启动脚本
安装完成后，可以使用生成的启动脚本快速启动服务：

```bash
# 运行启动脚本
~/.goqgo/start.sh
```

启动脚本会：
1. 初始化系统（如果是首次运行）
2. 启动调度服务
3. 启动 API 服务器（端口 8080）

## 卸载

### 一键卸载
```bash
curl -fsSL https://devops-public-1251949819.cos.ap-shanghai.myqcloud.com/public/goqgo/uninstall.sh | bash
```

### 卸载功能
- ✅ 停止所有运行中的服务
- ✅ 移除二进制文件和备份
- ✅ 可选择删除配置目录
- ✅ 清理 tmux 会话
- ✅ 提示清理 shell 配置

## 升级

升级到新版本：

```bash
# 方式一：重新运行安装脚本（推荐）
curl -fsSL https://devops-public-1251949819.cos.ap-shanghai.myqcloud.com/public/goqgo/install.sh | bash

# 方式二：使用 make 命令（开发环境）
make install-system
```

安装脚本会自动：
- 检测现有版本
- 备份旧版本
- 安装新版本
- 保留配置文件

## 验证安装

```bash
# 检查版本
goqgo --version

# 检查帮助
goqgo --help

# 初始化系统
goqgo init

# 启动服务
goqgo schedule start
goqgo apiserver --port 8080
```

## 故障排除

### 权限问题
如果遇到权限问题，确保：
- `/usr/local/bin` 目录存在且可写
- 或者使用 `sudo` 权限安装
