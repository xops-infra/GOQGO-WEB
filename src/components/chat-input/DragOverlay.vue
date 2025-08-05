<template>
  <div class="drag-overlay">
    <div class="drag-content">
      <n-icon size="48" :color="'var(--color-success)'">
        <UploadIcon />
      </n-icon>
      <h3>释放文件以上传</h3>
      <p>支持图片、文档、视频等多种格式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import UploadIcon from '@/components/icons/UploadIcon.vue'
</script>

<style scoped lang="scss">
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(7, 193, 96, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: 2px dashed var(--color-success);
  border-radius: 8px;
  margin: 8px;
}

.drag-content {
  text-align: center;
  color: var(--color-success);
  
  h3 {
    margin: 12px 0 8px 0;
    font-weight: 500;
    font-size: 16px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }
}

// Terminal主题样式
[data-theme='terminal'] .drag-overlay {
  background: rgba(0, 255, 65, 0.1);
  border-color: var(--pixel-green);
  
  .drag-content {
    color: var(--pixel-green);
    
    h3, p {
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}
</style>
