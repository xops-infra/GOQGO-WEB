// 全局错误处理器
import { nextTick } from 'vue'

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: Error[] = []
  private isProcessing = false

  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private setupGlobalErrorHandlers() {
    // Vue错误处理
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Global Error')
    })

    // Promise未捕获错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection')
      event.preventDefault() // 阻止默认的控制台错误输出
    })

    // Vue组件错误（需要在app.config.errorHandler中设置）
    this.setupVueErrorHandler()
  }

  private setupVueErrorHandler() {
    // 这个方法需要在main.ts中调用
    return (err: any, instance: any, info: string) => {
      this.handleError(err, `Vue Component Error: ${info}`)
    }
  }

  private async handleError(error: any, context: string) {
    console.group(`🚨 ${context}`)
    console.error('Error:', error)
    console.error('Stack:', error?.stack)
    console.error('Context:', context)
    console.groupEnd()

    // 添加到错误队列
    this.errorQueue.push(error)

    // 异步处理错误，避免阻塞UI
    if (!this.isProcessing) {
      this.isProcessing = true
      await nextTick()
      this.processErrorQueue()
      this.isProcessing = false
    }
  }

  private processErrorQueue() {
    // 处理错误队列
    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift()
      this.logError(error)
    }
  }

  private logError(error: any) {
    // 这里可以发送错误到日志服务
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // 在开发环境下详细输出
    if (import.meta.env.DEV) {
      console.warn('📝 Error logged:', errorInfo)
    }
  }

  // 手动报告错误
  public reportError(error: any, context?: string) {
    this.handleError(error, context || 'Manual Report')
  }

  // 安全执行异步操作
  public async safeAsync<T>(
    operation: () => Promise<T>,
    fallback?: T,
    context?: string
  ): Promise<T | undefined> {
    try {
      return await operation()
    } catch (error) {
      this.handleError(error, context || 'Safe Async Operation')
      return fallback
    }
  }

  // 安全执行同步操作
  public safeSync<T>(
    operation: () => T,
    fallback?: T,
    context?: string
  ): T | undefined {
    try {
      return operation()
    } catch (error) {
      this.handleError(error, context || 'Safe Sync Operation')
      return fallback
    }
  }

  // 获取Vue错误处理器
  public getVueErrorHandler() {
    return this.setupVueErrorHandler()
  }
}

// 导出单例
export const errorHandler = ErrorHandler.getInstance()

// 导出便捷方法
export const reportError = (error: any, context?: string) => 
  errorHandler.reportError(error, context)

export const safeAsync = <T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: string
) => errorHandler.safeAsync(operation, fallback, context)

export const safeSync = <T>(
  operation: () => T,
  fallback?: T,
  context?: string
) => errorHandler.safeSync(operation, fallback, context)
