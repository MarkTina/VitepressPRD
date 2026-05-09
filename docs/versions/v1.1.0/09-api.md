---
version: v1.1.0
---

# 9. 接口定义

## 短信微服务

### POST /api/v1/sms/send

**描述：** 发送单条短信

**请求头：**

| 参数 | 必填 | 说明 |
|------|------|------|
| X-Api-Key | 是 | 租户 API Key |

**请求体：**

```json
{
  "template_id": "TMPL_001",
  "mobiles": ["13800138000"],
  "variables": { "code": "123456" },
  "callback_url": "https://biz.example.com/sms/callback"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| template_id | string | 是 | 短信模板 ID |
| mobiles | string[] | 是 | 目标手机号，最多 100 个 |
| variables | object | 否 | 模板变量 |
| callback_url | string | 否 | 自定义回调地址 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "message_id": "MSG_20260510_001",
    "status": "queued"
  },
  "message": "success"
}
```

### POST /api/v1/sms/batch-send

**描述：** 批量发送（不同手机号不同模板变量）

**请求体：**

```json
{
  "template_id": "TMPL_001",
  "items": [
    { "mobile": "13800138000", "variables": { "code": "123456" } },
    { "mobile": "13900139000", "variables": { "code": "789012" } }
  ],
  "callback_url": "https://biz.example.com/sms/callback"
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "batch_id": "BATCH_20260510_001",
    "total": 2,
    "status": "queued"
  },
  "message": "success"
}
```

### GET /api/v1/sms/records/{message_id}

**描述：** 查询单条发送记录

**响应：**

```json
{
  "code": 0,
  "data": {
    "message_id": "MSG_20260510_001",
    "template_id": "TMPL_001",
    "mobile": "138****8000",
    "status": "success",
    "channel_response": { "req_id": "xxx", "biz_id": "yyy" },
    "sent_at": "2026-05-10T10:00:05Z"
  },
  "message": "success"
}
```

### 短信发送结果回调

**描述：** 服务端主动回调通知业务方

**Method：** `POST`（回调到业务方配置的 callback_url）

```json
{
  "event": "sms.result",
  "data": {
    "message_id": "MSG_20260510_001",
    "status": "success",
    "sent_at": "2026-05-10T10:00:05Z",
    "error_code": null,
    "error_message": null
  }
}
```

---

## 支付配置中心

### POST /api/v1/payment/configs

**描述：** 创建支付配置

**请求体（微信服务商分账模式示例）：**

```json
{
  "name": "华北区-微信分账-标准佣金",
  "mode": "wechat_split",
  "params": {
    "service_mch_id": "1234567890",
    "api_key": "***",
    "sub_mch_id": "9876543210",
    "profit_sharing": {
      "enabled": true,
      "type": "ratio",
      "receivers": [
        { "receiver_type": "platform", "merchant_id": "1001", "ratio": 0.15 },
        { "receiver_type": "franchisee", "merchant_id": "2001", "ratio": 0.85 }
      ]
    }
  }
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "config_id": "CFG_20260510_001",
    "name": "华北区-微信分账-标准佣金",
    "mode": "wechat_split",
    "status": "enabled",
    "created_at": "2026-05-10T10:00:00Z"
  },
  "message": "success"
}
```

### GET /api/v1/payment/configs

**描述：** 查询支付配置列表

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mode | string | 否 | 按模式筛选：wechat_split/wechat_direct/alipay_direct |
| status | string | 否 | 按状态筛选：enabled/disabled |
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 20 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "config_id": "CFG_20260510_001",
        "name": "华北区-微信分账-标准佣金",
        "mode": "wechat_split",
        "status": "enabled",
        "bound_sites": 3,
        "created_at": "2026-05-10T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  },
  "message": "success"
}
```

### GET /api/v1/payment/configs/{config_id}

**描述：** 获取支付配置详情

### PUT /api/v1/payment/configs/{config_id}

**描述：** 更新支付配置（名称、参数可改，模式不可改）

### DELETE /api/v1/payment/configs/{config_id}

**描述：** 删除支付配置（仅未被绑定时可删除）

### PUT /api/v1/payment/configs/{config_id}/status

**描述：** 启用/停用支付配置

**请求体：**

```json
{
  "status": "disabled"
}
```

---

## 网点支付绑定

### POST /api/v1/sites/{site_id}/payment-binding

**描述：** 为网点绑定支付配置

**请求体：**

```json
{
  "config_id": "CFG_20260510_001"
}
```

### GET /api/v1/sites/{site_id}/payment-binding

**描述：** 查询网点当前支付配置绑定

**响应：**

```json
{
  "code": 0,
  "data": {
    "binding_id": "BIND_001",
    "site_id": "SITE_001",
    "config_id": "CFG_20260510_001",
    "config_name": "华北区-微信分账-标准佣金",
    "mode": "wechat_split",
    "bound_at": "2026-05-10T10:30:00Z"
  },
  "message": "success"
}
```

---

## 支付下单（业务侧）

### POST /api/v1/payment/order

**描述：** 发起支付（根据网点绑定的配置自动路由到对应支付渠道）

**请求体：**

```json
{
  "site_id": "SITE_001",
  "amount": 20.00,
  "description": "自助洗衣-标准洗-30分钟",
  "notify_url": "https://laundry.example.com/pay/callback"
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "transaction_id": "TXN_20260510_001",
    "channel": "wechat",
    "pay_params": {
      "appId": "wx...",
      "timeStamp": "1715328000",
      "nonceStr": "...",
      "package": "prepay_id=...",
      "signType": "RSA",
      "paySign": "..."
    }
  },
  "message": "success"
}
```

---

## 支付回调（渠道 → 平台）

### POST /api/v1/payment/notify/wechat

**描述：** 微信支付异步通知接收

### POST /api/v1/payment/notify/alipay

**描述：** 支付宝异步通知接收

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | API Key 无效或未提供 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复绑定） |
| 429 | 发送频率超限 / 日配额用尽 |
| 500 | 服务器内部错误 |
| 502 | 上游支付渠道错误 |
