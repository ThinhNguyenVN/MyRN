import type { AppPlatform, PickerEngine } from './type'

/**
 * Wheel list engine: Expo UI wheel on iOS only.
 * Android/web keep branded `WheelPickerView` (Android community Picker is a dropdown, not a wheel).
 */
export function resolveWheelPickerEngine(platform: AppPlatform): PickerEngine {
  return platform === 'ios' ? 'expo-ui' : 'custom'
}
