---
version: v1.0.0
---

# 9. 接口定义

> 本版本为纯文档脚手架，无后端接口。以下为示例格式，供后续版本参考。

## 接口列表

### 示例接口：获取版本列表

**URL：** `/api/versions`
**Method：** `GET`
**描述：** 获取所有 PRD 版本列表

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 筛选状态：draft/review/confirmed/released |
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 20 |

**响应数据：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "version": "v1.0.0",
        "status": "released",
        "date": "2025-05-09",
        "title": "MVP 版本",
        "description": "产品最小可用版本"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 20
  },
  "message": "success"
}
```

### 示例接口：获取版本详情

**URL：** `/api/versions/:version`
**Method：** `GET`
**描述：** 获取指定版本的完整 PRD 内容

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| version | string | 是 | 版本号，如 v1.0.0 |

**响应数据：**

```json
{
  "code": 0,
  "data": {
    "version": "v1.0.0",
    "status": "released",
    "sections": [
      {
        "type": "background",
        "title": "项目背景",
        "content": "..."
      }
    ]
  },
  "message": "success"
}
```

### 示例接口：创建新版本

**URL：** `/api/versions`
**Method：** `POST`
**描述：** 创建新版本的 PRD

**请求体：**

```json
{
  "version": "v1.1.0",
  "iteration_goal": "新增用户反馈功能",
  "author": "产品经理"
}
```

**响应数据：**

```json
{
  "code": 0,
  "data": {
    "version": "v1.1.0",
    "status": "draft",
    "created_at": "2025-05-10T10:00:00Z"
  },
  "message": "success"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 404 | 版本不存在 |
| 409 | 版本已存在 |
| 500 | 服务器内部错误 |
