import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  connectToEventSubscription,
  type SSEConnection,
  type SSEConnectionStatus,
  type SSEEvent,
  type EenError
} from 'een-api-toolkit'

export const useConnectionStore = defineStore('connection', () => {
  // Connection state
  const connection = ref<SSEConnection | null>(null)
  const connectionStatus = ref<SSEConnectionStatus>('disconnected')
  const connectionError = ref<EenError | null>(null)
  const connectedSubscriptionId = ref<string | null>(null)

  // Events state
  const events = ref<SSEEvent[]>([])
  const maxEvents = 100

  // Computed
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const isConnecting = computed(() => connectionStatus.value === 'connecting')

  function connect(subscriptionId: string, sseUrl: string) {
    // If already connected to same subscription, do nothing
    if (connection.value && connectedSubscriptionId.value === subscriptionId) {
      return
    }

    // Disconnect any existing connection
    disconnect()

    connectionError.value = null
    events.value = []
    connectedSubscriptionId.value = subscriptionId

    const result = connectToEventSubscription(sseUrl, {
      onEvent: (event) => {
        // Add new event at the beginning, limit to maxEvents
        events.value.unshift(event)
        if (events.value.length > maxEvents) {
          events.value.pop()
        }
      },
      onError: (error) => {
        connectionError.value = { code: 'NETWORK_ERROR', message: error.message }
      },
      onStatusChange: (status) => {
        connectionStatus.value = status
      }
    })

    if (result.error) {
      connectionError.value = result.error
      connectedSubscriptionId.value = null
    } else {
      connection.value = result.data
    }
  }

  /**
   * Set a connection error.
   * Use this action instead of directly mutating connectionError.
   */
  function setConnectionError(error: EenError) {
    connectionError.value = error
  }

  function disconnect() {
    if (connection.value) {
      connection.value.close()
      connection.value = null
    }
    connectionStatus.value = 'disconnected'
    connectedSubscriptionId.value = null
  }

  function clearEvents() {
    events.value = []
  }

  return {
    // State
    connection,
    connectionStatus,
    connectionError,
    connectedSubscriptionId,
    events,
    maxEvents,
    // Computed
    isConnected,
    isConnecting,
    // Actions
    connect,
    disconnect,
    clearEvents,
    setConnectionError
  }
})
