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
* {
  box-sizing: border-box;
}

.account-list-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .account-list-container {
    max-width: 100%;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .account-list-container {
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
  font-size: 28px;
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

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #e0e0e0;
}

.back-btn,
.create-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.back-btn {
  background: #757575;
  color: white;
}

.back-btn:hover {
  background: #616161;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.create-btn {
  background: #388e3c;
  color: white;
}

.create-btn:hover {
  background: #2e7d32;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group,
.sort-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label,
.sort-group label {
  color: #555555;
  font-size: 14px;
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #ffffff;
  color: #333333;
  font-size: 14px;
  transition: border-color 0.3s;
}

.filter-group select:focus {
  outline: none;
  border-color: #1976d2;
}

.sort-btn {
  padding: 8px 12px;
  background: #e0e0e0;
  color: #333333;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  font-weight: 500;
}

.sort-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.sort-btn:hover {
  background: #d0d0d0;
}

.sort-btn.active:hover {
  background: #1565c0;
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

.loading {
  text-align: center;
  padding: 40px;
  color: #666666;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
  font-size: 16px;
}

.accounts-table {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: #333333;
}

thead {
  background: #f5f5f5;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  color: #555555;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.api-key {
  font-family: monospace;
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666666;
}

.equity {
  color: #388e3c;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #ffebee;
  color: #c62828;
  font-weight: 500;
}

.status-badge.initialized {
  background: #e8f5e9;
  color: #2e7d32;
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
  transition: all 0.3s;
  font-weight: 500;
}

.view-btn {
  background: #1976d2;
  color: white;
}

.view-btn:hover {
  background: #1565c0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-btn {
  background: #d32f2f;
  color: white;
}

.delete-btn:hover {
  background: #b71c1c;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.page-btn {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background: #1565c0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.page-info {
  color: #666666;
  font-size: 14px;
  font-weight: 500;
}

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
  .account-list-container {
    padding: 16px;
  }

  h1 {
    font-size: 24px;
  }

  .controls {
    padding: 12px;
    gap: 10px;
  }

  .back-btn,
  .create-btn {
    flex: 1 1 calc(50% - 5px);
    min-width: 100px;
  }

  .filter-group,
  .sort-group {
    flex: 1 1 100%;
  }

  .sort-btn {
    flex: 1;
  }
}

/* 手机设备 (小于 768px) */
@media (max-width: 768px) {
  .account-list-container {
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

  .controls {
    flex-direction: column;
    padding: 12px;
    gap: 10px;
  }

  .back-btn,
  .create-btn {
    width: 100%;
    flex: none;
  }

  .filter-group,
  .sort-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .filter-group label,
  .sort-group label {
    width: 100%;
  }

  .filter-group select {
    width: 100%;
  }

  .sort-group {
    flex-wrap: wrap;
  }

  .sort-btn {
    flex: 1 1 calc(33.33% - 5px);
    min-width: 80px;
  }

  /* 表格响应式 */
  .accounts-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -12px;
    width: calc(100% + 24px);
    border-radius: 0;
    border: none;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }

  table {
    min-width: 500px;
    width: 100%;
  }

  th,
  td {
    padding: 10px 8px;
    font-size: 12px;
    white-space: nowrap;
  }

  .api-key {
    max-width: 80px;
    font-size: 10px;
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 4px;
    white-space: nowrap;
  }

  .action-btn {
    padding: 6px 8px;
    font-size: 10px;
    flex-shrink: 0;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  .page-btn {
    width: 100%;
    padding: 10px;
  }

  .page-info {
    width: 100%;
    text-align: center;
  }
}

/* 超小屏幕 (小于 480px) */
@media (max-width: 480px) {
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

  .sort-btn {
    flex: 1 1 calc(50% - 4px);
    min-width: 60px;
    font-size: 12px;
  }

  .accounts-table {
    margin: 0 -8px;
    width: calc(100% + 16px);
  }

  table {
    min-width: 450px;
  }

  th,
  td {
    padding: 8px 6px;
    font-size: 11px;
  }

  .api-key {
    max-width: 60px;
    font-size: 9px;
  }

  .action-btn {
    padding: 5px 6px;
    font-size: 9px;
  }
}
</style>

