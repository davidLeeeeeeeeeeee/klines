# 项目重构实现指南

## 概述

根据README.md中的API文档，已完成以下重构：

### 1. 核心变更

#### Home.vue - 用户历史净值曲线
- **原逻辑**：调用 `/alphanow-admin/api/account/history/line` 展示特定账户的历史曲线
- **新逻辑**：调用 `/alphanow-admin/api/user/history/line` 展示用户总体历史曲线
- **参数变更**：
  - 移除 `accountId` 参数
  - 添加 `exchange` 参数（可选，默认BYBIT）
  - 保留 `startTime` 和 `endTime` 参数
- **功能**：展示用户所有子账户的总体净值曲线，并提供"管理子账户"按钮

### 2. 新增组件

#### AccountList.vue - 子账户列表管理
- **接口**：`POST /alphanow-admin/api/account/list`
- **功能**：
  - 展示用户所有子账户列表
  - 支持按状态筛选（全部/未初始化/已初始化）
  - 支持多种排序方式（时间倒序/净值倒序/净值升序）
  - 分页显示
  - 快速操作：查看详情、删除账户
  - 新建子账户按钮

#### CreateAccount.vue - 新建子账户
- **接口**：`POST /alphanow-admin/api/account/create`
- **功能**：
  - 表单输入：API Key、API Secret、API Passphrase、交易所
  - 创建成功后自动返回账户列表
  - 表单验证和错误提示

#### SubAccountDetail.vue - 子账户详情页
- **接口**：`POST /alphanow-admin/api/account/history/line`
- **功能**：
  - 展示特定子账户的历史净值曲线
  - 支持自定义时间范围
  - 与Home.vue类似的图表交互功能
  - 返回账户列表按钮

#### DeleteAccount.vue - 删除子账户
- **接口**：`POST /alphanow-admin/api/account/remove?id={accountId}`
- **功能**：
  - 删除确认对话框
  - 需要输入"确认删除"文本确认
  - 删除成功后返回账户列表
  - 安全提示信息

### 3. 路由系统

#### 路由配置 (src/router/index.js)
```
/login              - 登录页面
/home               - 用户历史净值曲线（首页）
/accounts           - 子账户列表
/create-account     - 新建子账户
/account/:id        - 子账户详情
/delete-account/:id - 删除子账户
```

#### 路由守卫
- 未登录用户自动重定向到登录页
- 已登录用户访问登录页自动重定向到首页
- 所有页面（除登录页）都需要认证

### 4. 文件结构

```
src/
├── components/
│   ├── Home.vue              # 用户历史净值曲线
│   ├── Login.vue             # 登录页面
│   ├── AccountList.vue       # 子账户列表
│   ├── CreateAccount.vue     # 新建子账户
│   ├── SubAccountDetail.vue  # 子账户详情
│   └── DeleteAccount.vue     # 删除子账户
├── router/
│   └── index.js              # 路由配置
├── utils/
│   ├── auth.js               # 认证工具
│   └── request.js            # HTTP请求工具
├── App.vue                   # 根组件（使用router-view）
└── main.js                   # 应用入口（集成路由）
```

### 5. 使用流程

1. **用户登录**
   - 访问 `/login`
   - 输入用户名和密码
   - 登录成功后自动跳转到 `/home`

2. **查看用户总体净值**
   - 在 `/home` 页面查看用户所有子账户的总体历史净值曲线
   - 可选择交易所和时间范围
   - 点击"管理子账户"按钮进入账户列表

3. **管理子账户**
   - 在 `/accounts` 页面查看所有子账户
   - 支持筛选和排序
   - 点击"新建子账户"创建新账户
   - 点击"查看"查看特定账户的历史净值曲线
   - 点击"删除"删除账户

4. **查看子账户详情**
   - 在 `/account/:id` 页面查看特定子账户的历史净值曲线
   - 可自定义时间范围
   - 点击"返回列表"回到账户列表

5. **删除子账户**
   - 在 `/delete-account/:id` 页面确认删除
   - 需要输入"确认删除"文本确认
   - 删除成功后返回账户列表

### 6. 关键改进

- ✅ 功能分离：每个功能独立为一个Vue组件
- ✅ 路由导航：使用Vue Router实现页面间导航
- ✅ 接口对应：每个组件对应相应的API接口
- ✅ 用户体验：清晰的导航流程和操作提示
- ✅ 错误处理：完善的错误提示和异常处理
- ✅ 响应式设计：支持不同屏幕尺寸

### 7. 依赖项

- vue@^3.5.22
- vue-router@^4
- lightweight-charts@^5.0.9

### 8. 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 9. 注意事项

- 所有API请求都会自动添加 `alphatoken` 请求头（从localStorage获取）
- 未授权错误会自动触发登出并重定向到登录页
- 时间格式：`yyyy-MM-dd HH:mm:ss`
- 日期格式：`yyyy-MM-dd`

