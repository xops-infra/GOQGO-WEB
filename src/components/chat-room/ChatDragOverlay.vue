<template>
  <div class="chat-drag-overlay">
    <div class="drag-content">
      <n-icon size="48" :color="iconColor">
        <ImageUploadIcon />
      </n-icon>
      <h3>释放文件以上传图片</h3>
      <p>支持 PNG, JPG, GIF 等图片格式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import ImageUploadIcon from '@/components/icons/ImageUploadIcon.vue'

const { isTerminal } = useTheme()

const iconColor = computed(() => {
  return isTerminal.value ? 'var(--pixel-green)' : 'var(--color-success)'
})
</script>

<style scoped lang="scss">
.chat-drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-success-rgb), 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 8px;
  margin: 8px;
  border: 2px dashed var(--color-success);
}

.drag-content {
  text-align: center;
  color: var(--color-success);
  
  h3 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }
}

// Terminal主题样式
[data-theme='terminal'] .chat-drag-overlay {
  background: rgba(0, 255, 65, 0.1);
  border-color: var(--pixel-green);
  
  .drag-content {
    color: var(--pixel-green);
    
    h3, p {
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    h3 {
      text-shadow: 0 0 8px var(--pixel-green);
    }
  }
}
</style>
