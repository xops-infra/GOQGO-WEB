<template>
  <BaseLayout
    :show-header="true"
    :show-sidebar="true"
    :show-footer="false"
    :show-right-panel="showRightPanel"
    mode="default"
  >
    <!-- 自定义头部 -->
    <template #header>
      <MainHeader />
    </template>

    <!-- 自定义侧边栏 -->
    <template #sidebar>
      <MainSidebar />
    </template>

    <!-- 主要内容区域 -->
    <router-view />

    <!-- 右侧面板 -->
    <template #right-panel>
      <RightPanel v-if="showRightPanel" />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseLayout from './BaseLayout.vue'
import MainHeader from './components/MainHeader.vue'
import MainSidebar from './components/MainSidebar.vue'
import RightPanel from './components/RightPanel.vue'

const route = useRoute()

// 根据路由决定是否显示右侧面板
const showRightPanel = computed(() => {
  // 在聊天页面显示右侧面板
  return route.name === 'chat' || route.path.includes('/chat')
})
</script>

<style scoped lang="scss">
// MainLayout特定样式可以在这里添加
</style>
