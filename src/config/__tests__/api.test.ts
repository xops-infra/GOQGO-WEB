import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiConfig, buildApiUrl, buildWsUrl, API_ENDPOINTS } from '../api'

// Mock import.meta.env
const mockEnv = {
  DEV: true,
  PROD: false,
  VITE_API_BASE_URL: '',
  VITE_WS_BASE_URL: ''
}

vi.stubGlobal('import', {
  meta: {
    env: mockEnv
  }
})

describe('API Configuration', () => {
  beforeEach(() => {
    // Reset mock environment
    mockEnv.DEV = true
    mockEnv.PROD = false
    mockEnv.VITE_API_BASE_URL = ''
    mockEnv.VITE_WS_BASE_URL = ''
  })

  describe('apiConfig', () => {
    it('should have correct development configuration', () => {
      expect(apiConfig.baseURL).toBe('http://localhost:8080')
      expect(apiConfig.wsBaseURL).toBe('ws://localhost:8080')
      expect(apiConfig.timeout).toBe(10000)
    })
  })

  describe('buildApiUrl', () => {
    it('should build correct API URL', () => {
      const endpoint = '/api/v1/test'
      const result = buildApiUrl(endpoint)
      expect(result).toBe('http://localhost:8080/api/v1/test')
    })

    it('should handle endpoints without leading slash', () => {
      const endpoint = 'api/v1/test'
      const result = buildApiUrl(endpoint)
      expect(result).toBe('http://localhost:8080/api/v1/test')
    })
  })

  describe('buildWsUrl', () => {
    it('should build correct WebSocket URL', () => {
      const endpoint = '/ws/test'
      const result = buildWsUrl(endpoint)
      expect(result).toBe('ws://localhost:8080/ws/test')
    })
  })

  describe('API_ENDPOINTS', () => {
    it('should have all required endpoint categories', () => {
      expect(API_ENDPOINTS.AUTH).toBeDefined()
      expect(API_ENDPOINTS.NAMESPACES).toBeDefined()
      expect(API_ENDPOINTS.AGENTS).toBeDefined()
      expect(API_ENDPOINTS.FILES).toBeDefined()
      expect(API_ENDPOINTS.USERS).toBeDefined()
      expect(API_ENDPOINTS.WEBSOCKET).toBeDefined()
    })

    it('should generate correct agent endpoints', () => {
      const namespace = 'test-namespace'
      const agentName = 'test-agent'
      
      expect(API_ENDPOINTS.AGENTS.LIST(namespace)).toBe(`/api/v1/namespaces/${namespace}/agents`)
      expect(API_ENDPOINTS.AGENTS.DELETE(namespace, agentName)).toBe(`/api/v1/namespaces/${namespace}/agents/${agentName}`)
    })

    it('should generate correct WebSocket endpoints', () => {
      const namespace = 'test-namespace'
      const token = 'test-token'
      
      const chatEndpoint = API_ENDPOINTS.WEBSOCKET.CHAT(namespace, token)
      expect(chatEndpoint).toBe(`/ws/namespaces/${namespace}/chat?token=${token}`)
    })
  })
})
