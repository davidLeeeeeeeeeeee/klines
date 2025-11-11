<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '../utils/request'
import { setToken, setUserInfo } from '../utils/auth'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

// 登录函数
const handleLogin = async () => {
  // 验证输入
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await post('/alphanow-admin/api/user/login', {
      username: username.value,
      password: password.value
    })

    console.log('登录成功:', response)

    // 保存 token 和用户信息
    // API 返回格式: { code, success, data: { token, id, username, equity } }
    if (response.data && response.data.token) {
      setToken(response.data.token)
      setUserInfo({
        id: response.data.id,
        username: response.data.username,
        equity: response.data.equity
      })

      // 登录成功，导航到首页
      router.push('/home')
    } else {
      throw new Error('登录响应中没有 token')
    }
  } catch (err) {
    console.error('登录失败:', err)
    error.value = err.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}

// 回车登录
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">📊 账户净值系统</h1>
      <p class="login-subtitle">请登录以查看您的账户信息</p>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="请输入用户名"
          @keypress="handleKeyPress"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="请输入密码"
          @keypress="handleKeyPress"
          :disabled="loading"
        />
      </div>

      <button
        class="login-btn"
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div class="login-tips">
        <p>💡 提示：登录后可以查看账户历史净值曲线</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.login-title {
  color: #1976d2;
  font-size: 28px;
  margin: 0 0 10px 0;
  text-align: center;
  font-weight: 600;
}

.login-subtitle {
  color: #666666;
  font-size: 14px;
  text-align: center;
  margin: 0 0 30px 0;
  opacity: 0.8;
}

.error-message {
  padding: 12px;
  margin-bottom: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  border-left: 4px solid #d32f2f;
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

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.form-group input::placeholder {
  color: #999999;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #1565c0;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.login-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.login-tips {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.login-tips p {
  color: #666666;
  font-size: 13px;
  text-align: center;
  margin: 0;
  opacity: 0.8;
}

/* 手机设备响应式 */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }

  .form-group input {
    font-size: 16px; /* 防止 iOS 自动放大 */
  }
}
</style>

