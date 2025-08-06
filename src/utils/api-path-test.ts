// API路径验证工具
import { API_ENDPOINTS } from '@/config/api'

export class ApiPathTest {
  // 验证所有API路径是否正确更新为ns
  static validateApiPaths() {
    console.group('🧪 验证API路径更新')
    
    const testNamespace = 'default'
    const testAgent = 'test-agent'
    const testChat = 'test-chat'
    const testMessage = 'test-message'
    const testDag = 'test-dag'
    const testRecord = 'test-record'
    
    console.log('🔍 检查NAMESPACES接口:')
    console.log('- LIST:', API_ENDPOINTS.NAMESPACES.LIST)
    console.log('- CREATE:', API_ENDPOINTS.NAMESPACES.CREATE)
    console.log('- GET:', API_ENDPOINTS.NAMESPACES.GET(testNamespace))
    console.log('- UPDATE:', API_ENDPOINTS.NAMESPACES.UPDATE(testNamespace))
    console.log('- DELETE:', API_ENDPOINTS.NAMESPACES.DELETE(testNamespace))
    
    console.log('\n🔍 检查AGENTS接口:')
    console.log('- LIST:', API_ENDPOINTS.AGENTS.LIST(testNamespace))
    console.log('- CREATE:', API_ENDPOINTS.AGENTS.CREATE(testNamespace))
    console.log('- GET:', API_ENDPOINTS.AGENTS.GET(testNamespace, testAgent))
    console.log('- STATUS:', API_ENDPOINTS.AGENTS.STATUS(testNamespace, testAgent))
    console.log('- DELETE:', API_ENDPOINTS.AGENTS.DELETE(testNamespace, testAgent))
    console.log('- SEND:', API_ENDPOINTS.AGENTS.SEND(testNamespace, testAgent))
    console.log('- RESTART:', API_ENDPOINTS.AGENTS.RESTART(testNamespace, testAgent))
    console.log('- BROADCAST:', API_ENDPOINTS.AGENTS.BROADCAST(testNamespace))
    
    console.log('\n🔍 检查AGENTS日志接口:')
    console.log('- LOGS:', API_ENDPOINTS.AGENTS.LOGS(testNamespace, testAgent))
    console.log('- LOGS_FOLLOW:', API_ENDPOINTS.AGENTS.LOGS_FOLLOW(testNamespace, testAgent))
    console.log('- LOGS_HISTORY:', API_ENDPOINTS.AGENTS.LOGS_HISTORY(testNamespace, testAgent))
    console.log('- LOGS_REFRESH:', API_ENDPOINTS.AGENTS.LOGS_REFRESH(testNamespace, testAgent))
    console.log('- LOGS_STATUS:', API_ENDPOINTS.AGENTS.LOGS_STATUS(testNamespace, testAgent))
    
    console.log('\n🔍 检查CHATS接口:')
    console.log('- LIST:', API_ENDPOINTS.CHATS.LIST(testNamespace))
    console.log('- CREATE:', API_ENDPOINTS.CHATS.CREATE(testNamespace))
    console.log('- GET:', API_ENDPOINTS.CHATS.GET(testNamespace, testChat))
    console.log('- UPDATE:', API_ENDPOINTS.CHATS.UPDATE(testNamespace, testChat))
    console.log('- DELETE:', API_ENDPOINTS.CHATS.DELETE(testNamespace, testChat))
    
    console.log('\n🔍 检查CHATS消息接口:')
    console.log('- SEND_MESSAGE:', API_ENDPOINTS.CHATS.SEND_MESSAGE(testNamespace, testChat))
    console.log('- GET_HISTORY:', API_ENDPOINTS.CHATS.GET_HISTORY(testNamespace, testChat))
    console.log('- SEARCH_MESSAGES:', API_ENDPOINTS.CHATS.SEARCH_MESSAGES(testNamespace, testChat))
    console.log('- EDIT_MESSAGE:', API_ENDPOINTS.CHATS.EDIT_MESSAGE(testNamespace, testChat, testMessage))
    console.log('- DELETE_MESSAGE:', API_ENDPOINTS.CHATS.DELETE_MESSAGE(testNamespace, testChat, testMessage))
    
    console.log('\n🔍 检查DAGS接口:')
    console.log('- LIST:', API_ENDPOINTS.DAGS.LIST(testNamespace))
    console.log('- CREATE:', API_ENDPOINTS.DAGS.CREATE(testNamespace))
    console.log('- GET:', API_ENDPOINTS.DAGS.GET(testNamespace, testDag))
    console.log('- UPDATE:', API_ENDPOINTS.DAGS.UPDATE(testNamespace, testDag))
    console.log('- DELETE:', API_ENDPOINTS.DAGS.DELETE(testNamespace, testDag))
    
    console.log('\n🔍 检查RECORDS接口:')
    console.log('- LIST:', API_ENDPOINTS.RECORDS.LIST(testNamespace))
    console.log('- CREATE:', API_ENDPOINTS.RECORDS.CREATE(testNamespace))
    console.log('- GET:', API_ENDPOINTS.RECORDS.GET(testNamespace, testRecord))
    console.log('- UPDATE:', API_ENDPOINTS.RECORDS.UPDATE(testNamespace, testRecord))
    console.log('- DELETE:', API_ENDPOINTS.RECORDS.DELETE(testNamespace, testRecord))
    
    console.log('\n🔍 检查WebSocket接口:')
    console.log('- CHAT_ROOM:', API_ENDPOINTS.WEBSOCKET.CHAT_ROOM(testNamespace))
    console.log('- CHAT:', API_ENDPOINTS.WEBSOCKET.CHAT(testNamespace, testChat))
    console.log('- AGENT_LOGS:', API_ENDPOINTS.WEBSOCKET.AGENT_LOGS(testNamespace, testAgent))
    
    console.groupEnd()
  }
  
  // 检查是否还有旧的namespace路径
  static checkForOldPaths() {
    console.group('🔍 检查旧路径')
    
    const allPaths = [
      ...Object.values(API_ENDPOINTS.NAMESPACES),
      ...Object.values(API_ENDPOINTS.AGENTS).map(fn => typeof fn === 'function' ? fn('test', 'test') : fn),
      ...Object.values(API_ENDPOINTS.CHATS).map(fn => typeof fn === 'function' ? fn('test', 'test', 'test') : fn),
      ...Object.values(API_ENDPOINTS.DAGS).map(fn => typeof fn === 'function' ? fn('test', 'test') : fn),
      ...Object.values(API_ENDPOINTS.RECORDS).map(fn => typeof fn === 'function' ? fn('test', 'test') : fn),
      ...Object.values(API_ENDPOINTS.WEBSOCKET).map(fn => typeof fn === 'function' ? fn('test', 'test') : fn)
    ].flat()
    
    const oldPaths = allPaths.filter(path => 
      typeof path === 'string' && (path.includes('/namespaces/') || path.includes('/namespace/'))
    )
    
    if (oldPaths.length > 0) {
      console.error('❌ 发现旧的namespace路径:')
      oldPaths.forEach(path => console.error('  -', path))
    } else {
      console.log('✅ 所有路径已更新为ns格式')
    }
    
    console.groupEnd()
  }
  
  // 测试API连接
  static async testApiConnections() {
    console.group('🧪 测试API连接')
    
    const testEndpoints = [
      { name: 'Namespaces List', url: API_ENDPOINTS.NAMESPACES.LIST },
      { name: 'Agents List', url: API_ENDPOINTS.AGENTS.LIST('default') },
      { name: 'Chats List', url: API_ENDPOINTS.CHATS.LIST('default') }
    ]
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`测试 ${endpoint.name}: ${endpoint.url}`)
        
        const response = await fetch(`/api/v1${endpoint.url}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('goqgo_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log(`  状态: ${response.status} ${response.statusText}`)
        
        if (response.ok) {
          console.log(`  ✅ ${endpoint.name} 连接成功`)
        } else {
          console.log(`  ❌ ${endpoint.name} 连接失败`)
        }
        
      } catch (error) {
        console.error(`  ❌ ${endpoint.name} 连接错误:`, error)
      }
    }
    
    console.groupEnd()
  }
  
  // 比较新旧路径
  static compareOldAndNewPaths() {
    console.group('📊 新旧路径对比')
    
    const comparisons = [
      {
        category: 'Namespaces',
        old: '/namespaces',
        new: '/ns'
      },
      {
        category: 'Agents',
        old: '/namespaces/{ns}/agents',
        new: '/ns/{ns}/agents'
      },
      {
        category: 'Chats',
        old: '/namespaces/{ns}/chats',
        new: '/ns/{ns}/chats'
      },
      {
        category: 'WebSocket',
        old: '/ws/namespaces/{ns}/chat',
        new: '/ws/ns/{ns}/chat'
      }
    ]
    
    console.table(comparisons)
    
    console.log('📝 更新说明:')
    console.log('- 所有 /namespaces/ 路径已更新为 /ns/')
    console.log('- 所有 /namespace/ 路径已更新为 /ns/')
    console.log('- WebSocket路径也相应更新')
    console.log('- 保持了原有的API结构和参数')
    
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).apiPathTest = ApiPathTest
  console.log('🧪 API路径测试工具已加载，使用 window.apiPathTest 访问')
  console.log('📋 可用方法:')
  console.log('  - apiPathTest.validateApiPaths() - 验证所有API路径')
  console.log('  - apiPathTest.checkForOldPaths() - 检查旧路径')
  console.log('  - apiPathTest.testApiConnections() - 测试API连接')
  console.log('  - apiPathTest.compareOldAndNewPaths() - 新旧路径对比')
}
