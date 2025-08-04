import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true, // 允许 HTML 标签
  linkify: true, // 自动识别链接
  typographer: true, // 启用一些语言中性的替换 + 引号美化
  breaks: true, // 将换行符转换为 <br>
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 自定义渲染规则
md.renderer.rules.link_open = function (tokens, idx, options, env, renderer) {
  const token = tokens[idx]
  const hrefIndex = token.attrIndex('href')
  
  if (hrefIndex >= 0) {
    const href = token.attrs![hrefIndex][1]
    // 外部链接添加 target="_blank"
    if (href.startsWith('http')) {
      token.attrPush(['target', '_blank'])
      token.attrPush(['rel', 'noopener noreferrer'])
    }
  }
  
  return renderer.renderToken(tokens, idx, options)
}

// 渲染 Markdown 文本
export const renderMarkdown = (content: string): string => {
  return md.render(content)
}

// 渲染内联 Markdown
export const renderInlineMarkdown = (content: string): string => {
  return md.renderInline(content)
}

export default md
