#!/bin/bash

echo "🚀 启动 GoQGo Web 开发服务器..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install --legacy-peer-deps
fi

# 清理可能的端口占用（可选）
echo "🔍 检查端口占用情况..."
for port in 3000 3001 3002 3003; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "⚠️  端口 $port 被占用"
    else
        echo "✅ 端口 $port 可用"
        break
    fi
done

# 启动开发服务器
echo "🌟 启动开发服务器（Vite将自动选择可用端口）..."
echo "📝 如果端口3000被占用，Vite会自动选择下一个可用端口"
echo "🎭 Mock模式已启用，可以直接使用演示账户登录"
echo ""

npm run dev
