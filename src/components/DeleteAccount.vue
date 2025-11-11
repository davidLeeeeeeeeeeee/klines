<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '../utils/request'
import { getUserInfo, clearAuth } from '../utils/auth'

const router = useRouter()

const props = defineProps({
  accountId: {
    type: Number,
    required: true
  }
})

const loading = ref(false)
const error = ref(null)
const success = ref(false)
const userInfo = ref(null)
const confirmText = ref('')

// 删除账户
const handleDeleteAccount = async () => {
  if (confirmText.value !== '确认删除') {
    error.value = '请输入"确认删除"来确认操作'
    return
  }

  loading.value = true
  error.value = null
  success.value = false

  try {
    console.log('删除账户ID:', props.accountId)
    const data = await post(`/alphanow-admin/api/account/remove?id=${props.accountId}`)
    console.log('删除成功:', data)

    success.value = true
    error.value = null

    // 2秒后返回账户列表
    setTimeout(() => {
      router.push('/accounts')
    }, 2000)
  } catch (err) {
    console.error('删除账户失败:', err)
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

// 取消删除
const cancelDelete = () => {
  router.push('/accounts')
}

// 获取用户信息
userInfo.value = getUserInfo()
</script>

<template>
  <div class="delete-account-container">
    <div class="header">
      <h1>🗑️ 删除子账户</h1>
      <div class="user-info" v-if="userInfo">
        <span class="username">👤 {{ userInfo.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="dialog-wrapper">
      <div class="dialog-card">
        <div class="warning-icon">⚠️</div>

        <h2>确认删除账户</h2>

        <div class="warning-message">
          <p>您即将删除账户 ID: <strong>{{ accountId }}</strong></p>
          <p>此操作无法撤销，请谨慎操作！</p>
        </div>

        <div v-if="success" class="success-message">
          ✅ 账户已成功删除！正在返回账户列表...
        </div>

        <div v-if="error" class="error-message">
          ⚠️ {{ error }}
        </div>

        <div v-if="!success" class="confirmation-section">
          <p class="confirmation-text">
            请输入 <strong>"确认删除"</strong> 来确认此操作：
          </p>
          <input
            v-model="confirmText"
            type="text"
            placeholder="请输入确认文本"
            :disabled="loading"
            class="confirmation-input"
          />
        </div>

        <div class="dialog-actions">
          <button
            @click="cancelDelete"
            class="cancel-btn"
            :disabled="loading"
          >
            取消
          </button>
          <button
            @click="handleDeleteAccount"
            class="delete-btn"
            :disabled="loading || confirmText !== '确认删除'"
          >
            {{ loading ? '删除中...' : '确认删除' }}
          </button>
        </div>

        <div class="info-box">
          <h3>📝 说明</h3>
          <ul>
            <li>删除后该账户的所有数据将被清除</li>
            <li>此操作不可恢复</li>
            <li>请确保您已备份重要数据</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-account-container {
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
  color: #ff5252;
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

.dialog-wrapper {
  display: flex;
  justify-content: center;
}

.dialog-card {
  width: 100%;
  background: #2b2b43;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border-left: 4px solid #ff5252;
}

.warning-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  color: #ff5252;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 20px;
}

.warning-message {
  background: #1e222d;
  border-left: 3px solid #ff5252;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.warning-message p {
  color: #d1d4dc;
  margin: 8px 0;
  font-size: 14px;
}

.warning-message strong {
  color: #ff5252;
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

.confirmation-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #1e222d;
  border-radius: 4px;
}

.confirmation-text {
  color: #d1d4dc;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.confirmation-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #485c7b;
  border-radius: 6px;
  background: #2b2b43;
  color: #d1d4dc;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.confirmation-input:focus {
  outline: none;
  border-color: #ff5252;
}

.confirmation-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.cancel-btn,
.delete-btn {
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

.delete-btn {
  background: #ff5252;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #e04545;
}

.cancel-btn:disabled,
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-box {
  padding: 15px;
  background: #1e222d;
  border-radius: 6px;
  border-left: 3px solid #ff5252;
}

.info-box h3 {
  color: #ff5252;
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

