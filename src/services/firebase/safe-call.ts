import { loadFirebase } from './native-modules'
import type { FirebaseModules } from './types'

/** `false` on web, in Expo Go, and in builds without Firebase native code. */
export function isFirebaseAvailable(): boolean {
  return loadFirebase() !== null
}

/**
 * Runs `fn` with the native modules, or returns `fallback` when Firebase is unavailable or the
 * call throws. Telemetry must never crash or block the app, so errors are only logged in dev.
 */
export function withFirebase<T>(
  label: string,
  fallback: T,
  fn: (modules: FirebaseModules) => T,
): T {
  const modules = loadFirebase()
  if (!modules) return fallback
  try {
    return fn(modules)
  } catch (error) {
    if (__DEV__) console.warn(`[firebase] ${label} failed`, error)
    return fallback
  }
}

/** Async variant of {@link withFirebase}: rejected promises also resolve to `fallback`. */
export async function withFirebaseAsync<T>(
  label: string,
  fallback: T,
  fn: (modules: FirebaseModules) => Promise<T>,
): Promise<T> {
  const modules = loadFirebase()
  if (!modules) return fallback
  try {
    return await fn(modules)
  } catch (error) {
    if (__DEV__) console.warn(`[firebase] ${label} failed`, error)
    return fallback
  }
}
