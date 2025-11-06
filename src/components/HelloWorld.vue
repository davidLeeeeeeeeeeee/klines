<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as LightweightCharts from 'lightweight-charts'

defineProps({
  msg: String,
})

const chartContainer = ref(null)
let chart = null
let candlestickSeries = null

// 生成模拟K线数据
const generateKlineData = () => {
  const data = []
  const basePrice = 50000
  let currentPrice = basePrice
  const startDate = new Date('2024-01-01')

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    // 模拟价格波动
    const change = (Math.random() - 0.5) * 2000
    currentPrice += change

    const open = currentPrice
    const close = currentPrice + (Math.random() - 0.5) * 1000
    const high = Math.max(open, close) + Math.random() * 500
    const low = Math.min(open, close) - Math.random() * 500

    data.push({
      // lightweight-charts v5 9 requires Unix timestamp (seconds)
      time: Math.floor(date.getTime() / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    })

    currentPrice = close
  }

  return data
}

onMounted(() => {
  if (chartContainer.value) {
    // 创建图表
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

    // 添加K线系列
    candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // 设置数据
    const klineData = generateKlineData()
    candlestickSeries.setData(klineData)

    // 自适应时间轴
    chart.timeScale().fitContent()

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
  }
})
</script>

<template>
  <div class="kline-container">
    <h1>{{ msg }}</h1>
    <div class="chart-info">
      <p>📈 基于 TradingView 的 lightweight-charts 库</p>
      <p>💡 支持缩放、拖拽、十字光标等交互功能</p>
    </div>
    <div ref="chartContainer" class="chart-wrapper"></div>
  </div>
</template>

<style scoped>
.kline-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #42b983;
  margin-bottom: 20px;
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
