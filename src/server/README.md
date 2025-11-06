POST /v5/order/create

請求參數
參數	是否必需	類型	說明
category	true	string	產品類型
linear
symbol	true	string	合約名稱
isLeverage	false	integer	是否借貸. 僅統一帳戶的現貨交易有效. 0(default): 否，則是幣幣訂單, 1: 是，則是槓桿訂單
side	true	string	Buy, Sell
orderType	true	string	訂單類型. Market, Limit
qty	true	string	訂單數量
統一帳戶
現貨: 可以通過設置marketUnit來表示市價單qty的單位, 市價買單默認是quoteCoin, 市價賣單默認是baseCoin
期貨和期權: 總是以base coin作為qty的單位
經典帳戶
現貨: 市價買單的qty總是以quote coin為單位, 其他情況下, qty都是以base coin為單位
期貨: qty總是以base coin為單位
期貨: 如果傳入qty="0"以及reduceOnly="true", 則可以平掉對應合約可達單個訂單允許的最大qty的倉位, 參照查詢可交易產品的規格信息接口裡的字段maxMktOrderQty或者maxOrderQty
marketUnit	false	string	統一帳戶現貨交易創建市價單時給入參qty指定的單位, 支持orderFilter=Order, tpslOrder 和 StopOrder
baseCoin: 比如, 買BTCUSDT, 則"qty"的單位是BTC
quoteCoin: 比如, 賣BTCUSDT, 則"qty"的單位是USDT
slippageToleranceType	false	string	市價單滑點容差類型, TickSize, Percent
不支持止盈止損、條件單
TickSize:
限制買單最高價格 = ask1 + slippageTolerance x tickSize;
限制賣單最低價格 = bid1 - slippageTolerance x tickSize
Percent:
限制買單最高價格 = ask1 x (1 + slippageTolerance x 0.01);
限制賣單最低價格 = bid1 x (1 - slippageTolerance x 0.01)
slippageTolerance	false	string	滑點容差數值
TickSize: 範圍是[1, 10000], 僅整數
Percent: 範圍是[0.01, 10], 最多2位小數
price	false	string	訂單價格.
市價單將會忽視該字段
請通過該接口確認最低價格和精度要求
如果有持倉, 確保價格優於強平價格
triggerDirection	false	integer	條件單參數. 用於辨別期望的方向.
1: 當市場價上漲到了triggerPrice時觸發條件單
2: 當市場價下跌到了triggerPrice時觸發條件單
對linear和inverse有效
orderFilter	false	string	指定訂單品種. Order: 普通單,tpslOrder: 止盈止損單,StopOrder: 條件單. 若不傳, 默認Order
僅對現貨有效
triggerPrice	false	string
對於期貨, 是條件單觸發價格參數. 若您希望市場價是要上升後觸發, 確保:
triggerPrice > 市場價格
否則, triggerPrice < 市場價格
對於現貨, 這是下止盈止損單或者條件單的觸發價格參數
triggerBy	false	string	條件單參數. 觸發價格類型. LastPrice, IndexPrice, MarkPrice
僅對linear和inverse有效
orderIv	false	string	隱含波動率. 僅option有效. 按照實際值傳入, e.g., 對於10%, 則傳入0.1. orderIv比price有更高的優先級
timeInForce	false	string	訂單執行策略
市價單，系統直接使用IOC
若不傳，默認使用GTC
positionIdx	false	integer	倉位標識, 用戶不同倉位模式. 該字段對於雙向持倉模式是必傳:
0: 單向持倉
1: 買側雙向持倉
2: 賣側雙向持倉
orderLinkId	false	string	用戶自定義訂單Id
category=option時，該參數必傳
takeProfit	false	string	止盈價格
linear & inverse: 支援統一帳戶和經典帳戶
spot: 僅支持統一帳戶, 創建限價單時, 可以附帶市價止盈止損和限價止盈止損
stopLoss	false	string	止損價格
linear & inverse: 支援統一帳戶和經典帳戶
spot: 僅支持統一帳戶, 創建限價單時, 可以附帶市價止盈止損和限價止盈止損
tpTriggerBy	false	string	觸發止盈的價格類型
MarkPrice
IndexPrice
LastPrice(默認)

僅對linear和inverse有效
slTriggerBy	false	string	觸發止損的價格類型
MarkPrice
IndexPrice
LastPrice(默認)

僅對linear和inverse有效
reduceOnly	false	boolean	什麼是只減倉? true 將這筆訂單設為只減倉
當減倉時, reduceOnly=true必傳
只減倉單的止盈止損不生效
對linear, inverse和option有效
closeOnTrigger	false	boolean	什麼是觸發後平倉委託?此選項可以確保您的止損單被用於減倉（平倉）而非加倉，並且在可用保證金不足的情況下，取消其他委託，騰出保證金以確保平倉委託的執行.
僅對linear和inverse有效
smpType	false	string	Smp執行類型. 什麼是SMP?
mmp	false	boolean	做市商保護, true 表示該訂單是做市商保護訂單. 什麼是做市商保護?
僅option有效
tpslMode	false	string	止盈止損模式
Full: 全部倉位止盈止損. 此時, tpOrderType或者slOrderType必須傳Market
Partial: 部分倉位止盈止損(下單時沒有size選項, 實際上創建tpsl訂單時, 是按照實際成交的數量來生成止盈止損). 支持創建限價止盈止損. 注意: 創建限價止盈止損時, tpslMode必傳且為Partial
僅對linear和inverse有效
tpLimitPrice	false	string	觸發止盈後轉換為限價單的價格
linear & inverse: 僅作用於當tpslMode=Partial以及tpOrderType=Limit時
統一帳戶現貨: 參數必傳當創建訂單時帶了takeProfit 和 tpOrderType=Limit
slLimitPrice	false	string	觸發止損後轉換為限價單的價格
linear & inverse: 僅作用於當tpslMode=Partial以及slOrderType=Limit時
統一帳戶現貨: 參數必傳當創建訂單時帶了stopLoss 和 slOrderType=Limit
tpOrderType	false	string	止盈觸發後的訂單類型
category="linear"或"inverse": Market(默認), Limit
對於tpslMode=Full, 僅支持tpOrderType=Market
統一帳戶現貨:
Market: 當帶了參數"takeProfit",
Limit: 當帶了參數"takeProfit" 和 "tpLimitPrice"
slOrderType	false	string	止損觸發後的訂單類型
category="linear"或"inverse": Market(默認), Limit
對於tpslMode=Full, 僅支持slOrderType=Market
統一帳戶現貨:
Market: 當帶了參數"stopLoss",
Limit: 當帶了參數"stopLoss" 和 "slLimitPrice"
bboSideType	false	string
Queue: 用orderbook 上與side同向的order price掛單
Counterparty: 用orderbook 上與side異向的order price掛單
對linear和inverse有效
bboLevel	false	string	1,2,3,4,5 對linear和inverse有效