// `expo-haptics` pulls in `expo-modules-core` native code at import time, unavailable under
// Jest/jsdom (no native module bridge). `triggerHaptic` (`src/utils/haptic.ts`) only needs
// `ImpactFeedbackStyle` (a lookup object) and an async no-op `impactAsync`.
module.exports = {
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  impactAsync: async () => undefined,
}
