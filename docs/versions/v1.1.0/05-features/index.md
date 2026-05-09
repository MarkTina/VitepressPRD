---
version: v1.1.0
---

# 5. 功能模块

## 模块总览

| 功能 ID | 功能名称 | 优先级 | 状态 | 说明 |
|---------|----------|--------|------|------|
| F-101 | 短信微服务 | P0 | 草稿 | 将短信能力从快递业务拆离为独立微服务，全平台统一调用 |
| F-102 | 支付架构重构 | P0 | 草稿 | 以服务商模式为核心的收款体系，网点级支付配置管理 |

## 短信微服务依赖关系

```mermaid
graph TD
    subgraph 短信微服务
        F101[F-101 短信微服务]
    end

    subgraph 平台业务方
        Express[快递业务]
        Laundry[洗衣业务]
        UserCenter[用户中心]
    end

    Express -->|调用短信 API| F101
    Laundry -->|调用短信 API| F101
    UserCenter -->|调用短信 API| F101
```

## 支付架构重构依赖关系

```mermaid
graph TD
    subgraph 支付配置中心
        Config[支付配置管理]
    end

    subgraph 微信支付
        WxSplit[服务商分账]
        WxDirect[服务商直收]
    end

    subgraph 支付宝支付
        AliDirect[支付宝直收]
    end

    subgraph 洗衣业务
        Site[洗衣网点]
        Order[用户下单]
    end

    Config --> WxSplit
    Config --> WxDirect
    Config --> AliDirect

    Site -->|绑定微信和支付宝配置| Config
    Order -->|微信小程序内支付| WxSplit
    Order -->|微信小程序内支付| WxDirect
    Order -->|支付宝小程序内支付| AliDirect
```
