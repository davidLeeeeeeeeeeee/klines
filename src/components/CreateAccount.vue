<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '../utils/request'
import { getUserInfo, clearAuth } from '../utils/auth'

const router = useRouter()

const apiKey = ref('')
const apiSecret = ref('')
const apiPassphrase = ref('')
const exchange = ref('BYBIT')
const loading = ref(false)
const error = ref(null)
const success = ref(false)
const userInfo = ref(null)

// 创建账户
const handleCreateAccount = async () => {
  // 验证输入
  if (!apiKey.value || !apiSecret.value || !apiPassphrase.value) {
    error.value = '请填写所有必填字段'
    return
  }

  loading.value = true
  error.value = null
  success.value = false

  try {
    const requestData = {
      apiKey: apiKey.value,
      apiSecret: apiSecret.value,
      apiPassphrase: apiPassphrase.value,
      exchange: exchange.value
    }

    console.log('创建账户:', requestData)
    const data = await post('/alphanow-admin/api/account/create', requestData)
    console.log('创建成功:', data)

    success.value = true
    error.value = null

    // 2秒后返回账户列表
    setTimeout(() => {
      router.push('/accounts')
    }, 2000)
  } catch (err) {
    console.error('创建账户失败:', err)
    error.value = err.message

    if (err.message.includes('未授权')) {
      handleLogout()
    }
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

// 获取用户信息
userInfo.value = getUserInfo()
</script>

<template>
  <div class="create-account-container">
    <div class="header">
      <h1>➕ 新建子账户</h1>
      <div class="user-info" v-if="userInfo">
        <span class="username">👤 {{ userInfo.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="form-wrapper">
      <div class="form-card">
        <div v-if="success" class="success-message">
          ✅ 账户创建成功！正在返回账户列表...
        </div>

        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>

        <form @submit.prevent="handleCreateAccount">
          <div class="form-group">
            <label for="apiKey">API Key *</label>
            <input
              id="apiKey"
              v-model="apiKey"
              type="text"
              placeholder="请输入 API Key"
              :disabled="loading"
              required
            />
            <p class="help-text">从交易所获取的 API Key</p>
          </div>

          <div class="form-group">
            <label for="apiSecret">API Secret *</label>
            <input
              id="apiSecret"
              v-model="apiSecret"
              type="password"
              placeholder="请输入 API Secret"
              :disabled="loading"
              required
            />
            <p class="help-text">从交易所获取的 API Secret</p>
          </div>

          <div class="form-group">
            <label for="apiPassphrase">API Passphrase *</label>
            <input
              id="apiPassphrase"
              v-model="apiPassphrase"
              type="password"
              placeholder="请输入 API Passphrase"
              :disabled="loading"
              required
            />
            <p class="help-text">从交易所获取的 API Passphrase</p>
          </div>

          <div class="form-group">
            <label for="exchange">交易所 *</label>
            <select
              id="exchange"
              v-model="exchange"
              :disabled="loading"
              required
            >
              <option value="BYBIT">BYBIT</option>
            </select>
            <p class="help-text">选择交易所类型</p>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="goBack"
              class="cancel-btn"
              :disabled="loading"
            >
              取消
            </button>
            <button
              type="submit"
              class="submit-btn"
              :disabled="loading"
            >
              {{ loading ? '创建中...' : '创建账户' }}
            </button>
          </div>
        </form>

        <div class="info-box">
          <h3>📝 说明</h3>
          <ul>
            <li>请确保 API Key 具有必要的权限</li>
            <li>API Secret 和 Passphrase 将被安全存储</li>
            <li>创建后可以在账户列表中查看和管理</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-account-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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

.form-wrapper {
  display: flex;
  justify-content: center;
}

.form-card {
  width: 100%;
  background: #2b2b43;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.success-message {
  padding: 12px;
  margin-bottom: 20px;
  background: #42b983;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.error-message {
  padding: 12px;
  margin-bottom: 20px;
  background: #ff5252;
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #d1d4dc;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #485c7b;
  border-radius: 6px;
  background: #1e222d;
  color: #d1d4dc;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b983;
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.help-text {
  margin: 6px 0 0 0;
  color: #6b7280;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-btn {
  background: #485c7b;
  color: #d1d4dc;
}

.cancel-btn:hover:not(:disabled) {
  background: #5a6f8f;
}

.submit-btn {
  background: #42b983;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-box {
  padding: 15px;
  background: #1e222d;
  border-radius: 6px;
  border-left: 3px solid #42b983;
}

.info-box h3 {
  color: #42b983;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: #d1d4dc;
  font-size: 13px;
}

.info-box li {
  margin: 5px 0;
}
</style>

