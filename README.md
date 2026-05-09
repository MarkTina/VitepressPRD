# VitePress PRD 脚手架

基于 VitePress 的高质量产品需求文档（PRD）脚手架，让产品经理聚焦需求挖掘，AI 管线化处理文档撰写。

## 特性

- **结构化 PRD**：每份 PRD 包含 12 项标准要素，从背景到使用说明书全覆盖
- **版本管理**：按迭代版本管理 PRD（v1.0.0/v1.1.0/v1.2.0...），轻松追溯需求演进
- **AI 管线化**：4 阶段 AI 工作流——需求讨论 → PRD 生成 → 审校 → 用户文档
- **流程可视化**：内置 Mermaid 图表支持，业务流程一目了然
- **自定义主题**：PRD 专用组件（元信息卡片、状态标签、需求卡片）

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

### 构建

```bash
npm run docs:build
```

## 创建新版本

```bash
# 创建 v1.1.0 版本
npm run new-version v1.1.0
```

这将自动创建：
- 版本目录 `docs/versions/v1.1.0/`
- 全部 12 个章节的模板文件
- 功能模块目录
- 原型素材目录
- 更新版本配置文件

## 创建功能模块

```bash
# 在 v1.0.0 版本下创建功能模块 F-002
npm run new-feature v1.0.0 F-002 "用户登录功能"
```

## PRD 标准结构

每个版本的 PRD 包含以下 12 项要素：

| # | 要素 | 文件 |
|---|------|------|
| - | 版本首页 | `index.md` |
| 1 | 项目背景 | `01-background.md` |
| 2 | 核心需求 | `02-requirements.md` |
| 3 | 用户画像 | `03-personas.md` |
| 4 | 用户旅程 | `04-user-journey.md` |
| 5 | 功能模块 | `05-features/*.md` |
| 6 | 流程图 | `06-flows.md` |
| 7 | 原型素材 | `07-prototype/` |
| 8 | 数据模型 | `08-data-model.md` |
| 9 | 接口定义 | `09-api.md` |
| 10 | 验收标准 | `10-acceptance.md` |
| 11 | 风险评估 | `11-risk.md` |
| 12 | 使用说明书 | `12-user-doc.md` |

## AI 协作工作流

### 阶段 1：需求讨论

与 AI 讨论产品想法，梳理出结构化的需求要点。

**Prompt**：`docs/ai-prompts/01-discuss.md`

### 阶段 2：PRD 生成

基于需求要点，按模板生成完整的 PRD 各章节。

**Prompt**：`docs/ai-prompts/02-generate-prd.md`

### 阶段 3：PRD 审校

检查 PRD 的完整性、一致性、可行性和质量。

**Prompt**：`docs/ai-prompts/03-review-prd.md`

### 阶段 4：用户文档

基于确认的 PRD 生成面向终端用户的操作说明。

**Prompt**：`docs/ai-prompts/04-generate-user-doc.md`

## 目录结构

```
docs/
├── .vitepress/           # VitePress 配置
│   ├── config.mts        # 站点配置 + 动态 Sidebar
│   ├── versions.json     # 版本列表
│   └── theme/            # 自定义主题
│       ├── components/   # 自定义 Vue 组件
│       └── style.css     # 自定义样式
├── versions/             # PRD 版本目录
│   └── v1.0.0/           # 具体版本
├── templates/            # PRD 模板
├── guidelines/           # 撰写规范
└── ai-prompts/           # AI Prompt 模板
```

## Git 工作流

```bash
# 1. 从 main 切出新分支
git checkout -b prd/v1.1.0

# 2. 创建版本目录
npm run new-version v1.1.0

# 3. 与 AI 协作编写 PRD
# ...

# 4. PRD 完成后提交
git add .
git commit -m "docs(prd): v1.1.0 PRD 完成"

# 5. 合并到 main
git checkout main
git merge prd/v1.1.0
```

## 技术栈

- [VitePress](https://vitepress.dev/) - 静态站点生成器
- [Mermaid](https://mermaid.js.org/) - 流程图/图表
- [Vue 3](https://vuejs.org/) - 组件框架

## License

MIT
