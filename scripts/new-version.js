#!/usr/bin/env node

/**
 * 创建新版本的 PRD 目录结构
 * 用法：node scripts/new-version.js v1.1.0
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function validateVersion(version) {
  if (!version) {
    console.error('错误：请提供版本号')
    console.error('用法：node scripts/new-version.js v1.1.0')
    process.exit(1)
  }

  if (!version.match(/^v\d+\.\d+\.\d+$/)) {
    console.error('错误：版本号格式不正确，应为 vX.Y.Z（如 v1.1.0）')
    process.exit(1)
  }

  return version
}

function createVersionDir(version) {
  const versionDir = path.join(rootDir, 'docs', 'versions', version)

  if (fs.existsSync(versionDir)) {
    console.error(`错误：版本 ${version} 已存在`)
    process.exit(1)
  }

  // 创建目录结构
  const dirs = [
    versionDir,
    path.join(versionDir, '05-features'),
    path.join(versionDir, '07-prototype')
  ]

  dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`创建目录: ${path.relative(rootDir, dir)}`)
  })

  return versionDir
}

function createFiles(versionDir, version) {
  const today = new Date().toISOString().split('T')[0]

  const files = {
    'index.md': `---
version: ${version}
status: 草稿
date: ${today}
author: ''
iterationGoal: ''
---

# ${version} 版本 PRD

<PrdMeta
  version="${version}"
  status="草稿"
  date="${today}"
  author=""
  iterationGoal=""
/>

## 变更日志

### 新增

-

### 优化

-

### 修复

-

## 版本关联

- 上一版本：
`,
    '01-background.md': `---
version: ${version}
---

# 1. 项目背景

## 背景概述

描述本次迭代的背景，为什么要做这个版本。

## 迭代目标

明确本次迭代的核心目标（与首页 frontmatter 中的 iterationGoal 保持一致）。

## 预期成果

描述迭代完成后的预期效果。
`,
    '02-requirements.md': `---
version: ${version}
---

# 2. 核心需求

## 需求列表

| 需求 ID | 优先级 | 需求描述 | 状态 | 验收标准 |
|---------|--------|----------|------|----------|
| R-001 | P0 | 需求描述 | 草稿 | 验收标准 |

### P0 需求（必须有）

#### R-001：需求名称

**需求描述：**

**验收标准：**
- [ ] 验收条件 1
- [ ] 验收条件 2

### P1 需求（应该有）

### P2 需求（可以有）
`,
    '03-personas.md': `---
version: ${version}
---

# 3. 用户画像

## 用户角色

### 角色 1：角色名称

| 属性 | 描述 |
|------|------|
| 角色名称 | |
| 年龄/职位 | |
| 使用场景 | |
| 核心痛点 | |
| 期望价值 | |

## 使用场景

### 场景 1：场景名称

**触发条件：**
**用户行为：**
**期望结果：**
`,
    '04-user-journey.md': `---
version: ${version}
---

# 4. 用户旅程

## 旅程地图

### 阶段 1：认知

| 触点 | 用户行为 | 用户想法 | 情绪 |
|------|----------|----------|------|
| | | | |

### 阶段 2：考虑

### 阶段 3：使用

### 阶段 4：留存

## 痛点与机会

| 阶段 | 痛点 | 机会 |
|------|------|------|
| | | |
`,
    '05-features/index.md': `---
version: ${version}
---

# 5. 功能模块

## 模块总览

| 功能 ID | 功能名称 | 优先级 | 状态 | 说明 |
|---------|----------|--------|------|------|
| F-001 | | P0 | 草稿 | |

## 功能依赖关系

\`\`\`mermaid
graph TD
    A[功能A] --> B[功能B]
    A --> C[功能C]
\`\`\`
`,
    '06-flows.md': `---
version: ${version}
---

# 6. 流程图

## 主业务流程

\`\`\`mermaid
graph TD
    Start([开始]) --> Step1[步骤1]
    Step1 --> Step2[步骤2]
    Step2 --> End([结束])
\`\`\`

## 异常流程

\`\`\`mermaid
graph TD
    Start([开始]) --> Check{判断}
    Check -->|成功| Success[成功处理]
    Check -->|失败| Error[错误处理]
    Success --> End([结束])
    Error --> End
\`\`\`
`,
    '07-prototype/README.md': `---
version: ${version}
---

# 7. 原型素材

## 素材索引

| 编号 | 名称 | 关联功能 | 文件 | 说明 |
|------|------|----------|------|------|
| P-001 | | | | |

## 使用说明

将设计稿截图放入此目录，在素材索引表中登记。
`,
    '08-data-model.md': `---
version: ${version}
---

# 8. 数据模型

## 实体关系图

\`\`\`mermaid
erDiagram
    ENTITY1 ||--o{ ENTITY2 : relation
    ENTITY1 {
        int id PK
        string name
    }
    ENTITY2 {
        int id PK
        int entity1_id FK
    }
\`\`\`

## 实体定义

### 实体 1

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 是 | 主键 |
`,
    '09-api.md': `---
version: ${version}
---

# 9. 接口定义

## 接口列表

### 接口 1：接口名称

**URL：**
**Method：**
**描述：**

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| | | | |

**响应数据：**

\`\`\`json
{
  "code": 0,
  "data": {},
  "message": "success"
}
\`\`\`
`,
    '10-acceptance.md': `---
version: ${version}
---

# 10. 验收标准

## 整体验收 Checklist

### 功能验收

- [ ] 需求 R-001 已实现并测试通过
- [ ] 需求 R-002 已实现并测试通过

### 流程验收

- [ ] 主流程可完整走通
- [ ] 异常流程处理正确

### 体验验收

- [ ] UI 还原度达到 90% 以上
- [ ] 交互流程顺畅无阻塞

### 性能验收

- [ ] 页面加载时间 < 3s
- [ ] 核心接口响应时间 < 500ms
`,
    '11-risk.md': `---
version: ${version}
---

# 11. 风险评估

## 风险列表

| 风险 ID | 风险描述 | 风险等级 | 影响范围 | 应对方案 | 责任人 |
|---------|----------|----------|----------|----------|--------|
| Risk-001 | | 高/中/低 | | | |

## 风险说明

### Risk-001：风险名称

**风险描述：**
**风险等级：**
**影响范围：**
**应对方案：**
**责任人：**
`,
    '12-user-doc.md': `---
version: ${version}
title: 使用说明书
---

# 12. 使用说明书

## 简介

描述本版本的功能简介，面向终端用户。

## 使用前提

- 前提条件 1
- 前提条件 2

## 操作步骤

### 功能名称

1. **步骤 1**：操作说明
2. **步骤 2**：操作说明
3. **步骤 3**：操作说明

## 常见问题

### Q1：问题描述

A：回答说明。

### Q2：问题描述

A：回答说明。
`}

  Object.entries(files).forEach(([fileName, content]) => {
    const filePath = path.join(versionDir, fileName)
    fs.writeFileSync(filePath, content)
    console.log(`创建文件: ${path.relative(rootDir, filePath)}`)
  })
}

function updateVersionsConfig(version) {
  const versionsPath = path.join(rootDir, 'docs', '.vitepress', 'versions.json')
  let versions = []

  if (fs.existsSync(versionsPath)) {
    versions = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'))
  }

  const today = new Date().toISOString().split('T')[0]

  // 检查是否已存在
  if (versions.some(v => v.version === version)) {
    console.log(`版本 ${version} 已在配置中`)
    return
  }

  versions.push({
    version,
    status: '草稿',
    date: today,
    title: '',
    description: ''
  })

  // 按版本号降序排序
  versions.sort((a, b) => {
    const va = a.version.replace('v', '').split('.').map(Number)
    const vb = b.version.replace('v', '').split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (va[i] !== vb[i]) return vb[i] - va[i]
    }
    return 0
  })

  fs.writeFileSync(versionsPath, JSON.stringify(versions, null, 2))
  console.log(`更新版本配置: ${path.relative(rootDir, versionsPath)}`)
}

// 主流程
const version = validateVersion(process.argv[2])
console.log(`\n创建新版本: ${version}\n`)

const versionDir = createVersionDir(version)
createFiles(versionDir, version)
updateVersionsConfig(version)

console.log(`\n✅ 版本 ${version} 创建成功！`)
console.log(`\n下一步：`)
console.log(`  1. 编辑 docs/versions/${version}/index.md 填写版本信息`)
console.log(`  2. 运行 npm run docs:dev 预览`)
console.log(`  3. 使用 npm run new-feature 添加功能模块\n`)
