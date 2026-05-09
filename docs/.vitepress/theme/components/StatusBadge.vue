<template>
  <span class="status-badge" :class="statusClass">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusMap: Record<string, { text: string; class: string }> = {
  '草稿': { text: '草稿', class: 'status-draft' },
  '评审中': { text: '评审中', class: 'status-review' },
  '已确认': { text: '已确认', class: 'status-confirmed' },
  '已废弃': { text: '已废弃', class: 'status-deprecated' },
  '已发布': { text: '已发布', class: 'status-released' },
  '开发中': { text: '开发中', class: 'status-developing' },
  '测试中': { text: '测试中', class: 'status-testing' },
  '已完成': { text: '已完成', class: 'status-done' }
}

const statusText = computed(() => {
  return statusMap[props.status]?.text || props.status
})

const statusClass = computed(() => {
  return statusMap[props.status]?.class || 'status-default'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
}

.status-draft {
  background: var(--vp-c-gray-soft);
  color: var(--vp-c-text-2);
}

.status-review {
  background: #dbeafe;
  color: #1e40af;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-deprecated {
  background: #fee2e2;
  color: #991b1b;
}

.status-released {
  background: #c7d2fe;
  color: #3730a3;
}

.status-developing {
  background: #fef3c7;
  color: #92400e;
}

.status-testing {
  background: #fce7f3;
  color: #9d174d;
}

.status-done {
  background: #bbf7d0;
  color: #166534;
}

.status-default {
  background: var(--vp-c-gray-soft);
  color: var(--vp-c-text-2);
}
</style>
