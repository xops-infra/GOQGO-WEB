import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const baseURL = 'http://localhost:8000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // API 接口代理
      '/api': {
        target: baseURL,
        changeOrigin: true
      },
      // WebSocket 代理
      '/ws': {
        target: baseURL,
        changeOrigin: true,
        ws: true
      },
      // 健康检查代理
      '/health': {
        target: baseURL,
        changeOrigin: true
      }
    }
  }
})
