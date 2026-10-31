// Bundle entry. Firebase needs its background message handler registered before the app
// component: Android runs this file headless when a push arrives while the app is killed.
import { registerBackgroundMessageHandler } from './src/services/firebase/messaging'

registerBackgroundMessageHandler()

// eslint-disable-next-line import/first -- must load after the handler is registered
import 'expo-router/entry'
