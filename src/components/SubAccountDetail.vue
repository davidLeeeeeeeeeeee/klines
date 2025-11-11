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
    height: 500,
    layout: {
      background: { type: 'solid', color: '#1e222d' },
      textColor: '#d1d4dc',
    },
    grid: {
      vertLines: { color: '#2b2b43' },
      horzLines: { color: '#2b2b43' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#485c7b',
    },
    timeScale: {
      borderColor: '#485c7b',
      timeVisible: true,
      secondsVisible: false,
    },
  })

  lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
    color: '#2962FF',
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
.detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

h1 {
  color: #42b983;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #2b2b43;
  padding: 10px 20px;
  border-radius: 8px;
}

.username {
  color: #d1d4dc;
  font-size: 14px;
}

.logout-btn {
  padding: 6px 12px;
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #e04545;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #2b2b43;
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.back-btn {
  padding: 8px 16px;
  background: #485c7b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #5a6f8f;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  color: #d1d4dc;
  font-size: 14px;
  white-space: nowrap;
}

.control-group input {
  padding: 6px 10px;
  border: 1px solid #485c7b;
  border-radius: 4px;
  background: #1e222d;
  color: #d1d4dc;
  font-size: 14px;
}

.control-group input:focus {
  outline: none;
  border-color: #2962FF;
}

.refresh-btn {
  padding: 6px 16px;
  background: #2962FF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #1e4db7;
}

.refresh-btn:disabled {
  background: #485c7b;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  margin-bottom: 15px;
  background: #ff5252;
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

.chart-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #2b2b43;
  border-radius: 8px;
  color: #d1d4dc;
}

.chart-info p {
  margin: 5px 0;
  font-size: 14px;
}

.chart-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>

