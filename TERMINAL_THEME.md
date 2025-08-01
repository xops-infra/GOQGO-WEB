# GoQGo Terminal风格主题

## 概述

GoQGo现在支持三种主题模式：
- **Light Mode** - 浅色主题
- **Dark Mode** - 深色主题  
- **Terminal Mode** - 8-bit终端风格主题 ⚡

## Terminal主题特性

### 🎨 视觉特效
- **8-bit像素风格**：使用JetBrains Mono等宽字体
- **霓虹发光效果**：按钮和文字具有霓虹光晕
- **扫描线效果**：模拟CRT显示器的扫描线
- **矩阵雨背景**：可选的Matrix风格背景动画
- **像素化边框**：8-bit游戏风格的边框效果

### 🎯 配色方案
```scss
--pixel-green: #00ff41    // 主色调 - 矩阵绿
--pixel-blue: #0066ff     // 蓝色
--pixel-red: #ff0066      // 红色  
--pixel-yellow: #ffff00   // 黄色
--pixel-purple: #cc00ff   // 紫色
--pixel-cyan: #00ffff     // 青色
--pixel-orange: #ff6600   // 橙色
```

### 🔧 组件样式

#### 按钮 (.btn-8bit)
- 大写字母显示
- 霓虹边框效果
- 悬停时发光和位移动画
- 支持多种颜色变体

#### 卡片 (.card-8bit)
- 像素化阴影效果
- 悬停时3D位移
- 霓虹边框动画

#### 表格 (.terminal-table)
- 等宽字体显示
- 终端风格的列标题
- 状态指示器发光效果

#### 输入框 (.terminal-input)
- 终端背景色
- 聚焦时霓虹边框
- 等宽字体输入

### 📱 组件列表

#### 核心组件
- `TerminalHeader.vue` - 终端风格页头
- `TerminalStatsCard.vue` - 统计卡片
- `TerminalIcons.vue` - SVG图标集
- `ThemeToggle.vue` - 主题切换器

#### 工具类
- `theme.ts` - 主题管理器
- `terminal-theme.scss` - 终端样式定义

### 🚀 使用方法

#### 1. 主题切换
```typescript
import { useTheme } from '@/utils/theme'

const { currentTheme, isTerminal, setTheme } = useTheme()

// 切换到终端主题
setTheme('terminal')

// 检查是否为终端主题
if (isTerminal.value) {
  // 终端主题特定逻辑
}
```

#### 2. 组件使用
```vue
<template>
  <!-- 统计卡片 -->
  <TerminalStatsCard
    title="系统状态"
    value="ONLINE"
    type="success"
    icon="server"
    :progress="95"
    subtitle="SYSTEM_STATUS"
    trend="+5%"
    trend-direction="up"
  />
  
  <!-- 8-bit按钮 -->
  <n-button :class="{ 'btn-8bit': isTerminal }">
    {{ isTerminal ? 'EXECUTE' : '执行' }}
  </n-button>
  
  <!-- 终端图标 -->
  <TerminalIcons 
    name="terminal" 
    :size="32" 
    :glow="isTerminal"
    :animated="isTerminal"
  />
</template>
```

#### 3. 样式应用
```scss
.my-component {
  // 普通样式
  background: var(--bg-primary);
  
  // 终端主题特定样式
  [data-theme='terminal'] & {
    background: var(--terminal-bg);
    font-family: var(--font-mono);
    border: 1px solid var(--pixel-green);
    
    &:hover {
      box-shadow: var(--neon-glow-green);
    }
  }
}
```

### 🎮 动画效果

#### 扫描线动画
```scss
@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
```

#### 霓虹发光动画
```scss
@keyframes pulse-glow {
  from { text-shadow: 0 0 5px currentColor; }
  to { text-shadow: 0 0 20px currentColor; }
}
```

#### 打字机效果
```scss
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
```

### 📄 页面示例

#### AgentsView.vue
- 终端风格的智能体管理界面
- 实时状态监控卡片
- 8-bit风格的数据表格
- 霓虹效果的操作按钮

#### TerminalDemo.vue
- 主题切换演示
- 图标展示画廊
- 按钮样式展示
- 终端窗口模拟

### 🔧 自定义配置

#### 字体配置
```scss
:root {
  --font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
  --font-display: 'Orbitron', 'JetBrains Mono', monospace;
  --font-pixel: 'PixelFont', 'JetBrains Mono', monospace;
}
```

#### 特效开关
```typescript
// 禁用扫描线效果
body[data-theme='terminal']::before {
  display: none;
}

// 禁用CRT效果
body[data-theme='terminal']::after {
  display: none;
}
```

### 📱 响应式支持

Terminal主题完全支持响应式设计：
- 移动端优化的按钮尺寸
- 自适应的卡片布局
- 触摸友好的交互元素

### 🎯 最佳实践

1. **性能优化**：大量动画效果时考虑使用`will-change`属性
2. **可访问性**：保持足够的对比度，支持键盘导航
3. **一致性**：统一使用终端风格的文本转换（大写）
4. **渐进增强**：确保在不支持CSS特效的环境下仍可正常使用

### 🚀 访问方式

- 智能体管理：`/agents`
- 终端演示：`/terminal-demo`
- 主题切换：点击右上角主题按钮

---

**享受8-bit终端风格的未来感体验！** ⚡🎮
