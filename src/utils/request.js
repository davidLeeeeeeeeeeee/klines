// HTTP 请求工具函数
import { getToken } from './auth'

const API_BASE_URL = 'https://alphanow.io'

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

    // 检查响应状态
    if (!response.ok) {
      if (response.status === 401) {
        // 未授权，可能需要重新登录
        throw new Error('未授权，请重新登录')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('请求失败:', error)
    throw error
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

