<template>
  <div class="test-view">
    <h1>GoQGo Web 测试页面</h1>
    <div class="test-content">
      <h2>图片聊天功能测试</h2>
      <ChatRoom namespace="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatRoom from '@/components/ChatRoom.vue'
</script>

<style scoped lang="scss">
.test-view {
  height: 100vh;
  padding: 20px;
  background: #f5f5f5;
}

.test-content {
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

h2 {
  color: #666;
  margin-bottom: 20px;
}
</style>
