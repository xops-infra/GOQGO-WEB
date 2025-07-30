#!/bin/bash

echo "启动 GoQGo Web 开发服务器..."

pkill -f "npm run dev"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi
npm run dev
