curl -X POST http://localhost:3000/webhook \
-H "Content-Type: application/json" \
-d '{
"symbol": "BTCUSDT",
"side": "ENTER_LONG",
"qty": "0.0001",
"price": "100000",
"trigger_time": "2024-11-06T10:00:00Z",
"max_lag": "20",
"strategy_id": "f359bca4-f32e-4d58-97bf-017c4dd3af6e",
"amount_type": "absolute.quantity"
}'