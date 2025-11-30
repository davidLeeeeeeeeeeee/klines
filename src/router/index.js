import { createRouter, createWebHashHistory } from 'vue-router'
import { isAuthenticated } from '../utils/auth'

// 导入组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import AccountList from '../components/AccountList.vue'
import CreateAccount from '../components/CreateAccount.vue'
import SubAccountDetail from '../components/SubAccountDetail.vue'
import DeleteAccount from '../components/DeleteAccount.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'AccountList',
    component: AccountList,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-account',
    name: 'CreateAccount',
    component: CreateAccount,
    meta: { requiresAuth: true }
  },
  {
    path: '/account/:id',
    name: 'SubAccountDetail',
    component: SubAccountDetail,
    props: route => ({
      accountId: parseInt(route.params.id)
    }),
    meta: { requiresAuth: true }
  },
  {
    path: '/delete-account/:id',
    name: 'DeleteAccount',
    component: DeleteAccount,
    props: route => ({
      accountId: parseInt(route.params.id)
    }),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !authenticated) {
    // 需要认证但未登录，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && authenticated) {
    // 已登录但访问登录页，重定向到首页
    next('/home')
  } else {
    next()
  }
})

export default router

