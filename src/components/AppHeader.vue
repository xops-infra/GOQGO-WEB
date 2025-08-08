<template>
  <div class="app-header">
    <div class="header-container">
      <!-- 左侧：只保留Terminal Logo -->
      <div class="terminal-brand">
        <div class="brand-logo">
          <TerminalIcons 
            name="terminal" 
            :size="24" 
            color="#00ff41" 
            :glow="true" 
            :animated="false"
            class="terminal-icon"
          />
          <span class="logo-text">GOQGO.TERMINAL</span>
        </div>
      </div>

      <!-- 中间：导航菜单 -->
      <div class="navigation-section">
        <nav class="main-nav">
          <router-link 
            to="/" 
            class="nav-item" 
            :class="{ 'active': currentRoute === '/' }"
          >
            <n-icon size="18" class="nav-icon">
              <ChatbubbleOutline />
            </n-icon>
            <span class="nav-text">CHAT_ROOM</span>
          </router-link>

          <router-link 
            to="/agents" 
            class="nav-item" 
            :class="{ 'active': currentRoute === '/agents' }"
          >
            <n-icon size="18" class="nav-icon">
              <PersonOutline />
            </n-icon>
            <span class="nav-text">AGENTS</span>
          </router-link>

          <router-link 
            to="/dashboard" 
            class="nav-item" 
            :class="{ 'active': currentRoute === '/dashboard' }"
          >
            <n-icon size="18" class="nav-icon">
              <GridOutline />
            </n-icon>
            <span class="nav-text">DASHBOARD</span>
          </router-link>

          <router-link 
            to="/roles" 
            class="nav-item" 
            :class="{ 'active': currentRoute === '/roles' }"
          >
            <n-icon size="18" class="nav-icon">
              <ShieldCheckmarkOutline />
            </n-icon>
            <span class="nav-text">ROLES</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧：用户信息和终端动画 -->
      <div class="right-section">
        <!-- 终端命令行动画 -->
        <div class="terminal-animation">
          <div class="command-line">
            <span class="prompt">root@goqgo:~$</span>
            <span class="command">{{ currentCommand }}</span>
            <span class="cursor" :class="{ 'blink': showCursor }">|</span>
          </div>
        </div>
        
        <!-- 用户信息 -->
        <div class="user-section">
          <n-dropdown
            :options="userMenuOptions"
            @select="handleUserMenuSelect"
            trigger="click"
            placement="bottom-end"
          >
            <div class="user-info">
              <UserAvatarIcon 
                :size="32" 
                :username="userStore.username || '用户'"
                :is-online="true"
                class="user-avatar"
              />
              <span class="username">{{ userStore.username || 'ZHOUSHOUJIAN' }}</span>
            </div>
          </n-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon, NBadge, NDropdown, NAvatar, useMessage } from 'naive-ui'
import { 
  ChatbubbleOutline, 
  PersonOutline, 
  GridOutline, 
  ShieldCheckmarkOutline,
  SettingsOutline,
  LogOutOutline,
  RefreshOutline,
  SearchOutline,
  CheckmarkCircleOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'
import { useUserStore } from '@/stores/user'
import { authManager } from '@/utils/auth'
import UserAvatarIcon from '@/components/icons/UserAvatarIcon.vue'
import TerminalIcons from '@/components/TerminalIcons.vue'

const route = useRoute()
const router = useRouter()
const { isTerminal } = useTheme()
const userStore = useUserStore()
const message = useMessage()

// 当前路由
const currentRoute = computed(() => route.path)

// 当前命令
const currentCommand = ref('')
const showCursor = ref(true)

// 命令列表 - 使用真实的goqgo命令
const commands = [
  'goqgo agent list --all',
  'goqgo chat history --recent',
  'goqgo role list --all',
  'goqgo namespace list',
  'goqgo agent create ./ --role backend-engineer',
  'goqgo role describe architect'
]

let commandIndex = 0
let commandInterval: NodeJS.Timeout | null = null
let cursorInterval: NodeJS.Timeout | null = null
let typingInterval: NodeJS.Timeout | null = null
let currentTypingIndex = 0

// 用户菜单选项
const userMenuOptions = computed(() => [
  {
    label: '个人设置',
    key: 'settings',
    icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
  },
  {
    label: '刷新页面',
    key: 'refresh',
    icon: () => h(NIcon, null, { default: () => h(RefreshOutline) })
  },
  {
    type: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  }
])

// 处理用户菜单选择
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'settings':
      message.info('个人设置功能开发中...')
      break
    case 'refresh':
      window.location.reload()
      break
    case 'logout':
      authManager.clearAuth()
      router.push('/login')
      break
  }
}

// 启动命令轮播
const startCommandRotation = () => {
  // 开始光标闪烁
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 500)
  
  // 开始命令轮换
  commandInterval = setInterval(() => {
    commandIndex = (commandIndex + 1) % commands.length
    const newCommand = commands[commandIndex]
    
    // 清空当前命令
    currentCommand.value = ''
    currentTypingIndex = 0
    
    // 开始打字动画
    if (typingInterval) {
      clearInterval(typingInterval)
    }
    
    typingInterval = setInterval(() => {
      if (currentTypingIndex < newCommand.length) {
        currentCommand.value += newCommand[currentTypingIndex]
        currentTypingIndex++
      } else {
        // 打字完成，清除定时器
        if (typingInterval) {
          clearInterval(typingInterval)
          typingInterval = null
        }
      }
    }, 150) // 每个字符150ms，让打字效果更慢
  }, 6000) // 每6秒切换一次命令，让变化更慢
  
  // 立即开始第一个命令的打字动画
  setTimeout(() => {
    const firstCommand = commands[0]
    typingInterval = setInterval(() => {
      if (currentTypingIndex < firstCommand.length) {
        currentCommand.value += firstCommand[currentTypingIndex]
        currentTypingIndex++
      } else {
        if (typingInterval) {
          clearInterval(typingInterval)
          typingInterval = null
        }
      }
    }, 150)
  }, 1000)
}

// 停止命令轮播
const stopCommandRotation = () => {
  if (commandInterval) {
    clearInterval(commandInterval)
    commandInterval = null
  }
  if (cursorInterval) {
    clearInterval(cursorInterval)
    cursorInterval = null
  }
  if (typingInterval) {
    clearInterval(typingInterval)
    typingInterval = null
  }
}

onMounted(() => {
  startCommandRotation()
})

onUnmounted(() => {
  stopCommandRotation()
})
</script>

<style scoped lang="scss">
.app-header {
  /* 移除固定定位，让它正常占用布局空间 */
  /* position: fixed; */
  /* top: 0; */
  /* left: 0; */
  /* right: 0; */
  z-index: 1000;
  background: #000000;
  border-bottom: 1px solid #333333;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  height: 100%; /* 占满父容器高度 */
  
  /* 添加扫描线效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, transparent 98%, rgba(0, 255, 65, 0.05) 100%),
      linear-gradient(0deg, transparent 98%, rgba(0, 255, 65, 0.05) 100%);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: -1;
  }
}

.header-container {
  display: flex;
  align-items: center;
  padding: 20px 32px;
  height: 90px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

// 左侧品牌区域
.terminal-brand {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-width: 450px;

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;

    .terminal-icon {
      flex-shrink: 0;
      filter: drop-shadow(0 0 4px #00ff41);
    }

    .logo-text {
      font-family: 'Courier New', monospace;
      font-size: 22px;
      font-weight: 700;
      color: #00ff41;
      letter-spacing: 1.5px;
      text-shadow: 0 0 4px #00ff41;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .brand-subtitle {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 50px;
    opacity: 0.8;

    .subtitle-prefix {
      color: #00ff41;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      font-size: 12px;
    }

    .subtitle-text {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #aaaaaa;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
  }

  .command-line {
    margin-left: 60px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    opacity: 0.7;

    .prompt {
      color: #00ff41;
      font-weight: 500;
    }

    .command {
      color: #00ffff;
      font-weight: 400;
    }
  }
}

// 霓虹发光动画
@keyframes neon-glow {
  from {
    filter: drop-shadow(0 0 8px #00ff41);
  }
  to {
    filter: drop-shadow(0 0 15px #00ff41) drop-shadow(0 0 25px #00ff41);
  }
}

@keyframes neon-pulse {
  from {
    text-shadow: 
      0 0 10px #00ff41,
      0 0 20px #00ff41,
      0 0 30px #00ff41;
  }
  to {
    text-shadow: 
      0 0 15px #00ff41,
      0 0 25px #00ff41,
      0 0 35px #00ff41;
  }
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

// 导航区域
.navigation-section {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  min-width: 0;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  flex-wrap: wrap;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #cccccc;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: rgba(0, 255, 65, 0.2);
    color: #00ff41;
  }

  &.active {
    background: rgba(0, 255, 65, 0.3);
    color: #00ff41;
    border: 1px solid rgba(0, 255, 65, 0.5);
  }

  .nav-icon {
    color: currentColor;
  }

  .nav-text {
    font-size: 11px;
    font-weight: 600;
  }
}

// 右侧区域
.right-section {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

// 终端动画区域
.terminal-animation {
  display: flex;
  align-items: center;
  
  .command-line {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 8px 12px;
    background: rgba(0, 255, 65, 0.05);
    border: 1px solid rgba(0, 255, 65, 0.2);
    border-radius: 4px;
    width: 400px; // 固定宽度
    overflow: hidden; // 隐藏溢出内容
    
    .prompt {
      color: #00ff41;
      font-weight: 600;
      flex-shrink: 0; // 不收缩
      min-width: 120px; // 最小宽度
    }
    
    .command {
      color: #00ffff;
      font-weight: 400;
      flex: 1; // 占据剩余空间
      overflow: hidden; // 隐藏溢出
      text-overflow: ellipsis; // 显示省略号
      white-space: nowrap; // 不换行
    }
    
    .cursor {
      color: #00ff41;
      font-weight: bold;
      animation: cursor-blink 1s infinite;
      flex-shrink: 0; // 不收缩
      
      &.blink {
        opacity: 1;
      }
      
      &:not(.blink) {
        opacity: 0;
      }
    }
  }
}

// 用户信息区域
.user-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 255, 65, 0.3);
  background: rgba(0, 255, 65, 0.1);

  &:hover {
    background: rgba(0, 255, 65, 0.2);
    border-color: rgba(0, 255, 65, 0.5);
  }
}

.user-avatar {
  flex-shrink: 0;
}

.username {
  font-size: 12px;
  font-weight: 600;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

// 响应式设计
@media (max-width: 768px) {
  .header-container {
    padding: 16px 20px;
    height: 78px;
  }

  .terminal-brand {
    gap: 6px;
    max-width: 300px;

    .brand-logo {
      gap: 12px;

      .terminal-icon {
        width: 20px;
        height: 20px;
      }

      .logo-text {
        font-size: 18px;
        letter-spacing: 1px;
        text-shadow: 
          0 0 8px #00ff41,
          0 0 15px #00ff41,
          0 0 20px #00ff41;
      }
    }

    .brand-subtitle {
      margin-left: 40px;
      opacity: 0.7;

      .subtitle-prefix {
        font-size: 10px;
      }

      .subtitle-text {
        font-size: 9px;
      }
    }

    .command-line {
      margin-left: 50px;
      font-size: 9px;
      opacity: 0.6;
    }
  }

  .navigation-section {
    margin: 0 10px;
  }

  .main-nav {
    gap: 4px;
    padding: 4px 8px;
  }

  .nav-item {
    padding: 4px 8px;
    font-size: 10px;

    .nav-text {
      font-size: 9px;
    }
  }

  .user-info {
    gap: 6px;
    padding: 4px 8px;
  }

  .username {
    font-size: 10px;
  }

  // 移动端隐藏部分文字
  .brand-subtitle,
  .command-line {
    display: none;
  }

  .nav-text {
    display: none;
  }

  .username {
    display: none;
  }
  
  // 移动端隐藏终端动画
  .terminal-animation {
    display: none;
  }
  
  // 移动端调整右侧区域
  .right-section {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 12px 16px;
    height: 70px;
  }

  .terminal-brand {
    max-width: 250px;
  }

  .navigation-section {
    margin: 0 5px;
  }

  .connection-status {
    display: none;
  }
}
</style>
