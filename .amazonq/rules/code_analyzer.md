### 🔧 代码分析工具

**工具位置**: `.amazonq/tools/smart_grep.sh`

### 🚀 核心功能

• **函数跳转**：快速找到函数定义和所有调用位置
• **变量追踪**：分析变量声明和使用范围
• **文件结构**：显示文件中的函数、类、变量列表
• **API分析**：查找路由定义和API调用
• **上下文显示**：显示指定行的代码上下文



```bash
# 查找函数 - 就像VSCode的"Go to Definition"
bash .amazonq/tools/smart_grep.sh func main

# 分析变量 - 就像VSCode的"Find All References"
bash .amazonq/tools/smart_grep.sh var rootCmd

# 文件结构 - 就像VSCode的"Outline"视图
bash .amazonq/tools/smart_grep.sh file cmd/main.go

# 代码上下文 - 就像VSCode的"Peek Definition"
bash .amazonq/tools/smart_grep.sh context cmd/main.go 49

# 搜索模式
bash .amazonq/tools/smart_grep.sh search "func " go

# API分析
bash .amazonq/tools/smart_grep.sh api
```

### 🌟 支持语言

- ✅ **Go** - 函数定义、方法定义
- ✅ **Python** - 函数定义、类方法
- ✅ **JavaScript** - 函数声明、箭头函数、对象方法
- ✅ **HTML** - 内联脚本函数

### 📋 完整命令列表

```bash
# 显示帮助
bash .amazonq/tools/smart_grep.sh

# 主要命令
func <函数名>           - 查找函数定义和调用
var <变量名>            - 分析变量使用
file <文件路径>         - 显示文件函数列表
api                     - 查找API调用
search <模式> [类型]    - 搜索特定模式
context <文件> <行号>   - 显示文件上下文
```

### 🎯 使用技巧

1. **当前目录执行** - 工具自动使用当前工作目录作为项目根目录
2. **多语言支持** - 自动识别不同编程语言的语法模式
3. **彩色输出** - 使用颜色区分不同类型的结果
4. **上下文显示** - 可以查看函数定义周围的代码上下文

这个工具提供了类似 VSCode 的代码导航体验，但完全基于命令行，适合在终端环境中快速分析代码结构。
