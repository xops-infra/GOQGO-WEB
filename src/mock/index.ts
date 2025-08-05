import { mockConfig, mockState, mockLogger } from './config'
import { enableMockWebSocket, disableMockWebSocket, mockWebSocketManager } from './websocket'

// Mock初始化
export function initMock() {
  console.log('🎭 [Mock Init] 开始初始化Mock服务...')
  console.log('🎭 [Mock Init] Mock配置:', mockConfig)
  console.log('🎭 [Mock Init] Mock状态:', mockState.enabled)
  
  if (mockState.enabled) {
    mockLogger.info('初始化Mock服务...')
    
    // 启用Mock WebSocket
    enableMockWebSocket()
    
    // 添加Mock状态切换监听
    mockState.onStateChange((enabled) => {
      if (enabled) {
        enableMockWebSocket()
        mockLogger.info('Mock服务已启用')
      } else {
        disableMockWebSocket()
        mockLogger.info('Mock服务已禁用')
      }
    })
    
    // 添加Mock控制面板
    if (import.meta.env.DEV) {
      addMockControlPanel()
    }
    
    mockLogger.info('Mock服务初始化完成')
    console.log('🎭 [Mock Init] Mock服务初始化完成')
  } else {
    console.log('🎭 [Mock Init] Mock模式未启用')
  }
}

// 添加Mock控制面板
function addMockControlPanel() {
  // 创建控制面板
  const panel = document.createElement('div')
  panel.id = 'mock-control-panel'
  panel.innerHTML = `
    <div style="
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      background: #1a1a1a;
      color: white;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: monospace;
      font-size: 12px;
      min-width: 200px;
      border: 1px solid #333;
    ">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="color: #00ff41;">🎭</span>
        <strong>Mock Control</strong>
      </div>
      
      <div style="margin-bottom: 8px;">
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <input type="checkbox" id="mock-toggle" ${mockState.enabled ? 'checked' : ''}>
          <span>启用Mock模式</span>
        </label>
      </div>
      
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        <button id="mock-reset" style="
          background: #333;
          color: white;
          border: 1px solid #555;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
        ">重置数据</button>
        
        <button id="mock-random" style="
          background: #333;
          color: white;
          border: 1px solid #555;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
        ">随机数据</button>
        
        <button id="mock-disconnect" style="
          background: #333;
          color: white;
          border: 1px solid #555;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
        ">模拟断线</button>
      </div>
      
      <div style="margin-top: 8px; font-size: 10px; color: #888;">
        状态: <span id="mock-status">${mockState.enabled ? '已启用' : '已禁用'}</span>
      </div>
    </div>
  `
  
  // 添加到页面
  document.body.appendChild(panel)
  
  // 绑定事件
  const toggle = document.getElementById('mock-toggle') as HTMLInputElement
  const status = document.getElementById('mock-status') as HTMLSpanElement
  const resetBtn = document.getElementById('mock-reset') as HTMLButtonElement
  const randomBtn = document.getElementById('mock-random') as HTMLButtonElement
  const disconnectBtn = document.getElementById('mock-disconnect') as HTMLButtonElement
  
  // 切换Mock模式
  toggle?.addEventListener('change', () => {
    mockState.enabled = toggle.checked
    status.textContent = toggle.checked ? '已启用' : '已禁用'
  })
  
  // 重置数据
  resetBtn?.addEventListener('click', () => {
    mockLogger.info('重置Mock数据')
    // 这里可以重置mock数据
    alert('Mock数据已重置')
  })
  
  // 生成随机数据
  randomBtn?.addEventListener('click', () => {
    mockLogger.info('生成随机Mock数据')
    // 这里可以生成随机数据
    alert('随机Mock数据已生成')
  })
  
  // 模拟断线
  disconnectBtn?.addEventListener('click', () => {
    mockLogger.info('模拟WebSocket断线')
    // 模拟所有WebSocket连接断开
    mockWebSocketManager.broadcast({
      type: 'connection_lost',
      data: { reason: 'simulated_disconnect' }
    })
    alert('已模拟WebSocket断线')
  })
  
  // 监听Mock状态变化
  mockState.onStateChange((enabled) => {
    toggle.checked = enabled
    status.textContent = enabled ? '已启用' : '已禁用'
  })
}

// 清理Mock服务
export function cleanupMock() {
  mockWebSocketManager.cleanup()
  disableMockWebSocket()
  
  // 移除控制面板
  const panel = document.getElementById('mock-control-panel')
  if (panel) {
    panel.remove()
  }
  
  mockLogger.info('Mock服务已清理')
}

// 导出Mock服务
export * from './data'
export * from './services'
export * from './config'
export * from './websocket'
