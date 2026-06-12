# PTZ Camera Controls

> **Version:** 0.3.107
>
> Pan/Tilt/Zoom camera control: position, movement, presets, and automation.

---

## API Endpoints

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| `getPtzPosition(cameraId)` | GET | `/cameras/{cameraId}/ptz/position` | `Result<PtzPosition>` |
| `movePtz(cameraId, move)` | PUT | `/cameras/{cameraId}/ptz/position` | `Result<void>` |
| `getPtzSettings(cameraId)` | GET | `/cameras/{cameraId}/ptz/settings` | `Result<PtzSettings>` |
| `updatePtzSettings(cameraId, settings)` | PATCH | `/cameras/{cameraId}/ptz/settings` | `Result<void>` |

## Types

### PtzPosition
```typescript
interface PtzPosition {
  x?: number  // Pan (horizontal)
  y?: number  // Tilt (vertical)
  z?: number  // Zoom level
}
```

### PtzMove (discriminated union)
```typescript
type PtzMove = PtzPositionMove | PtzDirectionMove | PtzCenterOnMove

// Absolute position
interface PtzPositionMove {
  moveType: 'position'
  x?: number; y?: number; z?: number
}

// Relative direction
interface PtzDirectionMove {
  moveType: 'direction'
  direction: PtzDirection[]  // 'up' | 'down' | 'left' | 'right' | 'in' | 'out'
  stepSize?: PtzStepSize     // 'small' | 'medium' | 'large'
}

// Center on point in frame
interface PtzCenterOnMove {
  moveType: 'centerOn'
  relativeX: number  // 0.0 (left) to 1.0 (right)
  relativeY: number  // 0.0 (top) to 1.0 (bottom)
}
```

### PtzSettings & PtzSettingsUpdate
```typescript
interface PtzSettings {
  presets: PtzPreset[]
  homePreset: string | null
  mode: PtzMode           // 'homeReturn' | 'tour' | 'manualOnly'
  autoStartDelay: number  // seconds
}

interface PtzPreset {
  name: string
  position: PtzPosition
  timeAtPreset: number    // seconds at preset during tour
}

interface PtzSettingsUpdate {
  presets?: PtzPreset[]
  homePreset?: string | null
  mode?: PtzMode
  autoStartDelay?: number
}
```

## Usage Examples

### Get Position
```typescript
import { getPtzPosition } from 'een-api-toolkit'

const { data, error } = await getPtzPosition('camera-123')
if (data) {
  console.log(`Pan: ${data.x}, Tilt: ${data.y}, Zoom: ${data.z}`)
}
```

### Move Camera
```typescript
import { movePtz } from 'een-api-toolkit'

// Absolute position
await movePtz('camera-123', { moveType: 'position', x: 0.5, y: -0.3, z: 2.0 })

// Direction with step size
await movePtz('camera-123', {
  moveType: 'direction', direction: ['up', 'left'], stepSize: 'medium'
})

// Click-to-center on video frame
await movePtz('camera-123', { moveType: 'centerOn', relativeX: 0.75, relativeY: 0.5 })
```

### Manage Presets
```typescript
import { getPtzSettings, updatePtzSettings, getPtzPosition } from 'een-api-toolkit'

// Read presets
const { data: settings } = await getPtzSettings('camera-123')

// Save current position as preset
const { data: pos } = await getPtzPosition('camera-123')
if (pos && settings) {
  await updatePtzSettings('camera-123', {
    presets: [...settings.presets, { name: 'Gate', position: pos, timeAtPreset: 10 }],
    homePreset: 'Gate'
  })
}

// Change mode
await updatePtzSettings('camera-123', { mode: 'tour', autoStartDelay: 30 })
```

### Click-to-Center Pattern
```typescript
function handleVideoClick(event: MouseEvent) {
  const video = event.currentTarget as HTMLVideoElement
  const rect = video.getBoundingClientRect()
  const relativeX = (event.clientX - rect.left) / rect.width
  const relativeY = (event.clientY - rect.top) / rect.height
  movePtz(cameraId, { moveType: 'centerOn', relativeX, relativeY })
}
```

## Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| AUTH_REQUIRED | Not authenticated | Redirect to login |
| NOT_FOUND | Camera not found or no PTZ | Show message |
| FORBIDDEN | No permission | Show access denied |
| VALIDATION_ERROR | Empty camera ID | Fix input |

## Fisheye Camera Exclusion

**IMPORTANT:** Fisheye cameras report `capabilities.ptz.capable: true` but are NOT true PTZ cameras.
Always exclude fisheye cameras when checking PTZ capability:

```typescript
import { computed } from 'vue'

const isPtzCapable = computed(() => {
  const ptz = camera.value?.capabilities?.ptz
  return ptz?.capable === true && ptz?.fisheye !== true
})
```

Also check `effectivePermissions.controlPTZ` to verify the user has permission to move the camera.

---

## Reference Examples

- `examples/vue-ptz/` - Complete PTZ control app with live video


## See Also

- [AI-AUTH.md](./AI-AUTH.md)
- [AI-DEVICES.md](./AI-DEVICES.md)
- [AI-MEDIA.md](./AI-MEDIA.md)


