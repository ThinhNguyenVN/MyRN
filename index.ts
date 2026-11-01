// Bundle entry. Firebase needs its background message handler registered before the app
// component: Android runs this file headless when a push arrives while the app is killed.
// `import`s are hoisted and evaluated before this body, so the entry is loaded with `require`
// after the call (an `import 'expo-router/entry'` would register the app first).
import { registerBackgroundMessageHandler } from './src/services/firebase/messaging'

registerBackgroundMessageHandler()

// eslint-disable-next-line @typescript-eslint/no-require-imports -- must evaluate after the handler is registered
require('expo-router/entry')
