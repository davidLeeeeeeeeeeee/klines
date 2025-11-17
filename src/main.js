import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { setRouter } from './utils/request'

const app = createApp(App)

// 设置 router 实例到 request 工具中，用于处理认证失败时的跳转
setRouter(router)

app.use(router)
app.mount('#app')
