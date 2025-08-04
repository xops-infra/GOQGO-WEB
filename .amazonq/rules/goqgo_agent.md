# GoQGo Agent 智能助手命令使用指南

这是一份智能助手必会的 goqgo 命令使用说明，帮助AI助手在GoQGo系统中进行有效的交互和协作。

## 环境信息

当你作为GoQGo agent运行时，系统会自动设置以下环境变量：

- `GOQGO_AGENT_NAME`: 你的agent实例名称（如：default-sys-dea9c82a）
- `GOQGO_NAMESPACE`: 你所在的命名空间（如：default）
- `GOQGO_ROLE`: 你的角色（如：architect）
- `GOQGO_SESSION_NAME`: 你的tmux会话名称
- `GOQGO_WORKDIR`: 你的工作目录

你可以通过以下命令查看这些环境变量：
```bash
echo "我是 $GOQGO_AGENT_NAME，在 $GOQGO_NAMESPACE 命名空间中，角色是 $GOQGO_ROLE"
printenv | grep GOQGO
```

## 核心命令

### 1. 查看agent列表

```bash
# 查看当前namespace下的所有agent
goqgo agent list

# 查看指定namespace下的agent
goqgo agent list --namespace <namespace>

# 查看所有namespace的agent
goqgo agent list -A

# 查看agent详细信息
goqgo agent describe <agent_name>
```

### 2. 向其他agent发送消息

```bash
# 向同namespace的agent发送消息
goqgo agent send '<message>' <agent_name>

# 向指定namespace的agent发送消息
goqgo agent send '<message>' <agent_name>.<namespace>

# 示例
goqgo agent send '需要你的帮助处理这个问题' backend-engineer
goqgo agent send '请协助前端开发' frontend-dev.production
```

### 3. 回复用户或记录消息

```bash
# 记录你的回复消息（会自动使用你的agent身份）
goqgo agent reply '<message>'

# 向指定agent回复消息
goqgo agent reply '<message>' <agent_name>.<namespace>

# 示例
goqgo agent reply '任务已完成，结果如下：...'
goqgo agent reply '收到，正在处理中' user-request-handler
```

**重要提示**：reply命令会自动识别你的agent身份。如果环境变量设置正确，消息会以 `agent_name.namespace` 的格式记录，而不是默认的 `assistant`。

### 4. 广播消息

```bash
# 向当前namespace的所有agent广播
goqgo agent broadcast '<message>'

# 向指定namespace广播
goqgo agent broadcast '<message>' --namespace <namespace>

# 向所有namespace广播
goqgo agent broadcast '<message>' -A
```

### 5. 查看agent状态和日志

```bash
# 查看指定agent的实时日志
goqgo agent logs <agent_name>

# 查看自己的日志
goqgo agent logs $GOQGO_AGENT_NAME

# 实时跟踪日志
goqgo agent logs <agent_name> -f
```

### 6. 管理agent生命周期

```bash
# 重启agent
goqgo agent restart <agent_name>

# 停止agent
goqgo agent stop <agent_name>

# 删除agent
goqgo agent rm <agent_name>

# 接管agent终端（进入交互模式）
goqgo agent attach <agent_name>
```

## 协作模式

### 1. 接收@消息
当用户或其他agent通过 `@你的名字` 方式提及你时，你会收到相应的消息。处理完成后应该使用 `reply` 命令回复。

**消息流程**：
1. 用户发送：`@default-sys 今天几号？`
2. 系统自动路由消息到你的tmux会话
3. 你处理消息并回复：`goqgo agent reply "今天是$(date +%Y-%m-%d)"`
4. 系统记录回复，显示正确的agent身份

### 2. 任务协作

```bash
# 将任务转发给专业的agent
goqgo agent send '请帮忙处理这个Go语言相关的问题：...' go-backend-engineer

# 请求其他agent的意见
goqgo agent send '对于这个架构设计，你有什么建议？' architect

# 汇报任务进度
goqgo agent reply '任务进度更新：已完成60%，预计还需要2小时'

# 协作完成任务
goqgo agent send '前端部分已完成，请检查API接口' backend-api
```

### 3. 状态同步

```bash
# 查看团队中其他agent的状态
goqgo agent list | grep -E "(Running|Idle|Busy)"

# 检查特定agent是否在线
goqgo agent describe backend-api | grep "状态"

# 查看namespace中的所有活跃agent
goqgo agent list --namespace $GOQGO_NAMESPACE
```

## 高级功能

### 1. 角色管理

```bash
# 查看可用角色
goqgo role list

# 查看角色详细信息
goqgo role describe architect

# 应用角色到agent（需要管理员权限）
goqgo role apply architect --agent $GOQGO_AGENT_NAME --namespace $GOQGO_NAMESPACE
```

### 2. 命名空间操作

```bash
# 查看所有namespace
goqgo namespace list

# 查看当前namespace信息
goqgo namespace describe $GOQGO_NAMESPACE

# 创建新的namespace（需要管理员权限）
goqgo namespace create my-project
```

### 3. 聊天系统集成

```bash
# 查看聊天列表
goqgo chat list --namespace $GOQGO_NAMESPACE

# 查看聊天历史
goqgo chat history default-$USER --namespace $GOQGO_NAMESPACE

# 创建群聊
goqgo chat create team-discussion --title "团队讨论" --type group
```

## 最佳实践

### 1. 消息格式规范

```bash
# ✅ 好的消息格式
goqgo agent reply "任务状态：已完成
- 处理文件：config.yaml
- 修改内容：更新数据库连接
- 测试结果：通过
- 下一步：等待部署确认"

# ❌ 避免的格式
goqgo agent reply "完成了"
```

### 2. 协作礼仪

- **及时响应**：收到@消息后尽快回复
- **状态更新**：定期汇报任务进度
- **清晰沟通**：使用结构化的消息格式
- **主动协助**：发现问题时主动提供帮助

### 3. 错误处理和调试

```bash
# 检查环境变量
if [ -z "$GOQGO_AGENT_NAME" ]; then
    echo "警告：GOQGO_AGENT_NAME 未设置"
    printenv | grep GOQGO
fi

# 测试网络连接
curl -s http://localhost:8080/health || echo "API服务器连接失败"

# 查看系统日志
goqgo agent logs $GOQGO_AGENT_NAME | tail -20

# 检查tmux会话状态
tmux list-sessions | grep $GOQGO_SESSION_NAME
```

### 4. 性能优化

```bash
# 批量操作时使用适当的延迟
for agent in $(goqgo agent list --namespace $GOQGO_NAMESPACE -o json | jq -r '.[].name'); do
    goqgo agent send "系统维护通知" $agent
    sleep 1  # 避免过快发送
done

# 使用过滤器减少不必要的查询
goqgo agent list --namespace $GOQGO_NAMESPACE | grep "Running"
```

## 故障排除

### 常见问题及解决方案

#### Q: 为什么我的消息显示发送者是 "assistant"？
A: 这通常是环境变量未正确设置导致的。解决方法：
```bash
# 检查环境变量
echo "GOQGO_AGENT_NAME: $GOQGO_AGENT_NAME"
echo "GOQGO_NAMESPACE: $GOQGO_NAMESPACE"

# 如果为空，检查tmux环境
tmux show-environment -t $GOQGO_SESSION_NAME | grep GOQGO
```

#### Q: 如何知道其他agent是否收到了我的消息？
A: 可以通过以下方式确认：
```bash
# 查看目标agent的日志
goqgo agent logs <target_agent> | tail -10

# 检查agent状态
goqgo agent describe <target_agent> | grep "最后活动"
```

#### Q: 如何处理跨namespace的协作？
A: 使用完整的agent地址格式：
```bash
# 格式：agent_name.namespace
goqgo agent send "跨namespace消息" backend-api.production
goqgo agent reply "收到跨namespace请求" frontend-app.development
```

#### Q: agent无响应怎么办？
A: 按以下步骤排查：
```bash
# 1. 检查agent状态
goqgo agent describe <agent_name>

# 2. 查看日志
goqgo agent logs <agent_name> | tail -20

# 3. 检查tmux会话
tmux list-sessions | grep <agent_name>

# 4. 重启agent
goqgo agent restart <agent_name>
```

## 系统集成示例

### 1. 与外部工具集成

```bash
# Git操作集成
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
    goqgo agent reply "检测到未提交的更改：
$git_status
建议先提交代码再继续操作。"
fi

# 文件监控
if [ -f "error.log" ] && [ -s "error.log" ]; then
    error_count=$(wc -l < error.log)
    goqgo agent reply "⚠️ 发现 $error_count 个错误，请检查 error.log"
fi

# 系统资源监控
cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    goqgo agent reply "🚨 CPU使用率过高：${cpu_usage}%"
fi
```

### 2. 自动化任务示例

```bash
# 定时状态报告
while true; do
    current_time=$(date '+%H:%M')
    if [[ "$current_time" == "09:00" ]] || [[ "$current_time" == "17:00" ]]; then
        goqgo agent reply "📊 每日状态报告：
- 系统运行正常
- 处理任务数：$(ps aux | grep -c goqgo)
- 内存使用：$(free -h | grep Mem | awk '{print $3}')"
    fi
    sleep 60
done

# 错误监控和自动恢复
monitor_service() {
    service_name=$1
    if ! pgrep -f "$service_name" > /dev/null; then
        goqgo agent reply "🔧 检测到 $service_name 服务停止，正在重启..."
        systemctl restart "$service_name"
        goqgo agent reply "✅ $service_name 服务已重启"
    fi
}
```

### 3. 团队协作工作流

```bash
# 代码审查工作流
code_review_workflow() {
    local pr_number=$1
    
    # 通知相关agent
    goqgo agent send "新的PR #$pr_number 需要审查" code-reviewer
    goqgo agent send "PR #$pr_number 已提交，请准备测试" qa-engineer
    
    # 记录状态
    goqgo agent reply "📝 PR #$pr_number 工作流已启动：
- 代码审查：进行中
- 自动化测试：排队中
- 部署准备：待定"
}

# 发布流程
release_workflow() {
    local version=$1
    
    goqgo agent broadcast "🚀 开始发布流程 v$version" --namespace production
    goqgo agent reply "发布检查清单：
- [ ] 代码审查完成
- [ ] 测试通过
- [ ] 文档更新
- [ ] 备份完成"
}
```

## 安全注意事项

### 1. 权限管理
```bash
# 检查当前用户权限
goqgo config get current-user

# 避免执行危险命令
dangerous_commands=("rm -rf" "sudo" "chmod 777")
for cmd in "${dangerous_commands[@]}"; do
    if echo "$1" | grep -q "$cmd"; then
        goqgo agent reply "⚠️ 检测到潜在危险命令，已阻止执行"
        exit 1
    fi
done
```

### 2. 数据保护
```bash
# 避免在消息中暴露敏感信息
sanitize_message() {
    local message=$1
    # 移除可能的密码、token等
    echo "$message" | sed 's/password=[^[:space:]]*/password=****/g' \
                    | sed 's/token=[^[:space:]]*/token=****/g'
}

# 使用示例
safe_message=$(sanitize_message "$original_message")
goqgo agent reply "$safe_message"
```

记住：作为GoQGo系统中的智能助手，你的目标是高效协作，及时响应，并为用户和其他agent提供有价值的帮助。始终保持专业、准确和有用的交互方式。
