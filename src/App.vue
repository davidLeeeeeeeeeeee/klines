<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/Login.vue'
import { isAuthenticated } from './utils/auth'

const isLoggedIn = ref(false)

// 检查登录状态
const checkAuth = () => {
  isLoggedIn.value = isAuthenticated()
}

// 登录成功处理
const handleLoginSuccess = () => {
  isLoggedIn.value = true
}

// 退出登录处理
const handleLogout = () => {
  isLoggedIn.value = false
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <div id="app">
    <!-- 未登录显示登录页面 -->
    <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />

    <!-- 已登录显示主页面 -->
    <HelloWorld v-else msg="📊 账户历史净值曲线" @logout="handleLogout" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  background: #1e222d;
  color: #d1d4dc;
}

#app {
  min-height: 100vh;
}
</style>
