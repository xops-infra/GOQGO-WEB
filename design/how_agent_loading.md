
前端会把问题设置一个本地的tempId发送消息过去；
后端先发送message_confirem；
随后会发送 agent_thinking的数据包会包含tempId表示在思考哪个问题；
然后前端就可以进行 thinking 渲染，并且可以关联某个问题；

后续还会持续发送保证处理中,最后会收到 agent 的 chat 回复渲染最终的 content的内容替换 div loading 的内容, 可以通过 data 数据的 conversationId 来唯一对应;

{type: "agent_thinking", data: {agentName: "default-sys", content: "正在思考中...",…},…}

agentName
: 
"default-sys"
content
: 
"正在思考中..."
conversationId
: 
"conv_1754319059_zhoushoujian_default-sys_f7e38685"
isThinking
: 
true
messageId
: 
"1754319059565365000-jh0nm4ga"
status
: 
"thinking"
tempId
: 
"temp_1754319059553_th8c01ty"
timestamp
: 
"2025-08-04T22:50:59.5654+08:00"
username
: 
"default-sys.default"


- id: 1754316955081091000-ndiesrrz
  conversationId: conv_123  # 现在会被正确记录
  username: default-sys.default
  content: "消息内容"
  type: agent_message
  timestamp: 2025-08-04T22:15:55.081139+08:00