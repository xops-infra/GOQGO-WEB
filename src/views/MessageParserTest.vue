<template>
  <div class="message-parser-test">
    <n-card title="消息解析测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 输入区域 -->
        <div>
          <n-text strong>测试消息内容：</n-text>
          <n-input
            v-model:value="testMessage"
            type="textarea"
            placeholder="输入包含文件链接的消息内容..."
            :rows="4"
            style="margin-top: 8px;"
          />
        </div>

        <!-- 预设测试消息 -->
        <div>
          <n-text strong>预设测试消息：</n-text>
          <n-space style="margin-top: 8px;">
            <n-button 
              v-for="preset in presetMessages" 
              :key="preset.label"
              size="small"
              @click="testMessage = preset.content"
            >
              {{ preset.label }}
            </n-button>
          </n-space>
        </div>

        <!-- 解析结果 -->
        <div>
          <n-text strong>解析结果：</n-text>
          <n-card style="margin-top: 8px;" size="small">
            <pre>{{ JSON.stringify(parsedResult, null, 2) }}</pre>
          </n-card>
        </div>

        <!-- 渲染效果 -->
        <div>
          <n-text strong>渲染效果：</n-text>
          <n-card style="margin-top: 8px;" size="small">
            <div class="rendered-content" v-html="renderedContent"></div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseMessage, formatMessageContent } from '@/utils/messageParser'

const testMessage = ref('你好啊 http://localhost:8080/api/v1/users/xops/files/image_20250731_223222.png')

const presetMessages = [
  {
    label: '图片消息',
    content: '你好啊 http://localhost:8080/api/v1/users/xops/files/image_20250731_223222.png'
  },
  {
    label: '视频消息',
    content: '看看这个视频 http://localhost:8080/api/v1/users/xops/files/video_demo.mp4'
  },
  {
    label: '文档消息',
    content: '这是一个PDF文档 http://localhost:8080/api/v1/users/xops/files/document.pdf'
  },
  {
    label: '混合消息',
    content: '你好 @张三，这里有个图片 http://localhost:8080/api/v1/users/xops/files/screenshot.png 和一个文档 http://localhost:8080/api/v1/users/xops/files/report.pdf'
  },
  {
    label: '音频消息',
    content: '听听这个音频 http://localhost:8080/api/v1/users/xops/files/audio.mp3'
  }
]

const parsedResult = computed(() => {
  return parseMessage(testMessage.value)
})

const renderedContent = computed(() => {
  return formatMessageContent(testMessage.value)
})
</script>

<style scoped lang="scss">
.message-parser-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.rendered-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
  white-space: pre-wrap;

  // @mention 样式
  :deep(.mention) {
    color: var(--color-primary);
    background-color: rgba(59, 130, 246, 0.1);
    padding: 2px 4px;
    margin-right: 4px;
    border-radius: 4px;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
  }

  // 文件链接样式
  :deep(.file-link) {
    display: inline-block;
    margin: 8px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    max-width: 400px;
    width: 100%;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }

    .file-link-content {
      display: flex;
      align-items: center;
      padding: 16px;
      text-decoration: none;
      color: inherit;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      gap: 16px;
      min-width: 0;
      transition: all 0.3s ease;

      .file-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .file-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;

        .file-type {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .file-name {
          font-size: 12px;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    &.video-link .file-link-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;

      .file-info .file-type,
      .file-info .file-name {
        color: rgba(255, 255, 255, 0.95);
      }
    }

    &.audio-link .file-link-content {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;

      .file-info .file-type,
      .file-info .file-name {
        color: rgba(255, 255, 255, 0.95);
      }
    }

    &.generic-file .file-link-content {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border: none;

      .file-info .file-type,
      .file-info .file-name {
        color: rgba(255, 255, 255, 0.95);
      }
    }
  }

  // 内联图片样式
  :deep(.inline-image-container) {
    position: relative;
    display: inline-block;
    margin: 8px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

      .image-overlay {
        opacity: 1;
      }
    }

    .inline-image {
      max-width: 300px;
      max-height: 200px;
      width: auto;
      height: auto;
      display: block;
      border-radius: 12px;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      .image-label {
        background-color: var(--bg-modal);
        color: var(--text-primary);
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        backdrop-filter: blur(4px);
      }
    }
  }
}
</style>
