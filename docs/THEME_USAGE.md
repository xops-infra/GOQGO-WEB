# 主题系统使用指南

## 概述

GoQGo Web 项目已集成完整的主题系统，支持浅色、深色和自动跟随系统主题三种模式。

## 主要特性

- ✅ 统一的 CSS 变量系统
- ✅ 支持浅色/深色/自动主题切换
- ✅ Naive UI 组件主题同步
- ✅ 平滑的主题切换动画
- ✅ 本地存储主题偏好
- ✅ 系统主题自动检测

## 文件结构

```
src/
├── styles/
│   ├── index.scss          # 样式入口文件
│   └── theme.scss          # 主题变量和全局样式
├── utils/
│   └── theme.ts            # 主题管理工具
├── components/
│   └── ThemeToggle.vue     # 主题切换组件
└── stores/
    └── app.ts              # 应用状态管理
```

## 使用方法

### 1. 在组件中使用 CSS 变量

```vue
<template>
  <div class="my-component">
    <h1 class="title">标题</h1>
    <p class="content">内容</p>
  </div>
</template>

<style scoped lang="scss">
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  
  .title {
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .content {
    color: var(--text-secondary);
    line-height: 1.5;
  }
  
  &:hover {
    background-color: var(--bg-hover);
    box-shadow: var(--shadow-md);
  }
}
</style>
```

### 2. 使用通用类名

```vue
<template>
  <div class="bg-primary text-primary border-primary shadow-md theme-transition">
    <h1 class="text-primary">主标题</h1>
    <p class="text-secondary">副标题</p>
    <button class="bg-hover text-primary">按钮</button>
  </div>
</template>
```

### 3. 在 JavaScript 中使用主题工具

```vue
<script setup lang="ts">
import { useTheme } from '@/utils/theme'

const { theme, isDark, isLight, toggle, setTheme, getCurrentTheme } = useTheme()

// 检查当前主题
console.log('当前主题:', theme.value)
console.log('是否深色模式:', isDark())
console.log('是否浅色模式:', isLight())

// 切换主题
const handleToggle = () => {
  toggle()
}

// 设置特定主题
const setLightTheme = () => {
  setTheme('light')
}

const setDarkTheme = () => {
  setTheme('dark')
}

const setAutoTheme = () => {
  setTheme('auto')
}
</script>
```

### 4. 添加主题切换按钮

```vue
<template>
  <div class="header">
    <h1>我的应用</h1>
    <ThemeToggle />
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
```

## CSS 变量参考

### 背景色变量
- `--bg-primary`: 主背景色
- `--bg-secondary`: 次要背景色
- `--bg-tertiary`: 第三级背景色
- `--bg-hover`: 悬停背景色
- `--bg-active`: 激活背景色
- `--bg-modal`: 模态框背景色
- `--bg-overlay`: 遮罩背景色

### 文本色变量
- `--text-primary`: 主文本色
- `--text-secondary`: 次要文本色
- `--text-tertiary`: 第三级文本色
- `--text-disabled`: 禁用文本色
- `--text-inverse`: 反色文本色

### 边框色变量
- `--border-primary`: 主边框色
- `--border-secondary`: 次要边框色
- `--border-focus`: 焦点边框色

### 阴影变量
- `--shadow-sm`: 小阴影
- `--shadow-md`: 中等阴影
- `--shadow-lg`: 大阴影

### 品牌色变量
- `--color-primary`: 主品牌色
- `--color-primary-hover`: 主品牌色悬停
- `--color-primary-active`: 主品牌色激活
- `--color-success`: 成功色
- `--color-warning`: 警告色
- `--color-error`: 错误色
- `--color-info`: 信息色

## 通用类名

### 背景类
- `.bg-primary`, `.bg-secondary`, `.bg-tertiary`
- `.bg-hover`, `.bg-active`

### 文本类
- `.text-primary`, `.text-secondary`, `.text-tertiary`
- `.text-disabled`, `.text-inverse`

### 边框类
- `.border-primary`, `.border-secondary`, `.border-focus`

### 阴影类
- `.shadow-sm`, `.shadow-md`, `.shadow-lg`

### 动画类
- `.theme-transition`: 主题切换过渡动画

## 最佳实践

1. **优先使用 CSS 变量**: 而不是硬编码颜色值
2. **添加过渡动画**: 使用 `.theme-transition` 类或自定义过渡
3. **语义化命名**: 使用语义化的变量名而不是具体颜色名
4. **测试两种主题**: 确保在浅色和深色主题下都能正常显示
5. **响应式设计**: 考虑不同屏幕尺寸下的主题效果

## 扩展主题

如需添加新的主题变量，请在 `src/styles/theme.scss` 中添加：

```scss
:root {
  // 新的浅色主题变量
  --my-custom-color: #your-light-color;
}

[data-theme='dark'] {
  // 新的深色主题变量
  --my-custom-color: #your-dark-color;
}
```

然后在组件中使用：

```scss
.my-element {
  color: var(--my-custom-color);
}
```
