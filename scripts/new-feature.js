#!/usr/bin/env node

/**
 * 在指定版本下创建新的功能模块
 * 用法：node scripts/new-feature.js v1.0.0 F-002 功能名称
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function parseArgs() {
  const [version, featureId, ...featureNameParts] = process.argv.slice(2)
  const featureName = featureNameParts.join(' ')

  if (!version || !featureId) {
    console.error('错误：参数不足')
    console.error('用法：node scripts/new-feature.js v1.0.0 F-002 功能名称')
    process.exit(1)
  }

  if (!version.match(/^v\d+\.\d+\.\d+$/)) {
    console.error('错误：版本号格式不正确，应为 vX.Y.Z')
    process.exit(1)
  }

  if (!featureId.match(/^F-\d+$/)) {
    console.error('错误：功能 ID 格式不正确，应为 F-XXX（如 F-001）')
    process.exit(1)
  }

  return { version, featureId, featureName }
}

function createFeatureFile(version, featureId, featureName) {
  const featuresDir = path.join(rootDir, 'docs', 'versions', version, '05-features')

  if (!fs.existsSync(featuresDir)) {
    console.error(`错误：版本 ${version} 不存在，请先使用 new-version 创建`)
    process.exit(1)
  }

  const fileName = `${featureId}-${featureName || 'new-feature'}.md`
  const filePath = path.join(featuresDir, fileName)

  if (fs.existsSync(filePath)) {
    console.error(`错误：功能文件已存在: ${filePath}`)
    process.exit(1)
  }

  const content = `---
featureId: ${featureId}
module: ''
priority: P1
status: 草稿
owner: ''
---

# ${featureName || '新功能'}

## 功能概述

用 1-2 句话描述这个功能是什么、解决什么问题。

## 用户故事

> 作为 [用户角色]，我希望 [目标]，以便 [价值]。

## 前置条件

-

## 功能详述

### 场景 1：正常流程

1.
2.
3.

### 场景 2：异常流程

1.
2.
3.

### 场景 3：边界情况

-

## 交互说明

### 页面元素

| 元素 | 类型 | 说明 | 规则 |
|------|------|------|------|
| | | | |

### 状态说明

- **默认状态**：
- **焦点状态**：
- **错误状态**：
- **成功状态**：

## 原型关联

-

## 验收标准

- [ ] 验收条件 1
- [ ] 验收条件 2
- [ ] 验收条件 3

## 技术备注

-
`

  fs.writeFileSync(filePath, content)
  console.log(`创建功能模块: ${path.relative(rootDir, filePath)}`)

  return filePath
}

// 主流程
const { version, featureId, featureName } = parseArgs()
console.log(`\n在版本 ${version} 下创建功能: ${featureId} ${featureName || ''}\n`)

createFeatureFile(version, featureId, featureName)

console.log(`\n✅ 功能模块 ${featureId} 创建成功！`)
console.log(`\n下一步：编辑功能文件，完善功能描述\n`)
