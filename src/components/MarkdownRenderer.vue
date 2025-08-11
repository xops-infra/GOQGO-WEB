<template>
  <div 
    class="markdown-content"
    v-html="renderedContent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface Props {
  content: string
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inline: false
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  return renderMarkdown(props.content)
})
</script>

<style scoped lang="scss">
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word; /* 现代浏览器的换行属性 */
  max-width: 100%; /* 确保内容不会超出容器宽度 */

  // 标题样式
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 16px 0 8px 0;
    font-weight: 600;
    line-height: 1.25;
  }

  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.1em; }

  // 段落样式
  :deep(p) {
    margin: 8px 0;
  }

  // 列表样式
  :deep(ul), :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }

  :deep(li) {
    margin: 4px 0;
  }

  // 引用样式
  :deep(blockquote) {
    margin: 8px 0;
    padding: 8px 16px;
    border-left: 4px solid #e1e4e8;
    background-color: #f6f8fa;
    color: #6a737d;
  }

  // 代码样式
  :deep(code) {
    padding: 2px 4px;
    background-color: rgba(175, 184, 193, 0.2);
    border-radius: 3px;
    font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
    font-size: 0.9em;
  }

  :deep(pre) {
    margin: 8px 0;
    padding: 12px;
    background-color: #f6f8fa;
    border-radius: 6px;
    overflow-x: auto;
    max-width: 100%; /* 确保代码块不会超出容器宽度 */
    
    code {
      padding: 0;
      background-color: transparent;
      border-radius: 0;
    }
  }

  // 代码高亮样式
  :deep(.hljs) {
    background-color: #f6f8fa !important;
    color: #24292e;
  }

  // 链接样式
  :deep(a) {
    color: #0366d6;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  // 表格样式
  :deep(table) {
    border-collapse: collapse;
    margin: 8px 0;
    width: 100%;
    max-width: 100%; /* 确保表格不会超出容器宽度 */
    table-layout: fixed; /* 固定表格布局，防止内容撑开 */
  }

  :deep(th), :deep(td) {
    border: 1px solid #e1e4e8;
    padding: 6px 13px;
    word-wrap: break-word; /* 确保单元格内容换行 */
    overflow-wrap: break-word; /* 现代浏览器的换行属性 */
    max-width: 0; /* 允许单元格收缩 */
  }

  :deep(th) {
    background-color: #f6f8fa;
    font-weight: 600;
  }

  // 分割线样式
  :deep(hr) {
    height: 1px;
    margin: 16px 0;
    background-color: #e1e4e8;
    border: none;
  }

  // 强调样式
  :deep(strong) {
    font-weight: 600;
  }

  :deep(em) {
    font-style: italic;
  }

  // 删除线样式
  :deep(del) {
    text-decoration: line-through;
  }
}

// 暗色主题适配
.dark .markdown-content {
  :deep(blockquote) {
    border-left-color: #30363d;
    background-color: #161b22;
    color: #8b949e;
  }

  :deep(code) {
    background-color: rgba(110, 118, 129, 0.4);
  }

  :deep(pre) {
    background-color: #161b22;
  }

  :deep(.hljs) {
    background-color: #161b22 !important;
    color: #e6edf3;
  }

  :deep(a) {
    color: #58a6ff;
  }

  :deep(th), :deep(td) {
    border-color: #30363d;
  }

  :deep(th) {
    background-color: #21262d;
  }

  :deep(hr) {
    background-color: #30363d;
  }
}

// 终端模式适配
.terminal-mode .markdown-content {
  // 引用样式
  :deep(blockquote) {
    border-left-color: var(--terminal-neon-green, #00ff41);
    background-color: rgba(0, 255, 65, 0.05);
    color: var(--terminal-text-primary, #ffffff);
  }

  // 行内代码样式
  :deep(code) {
    background-color: rgba(0, 255, 65, 0.1);
    color: var(--terminal-text-primary, #ffffff);
    border: 1px solid rgba(0, 255, 65, 0.2);
  }

  // 代码块样式
  :deep(pre) {
    background-color: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: var(--terminal-text-primary, #ffffff);
  }

  // 代码高亮样式
  :deep(.hljs) {
    background-color: rgba(0, 0, 0, 0.8) !important;
    color: var(--terminal-text-primary, #ffffff) !important;
  }

  // 链接样式
  :deep(a) {
    color: var(--terminal-neon-cyan, #00ffff);
    
    &:hover {
      color: var(--terminal-neon-green, #00ff41);
      text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
    }
  }

  // 表格样式
  :deep(th), :deep(td) {
    border-color: rgba(0, 255, 65, 0.3);
    color: var(--terminal-text-primary, #ffffff);
  }

  :deep(th) {
    background-color: rgba(0, 255, 65, 0.1);
  }

  // 分割线样式
  :deep(hr) {
    background-color: rgba(0, 255, 65, 0.3);
  }

  // 标题样式
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    color: var(--terminal-text-primary, #ffffff);
  }

  // 段落和列表样式
  :deep(p), :deep(li) {
    color: var(--terminal-text-primary, #ffffff);
  }

  // 强调样式
  :deep(strong) {
    color: var(--terminal-text-primary, #ffffff);
  }

  :deep(em) {
    color: var(--terminal-text-primary, #ffffff);
  }

  // 删除线样式
  :deep(del) {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
