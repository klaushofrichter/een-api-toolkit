# Automations API - EEN API Toolkit

> **Version:** 0.3.46
>
> Complete reference for automation rules and alert actions.
> Load this document when working with automated alert workflows.

---

## Overview

The Automations API provides read access to the EEN alert automation system:

| Entity | Description |
|--------|-------------|
| **Event Alert Condition Rules** | Filter incoming events to generate alerts |
| **Alert Condition Rules** | Process events and create alerts with actors |
| **Alert Action Rules** | Route alerts to appropriate actions |
| **Alert Actions** | Execute notifications, webhooks, integrations |

### Workflow Diagram

```
┌─────────────┐     ┌─────────────────────────┐     ┌─────────┐
│   Events    │────▶│ Event Alert Condition   │────▶│ Alerts  │
│ (from       │     │ Rules                   │     │         │
│  cameras)   │     │ (filter & prioritize)   │     │         │
└─────────────┘     └─────────────────────────┘     └────┬────┘
                                                         │
                    ┌─────────────────────────┐          │
                    │ Alert Action Rules      │◀─────────┘
                    │ (match alerts to        │
                    │  actions)               │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │ Alert Actions           │
                    │ (notification, webhook, │
                    │  SMS, email, etc.)      │
                    └─────────────────────────┘
```

---

## Event Alert Condition Rule Types

```typescript
interface EventAlertConditionRule {
  id: string
  createTimestamp: string          // ISO 8601
  updateTimestamp: string          // ISO 8601
  name: string
  priority: number                 // 1-10 (higher = more important)
  notes?: string
  enabled: boolean
  cooldownSeconds: number          // Seconds between alerts
  humanValidation?: HumanValidation
  eventFilter: EventFilter
  outputAlertTypes: string[]
}

interface HumanValidation {
  required: boolean
  timeoutSeconds?: number
}

interface EventFilter {
  types: string[]                  // Event types to match
  resourceFilter?: EventResourceFilter
}

interface EventResourceFilter {
  accountIds?: string[]
  actorIds?: string[]
  actorTags__contains?: string[]   // All tags must match
  actorTags__any?: string[]        // Any tag matches
}

interface EventAlertConditionRuleFieldValues {
  eventTypes?: string[]
  outputAlertTypes?: string[]
}

interface ListEventAlertConditionRulesParams {
  pageSize?: number
  pageToken?: string
  enabled?: boolean
  id__in?: string[]
  outputAlertType__in?: string[]
  priority__gte?: number
  priority__lte?: number
}
```

---

## Alert Condition Rule Types

```typescript
interface AlertConditionRule {
  id: string
  createTimestamp: string
  type: string
  creatorId: string
  name: string
  notes?: string
  enabled: boolean
  priority: number                      // 1-10
  actors: AlertConditionRuleActor[]
  inputEventTypes: string[]
  outputAlertType: string
  actions?: AlertConditionRuleAction[]  // include=actions
  insights?: AlertConditionRuleInsights // include=insights
}

interface AlertConditionRuleActor {
  id: string
  type: string
  accountId?: string
}

interface AlertConditionRuleAction {
  id: string
  name?: string
  type?: string
}

interface AlertConditionRuleInsights {
  totalAlerts?: number
  lastTriggered?: string               // ISO 8601
  alertCounts?: {
    last24Hours?: number
    last7Days?: number
    last30Days?: number
  }
}

type AlertConditionRuleInclude = 'actions' | 'insights'

interface ListAlertConditionRulesParams {
  pageSize?: number
  pageToken?: string
  enabled?: boolean
  id__in?: string[]
  actorId__in?: string[]
  inputEventType__in?: string[]
  outputAlertType?: string
  type?: string
  include?: AlertConditionRuleInclude[]
}
```

---

## Alert Action Rule Types

```typescript
interface AlertActionRule {
  id: string
  createTimestamp: string
  name: string
  notes?: string
  enabled: boolean
  alertTypes: string[]           // Alert types this rule matches
  actorIds: string[]
  actorTypes: string[]
  ruleIds: string[]              // Alert condition rule IDs
  alertActionIds: string[]       // Actions to execute
  priority__gte?: number
  priority__lte?: number
}

interface ListAlertActionRulesParams {
  pageSize?: number
  pageToken?: string
  enabled?: boolean
  id__in?: string[]
  alertType__in?: string[]
  actorId__in?: string[]
  alertActionId__in?: string[]
  ruleId__in?: string[]
}
```

---

## Alert Action Types

```typescript
type AlertActionType =
  | 'notification'         // Push notifications to mobile app
  | 'sms'                  // SMS text messages
  | 'smtp'                 // Email notifications
  | 'slack'                // Slack webhook
  | 'webhook'              // Generic HTTP webhook
  | 'brivo'                // Brivo access control
  | 'zendesk'              // Zendesk ticket creation
  | 'immix'                // Immix integration
  | 'zapier'               // Zapier automation
  | 'sentinel'             // Sentinel integration
  | 'evalinkTalos'         // Evalink Talos integration
  | 'outputPort'           // Physical output port trigger
  | 'ebus'                 // eBus integration
  | 'playSpeakerAudioClip' // Play audio on speaker
  | 'zulipPrivate'         // Zulip private message
  | 'zulipStream'          // Zulip stream message

interface AutomationAlertAction {
  id: string
  createTimestamp: string
  type: AlertActionType
  name: string
  notes?: string
  enabled: boolean
  settings: AlertActionSettings    // Type-specific
}

// Type-specific settings interfaces
interface NotificationSettings {
  userIds: string[]
}

interface SmsSettings {
  phoneNumbers: string[]
}

interface SmtpSettings {
  recipients: string[]
  subject?: string
  body?: string
}

interface SlackSettings {
  webhookUrl: string
  channel?: string
  username?: string
}

interface WebhookSettings {
  url: string
  method?: 'GET' | 'POST' | 'PUT'
  headers?: Record<string, string>
}

interface OutputPortSettings {
  deviceId: string
  outputPort: number
  durationMs?: number
}

interface PlaySpeakerAudioClipSettings {
  speakerId: string
  audioClipId: string
  volume?: number
}

interface ListAlertActionsParams {
  pageSize?: number
  pageToken?: string
  enabled?: boolean
  id__in?: string[]
  type__in?: AlertActionType[]
}
```

---

## Event Alert Condition Rule Functions

### listEventAlertConditionRules(params?)

```typescript
import { listEventAlertConditionRules } from 'een-api-toolkit'

// Get all enabled rules
const { data, error } = await listEventAlertConditionRules({
  enabled: true,
  pageSize: 50
})

if (data) {
  data.results.forEach(rule => {
    console.log(`${rule.name} (priority: ${rule.priority})`)
    console.log(`  Events: ${rule.eventFilter.types.join(', ')}`)
    console.log(`  Outputs: ${rule.outputAlertTypes.join(', ')}`)
  })
}

// Filter by priority
const { data: highPriority } = await listEventAlertConditionRules({
  priority__gte: 7,
  priority__lte: 10
})

// Filter by output alert type
const { data: motionRules } = await listEventAlertConditionRules({
  outputAlertType__in: ['een.motionDetectionAlert.v1']
})
```

### getEventAlertConditionRuleFieldValues(params?)

Discover available filter values for building UIs:

```typescript
import { getEventAlertConditionRuleFieldValues } from 'een-api-toolkit'

const { data, error } = await getEventAlertConditionRuleFieldValues()

if (data) {
  // Populate event type dropdown
  const eventTypeOptions = data.eventTypes ?? []

  // Populate alert type dropdown
  const alertTypeOptions = data.outputAlertTypes ?? []
}
```

### getEventAlertConditionRule(ruleId)

```typescript
import { getEventAlertConditionRule } from 'een-api-toolkit'

const { data, error } = await getEventAlertConditionRule('rule-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Rule not found')
  }
  return
}

console.log(`Rule: ${data.name}`)
console.log(`Cooldown: ${data.cooldownSeconds} seconds`)
console.log(`Human validation: ${data.humanValidation?.required ?? false}`)
```

---

## Alert Condition Rule Functions

### listAlertConditionRules(params?)

```typescript
import { listAlertConditionRules } from 'een-api-toolkit'

// Get rules with actions and insights
const { data, error } = await listAlertConditionRules({
  enabled: true,
  include: ['actions', 'insights']
})

if (data) {
  data.results.forEach(rule => {
    console.log(`${rule.name}`)
    console.log(`  Type: ${rule.type}`)
    console.log(`  Input events: ${rule.inputEventTypes.join(', ')}`)
    console.log(`  Output alert: ${rule.outputAlertType}`)

    if (rule.actions) {
      console.log(`  Actions: ${rule.actions.length}`)
    }

    if (rule.insights) {
      console.log(`  Total alerts: ${rule.insights.totalAlerts}`)
      console.log(`  Last triggered: ${rule.insights.lastTriggered}`)
    }
  })
}

// Filter by actor
const { data: cameraRules } = await listAlertConditionRules({
  actorId__in: ['camera-123', 'camera-456']
})

// Filter by event type
const { data: motionRules } = await listAlertConditionRules({
  inputEventType__in: ['een.motionDetectionEvent.v1']
})
```

### getAlertConditionRule(ruleId, params?)

```typescript
import { getAlertConditionRule } from 'een-api-toolkit'

const { data, error } = await getAlertConditionRule('rule-123', {
  include: ['actions', 'insights']
})

if (data) {
  console.log(`Rule: ${data.name}`)
  console.log(`Actors: ${data.actors.length}`)
  console.log(`Actions: ${data.actions?.length ?? 0}`)

  // Display insights
  if (data.insights) {
    console.log(`Alerts last 24h: ${data.insights.alertCounts?.last24Hours}`)
    console.log(`Alerts last 7d: ${data.insights.alertCounts?.last7Days}`)
  }
}
```

---

## Alert Action Rule Functions

### listAlertActionRules(params?)

```typescript
import { listAlertActionRules } from 'een-api-toolkit'

// Get enabled rules for motion alerts
const { data, error } = await listAlertActionRules({
  enabled: true,
  alertType__in: ['een.motionDetectionAlert.v1']
})

if (data) {
  data.results.forEach(rule => {
    console.log(`${rule.name}`)
    console.log(`  Alert types: ${rule.alertTypes.join(', ')}`)
    console.log(`  Action count: ${rule.alertActionIds.length}`)

    if (rule.priority__gte !== undefined) {
      console.log(`  Min priority: ${rule.priority__gte}`)
    }
  })
}

// Find rules for specific actions
const { data: webhookRules } = await listAlertActionRules({
  alertActionId__in: ['webhook-action-123']
})
```

### getAlertActionRule(ruleId)

```typescript
import { getAlertActionRule } from 'een-api-toolkit'

const { data, error } = await getAlertActionRule('rule-123')

if (data) {
  console.log(`Rule: ${data.name}`)
  console.log(`Alert types: ${data.alertTypes.join(', ')}`)
  console.log(`Actor IDs: ${data.actorIds.join(', ')}`)
  console.log(`Actions: ${data.alertActionIds.join(', ')}`)
}
```

---

## Alert Action Functions

### listAlertActions(params?)

```typescript
import { listAlertActions } from 'een-api-toolkit'

// Get all enabled notification and webhook actions
const { data, error } = await listAlertActions({
  enabled: true,
  type__in: ['notification', 'webhook', 'slack']
})

if (data) {
  data.results.forEach(action => {
    console.log(`${action.name} (${action.type})`)

    switch (action.type) {
      case 'notification':
        const notifSettings = action.settings as NotificationSettings
        console.log(`  Users: ${notifSettings.userIds.join(', ')}`)
        break
      case 'webhook':
        const webhookSettings = action.settings as WebhookSettings
        console.log(`  URL: ${webhookSettings.url}`)
        break
      case 'slack':
        const slackSettings = action.settings as SlackSettings
        console.log(`  Channel: ${slackSettings.channel}`)
        break
    }
  })
}

// Get all SMS actions
const { data: smsActions } = await listAlertActions({
  type__in: ['sms']
})
```

### getAlertAction(actionId)

```typescript
import { getAlertAction } from 'een-api-toolkit'

const { data, error } = await getAlertAction('action-123')

if (data) {
  console.log(`Action: ${data.name}`)
  console.log(`Type: ${data.type}`)
  console.log(`Enabled: ${data.enabled}`)
  console.log('Settings:', JSON.stringify(data.settings, null, 2))
}
```

---

## Vue Component Example

```typescript
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
    ...(enabledFilter.value !== 'all' ? { enabled: enabledFilter.value === 'enabled' } : {})
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
    ...(enabledFilter.value !== 'all' ? { enabled: enabledFilter.value === 'enabled' } : {})
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
    ...(enabledFilter.value !== 'all' ? { enabled: enabledFilter.value === 'enabled' } : {})
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
    ...(enabledFilter.value !== 'all' ? { enabled: enabledFilter.value === 'enabled' } : {})
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
```

---

## Filter Patterns

| Filter | Entity | Example | Description |
|--------|--------|---------|-------------|
| `enabled` | All | `true` | Filter by enabled/disabled |
| `id__in` | All | `['id1', 'id2']` | Filter by IDs |
| `pageSize` | All | `50` | Results per page |
| `pageToken` | All | `'token'` | Pagination cursor |
| `priority__gte` | Event Alert Rules | `5` | Min priority (1-10) |
| `priority__lte` | Event Alert Rules | `10` | Max priority (1-10) |
| `outputAlertType__in` | Event Alert Rules | `['type']` | Output alert types |
| `actorId__in` | Alert Condition Rules | `['actor1']` | Actor IDs |
| `inputEventType__in` | Alert Condition Rules | `['type']` | Input event types |
| `outputAlertType` | Alert Condition Rules | `'type'` | Output alert type |
| `type` | Alert Condition Rules | `'basic'` | Rule type |
| `include` | Alert Condition Rules | `['actions']` | Include fields |
| `alertType__in` | Alert Action Rules | `['type']` | Alert types |
| `alertActionId__in` | Alert Action Rules | `['id']` | Action IDs |
| `ruleId__in` | Alert Action Rules | `['id']` | Rule IDs |
| `type__in` | Alert Actions | `['webhook']` | Action types |

---

## Error Handling

| Error Code | HTTP Status | Meaning | Action |
|------------|-------------|---------|--------|
| AUTH_REQUIRED | 401 | Not authenticated | Redirect to login |
| FORBIDDEN | 403 | No permission | Show access denied |
| NOT_FOUND | 404 | Entity not found | Show "not found" |
| RATE_LIMITED | 429 | Too many requests | Retry with backoff |
| API_ERROR | 5xx | Server error | Show error, retry |

---

## Reference Examples

- `examples/vue-automations/` - Automation rules listing
