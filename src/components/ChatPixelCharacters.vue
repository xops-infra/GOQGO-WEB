<template>
  <div class="chat-pixel-characters" ref="containerRef">
    <div
      v-for="character in characters"
      :key="character.id"
      class="pixel-character"
      :class="character.type"
      :style="{
        left: character.x + 'px',
        top: character.y + 'px',
        transform: `scale(${character.scale}) ${character.flipX ? 'scaleX(-1)' : ''}`
      }"
    >
      <div class="character-sprite" :class="{ walking: character.isMoving }">
        {{ character.sprite }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Character {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  type: string
  sprite: string
  scale: number
  flipX: boolean
  isMoving: boolean
  lastMoveTime: number
  behavior: 'random' | 'chase' | 'idle'
}

const containerRef = ref<HTMLElement>()
const characters = ref<Character[]>([])
const mouseX = ref(0)
const mouseY = ref(0)
const isMouseInside = ref(false)

// 精选的3个8bit像素公仔
const sprites = ['🤖', '👾', '💎']
const characterTypes = ['robot', 'alien', 'gem']

// 创建随机公仔
const createCharacter = (id: number): Character => {
  const containerWidth = containerRef.value?.clientWidth || 600
  const containerHeight = containerRef.value?.clientHeight || 400
  
  return {
    id,
    x: Math.random() * (containerWidth - 36),
    y: Math.random() * (containerHeight - 36),
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    targetX: 0,
    targetY: 0,
    type: characterTypes[id] || characterTypes[0],
    sprite: sprites[id] || sprites[0],
    scale: 0.7 + Math.random() * 0.4, // 0.7-1.1倍缩放
    flipX: Math.random() > 0.5,
    isMoving: false,
    lastMoveTime: Date.now(),
    behavior: 'random'
  }
}

// 初始化3个公仔
const initCharacters = () => {
  characters.value = []
  for (let i = 0; i < 3; i++) {
    characters.value.push(createCharacter(i))
  }
}

// 更新公仔位置
const updateCharacters = () => {
  if (!containerRef.value) return
  
  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight
  const now = Date.now()
  
  characters.value.forEach(char => {
    // 决定行为模式
    if (isMouseInside.value) {
      // 追逐鼠标
      char.behavior = 'chase'
      char.targetX = mouseX.value - 18
      char.targetY = mouseY.value - 18
    } else {
      // 随机移动
      if (now - char.lastMoveTime > 4000 + Math.random() * 3000) {
        char.behavior = 'random'
        char.targetX = Math.random() * (containerWidth - 36)
        char.targetY = Math.random() * (containerHeight - 36)
        char.lastMoveTime = now
      }
    }
    
    // 计算移动方向
    const dx = char.targetX - char.x
    const dy = char.targetY - char.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 10) {
      // 移动速度
      const speed = char.behavior === 'chase' ? 2.5 : 1.2
      char.vx = (dx / distance) * speed
      char.vy = (dy / distance) * speed
      char.isMoving = true
      
      // 根据移动方向翻转
      char.flipX = char.vx < 0
    } else {
      char.vx *= 0.85
      char.vy *= 0.85
      char.isMoving = Math.abs(char.vx) > 0.1 || Math.abs(char.vy) > 0.1
    }
    
    // 更新位置
    char.x += char.vx
    char.y += char.vy
    
    // 边界检测
    if (char.x < 0) {
      char.x = 0
      char.vx = Math.abs(char.vx)
    }
    if (char.x > containerWidth - 36) {
      char.x = containerWidth - 36
      char.vx = -Math.abs(char.vx)
    }
    if (char.y < 0) {
      char.y = 0
      char.vy = Math.abs(char.vy)
    }
    if (char.y > containerHeight - 36) {
      char.y = containerHeight - 36
      char.vy = -Math.abs(char.vy)
    }
  })
}

// 鼠标事件处理
const handleMouseMove = (event: MouseEvent) => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    mouseX.value = event.clientX - rect.left
    mouseY.value = event.clientY - rect.top
  }
}

const handleMouseEnter = () => {
  isMouseInside.value = true
}

const handleMouseLeave = () => {
  isMouseInside.value = false
}

// 动画循环
let animationId: number

const animate = () => {
  updateCharacters()
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  initCharacters()
  animate()
  
  // 添加鼠标事件监听
  if (containerRef.value) {
    containerRef.value.addEventListener('mousemove', handleMouseMove)
    containerRef.value.addEventListener('mouseenter', handleMouseEnter)
    containerRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
  
  // 窗口大小变化时重新初始化
  window.addEventListener('resize', initCharacters)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousemove', handleMouseMove)
    containerRef.value.removeEventListener('mouseenter', handleMouseEnter)
    containerRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
  
  window.removeEventListener('resize', initCharacters)
})
</script>

<style scoped lang="scss">
.chat-pixel-characters {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.pixel-character {
  position: absolute;
  width: 36px;
  height: 36px;
  transition: transform 0.15s ease-out;
  
  .character-sprite {
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    filter: 
      drop-shadow(0 0 4px rgba(0, 255, 0, 0.4))
      drop-shadow(0 0 8px rgba(0, 255, 0, 0.2));
    opacity: 0.6; // 半透明，不干扰聊天内容
    
    &.walking {
      animation: pixelWalk 0.6s infinite;
    }
  }
  
  // 不同类型的公仔效果
  &.robot .character-sprite {
    filter: 
      drop-shadow(0 0 4px rgba(0, 255, 255, 0.4))
      drop-shadow(0 0 8px rgba(0, 255, 255, 0.2));
  }
  
  &.alien .character-sprite {
    filter: 
      drop-shadow(0 0 4px rgba(255, 0, 255, 0.4))
      drop-shadow(0 0 8px rgba(255, 0, 255, 0.2));
  }
  
  &.gem .character-sprite {
    filter: 
      drop-shadow(0 0 4px rgba(255, 255, 0, 0.4))
      drop-shadow(0 0 8px rgba(255, 255, 0, 0.2));
  }
}

// 8bit像素风格的走路动画
@keyframes pixelWalk {
  0%, 100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-2px) rotate(1deg);
  }
  50% {
    transform: translateY(0px);
  }
  75% {
    transform: translateY(-1px) rotate(-1deg);
  }
}

// 鼠标悬停时增强效果
.chat-pixel-characters:hover .pixel-character {
  .character-sprite {
    opacity: 0.8;
    animation-duration: 0.3s;
    filter: 
      drop-shadow(0 0 6px rgba(0, 255, 0, 0.6))
      drop-shadow(0 0 12px rgba(0, 255, 0, 0.3));
  }
}

// 响应式调整
@media (max-width: 768px) {
  .pixel-character {
    width: 30px;
    height: 30px;
    
    .character-sprite {
      font-size: 22px;
    }
  }
}
</style>
