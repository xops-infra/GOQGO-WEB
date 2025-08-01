#!/bin/bash

echo "启动 GoQGo Web 开发服务器..."

# 删除3000端口的进程
echo "正在检查并删除3000端口的进程..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "没有找到3000端口的进程"

pkill -9 -f "npm run dev" 

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 指定3000端口启动开发服务器
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 18 && PORT=3000 npm run dev
