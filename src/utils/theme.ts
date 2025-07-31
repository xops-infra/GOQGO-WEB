import { watch } from 'vue'
import { useAppStore } from '@/stores/app'

export type ThemeMode = 'light' | 'dark' | 'auto'

export class ThemeManager {
  private static instance: ThemeManager
  private mediaQuery: MediaQuery | null = null

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  constructor() {
    this.init()
  }

  private init() {
    // 监听系统主题变化
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this))
    }

    // 监听应用主题变化
    const appStore = useAppStore()
    watch(
      () => appStore.theme,
      (newTheme) => {
        this.applyTheme(newTheme)
      },
      { immediate: true }
    )
  }

  private handleSystemThemeChange(e: MediaQueryListEvent) {
    const appStore = useAppStore()
    if (appStore.theme === 'auto') {
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
    const appStore = useAppStore()
    const currentTheme = appStore.theme
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    appStore.theme = newTheme
  }

  setTheme(theme: ThemeMode) {
    const appStore = useAppStore()
    appStore.theme = theme
  }

  getCurrentTheme(): 'light' | 'dark' {
    const appStore = useAppStore()
    if (appStore.theme === 'auto') {
      return this.getSystemTheme()
    }
    return appStore.theme
  }

  destroy() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this))
    }
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// 主题相关的工具函数
export const useTheme = () => {
  const appStore = useAppStore()
  
  return {
    theme: appStore.theme,
    isDark: () => themeManager.getCurrentTheme() === 'dark',
    isLight: () => themeManager.getCurrentTheme() === 'light',
    toggle: () => themeManager.toggleTheme(),
    setTheme: (theme: ThemeMode) => themeManager.setTheme(theme),
    getCurrentTheme: () => themeManager.getCurrentTheme()
  }
}
