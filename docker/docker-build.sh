#!/bin/bash

# GoQGo Web Docker构建脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 获取版本号
VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="goqgo-web"
FULL_IMAGE_NAME="${IMAGE_NAME}:${VERSION}"
LATEST_IMAGE_NAME="${IMAGE_NAME}:latest"

echo -e "${GREEN}开始构建 GoQGo Web Docker 镜像...${NC}"
echo -e "${YELLOW}版本: ${VERSION}${NC}"

# 构建镜像
echo -e "${GREEN}构建镜像: ${FULL_IMAGE_NAME}${NC}"
docker build -f docker/Dockerfile -t "${FULL_IMAGE_NAME}" -t "${LATEST_IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功!${NC}"
    echo -e "${GREEN}镜像标签:${NC}"
    echo -e "  - ${FULL_IMAGE_NAME}"
    echo -e "  - ${LATEST_IMAGE_NAME}"
    
    echo -e "${YELLOW}运行命令:${NC}"
    echo -e "  docker run -d -p 3000:80 --name goqgo-web ${LATEST_IMAGE_NAME}"
    echo -e "  或者使用 docker-compose up -d"
else
    echo -e "${RED}❌ 镜像构建失败!${NC}"
    exit 1
fi
