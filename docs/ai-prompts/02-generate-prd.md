# 阶段 2：PRD 生成

## Prompt 模板

```
基于以下已确认的需求，请按照 PRD 脚手架模板生成完整的 PRD 文档。

【版本信息】
- 版本号：{vX.Y.Z}
- 迭代目标：{一句话概括}
- 作者：{你的名字}
- 日期：{YYYY-MM-DD}

【已确认的需求要点】
{阶段 1 的输出}

请按以下要求生成 PRD：

1. 严格遵循以下文件结构和命名规范：
   - index.md：版本首页（含 frontmatter：version, status, date, author, iterationGoal）
   - 01-background.md：项目背景与目标
   - 02-requirements.md：核心需求列表（含优先级 P0/P1/P2、需求 ID、需求描述、验收标准）
   - 03-personas.md：用户画像与场景
   - 04-user-journey.md：用户旅程地图（用文字描述，不需要图表）
   - 05-features/index.md：功能模块总览
   - 05-features/具体功能.md：每个功能的详细说明（使用 feature-template.md 格式）
   - 06-flows.md：业务流程图（使用 Mermaid 语法）
   - 07-prototype/README.md：原型素材索引
   - 08-data-model.md：数据模型/实体关系（可用 Mermaid ER 图）
   - 09-api.md：接口定义（如有需要）
   - 10-acceptance.md：整体验收 checklist
   - 11-risk.md：风险评估与应对
   - 12-user-doc.md：使用说明书（面向终端用户的操作指南）

2. 每个文件必须包含正确的 frontmatter
3. 流程图使用 Mermaid 语法
4. 需求描述要具体、可验证
5. 术语在全文中保持一致

请按章节逐个输出，每个章节输出后我可以确认或提出修改意见。
```

## 使用说明

1. 将 `{阶段 1 的输出}` 替换为确认后的需求要点
2. 与 AI 逐章节确认
3. 将 AI 生成的内容复制到对应文件中
4. 检查并修正格式

## 关键约束

- 不要生成空泛的描述，每个需求点都要有具体的验收标准
- Mermaid 图表确保语法正确
- 功能模块的验收标准必须是可测试的
- 风险评估要包含具体的应对方案
