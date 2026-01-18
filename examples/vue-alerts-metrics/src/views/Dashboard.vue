<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Camera } from 'een-api-toolkit'
import CameraSelector from '../components/CameraSelector.vue'
import TimeRangeSelector from '../components/TimeRangeSelector.vue'
import MetricsChart from '../components/MetricsChart.vue'
import AlertsList from '../components/AlertsList.vue'
import NotificationsList from '../components/NotificationsList.vue'

const selectedCamera = ref<Camera | null>(null)
const selectedTimeRange = ref('none')
const selectedAggregateMinutes = ref<number | undefined>(undefined)
const cameraListLoaded = ref(false)

// Track if a specific camera is selected (not "All Cameras")
const hasSpecificCamera = computed(() => selectedCamera.value !== null)

function handleCameraSelect(camera: Camera | null) {
  selectedCamera.value = camera
  cameraListLoaded.value = true
}

function handleTimeRangeChange(range: string) {
  selectedTimeRange.value = range
}

function handleAggregateChange(minutes: number | undefined) {
  selectedAggregateMinutes.value = minutes
}

// Reset lists when camera changes
watch(selectedCamera, () => {
  // Lists will reset automatically through their props
})
</script>

<template>
  <div class="dashboard" data-testid="dashboard-container">
    <h2>Alerts & Metrics Dashboard</h2>

    <div class="controls">
      <CameraSelector
        @select="handleCameraSelect"
        data-testid="camera-selector"
      />
      <TimeRangeSelector
        :selected="selectedTimeRange"
        @change="handleTimeRangeChange"
        @update:aggregate-minutes="handleAggregateChange"
        data-testid="time-range-selector"
      />
    </div>

    <div v-if="!cameraListLoaded" class="no-camera-selected">
      <p>Loading cameras...</p>
    </div>

    <div v-else class="dashboard-content">
      <section class="metrics-section">
        <h3>Event Metrics</h3>
        <div v-if="!hasSpecificCamera" class="select-camera-message">
          <p>Select a specific camera to view event metrics.</p>
        </div>
        <MetricsChart
          v-else
          :camera="selectedCamera!"
          :time-range="selectedTimeRange"
          :aggregate-minutes="selectedAggregateMinutes"
        />
      </section>

      <div class="lists-container">
        <section class="alerts-section">
          <h3>Alerts</h3>
          <AlertsList
            :camera="selectedCamera"
            :time-range="selectedTimeRange"
          />
        </section>

        <section class="notifications-section">
          <h3>Notifications</h3>
          <NotificationsList
            :camera="selectedCamera"
            :time-range="selectedTimeRange"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.no-camera-selected {
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-section {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.metrics-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.select-camera-message {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.lists-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .lists-container {
    grid-template-columns: 1fr;
  }
}

.alerts-section,
.notifications-section {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.alerts-section h3,
.notifications-section h3 {
  margin-bottom: 15px;
  color: #333;
  position: sticky;
  top: 0;
  background: #fff;
  padding-bottom: 10px;
}
</style>
