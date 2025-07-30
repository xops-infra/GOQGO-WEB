#!/bin/bash

# GoQGo Web 启动脚本
# 支持后台运行和进程管理

PID_FILE=".goqgo_web.pid"
LOG_FILE="goqgo_web.log"
PORT=${PORT:-5173}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[GoQGo Web]${NC} ${message}"
}

# 函数：检查进程是否运行
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# 函数：停止服务
stop_service() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_message $YELLOW "正在停止 GoQGo Web 服务 (PID: $pid)..."
        
        # 尝试优雅地关闭
        kill -TERM "$pid" 2>/dev/null
        
        # 等待进程结束
        local count=0
        while ps -p "$pid" > /dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # 如果进程仍在运行，强制杀死
        if ps -p "$pid" > /dev/null 2>&1; then
            print_message $RED "进程未响应，强制关闭..."
            kill -KILL "$pid" 2>/dev/null
        fi
        
        rm -f "$PID_FILE"
        print_message $GREEN "GoQGo Web 服务已停止"
    else
        print_message $YELLOW "GoQGo Web 服务未运行"
    fi
}

# 函数：启动服务
start_service() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_message $YELLOW "GoQGo Web 服务已在运行 (PID: $pid)"
        print_message $BLUE "访问地址: http://localhost:$PORT"
        return 0
    fi
    
    print_message $BLUE "正在启动 GoQGo Web 服务..."
    
    # 检查Node.js和npm是否安装
    if ! command -v node &> /dev/null; then
        print_message $RED "错误: Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_message $RED "错误: npm 未安装"
        exit 1
    fi
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "检测到缺少依赖，正在安装..."
        npm install
    fi
    
    # 启动开发服务器
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # 保存PID
    echo "$pid" > "$PID_FILE"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务是否成功启动
    if ps -p "$pid" > /dev/null 2>&1; then
        print_message $GREEN "GoQGo Web 服务启动成功!"
        print_message $BLUE "PID: $pid"
        print_message $BLUE "访问地址: http://localhost:$PORT"
        print_message $BLUE "日志文件: $LOG_FILE"
        print_message $YELLOW "使用 './start.sh stop' 停止服务"
        print_message $YELLOW "使用 './start.sh status' 查看状态"
        print_message $YELLOW "使用 './start.sh logs' 查看日志"
    else
        print_message $RED "服务启动失败，请检查日志文件: $LOG_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# 函数：重启服务
restart_service() {
    print_message $BLUE "正在重启 GoQGo Web 服务..."
    stop_service
    sleep 2
    start_service
}

# 函数：查看服务状态
show_status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_message $GREEN "GoQGo Web 服务正在运行"
        print_message $BLUE "PID: $pid"
        print_message $BLUE "访问地址: http://localhost:$PORT"
        
        # 显示内存使用情况
        if command -v ps &> /dev/null; then
            local memory=$(ps -o rss= -p "$pid" 2>/dev/null | awk '{print $1/1024 " MB"}')
            if [ ! -z "$memory" ]; then
                print_message $BLUE "内存使用: $memory"
            fi
        fi
    else
        print_message $YELLOW "GoQGo Web 服务未运行"
    fi
}

# 函数：查看日志
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_message $BLUE "显示最近50行日志:"
        echo "----------------------------------------"
        tail -n 50 "$LOG_FILE"
        echo "----------------------------------------"
        print_message $YELLOW "使用 'tail -f $LOG_FILE' 实时查看日志"
    else
        print_message $YELLOW "日志文件不存在: $LOG_FILE"
    fi
}

# 函数：显示帮助信息
show_help() {
    echo -e "${BLUE}GoQGo Web 服务管理脚本${NC}"
    echo ""
    echo "用法:"
    echo "  ./start.sh [command]"
    echo ""
    echo "命令:"
    echo "  start    启动服务 (默认)"
    echo "  stop     停止服务"
    echo "  restart  重启服务"
    echo "  status   查看服务状态"
    echo "  logs     查看服务日志"
    echo "  help     显示帮助信息"
    echo ""
    echo "环境变量:"
    echo "  PORT     指定端口号 (默认: 5173)"
    echo ""
    echo "示例:"
    echo "  ./start.sh"
    echo "  ./start.sh start"
    echo "  ./start.sh stop"
    echo "  PORT=3000 ./start.sh start"
}

# 主逻辑
case "${1:-start}" in
    "start")
        start_service
        ;;
    "stop")
        stop_service
        ;;
    "restart")
        restart_service
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_message $RED "未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac