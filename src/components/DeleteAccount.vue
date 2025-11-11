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
* {
  box-sizing: border-box;
}

.delete-account-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .delete-account-container {
    max-width: 100%;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .delete-account-container {
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
  color: #d32f2f;
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

.dialog-wrapper {
  display: flex;
  justify-content: center;
}

.dialog-card {
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  border-left: 4px solid #d32f2f;
}

.warning-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  color: #d32f2f;
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
}

.warning-message {
  background: #ffebee;
  border-left: 3px solid #d32f2f;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.warning-message p {
  color: #666666;
  margin: 8px 0;
  font-size: 14px;
}

.warning-message strong {
  color: #d32f2f;
  font-weight: 600;
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

.confirmation-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.confirmation-text {
  color: #333333;
  font-size: 14px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.confirmation-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: all 0.3s;
}

.confirmation-input:focus {
  outline: none;
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.1);
}

.confirmation-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
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

.delete-btn {
  background: #d32f2f;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #b71c1c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-btn:disabled,
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-box {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #d32f2f;
  border: 1px solid #e0e0e0;
  border-left: 3px solid #d32f2f;
}

.info-box h3 {
  color: #d32f2f;
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
  .delete-account-container {
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

  .dialog-card {
    padding: 20px;
  }

  .confirmation-input {
    font-size: 16px; /* 防止 iOS 自动放大 */
  }

  .dialog-actions {
    flex-direction: column;
    gap: 10px;
  }

  .cancel-btn,
  .delete-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .delete-account-container {
    padding: 10px;
  }

  h1 {
    font-size: 18px;
  }

  .dialog-card {
    padding: 16px;
  }

  .warning-icon {
    font-size: 40px;
  }

  h2 {
    font-size: 18px;
  }
}
</style>

