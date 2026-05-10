# 快速开始

## 环境准备

- Node.js 18+
- npm 或 pnpm

## 安装依赖

```bash
npm install
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run docs:dev` | 启动开发服务器 |
| `npm run docs:build` | 构建静态站点 |
| `npm run docs:preview` | 预览构建结果 |
| `npm run docs:deploy` | 构建并部署到 Cloudflare Pages |
| `npm run new-version v1.x.x` | 创建新版本 PRD |
| `npm run new-feature v1.x.x F-xxx "名称"` | 创建功能模块 |

## 创建新版本 PRD

```bash
npm run new-version v1.1.0
```

执行后自动生成：
- `docs/versions/v1.1.0/` 目录
- 01 ~ 12 的完整 PRD 模板文件
- 功能模块目录 `05-features/`
- 原型素材目录 `07-prototype/`
- 自动更新 `versions.json`

然后按需编辑各章节内容即可。

## 创建功能模块

```bash
npm run new-feature v1.1.0 F-001 "用户登录功能"
```

在指定版本的 `05-features/` 目录下生成功能模块文件。

## AI 协作工作流

1. **需求讨论**：向我描述产品想法，我帮你梳理结构化需求
2. **PRD 生成**：基于确认的需求，按模板生成完整 PRD
3. **PRD 审校**：多维度检查完整性、一致性和可行性
4. **用户文档**：基于 PRD 自动生成面向终端用户的操作说明

## 部署上线

首次部署前需登录 Cloudflare（仅需一次）：

```bash
npx wrangler login
```

然后一键构建并部署：

```bash
npm run docs:deploy
```

部署成功后会返回在线访问地址。
