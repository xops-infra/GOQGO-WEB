#!/bin/bash

# GoQGo Web Docker快速启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

IMAGE_NAME="goqgo-web:latest"
CONTAINER_NAME="goqgo-web"
PORT="3000"

echo -e "${GREEN}GoQGo Web Docker 快速启动${NC}"

# 检查是否已有同名容器在运行
if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
    echo -e "${YELLOW}发现正在运行的容器，正在停止...${NC}"
    docker stop ${CONTAINER_NAME}
fi

# 删除已存在的容器
if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo -e "${YELLOW}删除已存在的容器...${NC}"
    docker rm ${CONTAINER_NAME}
fi

# 检查镜像是否存在
if [[ "$(docker images -q ${IMAGE_NAME} 2> /dev/null)" == "" ]]; then
    echo -e "${RED}镜像 ${IMAGE_NAME} 不存在，请先运行构建脚本:${NC}"
    echo -e "${BLUE}./docker/docker-build.sh${NC}"
    exit 1
fi

# 启动容器
echo -e "${GREEN}启动容器...${NC}"
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:80 \
    --restart unless-stopped \
    ${IMAGE_NAME}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 容器启动成功!${NC}"
    echo -e "${GREEN}访问地址: ${BLUE}http://localhost:${PORT}${NC}"
    echo -e "${YELLOW}容器管理命令:${NC}"
    echo -e "  查看日志: ${BLUE}docker logs -f ${CONTAINER_NAME}${NC}"
    echo -e "  停止容器: ${BLUE}docker stop ${CONTAINER_NAME}${NC}"
    echo -e "  重启容器: ${BLUE}docker restart ${CONTAINER_NAME}${NC}"
else
    echo -e "${RED}❌ 容器启动失败!${NC}"
    exit 1
fi
