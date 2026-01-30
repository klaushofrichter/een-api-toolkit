<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  listEventAlertConditionRules,
  listAlertConditionRules,
  listAlertActionRules,
  listAlertActions,
  type EventAlertConditionRule,
  type AlertConditionRule,
  type AlertActionRule,
  type AutomationAlertAction,
  type EenError
} from 'een-api-toolkit'

// Active tab
type TabName = 'eventAlertRules' | 'conditionRules' | 'actionRules' | 'actions'
const activeTab = ref<TabName>('eventAlertRules')

// Modal state
type SelectedItem = EventAlertConditionRule | AlertConditionRule | AlertActionRule | AutomationAlertAction
const showModal = ref(false)
const selectedItem = ref<SelectedItem | null>(null)
const selectedItemTitle = ref('')

function openModal(item: SelectedItem, title: string) {
  selectedItem.value = item
  selectedItemTitle.value = title
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedItem.value = null
  selectedItemTitle.value = ''
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}

// Event Alert Condition Rules
const eventAlertRules = ref<EventAlertConditionRule[]>([])
const eventAlertRulesLoading = ref(false)
const eventAlertRulesError = ref<EenError | null>(null)
const eventAlertRulesNextToken = ref<string | undefined>(undefined)
const hasMoreEventAlertRules = computed(() => !!eventAlertRulesNextToken.value)

// Alert Condition Rules
const conditionRules = ref<AlertConditionRule[]>([])
const conditionRulesLoading = ref(false)
const conditionRulesError = ref<EenError | null>(null)
const conditionRulesNextToken = ref<string | undefined>(undefined)
const hasMoreConditionRules = computed(() => !!conditionRulesNextToken.value)

// Alert Action Rules
const actionRules = ref<AlertActionRule[]>([])
const actionRulesLoading = ref(false)
const actionRulesError = ref<EenError | null>(null)
const actionRulesNextToken = ref<string | undefined>(undefined)
const hasMoreActionRules = computed(() => !!actionRulesNextToken.value)

// Alert Actions
const actions = ref<AutomationAlertAction[]>([])
const actionsLoading = ref(false)
const actionsError = ref<EenError | null>(null)
const actionsNextToken = ref<string | undefined>(undefined)
const hasMoreActions = computed(() => !!actionsNextToken.value)

// Filter state
const enabledFilter = ref<'all' | 'enabled' | 'disabled'>('all')

// Fetch functions
async function fetchEventAlertRules(append = false) {
  eventAlertRulesLoading.value = true
  eventAlertRulesError.value = null

  const params: Parameters<typeof listEventAlertConditionRules>[0] = {
    pageSize: 10,
    ...(append && eventAlertRulesNextToken.value ? { pageToken: eventAlertRulesNextToken.value } : {}),
    ...(enabledFilter.value !== 'all' ? { enabled__eq: enabledFilter.value === 'enabled' } : {})
  }

  const result = await listEventAlertConditionRules(params)

  if (result.error) {
    eventAlertRulesError.value = result.error
    if (!append) eventAlertRules.value = []
    eventAlertRulesNextToken.value = undefined
  } else {
    if (append) {
      eventAlertRules.value = [...eventAlertRules.value, ...result.data.results]
    } else {
      eventAlertRules.value = result.data.results
    }
    eventAlertRulesNextToken.value = result.data.nextPageToken
  }

  eventAlertRulesLoading.value = false
}

async function fetchConditionRules(append = false) {
  conditionRulesLoading.value = true
  conditionRulesError.value = null

  const params: Parameters<typeof listAlertConditionRules>[0] = {
    pageSize: 10,
    include: ['actions', 'insights'],
    ...(append && conditionRulesNextToken.value ? { pageToken: conditionRulesNextToken.value } : {}),
    ...(enabledFilter.value !== 'all' ? { enabled__eq: enabledFilter.value === 'enabled' } : {})
  }

  const result = await listAlertConditionRules(params)

  if (result.error) {
    conditionRulesError.value = result.error
    if (!append) conditionRules.value = []
    conditionRulesNextToken.value = undefined
  } else {
    if (append) {
      conditionRules.value = [...conditionRules.value, ...result.data.results]
    } else {
      conditionRules.value = result.data.results
    }
    conditionRulesNextToken.value = result.data.nextPageToken
  }

  conditionRulesLoading.value = false
}

async function fetchActionRules(append = false) {
  actionRulesLoading.value = true
  actionRulesError.value = null

  const params: Parameters<typeof listAlertActionRules>[0] = {
    pageSize: 10,
    ...(append && actionRulesNextToken.value ? { pageToken: actionRulesNextToken.value } : {}),
    ...(enabledFilter.value !== 'all' ? { enabled__eq: enabledFilter.value === 'enabled' } : {})
  }

  const result = await listAlertActionRules(params)

  if (result.error) {
    actionRulesError.value = result.error
    if (!append) actionRules.value = []
    actionRulesNextToken.value = undefined
  } else {
    if (append) {
      actionRules.value = [...actionRules.value, ...result.data.results]
    } else {
      actionRules.value = result.data.results
    }
    actionRulesNextToken.value = result.data.nextPageToken
  }

  actionRulesLoading.value = false
}

async function fetchActions(append = false) {
  actionsLoading.value = true
  actionsError.value = null

  const params: Parameters<typeof listAlertActions>[0] = {
    pageSize: 10,
    ...(append && actionsNextToken.value ? { pageToken: actionsNextToken.value } : {}),
    ...(enabledFilter.value !== 'all' ? { enabled__eq: enabledFilter.value === 'enabled' } : {})
  }

  const result = await listAlertActions(params)

  if (result.error) {
    actionsError.value = result.error
    if (!append) actions.value = []
    actionsNextToken.value = undefined
  } else {
    if (append) {
      actions.value = [...actions.value, ...result.data.results]
    } else {
      actions.value = result.data.results
    }
    actionsNextToken.value = result.data.nextPageToken
  }

  actionsLoading.value = false
}

function refreshCurrentTab() {
  switch (activeTab.value) {
    case 'eventAlertRules':
      fetchEventAlertRules()
      break
    case 'conditionRules':
      fetchConditionRules()
      break
    case 'actionRules':
      fetchActionRules()
      break
    case 'actions':
      fetchActions()
      break
  }
}

function loadMore() {
  switch (activeTab.value) {
    case 'eventAlertRules':
      fetchEventAlertRules(true)
      break
    case 'conditionRules':
      fetchConditionRules(true)
      break
    case 'actionRules':
      fetchActionRules(true)
      break
    case 'actions':
      fetchActions(true)
      break
  }
}

function switchTab(tab: TabName) {
  activeTab.value = tab
  // Fetch data for the tab if not loaded
  switch (tab) {
    case 'eventAlertRules':
      if (eventAlertRules.value.length === 0 && !eventAlertRulesLoading.value) {
        fetchEventAlertRules()
      }
      break
    case 'conditionRules':
      if (conditionRules.value.length === 0 && !conditionRulesLoading.value) {
        fetchConditionRules()
      }
      break
    case 'actionRules':
      if (actionRules.value.length === 0 && !actionRulesLoading.value) {
        fetchActionRules()
      }
      break
    case 'actions':
      if (actions.value.length === 0 && !actionsLoading.value) {
        fetchActions()
      }
      break
  }
}

const isLoading = computed(() => {
  switch (activeTab.value) {
    case 'eventAlertRules':
      return eventAlertRulesLoading.value
    case 'conditionRules':
      return conditionRulesLoading.value
    case 'actionRules':
      return actionRulesLoading.value
    case 'actions':
      return actionsLoading.value
    default:
      return false
  }
})

const hasMore = computed(() => {
  switch (activeTab.value) {
    case 'eventAlertRules':
      return hasMoreEventAlertRules.value
    case 'conditionRules':
      return hasMoreConditionRules.value
    case 'actionRules':
      return hasMoreActionRules.value
    case 'actions':
      return hasMoreActions.value
    default:
      return false
  }
})

onMounted(() => {
  fetchEventAlertRules()
})
</script>

<template>
  <div class="automations">
    <div class="header">
      <h2>Automations</h2>
      <div class="controls">
        <select v-model="enabledFilter" @change="refreshCurrentTab" data-testid="enabled-filter">
          <option value="all">All</option>
          <option value="enabled">Enabled Only</option>
          <option value="disabled">Disabled Only</option>
        </select>
        <button @click="refreshCurrentTab" :disabled="isLoading" data-testid="refresh-button">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'eventAlertRules' }"
        @click="switchTab('eventAlertRules')"
        data-testid="tab-event-alert-rules"
      >
        Event Alert Rules
      </button>
      <button
        :class="{ active: activeTab === 'conditionRules' }"
        @click="switchTab('conditionRules')"
        data-testid="tab-condition-rules"
      >
        Condition Rules
      </button>
      <button
        :class="{ active: activeTab === 'actionRules' }"
        @click="switchTab('actionRules')"
        data-testid="tab-action-rules"
      >
        Action Rules
      </button>
      <button
        :class="{ active: activeTab === 'actions' }"
        @click="switchTab('actions')"
        data-testid="tab-actions"
      >
        Actions
      </button>
    </div>

    <!-- Event Alert Condition Rules -->
    <div v-if="activeTab === 'eventAlertRules'" class="tab-content" data-testid="event-alert-rules-content">
      <div v-if="eventAlertRulesLoading && eventAlertRules.length === 0" class="loading">
        Loading event alert condition rules...
      </div>
      <div v-else-if="eventAlertRulesError" class="error">
        Error: {{ eventAlertRulesError.message }}
      </div>
      <div v-else>
        <table v-if="eventAlertRules.length > 0" data-testid="event-alert-rules-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th>Enabled</th>
              <th>Output Types</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rule in eventAlertRules"
              :key="rule.id"
              class="clickable-row"
              @click="openModal(rule, 'Event Alert Condition Rule')"
            >
              <td>{{ rule.name }}</td>
              <td>{{ rule.priority }}</td>
              <td>
                <span :class="rule.enabled ? 'enabled' : 'disabled'">
                  {{ rule.enabled ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>{{ rule.outputAlertTypes?.join(', ') || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-data">No event alert condition rules found.</p>
      </div>
    </div>

    <!-- Alert Condition Rules -->
    <div v-if="activeTab === 'conditionRules'" class="tab-content" data-testid="condition-rules-content">
      <div v-if="conditionRulesLoading && conditionRules.length === 0" class="loading">
        Loading alert condition rules...
      </div>
      <div v-else-if="conditionRulesError" class="error">
        Error: {{ conditionRulesError.message }}
      </div>
      <div v-else>
        <table v-if="conditionRules.length > 0" data-testid="condition-rules-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rule in conditionRules"
              :key="rule.id"
              class="clickable-row"
              @click="openModal(rule, 'Alert Condition Rule')"
            >
              <td>{{ rule.name }}</td>
              <td>{{ rule.type }}</td>
              <td>{{ rule.priority }}</td>
              <td>
                <span :class="rule.enabled ? 'enabled' : 'disabled'">
                  {{ rule.enabled ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>{{ rule.actions?.length ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-data">No alert condition rules found.</p>
      </div>
    </div>

    <!-- Alert Action Rules -->
    <div v-if="activeTab === 'actionRules'" class="tab-content" data-testid="action-rules-content">
      <div v-if="actionRulesLoading && actionRules.length === 0" class="loading">
        Loading alert action rules...
      </div>
      <div v-else-if="actionRulesError" class="error">
        Error: {{ actionRulesError.message }}
      </div>
      <div v-else>
        <table v-if="actionRules.length > 0" data-testid="action-rules-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Enabled</th>
              <th>Alert Types</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rule in actionRules"
              :key="rule.id"
              class="clickable-row"
              @click="openModal(rule, 'Alert Action Rule')"
            >
              <td>{{ rule.name }}</td>
              <td>
                <span :class="rule.enabled ? 'enabled' : 'disabled'">
                  {{ rule.enabled ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>{{ rule.alertTypes?.join(', ') || '-' }}</td>
              <td>{{ rule.alertActionIds?.length ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-data">No alert action rules found.</p>
      </div>
    </div>

    <!-- Alert Actions -->
    <div v-if="activeTab === 'actions'" class="tab-content" data-testid="actions-content">
      <div v-if="actionsLoading && actions.length === 0" class="loading">
        Loading alert actions...
      </div>
      <div v-else-if="actionsError" class="error">
        Error: {{ actionsError.message }}
      </div>
      <div v-else>
        <table v-if="actions.length > 0" data-testid="actions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Enabled</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="action in actions"
              :key="action.id"
              class="clickable-row"
              @click="openModal(action, 'Alert Action')"
            >
              <td>{{ action.name }}</td>
              <td>{{ action.type }}</td>
              <td>
                <span :class="action.enabled ? 'enabled' : 'disabled'">
                  {{ action.enabled ? 'Yes' : 'No' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-data">No alert actions found.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="hasMore" class="pagination">
      <button @click="loadMore" :disabled="isLoading" data-testid="load-more-button">
        {{ isLoading ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <!-- Detail Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal" data-testid="modal-overlay">
      <div class="modal" data-testid="detail-modal">
        <div class="modal-header">
          <h3>{{ selectedItemTitle }}</h3>
          <button class="modal-close" @click="closeModal" data-testid="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <pre class="json-content" data-testid="modal-json">{{ formatJson(selectedItem) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.automations {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  color: #666;
  font-size: 0.95rem;
}

.tabs button:hover {
  color: #333;
  background: #f5f5f5;
}

.tabs button.active {
  color: #4a90a4;
  border-bottom-color: #4a90a4;
  font-weight: 600;
}

.tab-content {
  min-height: 200px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.enabled {
  color: #27ae60;
}

.disabled {
  color: #e74c3c;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 40px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  color: #666;
  padding: 40px;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: #f0f7fa;
}

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

.modal {
  background: #fff;
  border-radius: 8px;
  width: 80%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow: auto;
  flex: 1;
}

.json-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: #333;
}
</style>
