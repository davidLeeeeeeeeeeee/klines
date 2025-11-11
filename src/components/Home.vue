<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as LightweightCharts from 'lightweight-charts'
import { post } from '../utils/request'
import { getUserInfo, clearAuth } from '../utils/auth'

const router = useRouter()

const props = defineProps({
  msg: String,
})

const chartContainer = ref(null)
const loading = ref(false)
const error = ref(null)
const exchange = ref('BYBIT') // 交易所类型
const startDate = ref('')
const endDate = ref('')
const userInfo = ref(null)
let chart = null
let lineSeries = null

// 初始化日期范围
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30) // 默认最近30天

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
}

// 获取用户历史净值数据
const fetchEquityData = async () => {
  loading.value = true
  error.value = null

  try {
    const requestData = {
      startTime: `${startDate.value} 00:00:00`,
      endTime: `${endDate.value} 23:59:59`,
      exchange: exchange.value
    }

    console.log('请求用户历史净值数据:', requestData)

    // 调用用户历史净值接口
    const data = await post('/alphanow-admin/api/user/history/line', requestData)
    console.log('接收到的数据:', data)

    return data
  } catch (err) {
    console.error('获取数据失败:', err)
    error.value = err.message

    // 如果是未授权错误，触发登出
    if (err.message.includes('未授权')) {
      handleLogout()
    }

    throw err
  } finally {
    loading.value = false
  }
}

// 退出登录
const handleLogout = () => {
  clearAuth()
  router.push('/login')
}

// 导航到子账户列表
const goToAccounts = () => {
  router.push('/accounts')
}

// 将API数据转换为图表数据格式
const convertToChartData = (apiData) => {
  if (!apiData || !apiData.lineX || !apiData.lineY) {
    return []
  }

  const { lineX, lineY } = apiData
  const chartData = []

  for (let i = 0; i < lineX.length; i++) {
    // lineX 是时间字符串格式如 "20251105"，需要转换为 Unix 时间戳（秒）
    const timeStr = lineX[i]

    // 将 "20251105" 格式转换为 "2025-11-05"
    const year = timeStr.substring(0, 4)
    const month = timeStr.substring(4, 6)
    const day = timeStr.substring(6, 8)
    const formattedDate = `${year}-${month}-${day}`

    const timestamp = new Date(formattedDate).getTime() / 1000

    chartData.push({
      time: timestamp,
      value: parseFloat(lineY[i])
    })
  }

  // 按时间排序
  chartData.sort((a, b) => a.time - b.time)

  return chartData
}

// 创建图表
const createChart = () => {
  if (!chartContainer.value) return

  chart = LightweightCharts.createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 400,
    layout: {
      background: { type: 'solid', color: '#ffffff' },
      textColor: '#333333',
    },
    grid: {
      vertLines: { color: '#e8e8e8' },
      horzLines: { color: '#e8e8e8' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#d0d0d0',
    },
    timeScale: {
      borderColor: '#d0d0d0',
      timeVisible: true,
      secondsVisible: false,
    },
  })

  // 添加折线系列（用于净值曲线）
  lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
    color: '#1976d2',
    lineWidth: 2,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 6,
    lastValueVisible: true,
    priceLineVisible: true,
  })
}

// 加载数据并更新图表
const loadData = async () => {
  try {
    const response = await fetchEquityData()
    console.log('API 响应:', response)

    // API 返回格式: { code, success, data: { lineX, lineY } }
    const apiData = response.data || response
    console.log('提取的数据:', apiData)

    const chartData = convertToChartData(apiData)
    console.log('转换后的图表数据:', chartData)

    if (chartData.length > 0) {
      lineSeries.setData(chartData)
      chart.timeScale().fitContent()
    } else {
      error.value = '暂无数据'
    }
  } catch (err) {
    console.error('加载数据失败:', err)
  }
}

// 刷新数据
const refreshData = () => {
  if (lineSeries) {
    loadData()
  }
}

onMounted(() => {
  // 获取用户信息
  userInfo.value = getUserInfo()

  initDateRange()
  createChart()
  loadData()

  // 响应式调整
  const handleResize = () => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
      })
    }
  }

  window.addEventListener('resize', handleResize)

  // 保存清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (chart) {
      chart.remove()
    }
  })
})
</script>

<template>
  <div class="equity-container">
    <div class="header">
      <h1>{{ msg }}</h1>
      <div class="user-info" v-if="userInfo">
        <span class="username">👤 {{ userInfo.username }}</span>
        <span class="equity">💰 净值: {{ userInfo.equity }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>交易所:</label>
        <select v-model="exchange" class="select-input">
          <option value="BYBIT">BYBIT</option>
        </select>
      </div>

      <div class="control-group">
        <label>开始日期:</label>
        <input v-model="startDate" type="date" />
      </div>

      <div class="control-group">
        <label>结束日期:</label>
        <input v-model="endDate" type="date" />
      </div>

      <button @click="refreshData" :disabled="loading" class="refresh-btn">
        {{ loading ? '加载中...' : '刷新数据' }}
      </button>

      <button @click="goToAccounts" class="accounts-btn">
        📋 管理子账户
      </button>
    </div>

    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <div class="chart-info">
      <p>📈 账户历史净值曲线</p>
      <p>💡 支持缩放、拖拽、十字光标等交互功能</p>
      <p>🔄 可以选择不同的时间范围和账号查看净值变化</p>
    </div>

    <div ref="chartContainer" class="chart-wrapper"></div>

    <!-- 底部退出登录按钮 (手机模式) -->
    <div class="bottom-logout">
      <button @click="handleLogout" class="bottom-logout-btn">
        🚪 退出登录
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.equity-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .equity-container {
    max-width: 100%;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .equity-container {
    padding: 8px;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

h1 {
  color: #333333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f5f5f5;
  padding: 12px 20px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.username,
.equity {
  color: #666666;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  padding: 8px 16px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  font-weight: 500;
}

.logout-btn:hover {
  background: #b71c1c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #e0e0e0;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  color: #555555;
  font-size: 14px;
  white-space: nowrap;
  font-weight: 500;
}

.control-group input,
.select-input {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: border-color 0.3s;
}

.control-group input:focus,
.select-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.refresh-btn,
.accounts-btn {
  padding: 8px 18px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled),
.accounts-btn:hover {
  background: #1565c0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.accounts-btn {
  background: #388e3c;
}

.accounts-btn:hover {
  background: #2e7d32;
}

.error-message {
  padding: 12px 16px;
  margin-bottom: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
  border-left: 4px solid #d32f2f;
}

.chart-info {
  margin-bottom: 25px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  color: #666666;
  border: 1px solid #e0e0e0;
}

.chart-info p {
  margin: 6px 0;
  font-size: 14px;
  line-height: 1.5;
}

.chart-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

/* 底部退出登录按钮 (手机模式) */
.bottom-logout {
  margin-top: 30px;
  padding: 20px 0;
  display: none;
  justify-content: center;
  border-top: 1px solid #e0e0e0;
}

.bottom-logout-btn {
  width: 100%;
  max-width: 400px;
  padding: 12px 24px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.bottom-logout-btn:hover {
  background: #b71c1c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bottom-logout-btn:active {
  transform: translateY(0);
}

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
  .equity-container {
    padding: 16px;
  }

  h1 {
    font-size: 24px;
  }

  .header {
    margin-bottom: 20px;
    padding-bottom: 16px;
  }

  .controls {
    padding: 16px;
    gap: 12px;
  }

  .control-group {
    flex: 1 1 calc(50% - 6px);
    min-width: 150px;
  }

  .refresh-btn,
  .accounts-btn {
    flex: 1 1 calc(50% - 6px);
    min-width: 120px;
  }
}

/* 手机设备 (小于 768px) */
@media (max-width: 768px) {
  h1 {
    font-size: 20px;
    width: 100%;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 16px;
    gap: 12px;
  }

  .user-info {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }

  .username,
  .equity {
    width: 100%;
  }

  .logout-btn {
    width: 100%;
    padding: 10px;
  }

  .controls {
    flex-direction: column;
    padding: 12px;
    gap: 10px;
    margin-bottom: 20px;
  }

  .control-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .control-group label {
    width: 100%;
  }

  .control-group input,
  .select-input {
    width: 100%;
  }

  .refresh-btn,
  .accounts-btn {
    width: 100%;
    padding: 12px;
    font-size: 15px;
  }

  .chart-wrapper {
    height: auto;
    min-height: 300px;
    margin: 0;
    border-radius: 0;
  }

  .chart-info {
    padding: 12px;
    margin-bottom: 20px;
    border-radius: 0;
  }

  .chart-info p {
    font-size: 13px;
    margin: 4px 0;
  }

  .bottom-logout {
    display: flex;
    margin-top: 20px;
    padding: 16px 0;
  }

  .bottom-logout-btn {
    width: 100%;
    max-width: none;
    padding: 14px 20px;
    font-size: 15px;
  }
}

/* 超小屏幕 (小于 480px) */
@media (max-width: 480px) {
  h1 {
    font-size: 18px;
  }

  .header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .user-info {
    padding: 10px;
  }

  .controls {
    padding: 10px;
    gap: 8px;
  }

  .control-group input,
  .select-input {
    font-size: 16px; /* 防止 iOS 自动放大 */
  }

  .refresh-btn,
  .accounts-btn {
    padding: 10px;
    font-size: 14px;
  }

  .chart-info {
    padding: 10px;
  }

  .chart-info p {
    font-size: 12px;
  }
}
</style>

