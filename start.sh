#!/bin/bash

# 检查命令行参数
if [ "$1" = "prod" ]; then
    echo "启动 GoQGo Web 生产服务器..."
    PORT=80
    COMMAND="npm run prod"
else
    echo "启动 GoQGo Web 开发服务器..."
    PORT=3000
    COMMAND="npm run dev"
fi

# 删除指定端口的进程
echo "正在检查并删除${PORT}端口的进程..."
lsof -ti:${PORT} | xargs kill -9 2>/dev/null || echo "没有找到${PORT}端口的进程"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install --legacy-peer-deps
fi

# 启动服务器
echo "在端口 ${PORT} 启动服务器..."
$COMMAND
