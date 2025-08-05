<template>
  <div class="chat-input-container">
    <ChatInput
      :is-connected="isConnected"
      :namespace="namespace"
      @send="$emit('send', $event)"
      @send-image="$emit('send-image', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import ChatInput from '@/components/ChatInput.vue'

interface Props {
  isConnected: boolean
  namespace?: string
}

defineProps<Props>()

defineEmits<{
  send: [message: string, mentionedAgents?: string[]]
  'send-image': [url: string]
}>()
</script>

<style scoped lang="scss">
.chat-input-container {
  // 样式由ChatInput组件处理
}
</style>
