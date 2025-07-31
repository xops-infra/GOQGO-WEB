// 简单的 Node.js WebSocket 客户端测试
const WebSocket = require('ws');

const namespace = 'goqgo';
const agentName = 'test-agent';
const lines = 10;

const url = `ws://localhost:8080/ws/namespaces/${namespace}/agents/${agentName}/logs?lines=${lines}&follow=true`;

console.log('🔗 连接到:', url);

const ws = new WebSocket(url);

ws.on('open', function open() {
  console.log('✅ WebSocket 连接成功');
});

ws.on('message', function message(data) {
  console.log('📨 收到消息:', data.toString());
  try {
    const parsed = JSON.parse(data.toString());
    console.log('📨 解析后的消息:', JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.log('📨 非JSON消息:', data.toString());
  }
});

ws.on('close', function close(code, reason) {
  console.log('🔌 连接关闭:', code, reason.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket 错误:', err);
});

// 5秒后请求历史日志
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('📜 请求历史日志');
    ws.send(JSON.stringify({ type: 'load_history' }));
  }
}, 5000);

// 10秒后关闭连接
setTimeout(() => {
  console.log('🔚 关闭连接');
  ws.close();
}, 10000);
