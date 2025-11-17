// HTTP 请求工具函数
import { getToken, clearAuth } from './auth'

const API_BASE_URL = 'https://alphanow.io'

// 用于存储 router 实例的变量
let routerInstance = null

/**
 * 设置 router 实例（在 main.js 中调用）
 */
export const setRouter = (router) => {
  routerInstance = router
}

/**
 * 通用请求函数
 * @param {string} url - 请求路径
 * @param {object} options - 请求配置
 * @returns {Promise} 响应数据
 */
export const request = async (url, options = {}) => {
  const token = getToken()

  // 默认配置
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // 如果有 token，添加到请求头
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`
    // API 使用 alphatoken 字段
    defaultOptions.headers['alphatoken'] = token
  }

  // 合并配置
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  // 如果是 POST/PUT 等方法且有 body，转换为 JSON
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, finalOptions)

    // 先尝试解析 JSON，无论状态码是什么
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      // 如果无法解析 JSON，检查 HTTP 状态码
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError()
          throw new Error('未授权，请重新登录')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      throw parseError
    }

    // 统一处理登录失效（code: 3004）
    if (data.code === 3004) {
      console.log('登录已失效，清理数据并跳转到登录页面')
      handleAuthError()
      throw new Error('登录已失效，请重新登录')
    }

    // 检查响应状态（在检查 code 之后）
    if (!response.ok && data.code !== 3004) {
      if (response.status === 401) {
        handleAuthError()
        throw new Error('未授权，请重新登录')
      }
      throw new Error(data.description || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

/**
 * 处理认证错误，清除认证信息并跳转到登录页
 */
const handleAuthError = () => {
  clearAuth()

  // 优先使用 router 实例进行跳转
  if (routerInstance) {
    routerInstance.push('/login')
  } else {
    // 如果没有 router 实例，使用 window.location
    window.location.href = '/login'
  }
}

/**
 * GET 请求
 */
export const get = (url, options = {}) => {
  return request(url, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export const post = (url, body, options = {}) => {
  return request(url, { ...options, method: 'POST', body })
}

/**
 * PUT 请求
 */
export const put = (url, body, options = {}) => {
  return request(url, { ...options, method: 'PUT', body })
}

/**
 * DELETE 请求
 */
export const del = (url, options = {}) => {
  return request(url, { ...options, method: 'DELETE' })
}

export { API_BASE_URL }

