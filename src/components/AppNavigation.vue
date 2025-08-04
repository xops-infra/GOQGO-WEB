<template>
  <div class="app-navigation">
    <n-menu
      v-model:value="activeKey"
      mode="horizontal"
      :options="menuOptions"
      @update:value="handleMenuSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()

// 当前激活的菜单项
const activeKey = ref<string>(route.name as string || 'chat')

// 菜单选项
const menuOptions = computed<MenuOption[]>(() => [
  {
    label: '聊天',
    key: 'chat',
    icon: () => h(NIcon, null, {
      default: () => h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'
        })
      ])
    })
  },
  {
    label: '智能体',
    key: 'agents',
    icon: () => h(NIcon, null, {
      default: () => h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
        })
      ])
    })
  },
  {
    label: '角色管理',
    key: 'roles',
    icon: () => h(NIcon, null, {
      default: () => h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
        })
      ])
    })
  }
])

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  activeKey.value = key
  router.push({ name: key })
}

// 监听路由变化更新激活状态
router.afterEach((to) => {
  if (to.name) {
    activeKey.value = to.name as string
  }
})
</script>

<style scoped lang="scss">
.app-navigation {
  .n-menu {
    background: transparent;
  }
}
</style>
