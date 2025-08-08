<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    :fill="color"
    class="logs-icon"
  >
    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor'
})
</script>

<style scoped>
.logs-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
