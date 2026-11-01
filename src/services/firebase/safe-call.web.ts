import { getWebFirebaseConfig } from './web-sdk'

/** Web: `true` when this env has `firebase/<env>/firebase-web.json` (and not static rendering). */
export function isFirebaseAvailable(): boolean {
  return getWebFirebaseConfig() !== null
}
