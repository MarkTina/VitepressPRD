---
layout: home

hero:
  name: "产品需求文档"
  text: "PRD 文档中心"
  tagline: 高质量产品需求文档的沉淀与管理
  actions:
    - theme: brand
      text: 查看最新版本
      link: /versions/v1.1.0/
    - theme: alt
      text: 使用说明
      link: /versions/v1.0.0/
    - theme: alt
      text: AI 工作流
      link: /guidelines/workflow-guide

features:
  - icon: 📝
    title: 结构化 PRD
    details: 每份 PRD 包含 12 项标准要素，从背景到使用说明书全覆盖
  - icon: 🔄
    title: 版本管理
    details: 按迭代版本管理 PRD，轻松追溯需求演进历史
  - icon: 🤖
    title: AI 管线化
    details: 4 阶段 AI 工作流：需求讨论 → PRD 生成 → 审校 → 用户文档
  - icon: 📊
    title: 流程可视化
    details: 内置 Mermaid 图表支持，业务流程一目了然
---

## 版本列表

<div class="prd-home-versions">

<a href="/versions/v1.1.0/" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">v1.1.0</span>
    <span class="status-badge status-draft">草稿</span>
  </div>
  <div class="prd-home-version-desc">用户创建的新版本</div>
  <div class="prd-home-version-meta">
    <span>2026-05-08</span>
  </div>
</a>

</div>

## Mark's PRD 使用说明

<div class="prd-home-versions">

<a href="/quick-start" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">快速开始</span>
  </div>
  <div class="prd-home-version-desc">安装、常用命令、创建版本、AI 协作流程</div>
</a>

<a href="/versions/v1.0.0/" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">示例 PRD (v1.0.0)</span>
    <span class="status-badge status-released">已发布</span>
  </div>
  <div class="prd-home-version-desc">脚手架自带示例，展示完整 PRD 结构</div>
  <div class="prd-home-version-meta">
    <span>2025-05-09</span>
  </div>
</a>

<a href="/templates/prd-index-template" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">PRD 模板</span>
  </div>
  <div class="prd-home-version-desc">版本首页、章节、功能模块模板</div>
</a>

<a href="/guidelines/prd-writing-guide" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">撰写规范</span>
  </div>
  <div class="prd-home-version-desc">命名规范、Frontmatter、优先级定义</div>
</a>

<a href="/ai-prompts/00-role-prompt" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">AI Prompts</span>
  </div>
  <div class="prd-home-version-desc">4 阶段 AI 协作 Prompt 模板</div>
</a>

</div>

## 快速开始

### 使用方式

```bash
# 启动开发服务器
npm run docs:dev

# 创建新版本
npm run new-version v1.1.0

# 创建功能模块
npm run new-feature v1.1.0 F-001 "用户登录"

# 构建
npm run docs:build

# 部署到 Cloudflare Pages（首次需先运行 npx wrangler login）
npm run docs:deploy
```

### AI 协作工作流

后续你有需求时，直接描述给我即可，我会按 `ai-prompts/` 中定义的 4 阶段管线（需求讨论 → PRD 生成 → 审校 → 用户文档）为你产出符合脚手架规范的完整 PRD。

## 目录结构

```
docs/
├── versions/          # PRD 版本目录
│   └── v1.0.0/        # 具体版本
├── templates/         # PRD 模板
├── guidelines/        # 撰写规范
└── ai-prompts/        # AI Prompt 模板
```

<style>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-released {
  background: #c7d2fe;
  color: #3730a3;
}
.status-draft {
  background: var(--vp-c-gray-soft);
  color: var(--vp-c-text-2);
}
</style>
