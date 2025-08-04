#!/bin/bash

# GoQGo Web 一键部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 显示Logo
echo -e "${PURPLE}"
echo "   ____       ___   ____       "
echo "  / ___| ___ / _ \ / ___| ___  "
echo " | |  _ / _ \ | | | |  _ / _ \ "
echo " | |_| | (_) | |_| | |_| | (_) |"
echo "  \____|\___/ \__\_\\____|\___/ "
echo -e "${NC}"
echo -e "${GREEN}GoQGo Web - AI智能体协助开发平台${NC}"
echo -e "${BLUE}Docker 一键部署脚本${NC}"
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    echo -e "${YELLOW}安装指南: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 已安装${NC}"

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker 未运行，请启动 Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 正在运行${NC}"

# 停止并删除已存在的容器
if [ "$(docker ps -q -f name=goqgo-web)" ]; then
    echo -e "${YELLOW}🔄 停止现有容器...${NC}"
    docker stop goqgo-web
fi

if [ "$(docker ps -aq -f name=goqgo-web)" ]; then
    echo -e "${YELLOW}🗑️  删除现有容器...${NC}"
    docker rm goqgo-web
fi

# 构建镜像
echo -e "${GREEN}🔨 构建 Docker 镜像...${NC}"
docker build -f docker/Dockerfile.standalone -t goqgo-web:latest . --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功${NC}"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi

# 启动容器
echo -e "${GREEN}🚀 启动容器...${NC}"
docker run -d \
    --name goqgo-web \
    -p 3000:80 \
    --restart unless-stopped \
    goqgo-web:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 容器启动成功！${NC}"
    echo ""
    echo -e "${PURPLE}🎉 部署完成！${NC}"
    echo -e "${GREEN}📱 访问地址: ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}📋 管理命令:${NC}"
    echo -e "  查看状态: ${BLUE}docker ps${NC}"
    echo -e "  查看日志: ${BLUE}docker logs -f goqgo-web${NC}"
    echo -e "  停止服务: ${BLUE}docker stop goqgo-web${NC}"
    echo -e "  重启服务: ${BLUE}docker restart goqgo-web${NC}"
    echo ""
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
    sleep 3
    
    # 检查服务状态
    if curl -s http://localhost:3000/ > /dev/null; then
        echo -e "${GREEN}✅ 服务运行正常${NC}"
        echo -e "${BLUE}🌐 正在打开浏览器...${NC}"
        
        # 尝试打开浏览器
        if command -v open &> /dev/null; then
            open http://localhost:3000
        elif command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        elif command -v start &> /dev/null; then
            start http://localhost:3000
        else
            echo -e "${YELLOW}请手动打开浏览器访问: http://localhost:3000${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  服务可能还在启动中，请稍后访问${NC}"
    fi
else
    echo -e "${RED}❌ 容器启动失败${NC}"
    exit 1
fi
