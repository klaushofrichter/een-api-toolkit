<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatTimestamp } from 'een-api-toolkit'

const props = defineProps<{
  selected: string
}>()

const emit = defineEmits<{
  change: [range: string]
  'update:aggregateMinutes': [minutes: number | undefined]
}>()

const ranges = [
  { value: 'none', label: 'None' },
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' }
]

const aggregateOptions = [
  { value: '', label: 'None', minutes: undefined },
  { value: '60', label: '60 min', minutes: 60 },
  { value: '360', label: '6h', minutes: 360 },
  { value: '1440', label: '24h', minutes: 1440 }
]

const selectedAggregate = ref('')
const showApiFormat = ref(false)
const startCopied = ref(false)
const endCopied = ref(false)

function getTimeRangeMs(range: string): number {
  switch (range) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}

const timeRange = computed(() => {
  const now = new Date()
  const rangeMs = getTimeRangeMs(props.selected)
  const startTime = new Date(now.getTime() - rangeMs)
  return { start: startTime, end: now }
})

// Always compute API format timestamps for copying
const apiStartTimestamp = computed(() => {
  return formatTimestamp(timeRange.value.start.toISOString())
})

const apiEndTimestamp = computed(() => {
  return formatTimestamp(timeRange.value.end.toISOString())
})

const formattedStart = computed(() => {
  if (showApiFormat.value) {
    return apiStartTimestamp.value
  }
  return timeRange.value.start.toLocaleString()
})

const formattedEnd = computed(() => {
  if (showApiFormat.value) {
    return apiEndTimestamp.value
  }
  return timeRange.value.end.toLocaleString()
})

function handleClick(range: string) {
  emit('change', range)
}

function toggleFormat() {
  showApiFormat.value = !showApiFormat.value
}

function handleAggregateChange() {
  const option = aggregateOptions.find(o => o.value === selectedAggregate.value)
  emit('update:aggregateMinutes', option?.minutes)
}

async function copyStartTimestamp() {
  await navigator.clipboard.writeText(apiStartTimestamp.value)
  startCopied.value = true
  setTimeout(() => {
    startCopied.value = false
  }, 500)
}

async function copyEndTimestamp() {
  await navigator.clipboard.writeText(apiEndTimestamp.value)
  endCopied.value = true
  setTimeout(() => {
    endCopied.value = false
  }, 500)
}
</script>

<template>
  <div class="time-range-selector">
    <div class="selector-row">
      <span class="label">Time Range:</span>
      <div class="buttons">
        <button
          v-for="range in ranges"
          :key="range.value"
          :class="{ active: selected === range.value }"
          @click="handleClick(range.value)"
          :data-testid="`time-range-${range.value}`"
        >
          {{ range.label }}
        </button>
      </div>
      <span class="label aggregate-label">Aggregate:</span>
      <div class="buttons">
        <button
          v-for="option in aggregateOptions"
          :key="option.value"
          :class="{ active: selectedAggregate === option.value }"
          @click="selectedAggregate = option.value; handleAggregateChange()"
          :data-testid="`aggregate-${option.value || 'none'}`"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div v-if="selected !== 'none'" class="time-display">
      <div class="timestamps">
        <span class="time-label">From:</span>
        <code
          :class="{ copied: startCopied }"
          @click="copyStartTimestamp"
          data-testid="time-start"
          title="Click to copy API format timestamp"
        >{{ formattedStart }}</code>
        <span class="time-label">To:</span>
        <code
          :class="{ copied: endCopied }"
          @click="copyEndTimestamp"
          data-testid="time-end"
          title="Click to copy API format timestamp"
        >{{ formattedEnd }}</code>
      </div>
      <button
        class="format-toggle"
        @click="toggleFormat"
        data-testid="format-toggle"
      >
        {{ showApiFormat ? 'Local Time' : 'API Format' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.time-range-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 500;
}

.aggregate-label {
  margin-left: 20px;
}

.buttons {
  display: flex;
  gap: 5px;
}

.buttons button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

.buttons button:hover {
  background: #f5f5f5;
}

.buttons button.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.timestamps {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
}

.time-label {
  font-weight: 500;
}

.timestamps code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.timestamps code:hover {
  background: #e0e0e0;
}

.timestamps code.copied {
  background: #42b883;
  color: white;
}

.format-toggle {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #666;
}

.format-toggle:hover {
  background: #f0f0f0;
  border-color: #999;
}
</style>
