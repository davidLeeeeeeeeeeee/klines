<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as LightweightCharts from 'lightweight-charts'
import { post } from '../utils/request'
import { getUserInfo, clearAuth } from '../utils/auth'
import { parseTimeString, detectDataGranularity } from '../utils/timeParser'

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
const dataGranularity = ref('未知') // 数据粒度（分钟/小时/日）
const positionData = ref([]) // 持仓数据
const closePnlList = ref([]) // 平仓历史列表
const closePnlTotal = ref(0) // 平仓历史总数
const closePnlPage = ref(1) // 平仓历史页码
const closePnlPageSize = ref(10) // 平仓历史每页数量
const loadingPosition = ref(false) // 持仓加载状态
const loadingClosePnl = ref(false) // 平仓历史加载状态
let chart = null
let lineSeries = null
let autoRefreshTimer = null // 自动刷新定时器

// 初始化日期范围
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setHours(start.getHours() - 6) // 默认最近6小时

  const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  startDate.value = formatDateTime(start)
  endDate.value = formatDateTime(end)
}

// 获取持仓信息
const fetchPositionData = async () => {
  if (!userInfo.value) return

  loadingPosition.value = true

  try {
    const requestData = {
      accountId: props.accountId,
      apiKey: '',
      exchange: 'BYBIT',
      userId: userInfo.value.id || 0
    }

    console.log('请求持仓数据:', requestData)

    const response = await post('/alphanow-admin/api/trade/position', requestData)
    console.log('持仓数据响应:', response)

    if (response && response.data) {
      positionData.value = Array.isArray(response.data) ? response.data : []
    } else {
      positionData.value = []
    }
  } catch (err) {
    console.error('获取持仓数据失败:', err)
    positionData.value = []
  } finally {
    loadingPosition.value = false
  }
}

// 获取账户历史净值数据
const fetchEquityData = async () => {
  loading.value = true
  error.value = null

  try {
    // 格式化时间为 "YYYY-MM-DD HH:mm:ss"
    const formatToApiTime = (dateTimeStr) => {
      if (!dateTimeStr) {
        console.error('时间字符串为空')
        return ''
      }

      const date = new Date(dateTimeStr)

      if (isNaN(date.getTime())) {
        console.error('无效的时间格式:', dateTimeStr)
        return ''
      }

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const startTimeFormatted = formatToApiTime(startDate.value)
    const endTimeFormatted = formatToApiTime(endDate.value)

    console.log('原始时间值:', { start: startDate.value, end: endDate.value })
    console.log('格式化后时间:', { start: startTimeFormatted, end: endTimeFormatted })

    const requestData = {
      accountId: props.accountId,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted
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

  // 检测数据粒度
  dataGranularity.value = detectDataGranularity(lineX)
  console.log(`检测到数据粒度: ${dataGranularity.value}`)

  for (let i = 0; i < lineX.length; i++) {
    const timeStr = lineX[i]

    // 使用通用时间解析函数，自动识别格式
    const timestamp = parseTimeString(timeStr)

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
    localization: {
      locale: 'zh-CN',
      dateFormat: 'yyyy年MM月dd日',
    },
  })

  // 添加面积系列（用于净值曲线，带阴影效果）
  lineSeries = chart.addSeries(LightweightCharts.AreaSeries, {
    lineColor: '#1976d2',
    topColor: 'rgba(25, 118, 210, 0.4)',
    bottomColor: 'rgba(25, 118, 210, 0.05)',
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

// 启动自动刷新
const startAutoRefresh = () => {
  // 清除已存在的定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }

  // 每60秒（1分钟）自动刷新一次
  autoRefreshTimer = setInterval(() => {
    console.log('自动刷新图表数据...')
    if (lineSeries) {
      loadData()
    }
  }, 60000) // 60000毫秒 = 1分钟
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// 获取平仓历史列表
const fetchClosePnlList = async () => {
  if (!userInfo.value) return

  loadingClosePnl.value = true

  try {
    const requestData = {
      page: closePnlPage.value,
      pageSize: closePnlPageSize.value,
      param: {
        accountId: props.accountId,
        exchange: 'BYBIT',
        side: '',
        symbol: ''
      }
    }

    console.log('请求平仓历史数据:', requestData)

    const response = await post('/alphanow-admin/api/trade/close/list', requestData)
    console.log('平仓历史响应:', response)

    if (response && response.data) {
      closePnlList.value = response.data.records || []
      closePnlTotal.value = response.data.total || 0
    } else {
      closePnlList.value = []
      closePnlTotal.value = 0
    }
  } catch (err) {
    console.error('获取平仓历史失败:', err)
    closePnlList.value = []
    closePnlTotal.value = 0
  } finally {
    loadingClosePnl.value = false
  }
}

// 切换页码
const handlePageChange = (page) => {
  closePnlPage.value = page
  fetchClosePnlList()
}

// 格式化时间戳
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  userInfo.value = getUserInfo()
  initDateRange()
  createChart()
  loadData()

  // 加载持仓和平仓历史数据
  fetchPositionData()
  fetchClosePnlList()

  // 启动自动刷新
  startAutoRefresh()

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
    stopAutoRefresh() // 停止自动刷新
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
      </div>
    </div>

    <!-- 持仓信息 -->
    <div class="position-section">
      <div class="section-header">
        <h2>📊 当前持仓</h2>
      </div>

      <div class="position-info" v-if="positionData.length > 0">
        <div class="position-list">
          <div v-for="pos in positionData" :key="pos.symbol + pos.side" class="position-item">
            <span class="pos-symbol">{{ pos.symbol }}</span>
            <span :class="['pos-side', pos.side === 'Buy' ? 'long' : 'short']">
              {{ pos.side === 'Buy' ? '多' : '空' }}
            </span>
            <span class="pos-qty">数量: {{ pos.qty }}</span>
            <span class="pos-price">均价: {{ pos.avaPrice }}</span>
            <span :class="['pos-pnl', pos.unrealisedPnl >= 0 ? 'profit' : 'loss']">
              盈亏: {{ pos.unrealisedPnl >= 0 ? '+' : '' }}{{ pos.unrealisedPnl }}
            </span>
          </div>
        </div>
      </div>
      <div class="position-info" v-else-if="!loadingPosition">
        <div class="position-empty">暂无持仓</div>
      </div>
      <div class="position-info" v-else>
        <div class="position-empty">加载中...</div>
      </div>
    </div>

    <div class="controls">
      <button @click="goBack" class="back-btn">← 返回列表</button>

      <div class="control-group" @click="$refs.startDateInput.showPicker()">
        <label>开始时间:</label>
        <input ref="startDateInput" v-model="startDate" type="datetime-local" />
      </div>

      <div class="control-group" @click="$refs.endDateInput.showPicker()">
        <label>结束时间:</label>
        <input ref="endDateInput" v-model="endDate" type="datetime-local" />
      </div>

      <button @click="refreshData" :disabled="loading" class="refresh-btn">
        {{ loading ? '加载中...' : '刷新数据' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <div class="chart-info">
      <p>📈 子账户历史净值曲线</p>
      <p class="granularity-info">⏱️ 数据粒度: {{ dataGranularity }}</p>
    </div>

    <div ref="chartContainer" class="chart-wrapper"></div>

    <!-- 平仓历史列表 -->
    <div class="close-history-section">
      <div class="section-header">
        <h2>📜 平仓历史</h2>
        <button @click="fetchClosePnlList" :disabled="loadingClosePnl" class="refresh-small-btn">
          {{ loadingClosePnl ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div v-if="loadingClosePnl" class="loading-message">
        加载中...
      </div>

      <div v-else-if="closePnlList.length === 0" class="empty-message">
        暂无平仓记录
      </div>

      <div v-else class="close-history-table">
        <table>
          <thead>
            <tr>
              <th>交易对</th>
              <th>方向</th>
              <th>数量</th>
              <th>入场价</th>
              <th>平仓价</th>
              <th>盈亏</th>
              <th>杠杆</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in closePnlList" :key="item.id">
              <td>{{ item.symbol }}</td>
              <td :class="item.side === 'Buy' ? 'long' : 'short'">
                {{ item.side === 'Buy' ? '多' : '空' }}
              </td>
              <td>{{ item.closedQty }}</td>
              <td>{{ item.avgEntryPrice }}</td>
              <td>{{ item.avgExitPrice }}</td>
              <td :class="item.closedPnl >= 0 ? 'profit' : 'loss'">
                {{ item.closedPnl >= 0 ? '+' : '' }}{{ item.closedPnl }}
              </td>
              <td>{{ item.leverage }}x</td>
              <td>{{ formatTime(item.orderCreateTime) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="pagination" v-if="closePnlTotal > closePnlPageSize">
          <button
            @click="handlePageChange(closePnlPage - 1)"
            :disabled="closePnlPage <= 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ closePnlPage }} 页 / 共 {{ Math.ceil(closePnlTotal / closePnlPageSize) }} 页
          </span>
          <button
            @click="handlePageChange(closePnlPage + 1)"
            :disabled="closePnlPage >= Math.ceil(closePnlTotal / closePnlPageSize)"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
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

/* 持仓区域 */
.position-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #e3f2fd;
  border-radius: 8px;
  border: 2px solid #2196f3;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.position-info {
  width: 100%;
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.position-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.position-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 13px;
  flex-wrap: wrap;
}

.pos-symbol {
  font-weight: 600;
  color: #333;
}

.pos-side {
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 500;
  font-size: 12px;
}

.pos-side.long {
  background: #e8f5e9;
  color: #2e7d32;
}

.pos-side.short {
  background: #ffebee;
  color: #c62828;
}

.pos-qty,
.pos-price {
  color: #666;
}

.pos-pnl {
  font-weight: 600;
  margin-left: auto;
}

.pos-pnl.profit {
  color: #2e7d32;
}

.pos-pnl.loss {
  color: #c62828;
}

.position-empty {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 8px;
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
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-group:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.control-group label {
  color: #555555;
  font-size: 14px;
  white-space: nowrap;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.control-group input {
  padding: 10px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: border-color 0.3s;
  min-height: 40px;
  cursor: pointer;
  flex: 1;
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

.granularity-info {
  color: #1976d2;
  font-weight: 600;
}

.chart-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-bottom: 30px;
}

/* 平仓历史区域 */
.close-history-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.refresh-small-btn {
  padding: 6px 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.refresh-small-btn:hover:not(:disabled) {
  background: #1565c0;
}

.refresh-small-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.close-history-table {
  overflow-x: auto;
}

.close-history-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.close-history-table th,
.close-history-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
}

.close-history-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.close-history-table tbody tr:hover {
  background: #f9f9f9;
}

.close-history-table .long {
  color: #2e7d32;
  font-weight: 600;
}

.close-history-table .short {
  color: #c62828;
  font-weight: 600;
}

.close-history-table .profit {
  color: #2e7d32;
  font-weight: 600;
}

.close-history-table .loss {
  color: #c62828;
  font-weight: 600;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.page-btn {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #1565c0;
}

.page-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 13px;
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
    gap: 8px;
    padding: 12px;
  }

  .username {
    width: 100%;
  }

  .position-section,
  .close-history-section {
    padding: 12px;
  }

  .section-header h2 {
    font-size: 16px;
  }

  .position-item {
    font-size: 12px;
    gap: 6px;
  }

  .close-history-table {
    font-size: 12px;
  }

  .close-history-table th,
  .close-history-table td {
    padding: 8px 4px;
    font-size: 11px;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
  }

  .page-btn {
    width: 100%;
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

