[**EEN API Toolkit v0.3.87**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzDirectionMove

# Interface: PtzDirectionMove

Defined in: [types/ptz.ts:92](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L92)

Move in a relative direction with optional step size.

## Remarks

Moves the camera in one or more directions relative to its current position.
Multiple directions can be combined (e.g., up + left for diagonal movement).

## Example

```typescript
const move: PtzDirectionMove = {
  moveType: 'direction',
  direction: ['up', 'left'],
  stepSize: 'medium'
}
```

## Properties

### moveType

> **moveType**: `"direction"`

Defined in: [types/ptz.ts:94](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L94)

Must be 'direction'

***

### direction

> **direction**: [`PtzDirection`](../type-aliases/PtzDirection.md)[]

Defined in: [types/ptz.ts:96](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L96)

One or more directions to move

***

### stepSize?

> `optional` **stepSize**: [`PtzStepSize`](../type-aliases/PtzStepSize.md)

Defined in: [types/ptz.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L98)

Size of each movement step (default: medium)
