<template>
  <div class="logs-control-buttons">
    <!-- 实时跟踪切换 -->
    <div class="control-group">
      <n-button
        :type="isRealTimeEnabled ? 'primary' : 'default'"
        :ghost="!isRealTimeEnabled"
        size="small"
        round
        @click="$emit('toggle-realtime')"
        :disabled="!isConnected"
        class="control-button realtime-button"
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,2A2,2 0 0,1 14,4V8A2,2 0 0,1 12,10A2,2 0 0,1 10,8V4A2,2 0 0,1 12,2M21,11H20A8,8 0 0,1 12,19A8,8 0 0,1 4,11H3A1,1 0 0,1 2,10A1,1 0 0,1 3,9H4A8,8 0 0,1 12,1A8,8 0 0,1 20,9H21A1,1 0 0,1 22,10A1,1 0 0,1 21,11Z"
              />
            </svg>
          </n-icon>
        </template>
        {{ isRealTimeEnabled ? '实时跟踪' : '已暂停' }}
      </n-button>
    </div>

    <!-- 操作按钮组 -->
    <div class="control-group">
      <!-- 加载历史 -->
      <n-button
        size="small"
        quaternary
        round
        @click="$emit('load-history')"
        :loading="isLoadingHistory"
        :disabled="!isConnected || hasReachedTop"
        class="control-button"
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"
              />
            </svg>
          </n-icon>
        </template>
        {{ hasReachedTop ? '已全部加载' : '加载历史' }}
      </n-button>

      <!-- 刷新 -->
      <n-button
        size="small"
        quaternary
        round
        @click="$emit('refresh')"
        :loading="isRefreshing"
        :disabled="!isConnected"
        class="control-button"
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"
              />
            </svg>
          </n-icon>
        </template>
        刷新
      </n-button>

      <!-- 清空 -->
      <n-button
        size="small"
        quaternary
        round
        @click="$emit('clear')"
        class="control-button"
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
              />
            </svg>
          </n-icon>
        </template>
        清空
      </n-button>

      <!-- 复制 -->
      <n-button
        size="small"
        quaternary
        round
        @click="$emit('copy')"
        :disabled="logCount === 0"
        class="control-button"
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
              />
            </svg>
          </n-icon>
        </template>
        复制
      </n-button>
    </div>

    <!-- 关闭按钮 -->
    <div class="control-group">
      <n-button
        size="small"
        quaternary
        circle
        @click="$emit('close')"
        class="control-button close-button"
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isRealTimeEnabled: boolean
  isConnected: boolean
  isLoadingHistory: boolean
  isRefreshing: boolean
  hasReachedTop: boolean
  logCount: number
}

defineProps<Props>()

defineEmits<{
  'toggle-realtime': []
  'load-history': []
  'refresh': []
  'clear': []
  'copy': []
  'close': []
}>()
</script>

<style scoped lang="scss">
.logs-control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 4px;

  .control-group {
    display: flex;
    align-items: center;
    gap: 8px;

    &:not(:last-child) {
      border-right: 1px solid #e0e0e0;
      padding-right: 16px;
    }
  }

  .control-button {
    transition: all 0.2s ease;
    font-size: 12px;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &.realtime-button {
      min-width: 90px;
      font-weight: 500;
      
      &.n-button--primary {
        background: linear-gradient(135deg, #07c160, #06ad56);
        border: none;
        
        &:hover {
          background: linear-gradient(135deg, #06ad56, #059c4f);
        }
      }
    }

    &.close-button {
      color: #ff4757;
      
      &:hover {
        background: rgba(255, 71, 87, 0.1);
        color: #ff3742;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .logs-control-buttons {
    flex-wrap: wrap;
    gap: 8px;

    .control-group {
      gap: 4px;
      
      &:not(:last-child) {
        border-right: none;
        padding-right: 0;
      }
    }

    .control-button {
      font-size: 11px;
      
      &.realtime-button {
        min-width: 80px;
      }
    }
  }
}
</style>
