import { h } from 'vue'
import { NIcon } from 'naive-ui'

// 添加图标组件
export const AddIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z'
  })
])

// 日志图标组件
export const LogsIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
  })
])

// 恢复图标组件
export const RestoreIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11.41L8.29,8.71L7,10L12,15L17,10L15.71,8.71L13,11.41V7Z'
  })
])
