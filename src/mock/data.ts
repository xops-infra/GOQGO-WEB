import type { User, Agent, Namespace, Message, Role } from '@/types/api'

// Mock用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@goqgo.com',
    role: 'admin',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  },
  {
    id: '2', 
    username: 'demo',
    email: 'demo@goqgo.com',
    role: 'user',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  }
]

// Mock命名空间数据
export const mockNamespaces: Namespace[] = [
  {
    name: 'default',
    displayName: '默认命名空间',
    description: '系统默认命名空间',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z',
    labels: {
      'env': 'production',
      'team': 'platform'
    },
    resourceQuota: {
      maxAgents: 50,
      cpuLimit: 10,
      memoryLimit: 20
    }
  },
  {
    name: 'development',
    displayName: '开发环境',
    description: '用于开发和测试的命名空间',
    status: 'Active',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z',
    labels: {
      'env': 'development',
      'team': 'dev'
    },
    resourceQuota: {
      maxAgents: 20,
      cpuLimit: 5,
      memoryLimit: 10
    }
  },
  {
    name: 'testing',
    displayName: '测试环境',
    description: '用于QA测试的命名空间',
    status: 'Active',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z',
    labels: {
      'env': 'testing',
      'team': 'qa'
    },
    resourceQuota: {
      maxAgents: 15,
      cpuLimit: 3,
      memoryLimit: 8
    }
  }
]

// Mock Agent数据
export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'backend-api',
    namespace: 'default',
    role: 'backend-engineer',
    status: 'running',
    username: 'admin',
    age: '2h30m',
    restartCount: 0,
    createdAt: '2024-08-05T10:00:00Z',
    updatedAt: '2024-08-05T12:30:00Z',
    config: {
      image: 'goqgo/backend-api:latest',
      resources: {
        cpu: '500m',
        memory: '1Gi'
      }
    }
  },
  {
    id: 'agent-2',
    name: 'frontend-app',
    namespace: 'default',
    role: 'frontend-engineer',
    status: 'running',
    username: 'admin',
    age: '1h45m',
    restartCount: 1,
    createdAt: '2024-08-05T10:45:00Z',
    updatedAt: '2024-08-05T12:30:00Z',
    config: {
      image: 'goqgo/frontend-app:latest',
      resources: {
        cpu: '300m',
        memory: '512Mi'
      }
    }
  },
  {
    id: 'agent-3',
    name: 'data-processor',
    namespace: 'development',
    role: 'data-engineer',
    status: 'idle',
    username: 'demo',
    age: '45m',
    restartCount: 0,
    createdAt: '2024-08-05T11:45:00Z',
    updatedAt: '2024-08-05T12:30:00Z',
    config: {
      image: 'goqgo/data-processor:dev',
      resources: {
        cpu: '200m',
        memory: '256Mi'
      }
    }
  },
  {
    id: 'agent-4',
    name: 'ml-trainer',
    namespace: 'development',
    role: 'ml-engineer',
    status: 'error',
    username: 'demo',
    age: '10m',
    restartCount: 3,
    createdAt: '2024-08-05T12:20:00Z',
    updatedAt: '2024-08-05T12:30:00Z',
    config: {
      image: 'goqgo/ml-trainer:dev',
      resources: {
        cpu: '1000m',
        memory: '2Gi'
      }
    }
  },
  {
    id: 'agent-5',
    name: 'test-runner',
    namespace: 'testing',
    role: 'qa-engineer',
    status: 'creating',
    username: 'admin',
    age: '2m',
    restartCount: 0,
    createdAt: '2024-08-05T12:28:00Z',
    updatedAt: '2024-08-05T12:30:00Z',
    config: {
      image: 'goqgo/test-runner:latest',
      resources: {
        cpu: '100m',
        memory: '128Mi'
      }
    }
  }
]

// Mock角色数据
export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'backend-engineer',
    displayName: '后端工程师',
    description: '负责后端API开发和维护',
    permissions: ['api.read', 'api.write', 'db.read', 'db.write'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  },
  {
    id: 'role-2',
    name: 'frontend-engineer',
    displayName: '前端工程师',
    description: '负责前端界面开发和用户体验',
    permissions: ['ui.read', 'ui.write', 'api.read'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  },
  {
    id: 'role-3',
    name: 'data-engineer',
    displayName: '数据工程师',
    description: '负责数据处理和分析',
    permissions: ['data.read', 'data.write', 'analytics.read'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  },
  {
    id: 'role-4',
    name: 'ml-engineer',
    displayName: '机器学习工程师',
    description: '负责机器学习模型开发和训练',
    permissions: ['ml.read', 'ml.write', 'model.deploy'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  },
  {
    id: 'role-5',
    name: 'qa-engineer',
    displayName: 'QA工程师',
    description: '负责质量保证和测试',
    permissions: ['test.read', 'test.write', 'report.read'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z'
  }
]

// Mock消息数据
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: '大家好，我是后端API服务，现在开始工作了！',
    sender: 'backend-api',
    namespace: 'default',
    timestamp: '2024-08-05T10:00:00Z',
    type: 'text',
    status: 'sent'
  },
  {
    id: 'msg-2',
    content: '前端应用已启动，准备接收用户请求',
    sender: 'frontend-app',
    namespace: 'default',
    timestamp: '2024-08-05T10:45:00Z',
    type: 'text',
    status: 'sent'
  },
  {
    id: 'msg-3',
    content: '@backend-api 能帮我检查一下用户认证接口吗？',
    sender: 'frontend-app',
    namespace: 'default',
    timestamp: '2024-08-05T11:00:00Z',
    type: 'text',
    status: 'sent',
    mentionedAgents: ['backend-api']
  },
  {
    id: 'msg-4',
    content: '@frontend-app 用户认证接口工作正常，返回状态码200',
    sender: 'backend-api',
    namespace: 'default',
    timestamp: '2024-08-05T11:05:00Z',
    type: 'text',
    status: 'sent',
    mentionedAgents: ['frontend-app']
  },
  {
    id: 'msg-5',
    content: '数据处理任务已完成，处理了1000条记录',
    sender: 'data-processor',
    namespace: 'development',
    timestamp: '2024-08-05T11:30:00Z',
    type: 'text',
    status: 'sent'
  },
  {
    id: 'msg-6',
    content: '⚠️ ML训练任务遇到错误，正在重试...',
    sender: 'ml-trainer',
    namespace: 'development',
    timestamp: '2024-08-05T12:00:00Z',
    type: 'system',
    status: 'sent'
  },
  {
    id: 'msg-7',
    content: '测试套件正在启动，预计5分钟完成',
    sender: 'test-runner',
    namespace: 'testing',
    timestamp: '2024-08-05T12:28:00Z',
    type: 'text',
    status: 'sent'
  }
]

// Mock日志数据
export const mockLogs = {
  'agent-1': [
    '[2024-08-05 10:00:00] INFO: Backend API service starting...',
    '[2024-08-05 10:00:01] INFO: Database connection established',
    '[2024-08-05 10:00:02] INFO: Redis cache connected',
    '[2024-08-05 10:00:03] INFO: Server listening on port 8080',
    '[2024-08-05 10:30:15] INFO: Processing user authentication request',
    '[2024-08-05 11:05:22] INFO: User login successful: admin',
    '[2024-08-05 11:30:45] INFO: API health check passed',
    '[2024-08-05 12:00:12] INFO: Database backup completed',
    '[2024-08-05 12:15:33] INFO: Cache cleanup completed',
    '[2024-08-05 12:30:00] INFO: Service running normally'
  ],
  'agent-2': [
    '[2024-08-05 10:45:00] INFO: Frontend application starting...',
    '[2024-08-05 10:45:01] INFO: Loading configuration',
    '[2024-08-05 10:45:02] INFO: Initializing Vue application',
    '[2024-08-05 10:45:03] INFO: Router configured',
    '[2024-08-05 10:45:04] INFO: Store initialized',
    '[2024-08-05 10:45:05] INFO: Application ready on port 3000',
    '[2024-08-05 11:00:15] INFO: User interface loaded',
    '[2024-08-05 11:30:22] INFO: WebSocket connection established',
    '[2024-08-05 12:00:45] INFO: Theme system initialized',
    '[2024-08-05 12:30:00] INFO: Application running smoothly'
  ],
  'agent-3': [
    '[2024-08-05 11:45:00] INFO: Data processor starting...',
    '[2024-08-05 11:45:01] INFO: Connecting to data sources',
    '[2024-08-05 11:45:02] INFO: Processing pipeline initialized',
    '[2024-08-05 11:50:15] INFO: Processed 250 records',
    '[2024-08-05 12:00:30] INFO: Processed 500 records',
    '[2024-08-05 12:10:45] INFO: Processed 750 records',
    '[2024-08-05 12:20:12] INFO: Processed 1000 records',
    '[2024-08-05 12:25:33] INFO: Data processing completed',
    '[2024-08-05 12:30:00] INFO: Processor idle, waiting for next task'
  ],
  'agent-4': [
    '[2024-08-05 12:20:00] INFO: ML trainer starting...',
    '[2024-08-05 12:20:01] INFO: Loading training data',
    '[2024-08-05 12:20:02] ERROR: Failed to load dataset: file not found',
    '[2024-08-05 12:20:03] INFO: Retrying data load...',
    '[2024-08-05 12:20:04] ERROR: Dataset validation failed',
    '[2024-08-05 12:20:05] INFO: Attempting recovery...',
    '[2024-08-05 12:20:06] ERROR: Recovery failed, restarting service',
    '[2024-08-05 12:25:00] INFO: Service restarted, retry attempt 2',
    '[2024-08-05 12:25:01] ERROR: Same error occurred, escalating',
    '[2024-08-05 12:30:00] ERROR: Service in error state, manual intervention required'
  ],
  'agent-5': [
    '[2024-08-05 12:28:00] INFO: Test runner initializing...',
    '[2024-08-05 12:28:01] INFO: Loading test configuration',
    '[2024-08-05 12:28:02] INFO: Preparing test environment',
    '[2024-08-05 12:29:00] INFO: Test suite loaded: 45 tests',
    '[2024-08-05 12:29:30] INFO: Starting test execution...',
    '[2024-08-05 12:30:00] INFO: Running unit tests (1/3)'
  ]
}
