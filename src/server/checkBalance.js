const { RestClientV5 } = require('bybit-api');

// 从环境变量读取配置
const client = new RestClientV5({
    testnet: process.env.BYBIT_TESTNET === 'true',
    key: 'APJWtTOwYbWYqdNPNf',
    secret: 'BoDzOVXYXBpvo1kvpLSmGb847RJOgesCSvGu',
    recv_window: 200000,
    enable_time_sync: true,
    syncTimeBeforePrivateRequests: true,
});

/**
 * 查询账户余额
 */
async function getWalletBalance() {
    try {
        await client.syncTime(true);

        const response = await client.getWalletBalance({
            accountType: 'UNIFIED', // 统一账户
        });

        if (response.retCode === 0) {
            console.log('\n💰 账户余额信息:');
            console.log('='.repeat(60));
            
            const coins = response.result.list[0].coin;
            
            coins.forEach(coin => {
                const equity = parseFloat(coin.equity);
                const availableToWithdraw = parseFloat(coin.availableToWithdraw);
                const walletBalance = parseFloat(coin.walletBalance);
                
                if (equity > 0) {
                    console.log(`\n币种: ${coin.coin}`);
                    console.log(`  总权益: ${equity}`);
                    console.log(`  可用余额: ${availableToWithdraw}`);
                    console.log(`  钱包余额: ${walletBalance}`);
                }
            });
            
            console.log('\n' + '='.repeat(60));
            return response.result;
        } else {
            throw new Error(`Bybit API错误: ${response.retMsg}`);
        }
    } catch (error) {
        console.error('查询余额失败:', error);
        throw error;
    }
}

/**
 * 查询当前持仓
 */
async function getAllPositions() {
    try {
        await client.syncTime(true);

        const response = await client.getPositionInfo({
            category: 'linear',
            settleCoin: 'USDT'
        });

        if (response.retCode === 0) {
            console.log('\n📊 当前持仓信息:');
            console.log('='.repeat(60));
            
            const positions = response.result.list.filter(pos => parseFloat(pos.size) > 0);
            
            if (positions.length === 0) {
                console.log('暂无持仓');
            } else {
                positions.forEach(pos => {
                    console.log(`\n交易对: ${pos.symbol}`);
                    console.log(`  方向: ${pos.side}`);
                    console.log(`  数量: ${pos.size}`);
                    console.log(`  开仓价: ${pos.avgPrice}`);
                    console.log(`  标记价: ${pos.markPrice}`);
                    console.log(`  未实现盈亏: ${pos.unrealisedPnl}`);
                    console.log(`  杠杆: ${pos.leverage}x`);
                });
            }
            
            console.log('\n' + '='.repeat(60));
            return positions;
        } else {
            throw new Error(`Bybit API错误: ${response.retMsg}`);
        }
    } catch (error) {
        console.error('查询持仓失败:', error);
        throw error;
    }
}

/**
 * 计算建议的订单数量
 * @param {string} symbol - 交易对
 * @param {number} availableBalance - 可用余额
 * @param {number} price - 价格
 * @param {number} leverage - 杠杆倍数
 * @param {number} riskPercent - 风险百分比（默认10%）
 */
function calculateSafeOrderQty(symbol, availableBalance, price, leverage = 1, riskPercent = 10) {
    // 使用可用余额的一定百分比
    const riskAmount = availableBalance * (riskPercent / 100);
    
    // 计算可以买入的数量
    const qty = (riskAmount * leverage) / price;
    
    // 根据不同交易对设置最小精度
    let precision = 3; // 默认3位小数
    if (symbol.includes('BTC')) {
        precision = 3;
    } else if (symbol.includes('ETH')) {
        precision = 2;
    }
    
    const safeQty = qty.toFixed(precision);
    
    console.log('\n💡 建议订单参数:');
    console.log(`  交易对: ${symbol}`);
    console.log(`  可用余额: ${availableBalance.toFixed(2)} USDT`);
    console.log(`  价格: ${price}`);
    console.log(`  杠杆: ${leverage}x`);
    console.log(`  风险比例: ${riskPercent}%`);
    console.log(`  建议数量: ${safeQty}`);
    console.log(`  预计占用保证金: ${(parseFloat(safeQty) * price / leverage).toFixed(2)} USDT`);
    
    return safeQty;
}

/**
 * 主函数
 */
async function main() {
    try {
        // 查询余额
        const balance = await getWalletBalance();
        
        // 查询持仓
        await getAllPositions();
        
        // 获取 USDT 可用余额
        const usdtCoin = balance.list[0].coin.find(c => c.coin === 'USDT');
        if (usdtCoin) {
            const availableBalance = parseFloat(usdtCoin.availableToWithdraw);
            
            console.log('\n');
            console.log('='.repeat(60));
            
            // 计算不同交易对的建议数量
            if (availableBalance > 0) {
                console.log('\n📝 根据当前余额，建议的订单数量:');
                
                // ETH 示例（假设价格 3400）
                calculateSafeOrderQty('ETHUSDT', availableBalance, 3400, 1, 10);
                
                // BTC 示例（假设价格 50000）
                console.log('\n');
                calculateSafeOrderQty('BTCUSDT', availableBalance, 50000, 1, 10);
            } else {
                console.log('\n⚠️  可用余额不足，请先充值！');
            }
            
            console.log('\n' + '='.repeat(60));
        }
        
    } catch (error) {
        console.error('执行失败:', error);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = {
    getWalletBalance,
    getAllPositions,
    calculateSafeOrderQty
};

