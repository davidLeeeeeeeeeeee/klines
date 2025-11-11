<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '../utils/request'
import { getUserInfo, clearAuth } from '../utils/auth'

const router = useRouter()

const accounts = ref([])
const loading = ref(false)
const error = ref(null)
const userInfo = ref(null)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const sortType = ref(0) // 0=时间倒序，1=净值倒序，2=净值升序
const initFilter = ref('') // 空=全部，0=未初始化，1=已初始化

// 获取账户列表
const fetchAccounts = async () => {
  loading.value = true
  error.value = null

  try {
    const requestData = {
      page: page.value,
      pageSize: pageSize.value,
      param: {
        sortType: sortType.value,
        init: initFilter.value ? parseInt(initFilter.value) : ''
      }
    }

    console.log('请求账户列表:', requestData)
    const data = await post('/alphanow-admin/api/account/list', requestData)
    console.log('接收到的账户列表:', data)

    if (data.data && data.data.records) {
      accounts.value = data.data.records
      total.value = data.data.total
    }
  } catch (err) {
    console.error('获取账户列表失败:', err)
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

// 返回首页
const goHome = () => {
  router.push('/home')
}

// 查看账户详情
const viewAccountDetail = (accountId) => {
  router.push(`/account/${accountId}`)
}

// 删除账户
const deleteAccount = (accountId) => {
  router.push(`/delete-account/${accountId}`)
}

// 新建账户
const createNewAccount = () => {
  router.push('/create-account')
}

// 分页处理
const goToPage = (newPage) => {
  page.value = newPage
  fetchAccounts()
}

// 改变排序
const changeSortType = (type) => {
  sortType.value = type
  page.value = 1
  fetchAccounts()
}

onMounted(() => {
  userInfo.value = getUserInfo()
  fetchAccounts()
})
</script>

<template>
  <div class="account-list-container">
    <div class="header">
      <h1>📋 子账户管理</h1>
      <div class="user-info" v-if="userInfo">
        <span class="username">👤 {{ userInfo.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="controls">
      <button @click="goHome" class="back-btn">← 返回首页</button>
      <button @click="createNewAccount" class="create-btn">➕ 新建子账户</button>
      
      <div class="filter-group">
        <label>状态:</label>
        <select v-model="initFilter" @change="() => { page = 1; fetchAccounts() }">
          <option value="">全部</option>
          <option value="0">未初始化</option>
          <option value="1">已初始化</option>
        </select>
      </div>

      <div class="sort-group">
        <label>排序:</label>
        <button 
          :class="{ active: sortType === 0 }" 
          @click="changeSortType(0)"
          class="sort-btn"
        >
          时间倒序
        </button>
        <button 
          :class="{ active: sortType === 1 }" 
          @click="changeSortType(1)"
          class="sort-btn"
        >
          净值倒序
        </button>
        <button 
          :class="{ active: sortType === 2 }" 
          @click="changeSortType(2)"
          class="sort-btn"
        >
          净值升序
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="accounts.length === 0" class="empty-state">
      <p>暂无子账户，请创建一个新的子账户</p>
    </div>

    <div v-else class="accounts-table">
      <table>
        <thead>
          <tr>
            <th>账户ID</th>
            <th>API Key</th>
            <th>交易所</th>
            <th>净值</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
            <td>{{ account.id }}</td>
            <td class="api-key">{{ account.apiKey }}</td>
            <td>{{ account.exchange }}</td>
            <td class="equity">{{ account.equity }}</td>
            <td>
              <span :class="{ 'status-badge': true, 'initialized': account.init === 1 }">
                {{ account.init === 1 ? '已初始化' : '未初始化' }}
              </span>
            </td>
            <td>{{ new Date(account.createTime).toLocaleDateString() }}</td>
            <td class="actions">
              <button @click="viewAccountDetail(account.id)" class="action-btn view-btn">
                查看
              </button>
              <button @click="deleteAccount(account.id)" class="action-btn delete-btn">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="accounts.length > 0" class="pagination">
      <button 
        @click="goToPage(page - 1)" 
        :disabled="page === 1"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">第 {{ page }} 页，共 {{ Math.ceil(total / pageSize) }} 页</span>
      <button 
        @click="goToPage(page + 1)" 
        :disabled="page >= Math.ceil(total / pageSize)"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.account-list-container {
  width: 100%;
  max-width: 1400px;
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
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #2b2b43;
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.back-btn,
.create-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.back-btn {
  background: #485c7b;
  color: white;
}

.back-btn:hover {
  background: #5a6f8f;
}

.create-btn {
  background: #42b983;
  color: white;
}

.create-btn:hover {
  background: #35a372;
}

.filter-group,
.sort-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label,
.sort-group label {
  color: #d1d4dc;
  font-size: 14px;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid #485c7b;
  border-radius: 4px;
  background: #1e222d;
  color: #d1d4dc;
  font-size: 14px;
}

.sort-btn {
  padding: 6px 12px;
  background: #485c7b;
  color: #d1d4dc;
  border: 1px solid #485c7b;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.sort-btn.active {
  background: #2962FF;
  color: white;
  border-color: #2962FF;
}

.sort-btn:hover {
  background: #5a6f8f;
}

.error-message {
  padding: 12px;
  margin-bottom: 15px;
  background: #ff5252;
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #d1d4dc;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #d1d4dc;
  font-size: 16px;
}

.accounts-table {
  overflow-x: auto;
  background: #2b2b43;
  border-radius: 8px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: #d1d4dc;
}

thead {
  background: #1e222d;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #485c7b;
}

td {
  padding: 12px;
  border-bottom: 1px solid #485c7b;
}

.api-key {
  font-family: monospace;
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equity {
  color: #42b983;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #ff5252;
  color: white;
}

.status-badge.initialized {
  background: #42b983;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.view-btn {
  background: #2962FF;
  color: white;
}

.view-btn:hover {
  background: #1e4db7;
}

.delete-btn {
  background: #ff5252;
  color: white;
}

.delete-btn:hover {
  background: #e04545;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #2b2b43;
  border-radius: 8px;
}

.page-btn {
  padding: 8px 16px;
  background: #2962FF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #1e4db7;
}

.page-btn:disabled {
  background: #485c7b;
  cursor: not-allowed;
}

.page-info {
  color: #d1d4dc;
  font-size: 14px;
}
</style>

