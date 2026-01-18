<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { getEventMetrics, listEventFieldValues, type Camera, type EventMetric, type EenError } from 'een-api-toolkit'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

const props = defineProps<{
  camera: Camera
  timeRange: string
  aggregateMinutes?: number
}>()

interface DataPoint {
  timestamp: number
  count: number
}

const dataPoints = ref<DataPoint[]>([])
const eventTypes = ref<string[]>([])
const selectedEventType = ref<string>('')
const loadingEventTypes = ref(false)
const loadingMetrics = ref(false)
const error = ref<EenError | null>(null)

function getTimeRangeMs(range: string): number {
  switch (range) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case 'none': return 7 * 24 * 60 * 60 * 1000  // Default to 7 days when "none"
    default: return 7 * 24 * 60 * 60 * 1000
  }
}

function getAggregationMinutes(range: string): number {
  // Note: EEN API requires minimum 60 minute aggregation
  switch (range) {
    case '1h': return 60      // 1 hour bucket (1 data point)
    case '6h': return 60      // 1 hour buckets (6 data points)
    case '24h': return 60     // 1 hour buckets (24 data points)
    case '7d': return 360     // 6 hour buckets (28 data points)
    case 'none': return 360   // 6 hour buckets for 7 days default
    default: return 360
  }
}

function formatEventType(eventType: string): string {
  // Convert "een.motionDetectionEvent.v1" to "Motion Detection"
  const parts = eventType.split('.')
  if (parts.length >= 2) {
    const name = parts[1]
      .replace(/Event$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return eventType
}

async function fetchEventTypes() {
  if (!props.camera?.id) return

  loadingEventTypes.value = true
  error.value = null
  eventTypes.value = []
  selectedEventType.value = ''
  dataPoints.value = []

  const result = await listEventFieldValues({
    actor: `camera:${props.camera.id}`
  })

  if (result.error) {
    error.value = result.error
    loadingEventTypes.value = false
    return
  }

  eventTypes.value = result.data?.type ?? []
  // Auto-select first event type if available
  if (eventTypes.value.length > 0) {
    selectedEventType.value = eventTypes.value[0]
    fetchMetrics()
  }
  loadingEventTypes.value = false
}

async function fetchMetrics() {
  if (!props.camera?.id || !selectedEventType.value) return

  loadingMetrics.value = true
  error.value = null
  dataPoints.value = []

  const now = new Date()
  const rangeMs = getTimeRangeMs(props.timeRange)
  const startTime = new Date(now.getTime() - rangeMs)
  // Use provided aggregateMinutes prop, or fall back to auto-calculated value
  const aggregateByMinutes = props.aggregateMinutes ?? getAggregationMinutes(props.timeRange)

  const result = await getEventMetrics({
    actor: `camera:${props.camera.id}`,
    eventType: selectedEventType.value,
    timestamp__gte: startTime.toISOString(),
    timestamp__lte: now.toISOString(),
    aggregateByMinutes
  })

  if (result.error) {
    error.value = result.error
    loadingMetrics.value = false
    return
  }

  // Transform API data to chart data points
  const metrics = result.data ?? []
  const nowMs = now.getTime()
  if (metrics.length > 0) {
    // Use the first metric's data points (for count target)
    const metric = metrics.find((m: EventMetric) => m.target === 'count') ?? metrics[0]
    // Defensive check for dataPoints array
    if (metric.dataPoints && Array.isArray(metric.dataPoints)) {
      // Filter out future data points
      dataPoints.value = metric.dataPoints
        .filter(([timestamp]) => timestamp <= nowMs)
        .map(([timestamp, count]) => ({
          timestamp,
          count
        }))
    }
  }

  loadingMetrics.value = false
}

function handleEventTypeChange() {
  if (selectedEventType.value) {
    fetchMetrics()
  }
}

const chartData = computed(() => {
  if (dataPoints.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: dataPoints.value.map(({ timestamp }) => {
      const date = new Date(timestamp)
      // Use time-only format for short ranges, date+time for longer ranges (including 'none' which defaults to 7 days)
      if (props.timeRange === '1h' || props.timeRange === '6h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }),
    datasets: [
      {
        label: formatEventType(selectedEventType.value),
        data: dataPoints.value.map(({ count }) => count),
        borderColor: '#42b883',
        backgroundColor: 'rgba(66, 184, 131, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Event Count'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time'
      }
    }
  }
}

// Fetch event types when camera changes
watch(
  () => props.camera?.id,
  () => {
    fetchEventTypes()
  },
  { immediate: true }
)

// Fetch metrics when time range or aggregate changes (if event type is selected)
watch(
  () => [props.timeRange, props.aggregateMinutes],
  () => {
    if (selectedEventType.value) {
      fetchMetrics()
    }
  }
)
</script>

<template>
  <div class="metrics-chart" data-testid="metrics-chart">
    <div class="event-type-selector" data-testid="event-type-selector">
      <label for="event-type-select">Event Type:</label>
      <select
        id="event-type-select"
        v-model="selectedEventType"
        @change="handleEventTypeChange"
        :disabled="loadingEventTypes || eventTypes.length === 0"
        data-testid="event-type-select"
      >
        <option value="" disabled>
          {{ loadingEventTypes ? 'Loading event types...' : (eventTypes.length === 0 ? 'No event types available' : 'Select an event type') }}
        </option>
        <option
          v-for="et in eventTypes"
          :key="et"
          :value="et"
          data-testid="event-type-option"
        >
          {{ formatEventType(et) }} ({{ et }})
        </option>
      </select>
    </div>

    <div v-if="loadingMetrics" class="loading" data-testid="metrics-loading">
      Loading metrics...
    </div>
    <div v-else-if="error" class="error" data-testid="metrics-error">
      {{ error.message }}
    </div>
    <div v-else-if="!selectedEventType" class="no-data" data-testid="metrics-no-selection">
      Please select an event type to view metrics.
    </div>
    <div v-else-if="chartData.datasets.length === 0" class="no-data" data-testid="metrics-no-data">
      No event data available for this time range.
    </div>
    <div v-else class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.metrics-chart {
  min-height: 300px;
}

.event-type-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.event-type-selector label {
  font-weight: 500;
}

.event-type-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 350px;
}

.event-type-selector select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.chart-container {
  height: 300px;
}

.loading,
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-style: italic;
}

.error {
  color: #e74c3c;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 4px;
}
</style>
