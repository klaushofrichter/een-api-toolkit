<script setup lang="ts">
import { ref } from 'vue'
import { useApiLog, matchPresetName, isHomePreset, type ApiLogEntry } from '../composables/useApiLog'

const props = defineProps<{
  cameraId: string | null
}>()

const { entries, clear } = useApiLog()
const selectedEntry = ref<ApiLogEntry | null>(null)

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

function closeModal() {
  selectedEntry.value = null
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

function fmt(n: unknown): string {
  return typeof n === 'number' ? n.toFixed(2) : '?'
}

function entryIsAtHome(entry: ApiLogEntry): boolean {
  if (entry.error || entry.functionName !== 'getPtzPosition') return false
  const r = entry.response as Record<string, unknown> | undefined
  if (!r) return false
  const name = matchPresetName(r as { x?: number; y?: number; z?: number })
  return isHomePreset(name)
}

function entrySummary(entry: ApiLogEntry): string {
  const p = entry.params as Record<string, unknown> | undefined
  const r = entry.response as Record<string, unknown> | undefined
  if (entry.error) {
    const r = entry.response as Record<string, unknown> | undefined
    if (!r) return ''
    const parts: string[] = []
    if (r.status != null) parts.push(`Status: ${r.status}`)
    if (r.message) parts.push(String(r.message))
    return parts.join(' - ')
  }
  switch (entry.functionName) {
    case 'getPtzPosition': {
      if (!r) return ''
      const name = matchPresetName(r as { x?: number; y?: number; z?: number })
      const pos = `x=${fmt(r.x)} y=${fmt(r.y)} z=${fmt(r.z)}`
      return name ? `[${name}] ${pos}` : pos
    }
    case 'movePtz': {
      const move = p?.move as Record<string, unknown> | undefined
      if (!move) return ''
      const mt = move.moveType as string
      if (mt === 'direction') {
        const dir = (move.direction as string[])?.join(',') ?? ''
        return `direction ${dir} ${move.stepSize ?? ''}`
      }
      if (mt === 'centerOn') {
        return `centerOn x=${fmt(move.relativeX)} y=${fmt(move.relativeY)}`
      }
      if (mt === 'position') {
        return `position x=${fmt(move.x)} y=${fmt(move.y)} z=${fmt(move.z)}`
      }
      return mt
    }
    case 'getPtzSettings': {
      if (!r) return ''
      const presets = r.presets as unknown[] | undefined
      return `mode=${r.mode ?? '?'} presets=${presets?.length ?? 0}`
    }
    case 'updatePtzSettings': {
      const s = p?.settings as Record<string, unknown> | undefined
      if (!s) return ''
      return Object.keys(s).join(', ')
    }
    default:
      return ''
  }
}
</script>

<template>
  <div class="api-log" data-testid="api-log">
    <div class="log-header">
      <h3>API Call Log ({{ entries.length }})</h3>
      <button v-if="entries.length > 0" @click="clear" class="clear-btn" data-testid="clear-log">
        Clear
      </button>
    </div>

    <div v-if="entries.length === 0" class="empty-log">
      No API calls logged yet.
    </div>

    <div v-else class="log-list" data-testid="log-list">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="log-entry"
        :class="{ 'log-entry-error': entry.error }"
        @click="selectedEntry = entry"
        data-testid="log-entry"
      >
        <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
        <span class="log-fn" :class="{ 'log-fn-error': entry.error }">
          {{ entry.functionName }}
        </span>
        <svg v-if="entryIsAtHome(entry)" class="log-home-icon" viewBox="0 0 24 24" width="14" height="14" fill="#27ae60">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span v-if="entrySummary(entry)" class="log-summary">{{ entrySummary(entry) }}</span>
        <span v-if="entry.count > 1" class="log-count">{{ entry.count }}</span>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="selectedEntry" class="modal-overlay" @click="handleOverlayClick" data-testid="log-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedEntry.functionName }}</h3>
          <button @click="closeModal" class="modal-close" data-testid="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="props.cameraId" class="modal-section">
            <h4>Camera</h4>
            <pre><code>{{ props.cameraId }}</code></pre>
          </div>
          <div class="modal-section">
            <h4>Time (last call)</h4>
            <pre>{{ selectedEntry.timestamp.toISOString() }}</pre>
          </div>
          <div v-if="selectedEntry.count > 1" class="modal-section">
            <h4>Repeat Count</h4>
            <pre>{{ selectedEntry.count }} identical calls</pre>
          </div>
          <div class="modal-section">
            <h4>Parameters</h4>
            <pre class="json-block">{{ JSON.stringify(selectedEntry.params, null, 2) }}</pre>
          </div>
          <div class="modal-section">
            <h4>Response</h4>
            <pre class="json-block" :class="{ 'json-error': selectedEntry.error }">{{ JSON.stringify(selectedEntry.response, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-log {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
}

.log-header h3 {
  font-size: 14px;
  color: #2c3e50;
  margin: 0;
}

.clear-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #6c757d;
  border-radius: 4px;
}

.clear-btn:hover {
  background: #5a6268;
}

.empty-log {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 13px;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  transition: background 0.1s;
  overflow: hidden;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry:hover {
  background: #e9ecef;
}

.log-entry-error {
  background: #fff5f5;
}

.log-entry-error:hover {
  background: #ffe0e0;
}

.log-time {
  font-family: monospace;
  color: #888;
  white-space: nowrap;
  font-size: 12px;
}

.log-fn {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  flex-shrink: 0;
}

.log-fn-error {
  color: #e74c3c;
}

.log-home-icon {
  flex-shrink: 0;
}

.log-summary {
  color: #888;
  font-family: monospace;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.log-count {
  flex-shrink: 0;
  background: #6c757d;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  line-height: 18px;
}

.log-entry-error .log-count {
  background: #e74c3c;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 15px 20px;
  overflow-y: auto;
}

.modal-section {
  margin-bottom: 15px;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-section h4 {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.json-block {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.json-error {
  background: #fff5f5;
  border: 1px solid #f8d7da;
}

pre {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
}
</style>
