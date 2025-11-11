<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as LightweightCharts from 'lightweight-charts'
import { post } from '../utils/request'
import { getUserInfo, clearAuth } from '../utils/auth'

const router = useRouter()

const props = defineProps({
  accountId: {
    type: Number,
    required: true
  }
})

const chartContainer = ref(null)
const loading = ref(false)
const error = ref(null)
const startDate = ref('')
const endDate = ref('')
const userInfo = ref(null)
const accountInfo = ref(null)
let chart = null
let lineSeries = null

// 初始化日期范围
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
}

// 获取账户历史净值数据
const fetchEquityData = async () => {
  loading.value = true
  error.value = null

  try {
    const requestData = {
      accountId: props.accountId,
      startTime: `${startDate.value} 00:00:00`,
      endTime: `${endDate.value} 23:59:59`
    }

    console.log('请求账户历史净值数据:', requestData)
    const data = await post('/alphanow-admin/api/account/history/line', requestData)
    console.log('接收到的数据:', data)

    return data
  } catch (err) {
    console.error('获取数据失败:', err)
    error.value = err.message

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

// 返回账户列表
const goBack = () => {
  router.push('/accounts')
}

// 转换数据格式
const convertToChartData = (apiData) => {
  if (!apiData || !apiData.lineX || !apiData.lineY) {
    return []
  }

  const { lineX, lineY } = apiData
  const chartData = []

  for (let i = 0; i < lineX.length; i++) {
    const timeStr = lineX[i]
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

  lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
    color: '#1976d2',
    lineWidth: 2,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 6,
    lastValueVisible: true,
    priceLineVisible: true,
  })
}

// 加载数据
const loadData = async () => {
  try {
    const response = await fetchEquityData()
    const apiData = response.data || response
    const chartData = convertToChartData(apiData)

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
  userInfo.value = getUserInfo()
  initDateRange()
  createChart()
  loadData()

  const handleResize = () => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
      })
    }
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (chart) {
      chart.remove()
    }
  })
})
</script>

<template>
  <div class="detail-container">
    <div class="header">
      <h1>📊 子账户详情 - ID: {{ accountId }}</h1>
      <div class="user-info" v-if="userInfo">
        <span class="username">👤 {{ userInfo.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="controls">
      <button @click="goBack" class="back-btn">← 返回列表</button>

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
    </div>

    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <div class="chart-info">
      <p>📈 账户历史净值曲线</p>
      <p>💡 支持缩放、拖拽、十字光标等交互功能</p>
    </div>

    <div ref="chartContainer" class="chart-wrapper"></div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .detail-container {
    max-width: 100%;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .detail-container {
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
  font-size: 24px;
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

.username {
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

.back-btn {
  padding: 8px 16px;
  background: #757575;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.back-btn:hover {
  background: #616161;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.control-group input {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: border-color 0.3s;
}

.control-group input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.refresh-btn {
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

.refresh-btn:hover:not(:disabled) {
  background: #1565c0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
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
}

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
  .detail-container {
    padding: 16px;
  }

  h1 {
    font-size: 22px;
  }

  .controls {
    padding: 16px;
    gap: 12px;
  }

  .control-group {
    flex: 1 1 calc(50% - 6px);
    min-width: 150px;
  }

  .refresh-btn {
    flex: 1 1 calc(50% - 6px);
    min-width: 120px;
  }
}

/* 手机设备 (小于 768px) */
@media (max-width: 768px) {
  .detail-container {
    padding: 12px;
  }

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

  .username {
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
  }

  .back-btn {
    width: 100%;
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

  .control-group input {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    padding: 12px;
    font-size: 15px;
  }

  .chart-info {
    padding: 12px;
    margin-bottom: 20px;
  }

  .chart-info p {
    font-size: 13px;
    margin: 4px 0;
  }
}

/* 超小屏幕 (小于 480px) */
@media (max-width: 480px) {
  .detail-container {
    padding: 10px;
  }

  h1 {
    font-size: 18px;
  }

  .header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .controls {
    padding: 10px;
    gap: 8px;
  }

  .control-group input {
    font-size: 16px; /* 防止 iOS 自动放大 */
  }

  .refresh-btn {
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

