# Home.vue 功能更新总结

## 更新日期
2025-11-13

## 更新内容

### 1. 在 user-info 卡片中添加持仓信息

#### 新增功能
- 调用 `/alphanow-admin/api/trade/position` 接口获取用户持仓数据
- 在用户信息卡片中显示当前持仓列表
- 显示持仓详细信息：交易对、方向（多/空）、数量、均价、浮动盈亏

#### 实现细节
- 新增 `positionData` 响应式变量存储持仓数据
- 新增 `fetchPositionData()` 函数获取持仓信息
- 在 `onMounted` 生命周期中自动加载持仓数据
- 持仓信息以卡片形式展示，盈利显示绿色，亏损显示红色

#### UI 展示
```
📊 当前持仓
┌─────────────────────────────────────┐
│ BTCUSDT  多  数量: 0.1  均价: 95000 │
│ 盈亏: +500                          │
└─────────────────────────────────────┘
```

---

### 2. 在 chart-wrapper 下方添加平仓功能

#### 新增功能
- 一键平仓操作区域
- 交易对选择器（BTC, ETH, SOL, BNB, HYPE, XRP）
- 方向选择器（多/空）
- 平仓按钮

#### 实现细节
- 新增 `selectedSymbol` 和 `selectedSide` 响应式变量
- 新增 `handleClosePosition()` 函数调用平仓接口
- 调用 `/alphanow-admin/api/trade/closePosition` 接口
- 平仓成功后自动刷新持仓和平仓历史数据
- 添加确认对话框防止误操作

#### 交易对选项
- BTCUSDT (BTC)
- ETHUSDT (ETH)
- SOLUSDT (SOL)
- BNBUSDT (BNB)
- HYPEUSDT (HYPE)
- XRPUSDT (XRP)

---

### 3. 平仓历史列表

#### 新增功能
- 显示平仓历史记录
- 分页功能
- 刷新按钮
- 详细的平仓信息展示

#### 实现细节
- 新增 `closePnlList`、`closePnlTotal`、`closePnlPage`、`closePnlPageSize` 响应式变量
- 新增 `fetchClosePnlList()` 函数获取平仓历史
- 调用 `/alphanow-admin/api/trade/close/list` 接口
- 新增 `handlePageChange()` 函数处理分页
- 新增 `formatTime()` 函数格式化时间戳

#### 显示字段
- 交易对
- 方向（多/空）
- 平仓数量
- 入场价
- 平仓价
- 盈亏（带颜色标识）
- 杠杆倍数
- 时间

#### 表格样式
- 响应式设计，支持移动端
- 盈利显示绿色，亏损显示红色
- 鼠标悬停高亮行
- 分页控制

---

## 新增的响应式变量

```javascript
const positionData = ref([])           // 持仓数据
const closePnlList = ref([])          // 平仓历史列表
const closePnlTotal = ref(0)          // 平仓历史总数
const closePnlPage = ref(1)           // 平仓历史页码
const closePnlPageSize = ref(10)      // 平仓历史每页数量
const selectedSymbol = ref('BTCUSDT') // 选中的交易对
const selectedSide = ref('Buy')       // 选中的方向
const loadingPosition = ref(false)    // 持仓加载状态
const loadingClosePnl = ref(false)    // 平仓历史加载状态
const loadingClose = ref(false)       // 平仓操作加载状态
```

## 新增的常量

```javascript
// 交易对选项
const symbolOptions = [
  { value: 'BTCUSDT', label: 'BTC' },
  { value: 'ETHUSDT', label: 'ETH' },
  { value: 'SOLUSDT', label: 'SOL' },
  { value: 'BNBUSDT', label: 'BNB' },
  { value: 'HYPEUSDT', label: 'HYPE' },
  { value: 'XRPUSDT', label: 'XRP' }
]

// 方向选项
const sideOptions = [
  { value: 'Buy', label: '多' },
  { value: 'Sell', label: '空' }
]
```

## 新增的函数

### 1. fetchPositionData()
获取持仓信息
- 接口: `/alphanow-admin/api/trade/position`
- 方法: POST
- 参数:
  - accountId: userInfo.id (登录时返回的用户ID)
  - apiKey: '' (空字符串)
  - exchange: 'BYBIT'
  - userId: userInfo.id (登录时返回的用户ID)

### 2. fetchClosePnlList()
获取平仓历史列表
- 接口: `/alphanow-admin/api/trade/close/list`
- 方法: POST
- 参数:
  - page: 当前页码
  - pageSize: 每页数量 (10)
  - param:
    - accountId: userInfo.id (登录时返回的用户ID)
    - exchange: 'BYBIT'
    - side: 选中的方向 (Buy/Sell)
    - symbol: 选中的交易对

### 3. handleClosePosition()
一键平仓
- 接口: `/alphanow-admin/api/trade/closePosition`
- 方法: POST
- 参数: symbol, closeSide
- 包含确认对话框
- 成功后刷新持仓和历史数据

### 4. handlePageChange(page)
处理分页切换
- 更新当前页码
- 重新获取平仓历史数据

### 5. formatTime(timestamp)
格式化时间戳
- 输入: 毫秒时间戳
- 输出: "YYYY-MM-DD HH:mm" 格式

---

## 样式更新

### 1. 用户信息卡片样式
- 改为垂直布局以容纳持仓信息
- 新增持仓信息区域样式
- 盈亏颜色标识（绿色/红色）

### 2. 平仓操作区域样式
- 橙色背景突出显示
- 响应式布局
- 红色平仓按钮

### 3. 平仓历史表格样式
- 完整的表格样式
- 响应式设计
- 分页控制样式
- 移动端优化

### 4. 响应式适配
- 平板设备 (768px - 1024px)
- 手机设备 (< 768px)
- 超小屏幕 (< 480px)

---

## 使用说明

### 查看持仓
1. 登录后自动加载持仓信息
2. 持仓信息显示在用户信息卡片中
3. 如果没有持仓，显示"暂无持仓"

### 一键平仓
1. 在"一键平仓"区域选择交易对
2. 选择方向（多/空）
3. 点击"立即平仓"按钮
4. 确认对话框中点击"确定"
5. 等待平仓完成

### 查看平仓历史
1. 平仓历史自动加载
2. 点击"刷新"按钮可手动刷新
3. 使用"上一页"/"下一页"按钮翻页
4. 每页显示 10 条记录

---

## 注意事项

1. **API 依赖**: 所有功能依赖后端 API 正常运行
2. **用户信息**:
   - 登录时保存的 `userInfo.id` 用作 `accountId` 和 `userId`
   - 登录接口返回: `{ id, username, equity, token }`
   - 持仓和平仓接口都使用 `userInfo.id` 作为账户标识
3. **错误处理**: 所有 API 调用都包含错误处理
4. **确认对话框**: 平仓操作有确认对话框防止误操作
5. **自动刷新**: 平仓成功后自动刷新持仓和历史数据

---

## 测试建议

1. 测试持仓信息显示
2. 测试平仓功能（选择不同交易对和方向）
3. 测试平仓历史列表和分页
4. 测试响应式布局（不同屏幕尺寸）
5. 测试错误处理（网络错误、API 错误等）

---

## 后续优化建议

1. 添加持仓信息的自动刷新
2. 添加平仓历史的筛选功能
3. 添加导出平仓历史功能
4. 添加更详细的错误提示
5. 添加加载动画
6. 添加平仓成功/失败的通知提示

---

## 重要修复记录

### 2025-11-13 - accountId 逻辑修复

**问题**:
- 初始实现中使用了 `userInfo.accountId` 和 `userInfo.userId`，但这些字段在登录时并未保存

**原因**:
- Login.vue 中登录成功后只保存了 `{ id, username, equity }`
- 登录接口返回的 `id` 就是需要传递给持仓和平仓接口的 `accountId`

**解决方案**:
- 修改 `fetchPositionData()` 使用 `userInfo.id` 作为 `accountId` 和 `userId`
- 修改 `fetchClosePnlList()` 使用 `userInfo.id` 作为 `accountId`

**修改位置**:
```javascript
// 修改前
accountId: userInfo.value.accountId || 0,
userId: userInfo.value.userId || 0

// 修改后
accountId: userInfo.value.id || 0,
userId: userInfo.value.id || 0
```

**影响范围**:
- `fetchPositionData()` 函数
- `fetchClosePnlList()` 函数

**测试要点**:
- 登录后检查持仓信息是否正确显示
- 检查平仓历史列表是否正确加载
- 验证 API 请求中的 accountId 参数是否正确

