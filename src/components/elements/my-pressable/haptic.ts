import * as Haptics from 'expo-haptics'

export function triggerHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    console.error('Failed to trigger haptic')
  })
}
