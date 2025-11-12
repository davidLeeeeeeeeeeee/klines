/**
 * 时间解析工具函数
 * 支持三种时间格式：
 * - 分钟级别: "202511100000" (12位: YYYYMMDDHHmm)
 * - 小时级别: "2025111000" (10位: YYYYMMDDHH)
 * - 日级别: "20251105" (8位: YYYYMMDD)
 */

/**
 * 检测时间字符串的格式类型
 * @param {string} timeStr - 时间字符串
 * @returns {string} 'minute' | 'hour' | 'day' | 'unknown'
 */
export const detectTimeFormat = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') {
    return 'unknown'
  }

  const len = timeStr.length

  if (len === 12) {
    return 'minute'
  } else if (len === 10) {
    return 'hour'
  } else if (len === 8) {
    return 'day'
  }

  return 'unknown'
}

/**
 * 解析时间字符串为 Unix 时间戳（秒）
 * @param {string} timeStr - 时间字符串
 * @returns {number} Unix 时间戳（秒）
 */
export const parseTimeString = (timeStr) => {
  const format = detectTimeFormat(timeStr)

  let year, month, day, hour, minute

  switch (format) {
    case 'minute':
      // "202511100000" -> 2025-11-10 00:00
      year = timeStr.substring(0, 4)
      month = timeStr.substring(4, 6)
      day = timeStr.substring(6, 8)
      hour = timeStr.substring(8, 10)
      minute = timeStr.substring(10, 12)
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).getTime() / 1000

    case 'hour':
      // "2025111000" -> 2025-11-10 00:00
      year = timeStr.substring(0, 4)
      month = timeStr.substring(4, 6)
      day = timeStr.substring(6, 8)
      hour = timeStr.substring(8, 10)
      return new Date(`${year}-${month}-${day}T${hour}:00:00`).getTime() / 1000

    case 'day':
      // "20251105" -> 2025-11-05 00:00
      year = timeStr.substring(0, 4)
      month = timeStr.substring(4, 6)
      day = timeStr.substring(6, 8)
      return new Date(`${year}-${month}-${day}T00:00:00`).getTime() / 1000

    default:
      console.warn(`未知的时间格式: ${timeStr}`)
      return 0
  }
}

/**
 * 格式化时间字符串为可读格式
 * @param {string} timeStr - 时间字符串
 * @returns {string} 格式化后的时间字符串
 */
export const formatTimeString = (timeStr) => {
  const format = detectTimeFormat(timeStr)

  let year, month, day, hour, minute

  switch (format) {
    case 'minute':
      year = timeStr.substring(0, 4)
      month = timeStr.substring(4, 6)
      day = timeStr.substring(6, 8)
      hour = timeStr.substring(8, 10)
      minute = timeStr.substring(10, 12)
      return `${year}-${month}-${day} ${hour}:${minute}`

    case 'hour':
      year = timeStr.substring(0, 4)
      month = timeStr.substring(4, 6)
      day = timeStr.substring(6, 8)
      hour = timeStr.substring(8, 10)
      return `${year}-${month}-${day} ${hour}:00`

    case 'day':
      year = timeStr.substring(0, 4)
      month = timeStr.substring(4, 6)
      day = timeStr.substring(6, 8)
      return `${year}-${month}-${day}`

    default:
      return timeStr
  }
}

/**
 * 获取时间粒度的中文描述
 * @param {string} timeStr - 时间字符串
 * @returns {string} 时间粒度描述
 */
export const getTimeGranularity = (timeStr) => {
  const format = detectTimeFormat(timeStr)

  switch (format) {
    case 'minute':
      return '分钟'
    case 'hour':
      return '小时'
    case 'day':
      return '日'
    default:
      return '未知'
  }
}

/**
 * 检测数据集的时间粒度
 * @param {Array<string>} timeArray - 时间字符串数组
 * @returns {string} 时间粒度描述
 */
export const detectDataGranularity = (timeArray) => {
  if (!timeArray || timeArray.length === 0) {
    return '未知'
  }

  // 使用第一个时间点来判断粒度
  return getTimeGranularity(timeArray[0])
}

