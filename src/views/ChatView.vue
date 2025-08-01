<template>
  <div class="chat-view">
    <ChatRoom :namespace="currentNamespace" />
  </div>
</template>

<script setup lang="ts">
import ChatRoom from '@/components/ChatRoom.vue'
import { useNamespacesStore } from '@/stores/namespaces'
import { storeToRefs } from 'pinia'

// 获取当前命名空间
const namespacesStore = useNamespacesStore()
const { currentNamespace } = storeToRefs(namespacesStore)
console.log('currentNamespace', currentNamespace.value)
</script>

<style scoped lang="scss">
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
