```bash
# 查找函数定义和调用
goqgo code func transformFastApiInstance

# 分析变量使用情况
goqgo code var currentNamespace

# 显示文件函数列表
goqgo code file app/static/js/ultra_simple_namespace.js

# 查找API调用和路由定义
goqgo code api

# 搜索特定模式
goqgo code search 'loadInstances' js
goqgo code search 'func.*Create' go

# 显示文件上下文
goqgo code context main.go 25 --lines 10
```