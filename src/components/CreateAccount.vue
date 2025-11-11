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
* {
  box-sizing: border-box;
}

.create-account-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .create-account-container {
    max-width: 100%;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .create-account-container {
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

.form-wrapper {
  display: flex;
  justify-content: center;
}

.form-card {
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.success-message {
  padding: 12px;
  margin-bottom: 20px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  border-left: 4px solid #388e3c;
}

.error-message {
  padding: 12px;
  margin-bottom: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
  border-left: 4px solid #d32f2f;
}

form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #333333;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.help-text {
  margin: 6px 0 0 0;
  color: #999999;
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
  transition: all 0.3s;
}

.cancel-btn {
  background: #757575;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #616161;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: #388e3c;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #2e7d32;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-box {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #388e3c;
  border: 1px solid #e0e0e0;
  border-left: 3px solid #388e3c;
}

.info-box h3 {
  color: #388e3c;
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: #666666;
  font-size: 13px;
}

.info-box li {
  margin: 5px 0;
}

/* 手机设备响应式 */
@media (max-width: 768px) {
  .create-account-container {
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

  .form-card {
    padding: 20px;
  }

  .form-group input,
  .form-group select {
    font-size: 16px; /* 防止 iOS 自动放大 */
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .create-account-container {
    padding: 10px;
  }

  h1 {
    font-size: 18px;
  }

  .form-card {
    padding: 16px;
  }
}
</style>

