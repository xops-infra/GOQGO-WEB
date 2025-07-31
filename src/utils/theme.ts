import { watch, nextTick } from 'vue'
import type { App } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export class ThemeManager {
  private static instance: ThemeManager
  private mediaQuery: MediaQuery | null = null
  private initialized = false
  private app: App | null = null

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  constructor() {
    // 不在构造函数中初始化，等待 Vue 应用准备好
  }

  // 在 Vue 应用初始化后调用
  init(app?: App) {
    if (this.initialized) return
    
    if (app) {
      this.app = app
    }

    // 监听系统主题变化
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this))
    }

    // 应用初始主题
    const savedTheme = this.getSavedTheme()
    this.applyTheme(savedTheme)

    this.initialized = true
  }

  // 设置 store 监听器（在组件中调用）
  setupStoreWatcher() {
    if (typeof window === 'undefined') return

    nextTick(() => {
      try {
        // 动态导入 store 避免初始化问题
        import('@/stores/app').then(({ useAppStore }) => {
          const appStore = useAppStore()
          
          watch(
            () => appStore.theme,
            (newTheme) => {
              this.applyTheme(newTheme)
            },
            { immediate: true }
          )
        })
      } catch (error) {
        console.warn('Failed to setup store watcher:', error)
      }
    })
  }

  private handleSystemThemeChange(e: MediaQueryListEvent) {
    // 只有在 auto 模式下才响应系统主题变化
    const savedTheme = this.getSavedTheme()
    if (savedTheme === 'auto') {
      this.applyTheme('auto')
    }
  }

  applyTheme(theme: ThemeMode) {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    
    // 移除之前的主题类
    root.removeAttribute('data-theme')
    
    let actualTheme: 'light' | 'dark'
    
    if (theme === 'auto') {
      actualTheme = this.getSystemTheme()
    } else {
      actualTheme = theme
    }
    
    // 应用新主题
    if (actualTheme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    }
    
    // 保存到localStorage
    localStorage.setItem('goqgo-theme', theme)
  }

  getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  getSavedTheme(): ThemeMode {
    if (typeof localStorage === 'undefined') return 'light'
    return (localStorage.getItem('goqgo-theme') as ThemeMode) || 'light'
  }

  toggleTheme() {
    const currentTheme = this.getSavedTheme()
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
  }

  setTheme(theme: ThemeMode) {
    this.applyTheme(theme)
    
    // 尝试更新 store（如果可用）
    try {
      import('@/stores/app').then(({ useAppStore }) => {
        const appStore = useAppStore()
        appStore.theme = theme
      }).catch(() => {
        // Store 不可用时忽略错误
      })
    } catch (error) {
      // 忽略错误，主题仍然会被应用
    }
  }

  getCurrentTheme(): 'light' | 'dark' {
    const savedTheme = this.getSavedTheme()
    if (savedTheme === 'auto') {
      return this.getSystemTheme()
    }
    return savedTheme
  }

  destroy() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this))
    }
    this.initialized = false
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// 主题相关的工具函数
export const useTheme = () => {
  // 确保主题管理器已初始化
  if (!themeManager['initialized']) {
    themeManager.init()
    themeManager.setupStoreWatcher()
  }

  // 获取当前主题（不依赖 store）
  const getCurrentSavedTheme = () => themeManager.getSavedTheme()
  
  return {
    theme: getCurrentSavedTheme(),
    isDark: () => themeManager.getCurrentTheme() === 'dark',
    isLight: () => themeManager.getCurrentTheme() === 'light',
    toggle: () => themeManager.toggleTheme(),
    setTheme: (theme: ThemeMode) => themeManager.setTheme(theme),
    getCurrentTheme: () => themeManager.getCurrentTheme()
  }
}
