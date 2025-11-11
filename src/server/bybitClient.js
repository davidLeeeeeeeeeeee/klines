const { RestClientV5 } = require('bybit-api');

// 从环境变量读取配置
const client = new RestClientV5({
    testnet: process.env.BYBIT_TESTNET === 'true',
    key: 'APJWtTOwYbWYqdNPNf',
    secret: 'BoDzOVXYXBpvo1kvpLSmGb847RJOgesCSvGu',
    recv_window: 200000, // 增加时间窗口到200秒，允许更大的时间偏差
    enable_time_sync: true, // 启用时间同步，自动对齐服务器时间
    syncTimeBeforePrivateRequests: true, // 每次私有请求前同步一次时间，尽量避免时间漂移
});

/**
 * 获取当前持仓信息
 * @param {string} symbol - 交易对 (如: BTCUSDT)
 * @returns {Object} 持仓信息，包含 size (持仓数量) 和 side (持仓方向)
 */
async function getPosition(symbol) {
    try {
        await client.syncTime(true);

        const response = await client.getPositionInfo({
            category: 'linear',
            symbol: symbol
        });

        if (response.retCode === 0 && response.result.list.length > 0) {
            const position = response.result.list[0];
            const size = Math.abs(parseFloat(position.size));
            const positionSide = parseFloat(position.size) > 0 ? 'long' : 'short';

            console.log(`当前持仓 ${symbol}: 方向=${positionSide}, 数量=${size}`);

            return {
                size: size.toString(),
                side: positionSide,
                hasPosition: size > 0
            };
        }

        console.log(`${symbol} 当前无持仓`);
        return {
            size: '0',
            side: null,
            hasPosition: false
        };
    } catch (error) {
        console.error('查询持仓失败:', error);
        throw error;
    }
}

/**
 * 执行Bybit订单
 * @param {Object} params - 订单参数
 * @param {string} params.symbol - 交易对 (如: BTCUSDT)
 * @param {string} params.side - Buy 或 Sell
 * @param {string} params.qty - 数量
 * @param {string} params.price - 限价单价格 (可选，如果提供则下限价单，否则下市价单)
 * @param {boolean} params.reduceOnly - 是否只减仓
 * @param {string} params.takeProfit - 止盈价格
 * @param {string} params.stopLoss - 止损价格
 */
async function executeOrder({ symbol, side, qty, price, reduceOnly, takeProfit, stopLoss }) {
    try {
        // 在下单前强制进行一次时间同步，避免本机时间超前导致被拒
        try {
            await client.syncTime(true);
        } catch (e) {
            console.warn('时间同步失败，继续尝试下单（将进行自动重试）');
        }

        // 如果是平仓操作且没有指定数量，查询当前持仓并使用实际持仓数量
        let actualQty = qty;
        if (reduceOnly && (!qty || qty === '999999')) {
            console.log('平仓操作: 查询当前持仓数量...');
            const position = await getPosition(symbol);

            if (!position.hasPosition) {
                throw new Error(`${symbol} 当前无持仓，无法平仓`);
            }

            actualQty = position.size;
            console.log(`使用实际持仓数量进行平仓: ${actualQty}`);
        }

        // 根据是否有price参数决定订单类型
        // price 为 undefined、null、空字符串或 '0' 时使用市价单
        const orderType = (!price || price === '0') ? 'Market' : 'Limit';

        // 验证并修正止盈止损价格
        let finalTakeProfit = takeProfit;
        let finalStopLoss = stopLoss;

        if (takeProfit || stopLoss) {
            const orderPrice = parseFloat(price || '0');
            const tp = parseFloat(takeProfit || '0');
            const sl = parseFloat(stopLoss || '0');

            // 做空（Sell）：价格下跌赚钱
            if (side === 'Sell') {
                // 止盈应该低于开仓价，止损应该高于开仓价
                if (tp > 0 && orderPrice > 0 && tp > orderPrice) {
                    console.warn(`⚠️  做空订单止盈价格错误: ${tp} > ${orderPrice}，止盈价应该低于开仓价`);
                    console.warn(`   建议：如果想在价格跌到 ${tp} 时止盈，请将止盈价设为低于 ${orderPrice} 的值`);
                    // 不自动修正，让用户知道错误
                    finalTakeProfit = undefined;
                }
                if (sl > 0 && orderPrice > 0 && sl < orderPrice) {
                    console.warn(`⚠️  做空订单止损价格错误: ${sl} < ${orderPrice}，止损价应该高于开仓价`);
                    console.warn(`   建议：如果想在价格涨到 ${sl} 时止损，请将止损价设为高于 ${orderPrice} 的值`);
                    // 不自动修正，让用户知道错误
                    finalStopLoss = undefined;
                }
            }
            // 做多（Buy）：价格上涨赚钱
            else if (side === 'Buy') {
                // 止盈应该高于开仓价，止损应该低于开仓价
                if (tp > 0 && orderPrice > 0 && tp < orderPrice) {
                    console.warn(`⚠️  做多订单止盈价格错误: ${tp} < ${orderPrice}，止盈价应该高于开仓价`);
                    console.warn(`   建议：如果想在价格涨到 ${tp} 时止盈，请将止盈价设为高于 ${orderPrice} 的值`);
                    finalTakeProfit = undefined;
                }
                if (sl > 0 && orderPrice > 0 && sl > orderPrice) {
                    console.warn(`⚠️  做多订单止损价格错误: ${sl} > ${orderPrice}，止损价应该低于开仓价`);
                    console.warn(`   建议：如果想在价格跌到 ${sl} 时止损，请将止损价设为低于 ${orderPrice} 的值`);
                    finalStopLoss = undefined;
                }
            }
        }

        const orderParams = {
            category: 'linear', // 永续合约
            symbol: symbol,
            side: side,
            orderType: orderType,
            qty: actualQty.toString(),
            reduceOnly: reduceOnly,
            takeProfit: finalTakeProfit,
            stopLoss: finalStopLoss,
        };

        // 如果是限价单，添加价格参数
        if (orderType === 'Limit' && price) {
            orderParams.price = price.toString();
        }

        console.log('提交订单:', orderParams);

        let response = await client.submitOrder(orderParams);

        // 如果遇到时间窗/时间戳错误，进行一次重试：重新同步时间并加入微小负偏移
        if (response.retCode !== 0 && /timestamp|recv_window|recvWindow/i.test(response.retMsg || '')) {
            console.warn('检测到时间相关错误，正在重新同步时间并重试...');
            try {
                await client.syncTime(true);
                // 保险起见，给时间戳加入 -1000ms 的微小负偏移，避免“本机时间超前”
                client.timeOffset = (client.timeOffset || 0) - 1000;
            } catch {}

            response = await client.submitOrder(orderParams);
        }

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
    executeOrder,
    getPosition
};
