import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './style.css'

// 导入自定义组件
import PrdMeta from './components/PrdMeta.vue'
import StatusBadge from './components/StatusBadge.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册自定义组件
    app.component('PrdMeta', PrdMeta)
    app.component('StatusBadge', StatusBadge)
  }
} as Theme
