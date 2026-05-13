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
      <button class="mv-btn mv-btn--fullscreen" @click="toggleFullscreen">⛶</button>
    </div>

    <!-- Content -->
    <div class="mv-body" :class="{ 'mv-body--normal': !isFullscreen }">
      <!-- Code mode -->
      <div v-if="mode === 'code'" class="mv-code">
        <pre><code>{{ decodeCode(code) }}</code></pre>
      </div>

      <!-- Diagram mode -->
      <div
        v-else
        ref="viewportRef"
        class="mv-viewport"
        :class="{ 'mv-viewport--fs': isFullscreen }"
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

    <!-- Fullscreen overlay -->
    <Teleport to="body" v-if="isFullscreen">
      <div class="mv-fs-overlay" @click.self="toggleFullscreen">
        <div class="mv-fs-frame">
          <div class="mv-toolbar mv-toolbar--fullscreen">
            <button class="mv-btn mv-btn--close" @click="toggleFullscreen">✕ 退出</button>
            <span class="mv-fs-title">{{ id }}</span>
            <span class="mv-sep"></span>
            <button class="mv-btn" :disabled="!!error" @click="zoomIn">＋</button>
            <span class="mv-zoom-label">{{ Math.round(svgScale * 100) }}%</span>
            <button class="mv-btn" :disabled="!!error" @click="zoomOut">－</button>
            <button class="mv-btn" :disabled="!!error" @click="resetView">↺</button>
          </div>
          <div
            ref="fsViewportRef"
            class="mv-viewport mv-viewport--fs-body"
            @wheel.prevent="onWheel"
            @pointerdown="onPointerDown"
          >
            <div
              class="mv-canvas"
              :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
            >
              <div class="mv-svg" v-html="svg"></div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import mermaid from 'mermaid'

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

// Fullscreen
const isFullscreen = ref(false)

// Refs
const viewportRef = ref<HTMLElement | null>(null)
const svgContainerRef = ref<HTMLElement | null>(null)
const fsViewportRef = ref<HTMLElement | null>(null)

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
    const { svg: result } = await mermaid.render(`${props.id}-svg`, decodeCode(props.code))
    svg.value = result
    error.value = ''
    await nextTick()
    captureSvgDims()
  } catch (e: any) {
    error.value = e.message || String(e)
    svg.value = ''
  }
}

function getActiveViewport(): HTMLElement | null {
  return isFullscreen.value ? fsViewportRef.value : viewportRef.value
}

function getSvgEl(): SVGElement | null {
  const vp = getActiveViewport()
  return vp?.querySelector('svg') ?? null
}

function captureSvgDims() {
  const svgEl = getSvgEl()
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

  // Update SVG element dimensions on both viewports
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

// ── Zoom / Pan ──────────────────────────────────────────────────
const MIN_SCALE = 0.1
const MAX_SCALE = 10

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

function zoomIn() {
  const vp = getActiveViewport()
  if (!vp) return
  const cx = vp.clientWidth / 2
  const cy = vp.clientHeight / 2
  zoomAtPoint(cx, cy, 0.2)
}

function zoomOut() {
  const vp = getActiveViewport()
  if (!vp) return
  const cx = vp.clientWidth / 2
  const cy = vp.clientHeight / 2
  zoomAtPoint(cx, cy, -0.2)
}

function resetView() {
  svgScale.value = 1
  applyScale()
  const vp = getActiveViewport()
  if (vp) {
    vp.scrollLeft = 0
    vp.scrollTop = 0
  }
}

function zoomAtPoint(offsetX: number, offsetY: number, delta: number) {
  const vp = getActiveViewport()
  if (!vp) return

  const oldScale = svgScale.value
  const newScale = clampScale(oldScale + delta)
  const ratio = newScale / oldScale

  // Cursor position in content coordinates (scroll + offset)
  const cx = vp.scrollLeft + offsetX
  const cy = vp.scrollTop + offsetY

  svgScale.value = newScale
  applyScale()

  // Adjust scroll to keep the point under cursor stable
  requestAnimationFrame(() => {
    vp.scrollLeft = cx * ratio - offsetX
    vp.scrollTop = cy * ratio - offsetY
  })
}

function onWheel(e: WheelEvent) {
  const vp = getActiveViewport()
  if (!vp) return
  const rect = vp.getBoundingClientRect()
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  zoomAtPoint(e.clientX - rect.left, e.clientY - rect.top, delta)
}

function onPointerDown(e: PointerEvent) {
  const vp = getActiveViewport()
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
  const vp = getActiveViewport()
  if (!vp) return
  vp.scrollLeft = scrollStartX.value - (e.clientX - dragStartX.value)
  vp.scrollTop = scrollStartY.value - (e.clientY - dragStartY.value)
}

function onPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

// ── Fullscreen ──────────────────────────────────────────────────
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
    nextTick(() => fitToScreen())
  } else {
    document.body.style.overflow = ''
  }
}

function fitToScreen() {
  const vp = fsViewportRef.value
  if (!vp) return
  const svgEl = vp.querySelector('svg') as SVGElement | null
  if (!svgEl) return

  const vb = svgEl.viewBox.baseVal
  const vw = vb?.width || svgOrigW.value
  const vh = vb?.height || svgOrigH.value

  const pad = 0.92
  const fitW = (vp.clientWidth / vw) * pad
  const fitH = (vp.clientHeight / vh) * pad
  const fit = Math.min(fitW, fitH, 3) // cap at 300%

  svgScale.value = fit
  applyScale()

  // Center
  requestAnimationFrame(() => {
    if (!vp) return
    vp.scrollLeft = (canvasW.value - vp.clientWidth) / 2
    vp.scrollTop = (canvasH.value - vp.clientHeight) / 2
  })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
    document.body.style.overflow = ''
  }
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  await renderDiagram()

  darkObserver = new MutationObserver(() => {
    handleThemeChange()
  })
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  darkObserver?.disconnect()
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
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

.mv-toolbar--fullscreen {
  flex-shrink: 0;
  padding: 10px 16px;
  font-size: 15px;
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

.mv-btn--fullscreen {
  margin-left: auto;
}

.mv-btn--close {
  font-weight: 600;
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
}

.mv-body--normal {
  max-height: 500px;
  display: flex;
}

/* ── Viewport (scrollable area) ────────────────────────────────── */
.mv-viewport {
  width: 100%;
  min-height: 120px;
  overflow: auto;
  cursor: grab;
  background: var(--vp-c-bg);
}

.mv-viewport:not(.mv-viewport--fs) {
  max-height: 500px;
}

.mv-viewport:active {
  cursor: grabbing;
}

.mv-viewport--fs {
  border-radius: 0;
  flex: 1;
  background: var(--vp-c-bg);
}

.mv-viewport--fs-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Canvas (controls SVG intrinsic size) ─────────────────────── */
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
  padding: 16px;
  overflow: auto;
  max-height: 500px;
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

/* ── Fullscreen overlay ───────────────────────────────────────── */
.mv-fs-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--vp-c-bg);
  display: flex;
}

.mv-fs-frame {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.mv-fs-title {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
