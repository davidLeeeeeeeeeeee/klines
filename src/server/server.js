require('dotenv').config();
const express = require('express');
const { executeOrder } = require('./bybitClient');

const app = express();
app.use(express.json());

const PORT =  3000;

// 交易信号映射
const signalMapping = {
    'ENTER_LONG': { side: 'Buy', reduceOnly: false },//开多
    'ENTER_SHORT': { side: 'Sell', reduceOnly: false },//开空
    'EXIT_LONG': { side: 'Sell', reduceOnly: true },//平多
    'EXIT_SHORT': { side: 'Buy', reduceOnly: true }//平空
};

app.post('/webhook', async (req, res) => {
    try {
        const { symbol, side, qty, price, takeProfit, stopLoss } = req.body;

        // 验证必需参数
        if (!symbol || !side) {
            return res.status(400).json({
                success: false,
                error: '缺少必需参数: symbol, side'
            });
        }

        // 检查信号类型
        if (!signalMapping[side]) {
            return res.status(400).json({
                success: false,
                error: `不支持的信号类型: ${side}`
            });
        }

        // 执行订单
        const orderParams = signalMapping[side];

        // 如果是平仓操作（reduceOnly=true），使用极大值确保完全平仓
        let orderQty = qty;
        let orderPrice = price;

        if (orderParams.reduceOnly) {
            orderQty = "999999"; // 使用极大值，确保完全平仓
            // 平仓时如果没有指定价格，使用市价单（price='0'）
            if (!orderPrice) {
                orderPrice = '0';
                console.log(`平仓操作: 使用市价单快速平仓`);
            }
            console.log(`平仓操作: 使用极大值 qty=${orderQty} 确保完全平仓`);
        } else if (!qty) {
            // 开仓操作必须提供 qty
            return res.status(400).json({
                success: false,
                error: '开仓操作缺少必需参数: qty'
            });
        }

        const result = await executeOrder({
            symbol,
            side: orderParams.side,
            qty: orderQty,
            price: orderPrice, // 传递价格参数，如果有则下限价单，否则下市价单
            reduceOnly: orderParams.reduceOnly,
            takeProfit,
            stopLoss
        });

        const finalOrderType = (!orderPrice || orderPrice === '0') ? 'Market' : 'Limit';

        res.json({
            success: true,
            data: result,
            signal: side,
            orderType: finalOrderType, // 返回订单类型
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('订单执行失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`服务运行在端口 ${PORT}`);
    console.log(`接收Webhook: POST http://localhost:${PORT}/webhook`);
});
