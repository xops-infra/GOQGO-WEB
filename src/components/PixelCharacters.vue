<template>
  <div class="pixel-characters-fullscreen" ref="containerRef">
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

// 8bit像素公仔精灵
const sprites = [
  '🤖', '👾', '🎮', '🕹️', '⚡', '💎', '🔥', '⭐',
  '🚀', '🛸', '👽', '🎯', '💫', '✨', '🌟', '🎲'
]

const characterTypes = ['robot', 'alien', 'gem', 'fire', 'star']

// 创建随机公仔
const createCharacter = (id: number): Character => {
  const containerWidth = window.innerWidth
  const containerHeight = window.innerHeight
  
  return {
    id,
    x: Math.random() * (containerWidth - 40),
    y: Math.random() * (containerHeight - 40),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    targetX: 0,
    targetY: 0,
    type: characterTypes[Math.floor(Math.random() * characterTypes.length)],
    sprite: sprites[Math.floor(Math.random() * sprites.length)],
    scale: 0.6 + Math.random() * 0.6, // 0.6-1.2倍缩放
    flipX: Math.random() > 0.5,
    isMoving: false,
    lastMoveTime: Date.now(),
    behavior: 'random'
  }
}

// 初始化公仔
const initCharacters = () => {
  characters.value = []
  // 根据屏幕大小调整公仔数量
  const screenArea = window.innerWidth * window.innerHeight
  const characterCount = Math.min(Math.max(Math.floor(screenArea / 50000), 8), 20) // 8-20个公仔
  
  for (let i = 0; i < characterCount; i++) {
    characters.value.push(createCharacter(i))
  }
}

// 更新公仔位置
const updateCharacters = () => {
  const containerWidth = window.innerWidth
  const containerHeight = window.innerHeight
  const now = Date.now()
  
  characters.value.forEach(char => {
    // 决定行为模式
    if (isMouseInside.value) {
      // 追逐鼠标
      char.behavior = 'chase'
      char.targetX = mouseX.value - 20
      char.targetY = mouseY.value - 20
    } else {
      // 随机移动
      if (now - char.lastMoveTime > 3000 + Math.random() * 4000) {
        char.behavior = 'random'
        char.targetX = Math.random() * (containerWidth - 40)
        char.targetY = Math.random() * (containerHeight - 40)
        char.lastMoveTime = now
      }
    }
    
    // 计算移动方向
    const dx = char.targetX - char.x
    const dy = char.targetY - char.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 8) {
      // 移动速度
      const speed = char.behavior === 'chase' ? 4 : 2
      char.vx = (dx / distance) * speed
      char.vy = (dy / distance) * speed
      char.isMoving = true
      
      // 根据移动方向翻转
      char.flipX = char.vx < 0
    } else {
      char.vx *= 0.9
      char.vy *= 0.9
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
    if (char.x > containerWidth - 40) {
      char.x = containerWidth - 40
      char.vx = -Math.abs(char.vx)
    }
    if (char.y < 0) {
      char.y = 0
      char.vy = Math.abs(char.vy)
    }
    if (char.y > containerHeight - 40) {
      char.y = containerHeight - 40
      char.vy = -Math.abs(char.vy)
    }
  })
}

// 鼠标事件处理
const handleMouseMove = (event: MouseEvent) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
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
  
  // 添加全局鼠标事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseenter', handleMouseEnter)
  document.addEventListener('mouseleave', handleMouseLeave)
  
  // 窗口大小变化时重新初始化
  window.addEventListener('resize', initCharacters)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseenter', handleMouseEnter)
  document.removeEventListener('mouseleave', handleMouseLeave)
  window.removeEventListener('resize', initCharacters)
})
</script>

<style scoped lang="scss">
.pixel-characters-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 0; // 在最底层
}

.pixel-character {
  position: absolute;
  width: 40px;
  height: 40px;
  transition: transform 0.1s ease-out;
  
  .character-sprite {
    font-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    filter: 
      drop-shadow(0 0 6px rgba(0, 255, 0, 0.6))
      drop-shadow(0 0 12px rgba(0, 255, 0, 0.3));
    
    &.walking {
      animation: pixelWalk 0.5s infinite;
    }
  }
  
  // 不同类型的公仔效果
  &.robot .character-sprite {
    filter: 
      drop-shadow(0 0 6px rgba(0, 255, 255, 0.6))
      drop-shadow(0 0 12px rgba(0, 255, 255, 0.3));
  }
  
  &.alien .character-sprite {
    filter: 
      drop-shadow(0 0 6px rgba(255, 0, 255, 0.6))
      drop-shadow(0 0 12px rgba(255, 0, 255, 0.3));
  }
  
  &.gem .character-sprite {
    filter: 
      drop-shadow(0 0 6px rgba(255, 255, 0, 0.6))
      drop-shadow(0 0 12px rgba(255, 255, 0, 0.3));
  }
  
  &.fire .character-sprite {
    filter: 
      drop-shadow(0 0 6px rgba(255, 100, 0, 0.6))
      drop-shadow(0 0 12px rgba(255, 100, 0, 0.3));
  }
  
  &.star .character-sprite {
    filter: 
      drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))
      drop-shadow(0 0 12px rgba(255, 255, 255, 0.3));
  }
}

// 8bit像素风格的走路动画
@keyframes pixelWalk {
  0%, 100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-3px) rotate(2deg);
  }
  50% {
    transform: translateY(0px);
  }
  75% {
    transform: translateY(-2px) rotate(-2deg);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .pixel-character {
    width: 32px;
    height: 32px;
    
    .character-sprite {
      font-size: 24px;
    }
  }
}

@media (max-width: 480px) {
  .pixel-character {
    width: 28px;
    height: 28px;
    
    .character-sprite {
      font-size: 20px;
    }
  }
}
</style>
