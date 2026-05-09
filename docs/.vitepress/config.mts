import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import fs from 'fs'
import path from 'path'

// 读取版本列表
function getVersions() {
  const versionsPath = path.resolve(__dirname, 'versions.json')
  if (fs.existsSync(versionsPath)) {
    return JSON.parse(fs.readFileSync(versionsPath, 'utf-8'))
  }
  return []
}

// 获取所有版本目录
function getVersionDirs() {
  const versionsDir = path.resolve(__dirname, '../versions')
  if (!fs.existsSync(versionsDir)) return []
  return fs.readdirSync(versionsDir)
    .filter(dir => dir.match(/^v\d+\.\d+\.\d+$/))
    .sort((a, b) => {
      // 版本号降序排列，最新版本在前
      const va = a.replace('v', '').split('.').map(Number)
      const vb = b.replace('v', '').split('.').map(Number)
      for (let i = 0; i < 3; i++) {
        if (va[i] !== vb[i]) return vb[i] - va[i]
      }
      return 0
    })
}

// 动态生成某个版本的 sidebar
function generateVersionSidebar(version: string) {
  const versionPath = path.resolve(__dirname, `../versions/${version}`)
  if (!fs.existsSync(versionPath)) return []

  const sidebar: any[] = []

  // 版本首页
  sidebar.push({
    text: '版本概览',
    link: `/versions/${version}/`
  })

  const files = fs.readdirSync(versionPath)

  // 按 1-12 的固定顺序构建 sidebar
  const chapterOrder = [
    { file: '01-background.md', text: '1. 项目背景' },
    { file: '02-requirements.md', text: '2. 核心需求' },
    { file: '03-personas.md', text: '3. 用户画像' },
    { file: '04-user-journey.md', text: '4. 用户旅程' },
    { type: 'features' },
    { file: '06-flows.md', text: '6. 流程图' },
    { type: 'prototype' },
    { file: '08-data-model.md', text: '8. 数据模型' },
    { file: '09-api.md', text: '9. 接口定义' },
    { file: '10-acceptance.md', text: '10. 验收标准' },
    { file: '11-risk.md', text: '11. 风险评估' },
    { file: '12-user-doc.md', text: '12. 使用说明书' },
  ]

  for (const chapter of chapterOrder) {
    if ('file' in chapter && files.includes(chapter.file!)) {
      sidebar.push({
        text: chapter.text,
        link: `/versions/${version}/${chapter.file!.replace('.md', '')}`
      })
    }

    if ('type' in chapter && chapter.type === 'features') {
      const featuresDir = path.join(versionPath, '05-features')
      if (fs.existsSync(featuresDir)) {
        const featureFiles = fs.readdirSync(featuresDir)
          .filter(f => f.endsWith('.md'))
          .sort()

        if (featureFiles.length > 0) {
          const featureItems = featureFiles.map(f => ({
            text: f === 'index.md' ? '功能模块总览' : f.replace('.md', ''),
            link: `/versions/${version}/05-features/${f.replace('.md', '')}`
          }))

          sidebar.push({
            text: '5. 功能模块',
            collapsed: false,
            items: featureItems
          })
        }
      }
    }

    if ('type' in chapter && chapter.type === 'prototype') {
      const prototypeDir = path.join(versionPath, '07-prototype')
      if (fs.existsSync(prototypeDir)) {
        sidebar.push({
          text: '7. 原型素材',
          link: `/versions/${version}/07-prototype/README`
        })
      }
    }
  }

  return sidebar
}

// 构建 sidebar 配置
function buildSidebar() {
  const sidebar: Record<string, any[]> = {}
  const versions = getVersionDirs()

  versions.forEach(version => {
    sidebar[`/versions/${version}/`] = generateVersionSidebar(version)
  })

  // 模板和规范的 sidebar
  sidebar['/templates/'] = [
    {
      text: 'PRD 模板',
      items: [
        { text: '版本首页模板', link: '/templates/prd-index-template' },
        { text: '章节模板', link: '/templates/prd-section-template' },
        { text: '功能模块模板', link: '/templates/feature-template' }
      ]
    }
  ]

  sidebar['/guidelines/'] = [
    {
      text: '撰写规范',
      items: [
        { text: 'PRD 写作规范', link: '/guidelines/prd-writing-guide' },
        { text: 'AI 协作工作流', link: '/guidelines/workflow-guide' }
      ]
    }
  ]

  sidebar['/ai-prompts/'] = [
    {
      text: 'AI Prompt 模板',
      items: [
        { text: '角色设定', link: '/ai-prompts/00-role-prompt' },
        { text: '阶段1：需求讨论', link: '/ai-prompts/01-discuss' },
        { text: '阶段2：PRD 生成', link: '/ai-prompts/02-generate-prd' },
        { text: '阶段3：PRD 审校', link: '/ai-prompts/03-review-prd' },
        { text: '阶段4：用户文档', link: '/ai-prompts/04-generate-user-doc' }
      ]
    }
  ]

  return sidebar
}

// 构建导航栏
function buildNav() {
  const versions = getVersions()

  // 用户创建的版本（排除脚手架自带的示例 v1.0.0）
  const userVersions = versions.filter((v: any) => v.version !== 'v1.0.0')
  const versionItems = userVersions.map((v: any) => ({
    text: v.version,
    link: `/versions/${v.version}/`
  }))

  return [
    { text: '首页', link: '/' },
    {
      text: '版本',
      items: versionItems.length > 0 ? versionItems : []
    },
    {
      text: "Mark's PRD 使用说明",
      items: [
        { text: '快速开始', link: '/quick-start' },
        { text: '示例 PRD (v1.0.0)', link: '/versions/v1.0.0/' },
        { text: 'PRD 模板', link: '/templates/prd-index-template' },
        { text: '撰写规范', link: '/guidelines/prd-writing-guide' },
        { text: 'AI Prompts', link: '/ai-prompts/00-role-prompt' }
      ]
    }
  ]
}

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: '产品需求文档',
  description: '高质量 PRD 文档中心',
  lang: 'zh-CN',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: buildNav(),
    sidebar: buildSidebar(),

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',

    socialLinks: []
  },

  mermaid: {
    theme: 'default',
    themeVariables: {
      darkMode: false
    }
  },

  markdown: {
    config: (md) => {
      // 可以在这里添加自定义 markdown 插件
    }
  },

  // 忽略模板文件中的示例链接
  ignoreDeadLinks: true
}))