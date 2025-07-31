<template>
  <div class="debug-view">
    <ChatDebugger />
  </div>
</template>

<script setup lang="ts">
import ChatDebugger from '@/components/ChatDebugger.vue'
</script>

<style scoped lang="scss">
.debug-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
