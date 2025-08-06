# TODO-001: 创建统一布局系统

## 📋 任务概述

创建统一的页面布局系统，解决当前Layout.vue文件过大（1343行）的问题，并为所有页面提供一致的布局体验。

## 🎯 目标

- [x] 设计页面布局规范
- [x] 创建基础布局组件 (BaseLayout.vue)
- [x] 创建布局管理组合式函数 (useLayout.ts)
- [x] 创建应用头部组件 (AppHeader.vue)
- [ ] 创建侧边栏组件 (AppSidebar.vue)
- [ ] 创建底部组件 (AppFooter.vue)
- [ ] 实现响应式布局
- [ ] 重构现有Layout.vue
- [ ] 统一页面头部和导航

## 📁 文件结构

```
src/
├── layouts/                    # 新增布局目录
│   ├── BaseLayout.vue         # ✅ 基础布局组件
│   ├── MainLayout.vue         # 🔄 主要布局（待创建）
│   ├── AuthLayout.vue         # 🔄 认证布局（待创建）
│   └── components/            # 布局子组件
│       ├── AppHeader.vue      # ✅ 应用头部
│       ├── AppSidebar.vue     # 🔄 侧边栏（待创建）
│       └── AppFooter.vue      # 🔄 底部（待创建）
├── composables/               # 组合式函数
│   └── useLayout.ts          # ✅ 布局管理
└── components/icons/          # 图标组件（待创建）
```

## 🏗️ 已完成的组件

### 1. BaseLayout.vue
- **功能**: 提供基础布局结构
- **特性**: 
  - 支持头部、侧边栏、内容区、右侧面板、底部
  - 响应式设计
  - 主题适配（普通/Terminal）
  - 全局加载状态
  - 布局模式切换（默认/全屏/最小）

### 2. useLayout.ts
- **功能**: 布局状态管理
- **特性**:
  - 响应式断点检测
  - 侧边栏/右侧面板状态管理
  - 布局模式控制
  - 本地存储持久化
  - 事件总线和工具函数

### 3. AppHeader.vue
- **功能**: 统一的应用头部
- **特性**:
  - 菜单切换按钮
  - Logo和标题
  - 面包屑导航
  - 全局搜索
  - 连接状态指示
  - 通知中心
  - 主题切换
  - 用户菜单

## 🔄 待完成任务

### 1. 创建AppSidebar.vue
```vue
<template>
  <div class="app-sidebar">
    <!-- 导航菜单 -->
    <!-- 命名空间切换 -->
    <!-- 快捷操作 -->
  </div>
</template>
```

### 2. 创建AppFooter.vue
```vue
<template>
  <div class="app-footer">
    <!-- 版本信息 -->
    <!-- 状态信息 -->
    <!-- 快捷链接 -->
  </div>
</template>
```

### 3. 创建图标组件
需要创建以下图标组件：
- MenuIcon.vue
- SearchIcon.vue
- NotificationIcon.vue
- ThemeIcon.vue
- FullscreenIcon.vue
- ChevronDownIcon.vue

### 4. 创建MainLayout.vue
```vue
<template>
  <BaseLayout
    :show-header="true"
    :show-sidebar="true"
    :show-footer="false"
    mode="default"
  >
    <router-view />
  </BaseLayout>
</template>
```

### 5. 创建AuthLayout.vue
```vue
<template>
  <BaseLayout
    :show-header="false"
    :show-sidebar="false"
    :show-footer="false"
    mode="minimal"
  >
    <div class="auth-container">
      <router-view />
    </div>
  </BaseLayout>
</template>
```

## 📐 布局规范

### 1. 尺寸规范
- **头部高度**: 64px
- **侧边栏宽度**: 280px (展开) / 64px (收起)
- **右侧面板宽度**: 320px
- **底部高度**: 48px

### 2. 断点规范
- **sm**: < 640px
- **md**: 640px - 768px
- **lg**: 768px - 1024px
- **xl**: 1024px - 1280px
- **2xl**: > 1280px

### 3. 间距规范
- **内边距**: 8px, 12px, 16px, 24px
- **外边距**: 8px, 16px, 24px, 32px
- **组件间距**: 12px, 16px, 24px

### 4. 颜色规范
- **主色调**: 使用CSS变量 `var(--color-primary)`
- **背景色**: `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-tertiary)`
- **文字色**: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
- **边框色**: `var(--border-primary)`, `var(--border-secondary)`

## 🎨 主题支持

### 1. 普通主题
- 使用标准的CSS变量
- 支持亮色/暗色模式

### 2. Terminal主题
- 像素风格设计
- 特殊的颜色方案
- 等宽字体
- 霓虹灯效果

## 📱 响应式设计

### 1. 移动端 (< 768px)
- 侧边栏自动收起
- 头部简化显示
- 触摸友好的交互

### 2. 平板端 (768px - 1024px)
- 侧边栏可选择性显示
- 适中的组件尺寸

### 3. 桌面端 (> 1024px)
- 完整功能显示
- 多栏布局支持

## 🔧 使用方式

### 1. 在页面中使用
```vue
<template>
  <BaseLayout>
    <!-- 页面内容 -->
  </BaseLayout>
</template>

<script setup>
import BaseLayout from '@/layouts/BaseLayout.vue'
</script>
```

### 2. 使用布局管理
```vue
<script setup>
import { useLayout } from '@/composables/useLayout'

const { 
  toggleSidebar, 
  isMobile, 
  layoutConfig 
} = useLayout()
</script>
```

### 3. 自定义布局
```vue
<template>
  <BaseLayout
    :show-sidebar="false"
    :show-right-panel="true"
    mode="fullscreen"
  >
    <!-- 自定义内容 -->
  </BaseLayout>
</template>
```

## 🧪 测试计划

### 1. 单元测试
- [ ] BaseLayout组件测试
- [ ] useLayout组合式函数测试
- [ ] AppHeader组件测试

### 2. 集成测试
- [ ] 布局切换功能测试
- [ ] 响应式布局测试
- [ ] 主题切换测试

### 3. 视觉测试
- [ ] 不同屏幕尺寸测试
- [ ] 主题一致性测试
- [ ] 交互动画测试

## 📊 性能指标

### 1. 加载性能
- 首屏渲染时间 < 100ms
- 布局切换动画流畅 (60fps)

### 2. 内存使用
- 布局组件内存占用 < 5MB
- 无内存泄漏

### 3. 用户体验
- 响应式切换延迟 < 300ms
- 动画过渡自然流畅

## 🚀 下一步计划

1. **完成剩余组件**: AppSidebar, AppFooter, 图标组件
2. **重构现有Layout.vue**: 使用新的布局系统
3. **更新路由配置**: 应用新的布局组件
4. **页面迁移**: 逐步迁移现有页面到新布局
5. **测试和优化**: 确保功能完整性和性能

## 📝 注意事项

1. **向后兼容**: 确保现有页面不受影响
2. **渐进式迁移**: 逐步替换，避免大规模重构
3. **性能监控**: 关注布局切换的性能影响
4. **用户反馈**: 收集用户对新布局的反馈

## 🔗 相关文档

- [项目重构总体规划](./REFACTOR_PLAN.md)
- [组件设计规范](./docs/COMPONENT_DESIGN.md)
- [主题系统文档](./docs/THEME_SYSTEM.md)
