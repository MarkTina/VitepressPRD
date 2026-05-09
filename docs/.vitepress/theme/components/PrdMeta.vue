<template>
  <div class="prd-meta">
    <div class="prd-meta-item">
      <span class="prd-meta-label">版本</span>
      <span class="prd-meta-value">{{ version }}</span>
    </div>
    <div class="prd-meta-item">
      <span class="prd-meta-label">状态</span>
      <StatusBadge :status="status" />
    </div>
    <div class="prd-meta-item">
      <span class="prd-meta-label">日期</span>
      <span class="prd-meta-value">{{ date }}</span>
    </div>
    <div class="prd-meta-item">
      <span class="prd-meta-label">作者</span>
      <span class="prd-meta-value">{{ author }}</span>
    </div>
    <div v-if="iterationGoal" class="prd-meta-item prd-meta-goal">
      <span class="prd-meta-label">迭代目标</span>
      <span class="prd-meta-value">{{ iterationGoal }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'

defineProps<{
  version: string
  status: string
  date: string
  author: string
  iterationGoal?: string
}>()
</script>

<style scoped>
.prd-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
}

.prd-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prd-meta-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.prd-meta-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.prd-meta-goal {
  grid-column: 1 / -1;
}

.prd-meta-goal .prd-meta-value {
  font-weight: 400;
  line-height: 1.5;
}
</style>
