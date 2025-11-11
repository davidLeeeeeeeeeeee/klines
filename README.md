## 创建账号


**接口地址**:`/alphanow-admin/api/account/create`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "apiKey": "",
  "apiPassphrase": "",
  "apiSecret": "",
  "exchange": ""
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|request|创建账号|body|true|AccountCreateReq|AccountCreateReq|
|&emsp;&emsp;apiKey|KEY||true|string||
|&emsp;&emsp;apiPassphrase|密码||true|string||
|&emsp;&emsp;apiSecret|SECRET||true|string||
|&emsp;&emsp;exchange|交易所类型：BYBIT||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK||
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


暂无


**响应示例**:
```javascript

```
## 历史净值折线图


**接口地址**:`/alphanow-admin/api/account/history/line`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "accountId": 0,
  "endTime": "",
  "startTime": ""
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|reqVO|账户历史净值请求参数|body|true|AccountHistoryLineReq|AccountHistoryLineReq|
|&emsp;&emsp;accountId|账号ID||true|integer(int64)||
|&emsp;&emsp;endTime|结束时间:yyyy-MM-dd HH:mm:ss||true|string(date-time)||
|&emsp;&emsp;startTime|开始时间:yyyy-MM-dd HH:mm:ss||true|string(date-time)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|HistoryLineVO|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|createTime|创建时间|string(date-time)|string(date-time)|
|id|ID|integer(int64)|integer(int64)|
|lineX|X轴|array||
|lineY|Y轴|array||
|updateTime|更新时间|string(date-time)|string(date-time)|


**响应示例**:
```javascript
{
	"createTime": "",
	"id": 0,
	"lineX": [],
	"lineY": [],
	"updateTime": ""
}
```
## 账号列表


**接口地址**:`/alphanow-admin/api/account/list`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "page": 0,
  "pageSize": 0,
  "param": {
    "apiKey": "",
    "exchange": "",
    "init": 0,
    "sortType": 0
  }
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|reqVO|分页请求统一参数|body|true|PageRequestVO«AccountListReq»|PageRequestVO«AccountListReq»|
|&emsp;&emsp;page|页码||true|integer(int32)||
|&emsp;&emsp;pageSize|每页数据量||true|integer(int32)||
|&emsp;&emsp;param|账号列表请求||true|AccountListReq|AccountListReq|
|&emsp;&emsp;&emsp;&emsp;apiKey|KEY||false|string||
|&emsp;&emsp;&emsp;&emsp;exchange|交易所类型：BYBIT||false|string||
|&emsp;&emsp;&emsp;&emsp;init|状态：默认=全部，0=未初始化，1=已初始化||false|integer||
|&emsp;&emsp;&emsp;&emsp;sortType|默认=时间倒序，1=净值倒序，2=净值升序||false|integer||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|PageResponseVO«AccountVO»|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|records|数据列表|array|AccountVO|
|&emsp;&emsp;apiKey|KEY|string||
|&emsp;&emsp;createTime|创建时间|string(date-time)||
|&emsp;&emsp;equity|净值|number||
|&emsp;&emsp;exchange|交易所|string||
|&emsp;&emsp;id|ID|integer(int64)||
|&emsp;&emsp;init|状态：0=未初始化，1=已初始化|integer(int32)||
|&emsp;&emsp;updateTime|更新时间|string(date-time)||
|&emsp;&emsp;userId|用户ID|integer(int64)||
|total|总数据量|integer(int64)|integer(int64)|


**响应示例**:
```javascript
{
	"records": [
		{
			"apiKey": "",
			"createTime": "",
			"equity": 0,
			"exchange": "",
			"id": 0,
			"init": 0,
			"updateTime": "",
			"userId": 0
		}
	],
	"total": 0
}
```
## 删除账号


**接口地址**:`/alphanow-admin/api/account/remove`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id|id|query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK||
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


暂无


**响应示例**:
```javascript

```
## 当前用户详情


**接口地址**:`/alphanow-admin/api/user/info`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|AppUserRes|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|equity|账户净值|number||
|id|用户ID|integer(int64)|integer(int64)|
|token|TOKEN|string||
|username|用户名称|string||


**响应示例**:
```javascript
{
	"equity": 0,
	"id": 0,
	"token": "",
	"username": ""
}
```
## 用户登录: 成功返回基本信息和token


**接口地址**:`/alphanow-admin/api/user/login`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "password": "",
  "username": ""
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|request|用户请求参数:主要用于登录|body|true|AppUserReq|AppUserReq|
|&emsp;&emsp;password|登录密码||true|string||
|&emsp;&emsp;username|用户名称||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|AppUserRes|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|equity|账户净值|number||
|id|用户ID|integer(int64)|integer(int64)|
|token|TOKEN|string||
|username|用户名称|string||


**响应示例**:
```javascript
{
	"equity": 0,
	"id": 0,
	"token": "",
	"username": ""
}
```
## 用户退出: 成功返回true


**接口地址**:`/alphanow-admin/api/user/logout`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK||
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


暂无


**响应示例**:
```text
boolean
```

## 历史净值折线图


**接口地址**:`/alphanow-admin/api/user/history/line`


**请求方式**:`POST`


**请求数据类型**:`application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "endTime": "",
  "exchange": "",
  "startTime": ""
}
```


**请求参数**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|reqVO|用户历史净值请求参数|body|true|UserHistoryLineReq|UserHistoryLineReq|
|&emsp;&emsp;endTime|结束时间:yyyy-MM-dd HH:mm:ss||true|string(date-time)||
|&emsp;&emsp;exchange|平台:BYBIT,可用值:BYBIT||false|string||
|&emsp;&emsp;startTime|开始时间:yyyy-MM-dd HH:mm:ss||true|string(date-time)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|HistoryLineVO|
|201|Created||
|401|Unauthorized||
|403|Forbidden||
|404|Not Found||


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|createTime|创建时间|string(date-time)|string(date-time)|
|id|ID|integer(int64)|integer(int64)|
|lineX|X轴|array||
|lineY|Y轴|array||
|updateTime|更新时间|string(date-time)|string(date-time)|


**响应示例**:
```javascript
{
	"createTime": "",
	"id": 0,
	"lineX": [],
	"lineY": [],
	"updateTime": ""
}
```