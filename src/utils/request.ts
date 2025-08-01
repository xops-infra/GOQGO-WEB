import axios from './axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { authManager } from './auth'

/**
 * 统一的API请求工具
 * 确保所有请求都经过认证处理
 */
export class ApiRequest {
  private static instance: ApiRequest

  private constructor() {}

  static getInstance(): ApiRequest {
    if (!ApiRequest.instance) {
      ApiRequest.instance = new ApiRequest()
    }
    return ApiRequest.instance
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.get(url, config)
      return response
    } catch (error) {
      this.handleRequestError(error, 'GET', url)
      throw error
    }
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.post(url, data, config)
      return response
    } catch (error) {
      this.handleRequestError(error, 'POST', url)
      throw error
    }
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.put(url, data, config)
      return response
    } catch (error) {
      this.handleRequestError(error, 'PUT', url)
      throw error
    }
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.delete(url, config)
      return response
    } catch (error) {
      this.handleRequestError(error, 'DELETE', url)
      throw error
    }
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.patch(url, data, config)
      return response
    } catch (error) {
      this.handleRequestError(error, 'PATCH', url)
      throw error
    }
  }

  /**
   * 上传文件
   */
  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    try {
      const uploadConfig = {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers
        }
      }

      const response = await axios.post(url, formData, uploadConfig)
      return response
    } catch (error) {
      this.handleRequestError(error, 'UPLOAD', url)
      throw error
    }
  }

  /**
   * 处理请求错误
   */
  private handleRequestError(error: any, method: string, url: string) {
    console.error(`❌ ${method} 请求失败:`, {
      url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })

    // 如果是认证错误，由axios拦截器统一处理
    // 这里可以添加其他特殊错误处理逻辑
  }

  /**
   * 检查请求是否需要认证
   */
  private requiresAuth(url: string): boolean {
    return !authManager.shouldSkipAuth(url)
  }

  /**
   * 批量请求
   */
  async all<T = any>(requests: Promise<any>[]): Promise<T[]> {
    try {
      const responses = await Promise.all(requests)
      return responses
    } catch (error) {
      console.error('❌ 批量请求失败:', error)
      throw error
    }
  }

  /**
   * 并发请求（有限制）
   */
  async concurrent<T = any>(requests: (() => Promise<any>)[], limit: number = 5): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<any>[] = []

    for (const request of requests) {
      const promise = request().then((result: T) => {
        results.push(result)
        return result
      })

      executing.push(promise)

      if (executing.length >= limit) {
        await Promise.race(executing)
        executing.splice(
          executing.findIndex((p) => p === promise),
          1
        )
      }
    }

    await Promise.all(executing)
    return results
  }
}

// 导出单例实例
export const apiRequest = ApiRequest.getInstance()

// 导出便捷方法
export const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiRequest.get<T>(url, config)

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest.post<T>(url, data, config)

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest.put<T>(url, data, config)

export const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiRequest.delete<T>(url, config)

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest.patch<T>(url, data, config)

export const upload = <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) =>
  apiRequest.upload<T>(url, formData, config)

// 默认导出axios实例（保持向后兼容）
export default axios
