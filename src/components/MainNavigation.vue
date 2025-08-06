<template>
  <div class="main-navigation">
    <n-space :size="8" class="nav-items">
      <n-button
        v-for="item in navigationItems"
        :key="item.key"
        :type="currentRoute === item.path ? 'primary' : 'default'"
        :ghost="currentRoute !== item.path"
        size="medium"
        class="nav-item"
        @click="navigateTo(item.path)"
      >
        {{ item.label }}
      </n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NSpace, NButton } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const currentRoute = computed(() => {
  // 根据路由名称判断当前页面
  if (route.name === 'home') return '/'
  return route.path
})

const navigationItems = [
  { key: 'chat', label: '聊天', path: '/' },
  { key: 'agents', label: 'Agents', path: '/agents' },
  { key: 'market', label: '市场', path: '/market' },
  { key: 'dashboard', label: '看板', path: '/dashboard' },
  { key: 'roles', label: '角色', path: '/roles' }
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.main-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  
  .nav-items {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .nav-item {
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
}
</style>
