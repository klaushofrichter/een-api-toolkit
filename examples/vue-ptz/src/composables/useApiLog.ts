import { ref } from 'vue'
import type { PtzPreset } from 'een-api-toolkit'

export interface ApiLogEntry {
  id: number
  timestamp: Date
  functionName: string
  params: unknown
  response: unknown
  error: boolean
  count: number
}

const MAX_ENTRIES = 100
export const POSITION_TOLERANCE = 0.01
let nextId = 1

const entries = ref<ApiLogEntry[]>([])
const presets = ref<PtzPreset[]>([])
const homePresetName = ref<string | null>(null)

function isSame(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

export function isHomePreset(name: string | null): boolean {
  return name !== null && homePresetName.value === name
}

export function matchPresetName(pos: { x?: number; y?: number; z?: number }): string | null {
  for (const preset of presets.value) {
    const hp = preset.position
    if (
      Math.abs((pos.x ?? 0) - (hp.x ?? 0)) < POSITION_TOLERANCE &&
      Math.abs((pos.y ?? 0) - (hp.y ?? 0)) < POSITION_TOLERANCE &&
      Math.abs((pos.z ?? 0) - (hp.z ?? 0)) < POSITION_TOLERANCE
    ) {
      return preset.name
    }
  }
  return null
}

export function useApiLog() {
  function setPresets(p: PtzPreset[], home: string | null = null) {
    presets.value = p
    homePresetName.value = home
  }

  function log(functionName: string, params: unknown, response: unknown, error: boolean = false) {
    const first = entries.value[0]
    if (
      first &&
      first.functionName === functionName &&
      first.error === error &&
      isSame(first.params, params) &&
      isSame(first.response, response)
    ) {
      first.count++
      first.timestamp = new Date()
      return
    }

    entries.value.unshift({
      id: nextId++,
      timestamp: new Date(),
      functionName,
      params,
      response,
      error,
      count: 1
    })
    if (entries.value.length > MAX_ENTRIES) {
      entries.value.length = MAX_ENTRIES
    }
  }

  function clear() {
    entries.value = []
  }

  return { entries, log, clear, setPresets }
}
