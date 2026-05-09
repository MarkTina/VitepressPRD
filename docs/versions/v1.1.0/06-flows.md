---
version: v1.1.0
---

# 6. 流程图

## 短信发送全流程

```mermaid
sequenceDiagram
    actor Biz as 业务方
    participant API as 短信网关
    participant DB as 消息存储
    participant MQ as 消息队列
    participant Worker as 发送Worker
    participant Channel as 短信渠道
    participant CB as 回调通知

    Biz->>API: POST /api/v1/sms/send
    API->>API: 校验 API Key / 配额 / 模板
    API->>DB: 写入发送记录 (status: queued)
    API->>MQ: 投递发送任务
    API-->>Biz: { status: "queued", message_id }

    MQ->>Worker: 消费发送任务
    Worker->>DB: 更新状态 (sending)
    Worker->>Channel: 调用渠道 API 发送
    Channel-->>Worker: 返回发送结果

    alt 发送成功
        Worker->>DB: 更新状态 (success)
        Worker->>CB: 回调通知业务方 (success)
    else 发送失败 (可重试)
        Worker->>MQ: 入重试队列 (retry_count + 1)
    else 发送失败 (不可重试)
        Worker->>DB: 更新状态 (failed)
        Worker->>CB: 回调通知业务方 (failed)
    end
```

## 支付模式选择流程

```mermaid
graph TD
    Start([用户发起支付]) --> GetConfig[获取网点绑定的支付配置]
    GetConfig --> ModeSwitch{支付模式}

    ModeSwitch -->|微信服务商分账| WxSplitPay[调用微信服务商支付<br/>携带分账标记]
    ModeSwitch -->|微信服务商直收| WxDirectPay[调用微信服务商支付<br/>子商户直接收款]
    ModeSwitch -->|支付宝直收| AliPay[调用支付宝<br/>当面付/APP 支付]

    WxSplitPay --> PayResult{支付结果}
    WxDirectPay --> PayResult
    AliPay --> PayResult

    PayResult -->|成功| ProfitCheck{是否分账模式?}
    PayResult -->|失败| FailEnd([支付失败])

    ProfitCheck -->|是| DoSplit[发起分账请求]
    ProfitCheck -->|否| SuccessEnd([支付完成])

    DoSplit --> SplitResult{分账结果}
    SplitResult -->|成功| SuccessEnd
    SplitResult -->|失败| RetrySplit[自动重试队列<br/>最多 5 次]
    RetrySplit -->|仍失败| Alert[告警通知财务]
```

## 支付配置绑定与切换流程

```mermaid
sequenceDiagram
    actor Admin as 运营管理员
    participant Backend as 配置中心
    participant Redis as Redis 缓存
    participant PayGW as 支付网关

    Admin->>Backend: 创建支付配置 + 绑定网点
    Backend->>Backend: 校验配置参数有效性
    Backend->>Backend: 写入 DB（配置 + 绑定关系）
    Backend->>Redis: 更新缓存
    Backend-->>Admin: 绑定成功

    Note over PayGW: 下一次支付请求

    PayGW->>Redis: 查询网点支付配置
    Redis-->>PayGW: 返回当前绑定的配置
    PayGW->>PayGW: 根据配置模式调用对应支付渠道

    Admin->>Backend: 切换网点支付配置
    Backend->>Backend: 校验新配置状态
    Backend->>Backend: 更新绑定关系
    Backend->>Redis: 刷新缓存
    Backend-->>Admin: 切换成功

    Note over PayGW: 下一次支付请求自动使用新配置
```

## 服务商分账回退流程

```mermaid
graph TD
    Refund([用户发起退款]) --> CheckStatus{订单分账状态}
    CheckStatus -->|未分账| DirectRefund[直接退款<br/>从子商户账户退回]
    CheckStatus -->|已分账| SplitBack[先回退分账<br/>按原比例从各接收方退回]
    CheckStatus -->|分账中| WaitSplit[等待分账完成<br/>或超时后直接退款]

    SplitBack --> SplitBackResult{回退结果}
    SplitBackResult -->|成功| DirectRefund
    SplitBackResult -->|失败| ManualHandle[人工处理]

    DirectRefund --> RefundResult{退款结果}
    RefundResult -->|成功| Done([退款完成])
    RefundResult -->|失败| RefundRetry[退款重试]
    ManualHandle --> Done
```
