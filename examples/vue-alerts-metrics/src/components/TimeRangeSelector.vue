<script setup lang="ts">
defineProps<{
  selected: string
}>()

const emit = defineEmits<{
  change: [range: string]
}>()

const ranges = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' }
]

function handleClick(range: string) {
  emit('change', range)
}
</script>

<template>
  <div class="time-range-selector">
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
  </div>
</template>

<style scoped>
.time-range-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 500;
}

.buttons {
  display: flex;
  gap: 5px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

button:hover {
  background: #f5f5f5;
}

button.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}
</style>
