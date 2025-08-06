// 主题管理工具 - 只保留Terminal主题
import { computed } from 'vue'

export type ThemeType = 'terminal'

export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: ThemeType = 'terminal' // 固定使用terminal主题
  private listeners: ((theme: ThemeType) => void)[] = []

  private constructor() {
    this.initTheme()
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  private initTheme() {
    // 固定使用terminal主题
    this.currentTheme = 'terminal'
    this.applyTheme(this.currentTheme)
  }

  private applyTheme(theme: ThemeType) {
    const html = document.documentElement
    const body = document.body

    // 移除所有主题类
    html.removeAttribute('data-theme')
    body.removeAttribute('data-theme')

    // 应用Terminal主题
    html.setAttribute('data-theme', 'terminal')
    body.setAttribute('data-theme', 'terminal')

    // 保存到localStorage（虽然只有一个主题）
    localStorage.setItem('goqgo-theme', 'terminal')

    // 通知监听器
    this.listeners.forEach((listener) => listener(theme))
  }

  setTheme(theme: ThemeType) {
    // 只接受terminal主题
    if (theme === 'terminal') {
      this.currentTheme = theme
      this.applyTheme(theme)
    }
  }

  getTheme(): ThemeType {
    return 'terminal' // 固定返回terminal
  }

  // 移除切换功能，因为只有一个主题
  // toggleTheme() - 已删除

  addListener(listener: (theme: ThemeType) => void) {
    this.listeners.push(listener)
  }

  removeListener(listener: (theme: ThemeType) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 获取主题显示名称
  getThemeDisplayName(): string {
    return 'Terminal'
  }

  // 获取主题图标
  getThemeIcon(): string {
    return '🖥️'
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// 导出便捷的hook
export const useTheme = () => {
  return {
    theme: themeManager.getTheme(),
    setTheme: (theme: ThemeType) => themeManager.setTheme(theme),
    getTheme: () => themeManager.getTheme(),
    isTerminal: computed(() => themeManager.getTheme() === 'terminal'),
    addListener: (listener: (theme: ThemeType) => void) => themeManager.addListener(listener),
    removeListener: (listener: (theme: ThemeType) => void) => themeManager.removeListener(listener),
    getThemeDisplayName: () => themeManager.getThemeDisplayName(),
    getThemeIcon: () => themeManager.getThemeIcon()
  }
}

export default themeManager
