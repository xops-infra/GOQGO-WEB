import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AppState } from '@/types'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useAppStore = defineStore('app', () => {
  // 状态
  const user = ref<User | null>({
    id: 'user-1',
    name: '开发者',
    email: 'developer@goqgo.com',
    role: 'developer'
  })
  const currentProject = ref<string | null>('goqgo-web')
  const sidebarCollapsed = ref(false)
  const theme = ref<ThemeMode>('light')

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const appState = computed<AppState>(() => ({
    user: user.value,
    currentProject: currentProject.value,
    sidebarCollapsed: sidebarCollapsed.value,
    theme: theme.value
  }))

  // 方法
  const setUser = (userData: User | null) => {
    user.value = userData
  }

  const setCurrentProject = (projectId: string | null) => {
    currentProject.value = projectId
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme
  }

  return {
    // 状态
    user,
    currentProject,
    sidebarCollapsed,
    theme,

    // 计算属性
    isLoggedIn,
    appState,

    // 方法
    setUser,
    setCurrentProject,
    toggleSidebar,
    toggleTheme,
    setTheme
  }
})
