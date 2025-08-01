<template>
  <div class="image-message">
    <div class="image-container" @click="handleImageClick">
      <img
        :src="imageUrl"
        :alt="altText"
        class="message-image"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      <div v-if="loading" class="image-loading">
        <n-spin size="small" />
      </div>
      <div v-if="error" class="image-error">
        <n-icon size="24" color="#ff4757">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21,5V6.59L12.41,15.18L10.59,13.36L5,18.95V20H6.05L11.64,14.41L13.46,16.23L22,7.69V5H21M21,3H3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5A2,2 0 0,0 21,3Z"
            />
          </svg>
        </n-icon>
        <span>图片加载失败</span>
      </div>
    </div>
    <div v-if="showPath" class="image-path">
      {{ imagePath }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NSpin, NIcon, useMessage } from 'naive-ui'
import { getImagePreviewUrl, checkImageExists } from '@/utils/imageUtils'

interface Props {
  imagePath: string
  altText?: string
  showPath?: boolean
  maxWidth?: number
  maxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  altText: '图片',
  showPath: false,
  maxWidth: 300,
  maxHeight: 200
})

const message = useMessage()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const imageUrl = ref('')

// 计算属性
const containerStyle = computed(() => ({
  maxWidth: `${props.maxWidth}px`,
  maxHeight: `${props.maxHeight}px`
}))

// 处理图片加载
const handleImageLoad = () => {
  loading.value = false
  error.value = false
}

// 处理图片加载错误
const handleImageError = () => {
  loading.value = false
  error.value = true
}

// 处理图片点击（放大查看）
const handleImageClick = () => {
  if (error.value) return

  // 创建全屏预览
  const overlay = document.createElement('div')
  overlay.className = 'image-preview-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
  `

  const img = document.createElement('img')
  img.src = imageUrl.value
  img.style.cssText = `
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `

  overlay.appendChild(img)
  document.body.appendChild(overlay)

  // 点击关闭
  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay)
  })

  // ESC键关闭
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }
  document.addEventListener('keydown', handleKeyDown)
}

// 初始化
onMounted(async () => {
  console.log('=== ImageMessage组件挂载 ===')
  console.log('图片路径:', props.imagePath)
  console.log('替代文本:', props.altText)
  console.log('显示路径:', props.showPath)

  try {
    // 对于本地路径，创建一个占位图片
    if (props.imagePath.startsWith('/Users/')) {
      console.log('🖼️ 检测到本地路径，创建占位图片')

      // 创建一个简单的占位图片
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 150
      const ctx = canvas.getContext('2d')!

      // 绘制占位图片
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, 200, 150)

      ctx.fillStyle = '#666'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('图片预览', 100, 70)
      ctx.fillText(props.imagePath.split('/').pop() || '图片', 100, 90)

      imageUrl.value = canvas.toDataURL()
      console.log('✅ 占位图片创建完成')
      console.log('占位图片URL长度:', imageUrl.value.length)

      loading.value = false
      return
    }

    console.log('🔍 检查图片是否存在...')
    // 检查图片是否存在
    const exists = await checkImageExists(props.imagePath)
    console.log('图片存在检查结果:', exists)

    if (!exists) {
      console.log('❌ 图片不存在')
      error.value = true
      loading.value = false
      return
    }

    console.log('🔗 获取图片预览URL...')
    // 获取图片预览URL
    imageUrl.value = getImagePreviewUrl(props.imagePath)
    console.log('✅ 图片预览URL:', imageUrl.value)
  } catch (err) {
    console.error('❌ 加载图片失败:', err)
    console.error('错误堆栈:', err.stack)
    error.value = true
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.image-message {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}

.image-container {
  position: relative;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-card, #ffffff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  // 暗色主题适配
  @media (prefers-color-scheme: dark) {
    background: var(--bg-card, #2c2c2c);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
  }
}

.message-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  transition: opacity 0.3s ease;
  
  // 确保图片不会过大
  max-height: 300px;
  object-fit: cover;
  
  // 加载时的占位效果
  &[src=""] {
    opacity: 0;
  }
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 50%;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  // 暗色主题适配
  @media (prefers-color-scheme: dark) {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: var(--bg-error, #fafafa);
  border: 2px dashed var(--border-error, #e0e0e0);
  border-radius: 12px;
  color: var(--text-error, #666);
  font-size: 13px;
  min-width: 160px;
  min-height: 100px;
  transition: all 0.3s ease;
  
  // 暗色主题适配
  @media (prefers-color-scheme: dark) {
    background: var(--bg-error, #2a2a2a);
    border-color: var(--border-error, #404040);
    color: var(--text-error, #999);
  }
  
  // 错误图标样式
  .n-icon {
    opacity: 0.6;
  }
  
  span {
    font-weight: 500;
    text-align: center;
  }
}

.image-path {
  font-size: 11px;
  color: var(--text-tertiary, #999);
  font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;
  background: var(--bg-code, rgba(0, 0, 0, 0.05));
  padding: 4px 8px;
  border-radius: 6px;
  word-break: break-all;
  line-height: 1.4;
  border: 1px solid var(--border-light, rgba(0, 0, 0, 0.06));
  
  // 暗色主题适配
  @media (prefers-color-scheme: dark) {
    background: var(--bg-code, rgba(255, 255, 255, 0.08));
    border-color: var(--border-light, rgba(255, 255, 255, 0.1));
    color: var(--text-tertiary, #aaa);
  }
}

// 全局样式（用于预览覆盖层）
:global(.image-preview-overlay) {
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(8px);
  
  img {
    animation: scaleIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .image-container {
    border-radius: 8px;
    
    &:hover {
      transform: none;
    }
  }
  
  .message-image {
    border-radius: 8px;
    max-height: 250px;
  }
  
  .image-error {
    padding: 20px;
    min-width: 140px;
    min-height: 80px;
  }
}
</style>
