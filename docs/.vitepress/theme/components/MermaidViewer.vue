<template>
  <div class="mv-wrapper" :class="{ 'mv--fullscreen': isFullscreen }">
    <!-- Toolbar -->
    <div class="mv-toolbar">
      <button class="mv-btn" @click="mode = mode === 'diagram' ? 'code' : 'diagram'">
        {{ mode === 'diagram' ? '源码' : '图表' }}
      </button>
      <span class="mv-sep"></span>
      <button class="mv-btn" :disabled="mode !== 'diagram' || !!error" @click="zoomIn">＋</button>
      <span class="mv-zoom-label">{{ Math.round(scale * 100) }}%</span>
      <button class="mv-btn" :disabled="mode !== 'diagram' || !!error" @click="zoomOut">－</button>
      <button class="mv-btn" :disabled="mode !== 'diagram' || !!error" @click="resetView">↺</button>
      <span class="mv-sep"></span>
      <button class="mv-btn mv-btn--fullscreen" @click="toggleFullscreen">⛶</button>
    </div>

    <!-- Content -->
    <div class="mv-body" :class="{ 'mv-body--fullscreen': isFullscreen }">
      <!-- Code mode -->
      <div v-if="mode === 'code'" class="mv-code">
        <pre><code>{{ decodeCode(code) }}</code></pre>
      </div>

      <!-- Diagram mode -->
      <div
        v-else
        ref="diagramContainer"
        class="mv-diagram"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
      >
        <div v-if="error" class="mv-error">{{ error }}</div>
        <div
          v-else
          ref="svgContainer"
          class="mv-svg"
          :style="{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }"
          v-html="svg"
        ></div>
      </div>
    </div>

    <!-- Fullscreen overlay (Teleported to body) -->
    <Teleport :to="teleportTarget" v-if="isFullscreen">
      <div class="mv-fullscreen-overlay" @click.self="toggleFullscreen">
        <div class="mv-wrapper mv--overlay-active">
          <div class="mv-toolbar mv-toolbar--fullscreen">
            <button class="mv-btn mv-btn--close" @click="toggleFullscreen">✕ 退出</button>
            <span class="mv-fullscreen-title">{{ id }}</span>
            <span class="mv-sep"></span>
            <button class="mv-btn" @click="zoomIn">＋</button>
            <span class="mv-zoom-label">{{ Math.round(scale * 100) }}%</span>
            <button class="mv-btn" @click="zoomOut">－</button>
            <button class="mv-btn" @click="resetView">↺</button>
          </div>
          <div
            class="mv-body mv-body--fullscreen"
            @wheel.prevent="onWheel"
            @pointerdown="onPointerDown"
            ref="fullscreenContainer"
          >
            <div
              class="mv-svg"
              :style="{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }"
              v-html="svg"
            ></div>
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
  code: string  // base64 encoded mermaid source
  id: string
}>()

function decodeCode(raw: string): string {
  // Try base64 decode; if it fails, treat as plain text (backward compat)
  try {
    return atob(raw)
  } catch {
    return raw
  }
}

const mode = ref<'diagram' | 'code'>('diagram')
const svg = ref('')
const error = ref('')

// Zoom / pan state
const scale = ref(1)
const tx = ref(0)
const ty = ref(0)

// Pointer drag state
const dragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const txStart = ref(0)
const tyStart = ref(0)

// Fullscreen
const isFullscreen = ref(false)
const teleportTarget = ref('body')

// Refs
const diagramContainer = ref<HTMLElement | null>(null)
const svgContainer = ref<HTMLElement | null>(null)
const fullscreenContainer = ref<HTMLElement | null>(null)

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
  } catch (e: any) {
    error.value = e.message || String(e)
    svg.value = ''
  }
}

// ── Theme (dark/light) ──────────────────────────────────────────
async function handleThemeChange() {
  const isDark = document.documentElement.classList.contains('dark')
  mermaid.initialize({ ...mermaidConfig, theme: isDark ? 'dark' : 'default' })
  await renderDiagram()
}

// ── Zoom / Pan ──────────────────────────────────────────────────
const MIN_SCALE = 0.1
const MAX_SCALE = 5

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

function zoomIn() {
  scale.value = clampScale(scale.value + 0.2)
}

function zoomOut() {
  scale.value = clampScale(scale.value - 0.2)
}

function resetView() {
  scale.value = 1
  tx.value = 0
  ty.value = 0
}

function getContainer(): HTMLElement | null {
  return isFullscreen.value ? fullscreenContainer.value : diagramContainer.value
}

function onWheel(e: WheelEvent) {
  const container = getContainer()
  if (!container) return

  const rect = container.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const oldScale = scale.value
  const newScale = clampScale(oldScale + delta)

  // Zoom toward cursor position
  const ratio = newScale / oldScale
  tx.value = offsetX - ratio * (offsetX - tx.value)
  ty.value = offsetY - ratio * (offsetY - ty.value)
  scale.value = newScale
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  txStart.value = tx.value
  tyStart.value = ty.value

  const container = getContainer()
  container?.setPointerCapture(e.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value
  tx.value = txStart.value + dx
  ty.value = tyStart.value + dy
}

function onPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

// ── Fullscreen ──────────────────────────────────────────────────
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

// Close fullscreen on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  await renderDiagram()

  // Watch for theme changes
  darkObserver = new MutationObserver(() => {
    handleThemeChange()
  })
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  darkObserver?.disconnect()
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

// Re-render when code changes
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
  min-width: 38px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.mv-fullscreen-title {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Body ─────────────────────────────────────────────────────── */
.mv-body {
  position: relative;
  min-height: 120px;
  max-height: 500px;
  overflow: hidden;
}

.mv-body--fullscreen {
  flex: 1;
  max-height: none;
  overflow: hidden;
  cursor: grab;
}

.mv-body--fullscreen:active {
  cursor: grabbing;
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

/* ── Diagram mode ─────────────────────────────────────────────── */
.mv-diagram {
  width: 100%;
  height: 100%;
  min-height: 120px;
  max-height: 500px;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg);
}

.mv-diagram:active {
  cursor: grabbing;
}

.mv-svg {
  transform-origin: 0 0;
  will-change: transform;
}

.mv-svg :deep(svg) {
  display: block;
  max-width: none;
}

.mv-error {
  color: var(--vp-c-danger-1);
  font-size: 13px;
  padding: 24px;
  text-align: center;
  font-family: monospace;
  white-space: pre-wrap;
}

/* ── Fullscreen overlay ───────────────────────────────────────── */
.mv-fullscreen-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
}

.mv--overlay-active {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: none;
  border-radius: 0;
  margin: 0;
}

.mv--overlay-active .mv-body--fullscreen {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg);
}
</style>
