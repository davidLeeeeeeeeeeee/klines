require('dotenv').config();
const express = require('express');
const { executeOrder } = require('./bybitClient');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 交易信号映射
const signalMapping = {
    'ENTER_LONG': { side: 'Buy', reduceOnly: false },//开多
    'ENTER_SHORT': { side: 'Sell', reduceOnly: false },//开空
    'EXIT_LONG': { side: 'Sell', reduceOnly: true },//平多
    'EXIT_SHORT': { side: 'Buy', reduceOnly: true }//平空
};

app.post('/webhook', async (req, res) => {
    try {
        const { symbol, side, qty, takeProfit, stopLoss } = req.body;

        // 验证必需参数
        if (!symbol || !side || !qty) {
            return res.status(400).json({
                success: false,
                error: '缺少必需参数: symbol, side, qty'
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
        const result = await executeOrder({
            symbol,
            side: orderParams.side,
            qty,
            reduceOnly: orderParams.reduceOnly,
            takeProfit,
            stopLoss
        });

        res.json({ 
            success: true, 
            data: result,
            signal: side,
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
