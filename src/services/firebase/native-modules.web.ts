import type { FirebaseModules } from './types'

/** Web: Firebase is a no-op (keeps RNFirebase and the Firebase JS SDK out of the web bundle). */
export function loadFirebase(): FirebaseModules | null {
  return null
}
