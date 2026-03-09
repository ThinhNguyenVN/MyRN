import * as Haptics from 'expo-haptics'

export function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      console.error('Failed to trigger haptic')
    })
  } catch (error) {
    console.error('Failed to trigger haptic', error)
  }
}
