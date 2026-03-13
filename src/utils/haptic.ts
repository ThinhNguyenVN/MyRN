import * as Haptics from 'expo-haptics'

export function triggerHaptic(mode: keyof typeof Haptics.ImpactFeedbackStyle = 'Light') {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle[mode]).catch(() => {
      console.error('Failed to trigger haptic')
    })
  } catch (error) {
    console.error('Failed to trigger haptic', error)
  }
}
