import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// 响应式断点
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

type Breakpoint = keyof typeof BREAKPOINTS

export function useLayout() {
  // 屏幕尺寸状态
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)
  
  // 布局状态（持久化）
  const sidebarCollapsed = useLocalStorage('layout-sidebar-collapsed', false)
  const rightPanelCollapsed = useLocalStorage('layout-right-panel-collapsed', true)
  const layoutMode = useLocalStorage<'default' | 'fullscreen' | 'minimal'>('layout-mode', 'default')
  
  // 响应式计算属性
  const isMobile = computed(() => windowWidth.value < BREAKPOINTS.md)
  const isTablet = computed(() => 
    windowWidth.value >= BREAKPOINTS.md && windowWidth.value < BREAKPOINTS.lg
  )
  const isDesktop = computed(() => windowWidth.value >= BREAKPOINTS.lg)
  const isLargeScreen = computed(() => windowWidth.value >= BREAKPOINTS.xl)
  
  // 当前断点
  const currentBreakpoint = computed<Breakpoint>(() => {
    const width = windowWidth.value
    if (width < BREAKPOINTS.sm) return 'sm'
    if (width < BREAKPOINTS.md) return 'sm'
    if (width < BREAKPOINTS.lg) return 'md'
    if (width < BREAKPOINTS.xl) return 'lg'
    if (width < BREAKPOINTS['2xl']) return 'xl'
    return '2xl'
  })
  
  // 布局配置
  const layoutConfig = computed(() => ({
    // 侧边栏配置
    sidebar: {
      width: sidebarCollapsed.value ? '64px' : '280px',
      collapsed: sidebarCollapsed.value,
      show: !isMobile.value || !sidebarCollapsed.value
    },
    
    // 右侧面板配置
    rightPanel: {
      width: rightPanelCollapsed.value ? '0px' : '320px',
      collapsed: rightPanelCollapsed.value,
      show: !isMobile.value && !rightPanelCollapsed.value
    },
    
    // 内容区域配置
    content: {
      marginLeft: isMobile.value ? '0px' : (sidebarCollapsed.value ? '64px' : '280px'),
      marginRight: (isMobile.value || rightPanelCollapsed.value) ? '0px' : '320px'
    },
    
    // 头部配置
    header: {
      height: '64px',
      show: layoutMode.value !== 'fullscreen'
    },
    
    // 底部配置
    footer: {
      height: '48px',
      show: false // 默认不显示底部
    }
  }))
  
  // 窗口大小变化处理
  const handleResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    
    // 移动端自动收起侧边栏
    if (isMobile.value && !sidebarCollapsed.value) {
      sidebarCollapsed.value = true
    }
    
    // 移动端自动收起右侧面板
    if (isMobile.value && !rightPanelCollapsed.value) {
      rightPanelCollapsed.value = true
    }
  }
  
  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 切换右侧面板
  const toggleRightPanel = () => {
    rightPanelCollapsed.value = !rightPanelCollapsed.value
  }
  
  // 设置布局模式
  const setLayoutMode = (mode: 'default' | 'fullscreen' | 'minimal') => {
    layoutMode.value = mode
  }
  
  // 进入全屏模式
  const enterFullscreen = () => {
    setLayoutMode('fullscreen')
    sidebarCollapsed.value = true
    rightPanelCollapsed.value = true
  }
  
  // 退出全屏模式
  const exitFullscreen = () => {
    setLayoutMode('default')
  }
  
  // 重置布局
  const resetLayout = () => {
    sidebarCollapsed.value = false
    rightPanelCollapsed.value = true
    layoutMode.value = 'default'
  }
  
  // 获取断点匹配函数
  const matchBreakpoint = (breakpoint: Breakpoint) => {
    return windowWidth.value >= BREAKPOINTS[breakpoint]
  }
  
  // 获取容器尺寸
  const getContainerSize = () => ({
    width: windowWidth.value,
    height: windowHeight.value,
    contentWidth: windowWidth.value - 
      (sidebarCollapsed.value ? 64 : 280) - 
      (rightPanelCollapsed.value ? 0 : 320),
    contentHeight: windowHeight.value - 64 // 减去头部高度
  })
  
  // 生命周期
  onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize() // 初始化
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
  
  return {
    // 响应式状态
    windowWidth,
    windowHeight,
    sidebarCollapsed,
    rightPanelCollapsed,
    layoutMode,
    
    // 计算属性
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    currentBreakpoint,
    layoutConfig,
    
    // 方法
    toggleSidebar,
    toggleRightPanel,
    setLayoutMode,
    enterFullscreen,
    exitFullscreen,
    resetLayout,
    matchBreakpoint,
    getContainerSize,
    
    // 工具函数
    handleResize
  }
}

// 布局事件总线
export const layoutEventBus = {
  // 侧边栏切换事件
  onSidebarToggle: (callback: (collapsed: boolean) => void) => {
    const { sidebarCollapsed } = useLayout()
    watch(sidebarCollapsed, callback, { immediate: true })
  },
  
  // 右侧面板切换事件
  onRightPanelToggle: (callback: (collapsed: boolean) => void) => {
    const { rightPanelCollapsed } = useLayout()
    watch(rightPanelCollapsed, callback, { immediate: true })
  },
  
  // 布局模式变化事件
  onLayoutModeChange: (callback: (mode: string) => void) => {
    const { layoutMode } = useLayout()
    watch(layoutMode, callback, { immediate: true })
  },
  
  // 断点变化事件
  onBreakpointChange: (callback: (breakpoint: Breakpoint) => void) => {
    const { currentBreakpoint } = useLayout()
    watch(currentBreakpoint, callback, { immediate: true })
  }
}

// 布局工具函数
export const layoutUtils = {
  // 计算内容区域样式
  getContentStyles: () => {
    const { layoutConfig } = useLayout()
    return {
      marginLeft: layoutConfig.value.content.marginLeft,
      marginRight: layoutConfig.value.content.marginRight,
      transition: 'all 0.3s ease'
    }
  },
  
  // 获取Z-Index层级
  getZIndex: (layer: 'header' | 'sidebar' | 'rightPanel' | 'modal' | 'toast') => {
    const zIndexMap = {
      header: 100,
      sidebar: 90,
      rightPanel: 90,
      modal: 1000,
      toast: 2000
    }
    return zIndexMap[layer]
  },
  
  // 检查是否需要显示遮罩
  shouldShowOverlay: () => {
    const { isMobile, sidebarCollapsed, rightPanelCollapsed } = useLayout()
    return isMobile.value && (!sidebarCollapsed.value || !rightPanelCollapsed.value)
  }
}

export default useLayout
