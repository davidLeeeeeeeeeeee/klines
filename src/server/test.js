const axios = require('axios');

const BASE_URL = 'http://103.70.76.214:80';

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试函数
async function testWebhook(testName, payload) {
    log(`\n${'='.repeat(50)}`, 'blue');
    log(`测试: ${testName}`, 'blue');
    log('='.repeat(50), 'blue');

    console.log('请求数据:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(`${BASE_URL}/webhook`, payload);
        log('\n✅ 成功:', 'green');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        log('\n❌ 失败:', 'red');
        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('错误信息:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('错误:', error.message);
        }
        return null;
    }
}

// 健康检查
async function testHealth() {
    log(`\n${'='.repeat(50)}`, 'blue');
    log('健康检查', 'blue');
    log('='.repeat(50), 'blue');

    try {
        const response = await axios.get(`${BASE_URL}/health`);
        log('✅ 服务正常运行', 'green');
        console.log(JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        log('❌ 服务未启动或无法连接', 'red');
        console.log('错误:', error.message);
        return false;
    }
}


// 单独测试开多仓
async function openETHUSDT() {
    log('\n🎯 快速测试 - 开多仓\n', 'yellow');

    await testWebhook('开多仓 (ENTER_LONG)', {
        symbol: 'ETHUSDT',
        side: 'ENTER_LONG',
        qty: '0.01',  // 小数量测试，约需 34 USDT（价格3400时）
        price: '0',   // 使用市价单，更容易成交
        trigger_time: new Date().toISOString(),
        max_lag: '10',
        strategy_id: 'quick-test-' + Date.now(),
        amount_type: 'absolute.quantity'
    });
}

// 平仓 ETHUSDT（多仓平）
async function closeETHUSDT() {
    log('\n🎯 平仓 ETHUSDT - 平多仓\n', 'yellow');

    // 平多仓 - 不传 qty 和 price，自动查询持仓并使用市价单平仓
    await testWebhook('平多仓 ETHUSDT (EXIT_LONG)', {
        symbol: 'ETHUSDT',
        side: 'EXIT_LONG',
        // qty 不传，会自动查询持仓数量
        // price 不传，会使用市价单快速平仓
        trigger_time: new Date().toISOString(),
        max_lag: '10',
        strategy_id: 'close-eth-' + Date.now(),
        amount_type: 'absolute.quantity'
    });

}
async function openDownETHUSDT() {
    log('\n🎯 快速测试 - 开空仓\n', 'yellow');

    await testWebhook('开空仓 (ENTER_LONG)', {
        symbol: 'ETHUSDT',
        side: 'ENTER_SHORT',
        qty: '0.01',
        trigger_time: new Date().toISOString(),
        max_lag: '5',
        strategy_id: 'quick-test-' + Date.now(),
        amount_type: 'absolute.quantity'
    });
}
// 平空仓 ETHUSDT（空仓平）
async function closeDownETHUSDT() {
    log('\n🎯 平仓 ETHUSDT - 平空仓\n', 'yellow');

    // 平空仓 - 不传 qty 和 price，自动查询持仓并使用市价单平仓
    await testWebhook('平空仓 ETHUSDT (EXIT_SHORT)', {
        symbol: 'ETHUSDT',
        side: 'EXIT_SHORT',
        // qty 不传，会自动查询持仓数量
        // price 不传，会使用市价单快速平仓
    });

}
// 命令行参数处理
openETHUSDT();