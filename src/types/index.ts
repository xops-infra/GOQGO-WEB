export * from './api'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'developer' | 'viewer'
}

export interface NavigationItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: NavigationItem[]
}

export interface AppState {
  user: User | null
  currentProject: string | null
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'auto'
}

export interface NamespaceOption {
  label: string
  value: string
  disabled?: boolean
}

export type ThemeMode = 'light' | 'dark' | 'auto'
