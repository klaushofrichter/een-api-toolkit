# Automations API - EEN API Toolkit

> **Version:** 0.3.44
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

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  listAlertConditionRules,
  listAlertActions,
  type AlertConditionRule,
  type AutomationAlertAction,
  type EenError
} from 'een-api-toolkit'

const rules = ref<AlertConditionRule[]>([])
const actions = ref<AutomationAlertAction[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)

async function fetchAutomations() {
  loading.value = true
  error.value = null

  // Fetch rules and actions in parallel
  const [rulesResult, actionsResult] = await Promise.all([
    listAlertConditionRules({
      enabled: true,
      include: ['actions', 'insights']
    }),
    listAlertActions({ enabled: true })
  ])

  if (rulesResult.error) {
    error.value = rulesResult.error
  } else {
    rules.value = rulesResult.data.results
  }

  if (actionsResult.error && !error.value) {
    error.value = actionsResult.error
  } else if (!actionsResult.error) {
    actions.value = actionsResult.data.results
  }

  loading.value = false
}

function getActionName(actionId: string): string {
  const action = actions.value.find(a => a.id === actionId)
  return action?.name ?? actionId
}

onMounted(() => fetchAutomations())
</script>

<template>
  <div class="automations">
    <h2>Alert Condition Rules</h2>

    <div v-if="loading">Loading automations...</div>
    <div v-else-if="error" class="error">{{ error.message }}</div>

    <div v-else>
      <div v-for="rule in rules" :key="rule.id" class="rule-card">
        <h3>{{ rule.name }}</h3>
        <p>Priority: {{ rule.priority }}</p>
        <p>Input Events: {{ rule.inputEventTypes.join(', ') }}</p>
        <p>Output Alert: {{ rule.outputAlertType }}</p>

        <div v-if="rule.actions?.length">
          <h4>Actions</h4>
          <ul>
            <li v-for="action in rule.actions" :key="action.id">
              {{ action.name ?? action.id }}
            </li>
          </ul>
        </div>

        <div v-if="rule.insights">
          <h4>Insights</h4>
          <p>Total alerts: {{ rule.insights.totalAlerts }}</p>
          <p>Last 24h: {{ rule.insights.alertCounts?.last24Hours }}</p>
        </div>
      </div>

      <h2>Alert Actions ({{ actions.length }})</h2>
      <div v-for="action in actions" :key="action.id" class="action-card">
        <h3>{{ action.name }}</h3>
        <p>Type: {{ action.type }}</p>
        <p>Enabled: {{ action.enabled ? 'Yes' : 'No' }}</p>
      </div>
    </div>
  </div>
</template>
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
