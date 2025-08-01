// 主题管理工具
export type ThemeType = 'light' | 'dark' | 'terminal'

export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: ThemeType = 'terminal' // 默认使用terminal主题
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
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('goqgo-theme') as ThemeType
    if (savedTheme && ['light', 'dark', 'terminal'].includes(savedTheme)) {
      this.currentTheme = savedTheme
    }

    this.applyTheme(this.currentTheme)
  }

  private applyTheme(theme: ThemeType) {
    const html = document.documentElement
    const body = document.body

    // 移除所有主题类
    html.removeAttribute('data-theme')
    body.removeAttribute('data-theme')

    // 应用新主题
    html.setAttribute('data-theme', theme)
    body.setAttribute('data-theme', theme)

    // 保存到localStorage
    localStorage.setItem('goqgo-theme', theme)

    // 通知监听器
    this.listeners.forEach((listener) => listener(theme))
  }

  setTheme(theme: ThemeType) {
    this.currentTheme = theme
    this.applyTheme(theme)
  }

  getTheme(): ThemeType {
    return this.currentTheme
  }

  toggleTheme() {
    const themes: ThemeType[] = ['light', 'dark', 'terminal']
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.setTheme(themes[nextIndex])
  }

  onThemeChange(callback: (theme: ThemeType) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 获取主题相关的配置
  getThemeConfig(theme?: ThemeType) {
    const targetTheme = theme || this.currentTheme

    switch (targetTheme) {
      case 'terminal':
        return {
          name: 'Terminal',
          icon: '⚡',
          description: '8-bit Terminal Style',
          colors: {
            primary: '#00ff41',
            secondary: '#0066ff',
            accent: '#ff0066',
            background: '#0d1117'
          }
        }
      case 'dark':
        return {
          name: 'Dark',
          icon: '🌙',
          description: 'Dark Mode',
          colors: {
            primary: '#60a5fa',
            secondary: '#1e293b',
            accent: '#3b82f6',
            background: '#0f172a'
          }
        }
      case 'light':
      default:
        return {
          name: 'Light',
          icon: '☀️',
          description: 'Light Mode',
          colors: {
            primary: '#3b82f6',
            secondary: '#f8f9fa',
            accent: '#2563eb',
            background: '#ffffff'
          }
        }
    }
  }

  // 检查是否为terminal主题
  isTerminalTheme(): boolean {
    return this.currentTheme === 'terminal'
  }

  // 获取所有可用主题
  getAvailableThemes() {
    return [
      this.getThemeConfig('light'),
      this.getThemeConfig('dark'),
      this.getThemeConfig('terminal')
    ]
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// Vue组合式API
import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
  const currentTheme = ref<ThemeType>(themeManager.getTheme())
  const isTerminal = ref(themeManager.isTerminalTheme())

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = themeManager.onThemeChange((theme) => {
      currentTheme.value = theme
      isTerminal.value = theme === 'terminal'
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  const setTheme = (theme: ThemeType) => {
    themeManager.setTheme(theme)
  }

  const toggleTheme = () => {
    themeManager.toggleTheme()
  }

  const getThemeConfig = (theme?: ThemeType) => {
    return themeManager.getThemeConfig(theme)
  }

  const getAvailableThemes = () => {
    return themeManager.getAvailableThemes()
  }

  return {
    currentTheme,
    isTerminal,
    setTheme,
    toggleTheme,
    getThemeConfig,
    getAvailableThemes
  }
}

// 工具函数
export function createTerminalEffect() {
  // 创建矩阵雨效果
  const createMatrixRain = () => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '-1'
    canvas.style.opacity = '0.1'

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const chars =
      '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const charArray = chars.split('')

    const fontSize = 14
    const columns = canvas.width / fontSize
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff41'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)

    return {
      canvas,
      destroy: () => {
        clearInterval(interval)
        canvas.remove()
      }
    }
  }

  return {
    createMatrixRain
  }
}
