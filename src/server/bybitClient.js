const { RestClientV5 } = require('bybit-api');

// 从环境变量读取配置
const client = new RestClientV5({
    testnet: process.env.BYBIT_TESTNET === 'true',
    key: 'APJWtTOwYbWYqdNPNf',
    secret: 'BoDzOVXYXBpvo1kvpLSmGb847RJOgesCSvGu',
    recv_window: 20000, // 增加时间窗口到20秒，允许更大的时间偏差
    enable_time_sync: true, // 启用时间同步，自动对齐服务器时间
    syncTimeBeforePrivateRequests: true, // 每次私有请求前同步一次时间，尽量避免时间漂移
});

/**
 * 执行Bybit订单
 * @param {Object} params - 订单参数
 * @param {string} params.symbol - 交易对 (如: BTCUSDT)
 * @param {string} params.side - Buy 或 Sell
 * @param {string} params.qty - 数量
 * @param {boolean} params.reduceOnly - 是否只减仓
 * @param {string} params.takeProfit - 止盈价格
 * @param {string} params.stopLoss - 止损价格
 */
async function executeOrder({ symbol, side, qty, reduceOnly,takeProfit,stopLoss }) {
    try {
        const orderParams = {
            category: 'linear', // 永续合约
            symbol: symbol,
            side: side,
            orderType: 'Market', // 市价单
            qty: qty.toString(),
            reduceOnly: reduceOnly,
            takeProfit: takeProfit,
            stopLoss: stopLoss,
        };

        console.log('提交订单:', orderParams);

        const response = await client.submitOrder(orderParams);

        if (response.retCode === 0) {
            console.log('订单成功:', response.result);
            return response.result;
        } else {
            throw new Error(`Bybit API错误: ${response.retMsg}`);
        }

    } catch (error) {
        console.error('Bybit API调用失败:', error);
        throw error;
    }
}

module.exports = {
    executeOrder
};
