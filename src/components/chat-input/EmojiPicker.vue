<template>
  <div class="emoji-picker">
    <div class="emoji-grid">
      <button
        v-for="emoji in commonEmojis"
        :key="emoji"
        class="emoji-button"
        @click="$emit('select', emoji)"
        :title="emoji"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  select: [emoji: string]
}>()

// 常用表情列表
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
  '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
  '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
  '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
  '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇',
  '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏',
  '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
  '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
  '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅'
]
</script>

<style scoped lang="scss">
.emoji-picker {
  width: 280px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--bg-hover);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

// Terminal主题样式
[data-theme='terminal'] .emoji-picker {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  
  .emoji-button {
    &:hover {
      background: var(--terminal-surface);
      box-shadow: 0 0 4px var(--pixel-green);
    }
  }
}

// 滚动条样式
.emoji-picker {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 3px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}
</style>
