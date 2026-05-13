---
layout: home

hero:
  name: "Mark's PRD"
  text: "产品需求文档工作台"
  tagline: 基于 VitePress 的结构化 PRD 脚手架，内置 AI 4 阶段协作管线
  actions:
    - theme: brand
      text: 最新 PRD (v1.1.0)
      link: /versions/v1.1.0/
    - theme: alt
      text: 快速开始
      link: /quick-start
    - theme: alt
      text: AI Prompt 模板
      link: /ai-prompts/00-role-prompt

features:
  - icon: 📋
    title: 12 项标准 PRD 结构
    details: 项目背景 → 核心需求 → 用户画像 → 用户旅程 → 功能模块 → 流程图 → 原型素材 → 数据模型 → 接口定义 → 验收标准 → 风险评估 → 使用说明书
  - icon: 🔄
    title: 版本迭代管理
    details: 每个版本独立目录，自动生成 sidebar，`versions.json` 管理版本列表，轻松追溯需求演进
  - icon: 🤖
    title: AI 4 阶段管线
    details: 需求讨论 → PRD 生成 → PRD 审校 → 用户文档，每个阶段配备结构化 Prompt 模板
  - icon: 📊
    title: 交互式 Mermaid 图表
    details: 自研 MermaidViewer 组件，支持源码/图表切换、滚轮缩放、拖拽平移，一键跳转外部编辑器深度编辑
  - icon: 🖼️
    title: 原型素材管理
    details: 每版本独立 `07-prototype/` 目录，支持功能模块级索引，快速预览后台原型页面
  - icon: ☁️
    title: 一键部署
    details: docs:deploy 一键构建并部署到 Cloudflare Pages，开箱即用
---

## 当前版本

<div class="prd-home-versions">

<a href="/versions/v1.1.0/" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">v1.1.0</span>
    <span class="status-badge status-draft">草稿</span>
  </div>
  <div class="prd-home-version-desc">短信服务微服务化拆分 + 自助洗衣支付架构重构（服务商分账/直收模式）</div>
  <div class="prd-home-version-meta">
    <span>2 个功能模块</span>
    <span>·</span>
    <span>27 页原型</span>
  </div>
</a>

<a href="/versions/v1.0.0/" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">v1.0.0</span>
    <span class="status-badge status-released">示例</span>
  </div>
  <div class="prd-home-version-desc">脚手架自带示例 PRD，展示完整的 12 章节结构与交互组件用法</div>
</a>

</div>

## 使用方式

<div class="prd-home-versions">

<a href="/quick-start" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">快速开始</span>
  </div>
  <div class="prd-home-version-desc">环境准备、安装依赖、常用命令、部署上线</div>
</a>

<a href="/guidelines/workflow-guide" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">AI 协作工作流</span>
  </div>
  <div class="prd-home-version-desc">4 阶段管线详细说明：需求讨论 → PRD 生成 → 审校 → 用户文档</div>
</a>

<a href="/guidelines/prd-writing-guide" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">PRD 撰写规范</span>
  </div>
  <div class="prd-home-version-desc">命名规范、Frontmatter 字段、优先级定义、Mermaid 图表规范</div>
</a>

<a href="/templates/prd-index-template" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">文档模板</span>
  </div>
  <div class="prd-home-version-desc">版本首页模板、章节模板、功能模块模板</div>
</a>

<a href="/ai-prompts/00-role-prompt" class="prd-home-version-card">
  <div class="prd-home-version-header">
    <span class="prd-home-version-title">AI Prompt 模板</span>
  </div>
  <div class="prd-home-version-desc">角色设定 + 4 阶段 Prompt，可直接用于 AI 协作</div>
</a>

</div>

## 常用命令

```bash
npm run docs:dev                    # 启动开发服务器
npm run new-version v1.x.x          # 创建新版本 PRD（自动生成 12 章节骨架）
npm run new-feature v1.x.x F-xxx "名称"  # 创建功能模块
npm run docs:build                  # 构建静态站点
npm run docs:deploy                 # 构建并部署到 Cloudflare Pages
```

## 目录结构

```
docs/
├── index.md              # 首页
├── quick-start.md        # 快速开始
├── versions/             # PRD 版本
│   ├── v1.0.0/           #   示例版本
│   └── v1.1.0/           #   当前版本（短信 + 支付架构重构）
├── templates/            # 文档模板
├── guidelines/           # 撰写规范与工作流
└── ai-prompts/           # AI Prompt 模板
```

<style>
.prd-home-versions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin: 16px 0 32px;
}
.prd-home-version-card {
  display: block;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: border-color 0.2s;
  text-decoration: none;
  color: inherit;
}
.prd-home-version-card:hover {
  border-color: var(--vp-c-brand);
}
.prd-home-version-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.prd-home-version-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--vp-c-text-1);
}
.prd-home-version-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.prd-home-version-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  display: flex;
  gap: 4px;
}
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
