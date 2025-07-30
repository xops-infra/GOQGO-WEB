<template>
  <div class="main-layout">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-left">
          <img src="@/assets/Goqgo.svg" alt="GoQGo" class="header-logo" />
          <div class="header-title">
            <h1>Q Chat Manager</h1>
            <span class="subtitle">AI助手管理平台</span>
          </div>
        </div>
        <div class="header-right">
          <n-space>
            <NamespaceManager />
            <n-button size="small" quaternary @click="toggleTheme">
              <n-icon>
                <SunnyOutline v-if="appStore.theme === 'dark'" />
                <MoonOutline v-else />
              </n-icon>
            </n-button>
          </n-space>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-area">
      <!-- 左侧实例列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>Q CLI 实例</h3>
          <n-button size="small" type="primary" @click="showCreateModal = true">
            <n-icon><AddOutline /></n-icon>
          </n-button>
        </div>
        
        <div class="instances-list">
          <div
            v-for="agent in agents"
            :key="agent.name"
            class="instance-item"
            :class="{ active: agentsStore.selectedAgent?.name === agent.name }"
            @click="selectAgent(agent)"
          >
            <div class="instance-info">
              <div class="instance-name">{{ agent.name }}</div>
              <div class="instance-role">{{ agent.role }}</div>
            </div>
            <div class="instance-status" :class="agent.status">
              {{ agent.status }}
              <div class="status-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="right-panel">
        <ChatRoom :namespace="currentNamespace" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { 
  AddOutline,
  SunnyOutline,
  MoonOutline
} from '@vicons/ionicons5'
import { useAppStore } from '@/stores/app'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import NamespaceManager from './NamespaceManager.vue'
import ChatRoom from './ChatRoom.vue'
import type { Agent, CreateAgentRequest } from '@/types/api'

const appStore = useAppStore()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()
const { currentNamespace } = storeToRefs(namespacesStore)

// 响应式数据
const commandInput = ref('')
const chatInput = ref('')
const showCreateModal = ref(false)
const creating = ref(false)
const createFormRef = ref()

const createForm = ref<CreateAgentRequest>({
  name: '',
  namespace: 'default',
  role: '',
  context: ''
})

const createRules = {
  name: [{ required: true, message: '请输入实例名称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 计算属性
const agents = computed(() => agentsStore.agents)

// 方法
const selectAgent = (agent: Agent) => {
  agentsStore.setSelectedAgent(agent)
}

const toggleTheme = () => {
  appStore.toggleTheme()
}

// 生命周期
onMounted(async () => {
  try {
    await agentsStore.fetchAgents()
  } catch (error) {
    console.error('获取实例列表失败:', error)
  }
})
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header-bar {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .header-logo {
      width: 40px;
      height: 40px;
    }
    
    .header-title {
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      .subtitle {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }
}

.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #f5f5f5;
  padding: 16px;
  gap: 16px;
}

.left-panel {
  width: 240px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.instances-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.instance-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #e6f7ff;
    border-left: 3px solid #1890ff;
  }
  
  .instance-info {
    margin-bottom: 4px;
    
    .instance-name {
      font-weight: 500;
      color: #333;
    }
    
    .instance-role {
      font-size: 12px;
      color: #666;
    }
  }
  
  .instance-status {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.running {
      color: #52c41a;
    }
    
    &.error {
      color: #f5222d;
    }
    
    &.idle {
      color: #faad14;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  }
}
</style>
