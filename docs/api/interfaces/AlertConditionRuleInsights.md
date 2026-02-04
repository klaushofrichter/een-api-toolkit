[**EEN API Toolkit v0.3.55**](../README.md)

***

[EEN API Toolkit](../README.md) / AlertConditionRuleInsights

# Interface: AlertConditionRuleInsights

Defined in: [src/types/automation.ts:153](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L153)

Insights data for alert condition rules.

## Properties

### totalAlerts?

> `optional` **totalAlerts**: `number`

Defined in: [src/types/automation.ts:155](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L155)

Total number of alerts triggered

***

### lastTriggered?

> `optional` **lastTriggered**: `string`

Defined in: [src/types/automation.ts:157](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L157)

ISO 8601 timestamp of last triggered alert

***

### alertCounts?

> `optional` **alertCounts**: `object`

Defined in: [src/types/automation.ts:159](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/automation.ts#L159)

Count of alerts by time period

#### last24Hours?

> `optional` **last24Hours**: `number`

#### last7Days?

> `optional` **last7Days**: `number`

#### last30Days?

> `optional` **last30Days**: `number`
