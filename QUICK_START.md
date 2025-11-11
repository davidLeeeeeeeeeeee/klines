# 快速开始指南

## 项目已完成的重构

### 📋 主要改动

1. **Home.vue 重构**
   - 从 `/alphanow-admin/api/account/history/line` 改为 `/alphanow-admin/api/user/history/line`
   - 展示用户总体历史净值曲线而非单个账户
   - 添加"管理子账户"按钮

2. **新增5个功能组件**
   - `AccountList.vue` - 子账户列表管理
   - `CreateAccount.vue` - 新建子账户
   - `SubAccountDetail.vue` - 子账户详情页
   - `DeleteAccount.vue` - 删除子账户确认
   - `router/index.js` - 路由配置

3. **路由系统**
   - 使用 Vue Router 4 实现页面导航
   - 自动路由守卫（认证检查）
   - 清晰的导航流程

## 🚀 快速启动

```bash
# 安装依赖（已完成）
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 📱 页面导航

```
登录 (/login)
  ↓
首页 (/home) - 用户总体净值曲线
  ↓
子账户列表 (/accounts)
  ├→ 新建子账户 (/create-account)
  ├→ 查看详情 (/account/:id)
  └→ 删除账户 (/delete-account/:id)
```

## 🔌 API 接口对应

| 页面 | 接口 | 方法 |
|------|------|------|
| Home | `/alphanow-admin/api/user/history/line` | POST |
| AccountList | `/alphanow-admin/api/account/list` | POST |
| CreateAccount | `/alphanow-admin/api/account/create` | POST |
| SubAccountDetail | `/alphanow-admin/api/account/history/line` | POST |
| DeleteAccount | `/alphanow-admin/api/account/remove` | POST |

## 📝 关键特性

✅ **功能分离** - 每个功能独立组件
✅ **路由导航** - Vue Router 4 实现
✅ **认证守卫** - 自动登录检查
✅ **错误处理** - 完善的异常提示
✅ **响应式设计** - 支持多种屏幕
✅ **图表交互** - Lightweight Charts 支持

## 🛠️ 文件结构

```
src/
├── components/
│   ├── Home.vue              ✨ 重构
│   ├── Login.vue             ✨ 更新
│   ├── AccountList.vue       ✨ 新增
│   ├── CreateAccount.vue     ✨ 新增
│   ├── SubAccountDetail.vue  ✨ 新增
│   └── DeleteAccount.vue     ✨ 新增
├── router/
│   └── index.js              ✨ 新增
├── utils/
│   ├── auth.js               (无变化)
│   └── request.js            (无变化)
├── App.vue                   ✨ 更新
└── main.js                   ✨ 更新
```

## 🔐 认证流程

1. 用户访问任何页面
2. 路由守卫检查 localStorage 中的 token
3. 无 token → 重定向到 `/login`
4. 有 token → 允许访问
5. 登出时清除 token 并重定向到 `/login`

## 💡 使用示例

### 查看用户总体净值
```
访问 http://localhost:5173/home
```

### 管理子账户
```
点击"管理子账户"按钮
或直接访问 http://localhost:5173/accounts
```

### 查看特定子账户
```
在账户列表中点击"查看"
或直接访问 http://localhost:5173/account/123
```

### 删除子账户
```
在账户列表中点击"删除"
或直接访问 http://localhost:5173/delete-account/123
```

## ⚙️ 配置

### API 基础 URL
文件：`src/utils/request.js`
```javascript
const API_BASE_URL = 'http://170.75.168.24:8755'
```

### 认证 Token 存储
- 存储位置：`localStorage`
- Token 键：`alphanow_token`
- 用户信息键：`alphanow_user_info`

## 🐛 常见问题

**Q: 如何修改 API 地址？**
A: 编辑 `src/utils/request.js` 中的 `API_BASE_URL`

**Q: 如何添加新的路由？**
A: 编辑 `src/router/index.js`，添加新的路由配置

**Q: 如何修改认证逻辑？**
A: 编辑 `src/utils/auth.js` 中的认证函数

**Q: 如何自定义样式？**
A: 编辑各组件的 `<style scoped>` 部分

## 📚 相关文档

- `README.md` - API 文档
- `IMPLEMENTATION_GUIDE.md` - 详细实现指南
- `QUICK_START.md` - 本文件

## ✨ 下一步

1. 测试所有功能
2. 根据需要调整样式
3. 添加更多功能（如导出、统计等）
4. 部署到生产环境

