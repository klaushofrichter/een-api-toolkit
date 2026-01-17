<script setup lang="ts">
import { ref, watch } from 'vue'
import { listNotifications, type Camera, type Notification, type EenError } from 'een-api-toolkit'

const props = defineProps<{
  camera: Camera
  timeRange: string
}>()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

function getTimeRangeMs(range: string): number {
  switch (range) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}

async function fetchNotifications(append = false) {
  if (!props.camera?.id) return

  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    notifications.value = []
    nextPageToken.value = undefined
  }
  error.value = null

  const now = new Date()
  const rangeMs = getTimeRangeMs(props.timeRange)
  const startTime = new Date(now.getTime() - rangeMs)

  const result = await listNotifications({
    actorId: props.camera.id,
    timestamp__gte: startTime.toISOString(),
    timestamp__lte: now.toISOString(),
    pageSize: 20,
    pageToken: append ? nextPageToken.value : undefined,
    sort: ['-timestamp']
  })

  if (result.error) {
    error.value = result.error
  } else {
    const newNotifications = result.data?.results ?? []
    if (append) {
      notifications.value = [...notifications.value, ...newNotifications]
    } else {
      notifications.value = newNotifications
    }
    nextPageToken.value = result.data?.nextPageToken
  }

  loading.value = false
  loadingMore.value = false
}

function loadMore() {
  if (nextPageToken.value) {
    fetchNotifications(true)
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function getCategoryClass(category: string): string {
  switch (category) {
    case 'health': return 'category-health'
    case 'video': return 'category-video'
    case 'security': return 'category-security'
    case 'operational': return 'category-operational'
    default: return 'category-default'
  }
}

watch(
  () => [props.camera?.id, props.timeRange],
  () => {
    fetchNotifications()
  },
  { immediate: true }
)
</script>

<template>
  <div class="notifications-list" data-testid="notifications-list">
    <div v-if="loading" class="loading" data-testid="notifications-loading">
      Loading notifications...
    </div>
    <div v-else-if="error" class="error" data-testid="notifications-error">
      {{ error.message }}
    </div>
    <div v-else-if="notifications.length === 0" class="no-data" data-testid="notifications-no-data">
      No notifications found for this time range.
    </div>
    <div v-else>
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.read }"
        data-testid="notification-item"
      >
        <div class="notification-header">
          <span
            class="category-badge"
            :class="getCategoryClass(notification.category)"
          >
            {{ notification.category }}
          </span>
          <span v-if="!notification.read" class="unread-badge">New</span>
        </div>
        <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
        <div v-if="notification.description" class="notification-description">
          {{ notification.description }}
        </div>
        <div class="notification-status">
          Status: {{ notification.status }}
        </div>
      </div>

      <button
        v-if="nextPageToken"
        @click="loadMore"
        :disabled="loadingMore"
        class="load-more-button"
        data-testid="notifications-load-more"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.notifications-list {
  min-height: 200px;
}

.loading,
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  font-style: italic;
}

.error {
  color: #e74c3c;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 4px;
}

.notification-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
}

.notification-item.unread {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.category-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-health {
  background: #fef3c7;
  color: #92400e;
}

.category-video {
  background: #dbeafe;
  color: #1e40af;
}

.category-security {
  background: #fde8e8;
  color: #c53030;
}

.category-operational {
  background: #e0e7ff;
  color: #3730a3;
}

.category-default {
  background: #f3f4f6;
  color: #374151;
}

.unread-badge {
  background: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.notification-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.notification-description {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 5px;
}

.notification-status {
  font-size: 0.75rem;
  color: #888;
}

.load-more-button {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.load-more-button:hover {
  background: #eee;
}

.load-more-button:disabled {
  background: #f5f5f5;
  color: #999;
}
</style>
