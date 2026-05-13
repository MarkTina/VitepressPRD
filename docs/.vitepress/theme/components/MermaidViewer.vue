<template>
  <div class="mv-wrapper">
    <!-- Toolbar -->
    <div class="mv-toolbar">
      <button class="mv-btn" @click="mode = mode === 'diagram' ? 'code' : 'diagram'">
        {{ mode === 'diagram' ? '源码' : '图表' }}
      </button>
      <span class="mv-sep"></span>
      <button class="mv-btn" :disabled="mode !== 'diagram' || !!error" @click="zoomIn">＋</button>
      <span class="mv-zoom-label">{{ Math.round(svgScale * 100) }}%</span>
      <button class="mv-btn" :disabled="mode !== 'diagram' || !!error" @click="zoomOut">－</button>
      <button class="mv-btn" :disabled="mode !== 'diagram' || !!error" @click="resetView">↺</button>
      <span class="mv-sep"></span>
      <button class="mv-btn mv-btn--ext" @click="openInEditor">外部编辑</button>
    </div>

    <!-- Content -->
    <div class="mv-body">
      <div v-if="mode === 'code'" class="mv-code">
        <pre><code>{{ decodedCode }}</code></pre>
      </div>

      <div
        v-else
        ref="viewportRef"
        class="mv-viewport"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
      >
        <div v-if="error" class="mv-error">{{ error }}</div>
        <div
          v-else
          class="mv-canvas"
          :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
        >
          <div ref="svgContainerRef" class="mv-svg" v-html="svg"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import mermaid from 'mermaid'
import pako from 'pako'

const props = defineProps<{
  code: string
  id: string
}>()

function decodeCode(raw: string): string {
  try {
    const binary = atob(raw)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return raw
  }
}

const decodedCode = computed(() => decodeCode(props.code))

const mode = ref<'diagram' | 'code'>('diagram')
const svg = ref('')
const error = ref('')

// Zoom / pan state
const svgScale = ref(1)
const svgOrigW = ref(800)
const svgOrigH = ref(400)
const canvasW = ref(800)
const canvasH = ref(400)

// Pointer drag
const dragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const scrollStartX = ref(0)
const scrollStartY = ref(0)

// Refs
const viewportRef = ref<HTMLElement | null>(null)
const svgContainerRef = ref<HTMLElement | null>(null)

let darkObserver: MutationObserver | null = null
let initialized = false

// ── Mermaid init ────────────────────────────────────────────────
const mermaidConfig = {
  startOnLoad: false,
  securityLevel: 'loose' as const,
  theme: 'default' as const,
}

async function initMermaid() {
  if (!initialized) {
    mermaid.initialize(mermaidConfig)
    initialized = true
  }
}

async function renderDiagram() {
  await initMermaid()
  try {
    const { svg: result } = await mermaid.render(`${props.id}-svg`, decodedCode.value)
    svg.value = result
    error.value = ''
    await nextTick()
    captureSvgDims()
  } catch (e: any) {
    error.value = e.message || String(e)
    svg.value = ''
  }
}

function captureSvgDims() {
  const vp = viewportRef.value
  if (!vp) return
  const svgEl = vp.querySelector('svg') as SVGElement | null
  if (!svgEl) return
  const vb = svgEl.viewBox.baseVal
  if (vb && vb.width > 0 && vb.height > 0) {
    svgOrigW.value = vb.width
    svgOrigH.value = vb.height
  } else {
    const r = svgEl.getBoundingClientRect()
    svgOrigW.value = r.width || 800
    svgOrigH.value = r.height || 400
  }
  applyScale()
}

function applyScale() {
  const s = svgScale.value
  canvasW.value = Math.round(svgOrigW.value * s)
  canvasH.value = Math.round(svgOrigH.value * s)

  const svgEls = document.querySelectorAll(`[id="${props.id}-svg"]`)
  svgEls.forEach(el => {
    const se = el as SVGElement
    se.setAttribute('width', String(canvasW.value))
    se.setAttribute('height', String(canvasH.value))
    se.style.maxWidth = 'none'
  })
}

// ── Theme ───────────────────────────────────────────────────────
async function handleThemeChange() {
  const isDark = document.documentElement.classList.contains('dark')
  mermaid.initialize({ ...mermaidConfig, theme: isDark ? 'dark' : 'default' })
  await renderDiagram()
}

// ── External editor ─────────────────────────────────────────────
function openInEditor() {
  const state = JSON.stringify({
    code: decodedCode.value,
    mermaid: JSON.stringify({ theme: 'default' }),
    updateEditor: true,
    autoSync: true,
    updateDiagram: true,
  })
  const deflated = pako.deflate(state, { level: 9 })
  const base64 = btoa(String.fromCharCode(...deflated))
  window.open(`https://mermaid-live.usillyb.com:40443/edit#pako:${base64}`, '_blank')
}

// ── Zoom / Pan ──────────────────────────────────────────────────
const MIN_SCALE = 0.1
const MAX_SCALE = 10

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

function zoomIn() {
  const vp = viewportRef.value
  if (!vp) return
  zoomAtPoint(vp.clientWidth / 2, vp.clientHeight / 2, 0.2)
}

function zoomOut() {
  const vp = viewportRef.value
  if (!vp) return
  zoomAtPoint(vp.clientWidth / 2, vp.clientHeight / 2, -0.2)
}

function resetView() {
  svgScale.value = 1
  applyScale()
  const vp = viewportRef.value
  if (vp) {
    vp.scrollLeft = 0
    vp.scrollTop = 0
  }
}

function zoomAtPoint(offsetX: number, offsetY: number, delta: number) {
  const vp = viewportRef.value
  if (!vp) return

  const oldScale = svgScale.value
  const newScale = clampScale(oldScale + delta)
  const ratio = newScale / oldScale

  const cx = vp.scrollLeft + offsetX
  const cy = vp.scrollTop + offsetY

  svgScale.value = newScale
  applyScale()

  requestAnimationFrame(() => {
    vp.scrollLeft = cx * ratio - offsetX
    vp.scrollTop = cy * ratio - offsetY
  })
}

function onWheel(e: WheelEvent) {
  const vp = viewportRef.value
  if (!vp) return
  const rect = vp.getBoundingClientRect()
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  zoomAtPoint(e.clientX - rect.left, e.clientY - rect.top, delta)
}

function onPointerDown(e: PointerEvent) {
  const vp = viewportRef.value
  if (!vp) return

  dragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  scrollStartX.value = vp.scrollLeft
  scrollStartY.value = vp.scrollTop
  vp.setPointerCapture(e.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const vp = viewportRef.value
  if (!vp) return
  vp.scrollLeft = scrollStartX.value - (e.clientX - dragStartX.value)
  vp.scrollTop = scrollStartY.value - (e.clientY - dragStartY.value)
}

function onPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  await renderDiagram()

  darkObserver = new MutationObserver(() => {
    handleThemeChange()
  })
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  darkObserver?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

watch(() => props.code, async () => {
  await nextTick()
  await renderDiagram()
})
</script>

<style scoped>
/* ── Wrapper ──────────────────────────────────────────────────── */
.mv-wrapper {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
}

/* ── Toolbar ──────────────────────────────────────────────────── */
.mv-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  user-select: none;
}

.mv-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.mv-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
}

.mv-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.mv-btn--ext {
  margin-left: auto;
}

.mv-sep {
  width: 1px;
  height: 18px;
  background: var(--vp-c-divider);
  margin: 0 4px;
}

.mv-zoom-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  min-width: 40px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* ── Body ─────────────────────────────────────────────────────── */
.mv-body {
  position: relative;
  min-height: 120px;
  max-height: 500px;
}

/* ── Viewport ─────────────────────────────────────────────────── */
.mv-viewport {
  width: 100%;
  min-height: 120px;
  max-height: 500px;
  overflow: auto;
  cursor: grab;
  background: var(--vp-c-bg);
}

.mv-viewport:active {
  cursor: grabbing;
}

/* ── Canvas ───────────────────────────────────────────────────── */
.mv-canvas {
  transform-origin: 0 0;
}

/* ── SVG ──────────────────────────────────────────────────────── */
.mv-svg {
  line-height: 0;
}

.mv-svg :deep(svg) {
  display: block;
}

/* ── Code mode ────────────────────────────────────────────────── */
.mv-code {
  width: 100%;
  padding: 16px;
  overflow: auto;
  max-height: 500px;
  box-sizing: border-box;
}

.mv-code pre {
  margin: 0;
  padding: 0;
  background: transparent;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.mv-code code {
  color: var(--vp-c-text-1);
}

/* ── Error ────────────────────────────────────────────────────── */
.mv-error {
  color: var(--vp-c-danger-1);
  font-size: 13px;
  padding: 24px;
  text-align: center;
  font-family: monospace;
  white-space: pre-wrap;
}
</style>
