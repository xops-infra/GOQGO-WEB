// Mock模式验证脚本
import { isMockMode, mockConfig } from '@/mock/config'

export function testMockMode() {
  console.log('🎭 Mock模式验证:')
  console.log('  环境变量 VITE_MOCK_ENABLED:', import.meta.env.VITE_MOCK_ENABLED)
  console.log('  isMockMode():', isMockMode())
  console.log('  mockConfig.enabled:', mockConfig.enabled)
  console.log('  mockConfig.websocket.enabled:', mockConfig.websocket.enabled)
  
  if (isMockMode()) {
    console.log('✅ Mock模式已启用')
    console.log('  - API请求将使用Mock数据')
    console.log('  - WebSocket连接将使用Mock实现')
    console.log('  - 页面将显示MockChatRoom组件')
  } else {
    console.log('❌ Mock模式未启用')
    console.log('  - API请求将连接真实后端')
    console.log('  - WebSocket连接将尝试连接真实服务器')
    console.log('  - 页面将显示ChatRoom组件')
  }
  
  return {
    enabled: isMockMode(),
    config: mockConfig,
    env: import.meta.env.VITE_MOCK_ENABLED
  }
}

// 在开发环境下自动运行测试
if (import.meta.env.DEV) {
  setTimeout(() => {
    const result = testMockMode()
    ;(window as any).mockTest = {
      test: testMockMode,
      result
    }
    console.log('💡 提示: 在控制台运行 window.mockTest.test() 来重新测试Mock模式')
  }, 1000)
}
