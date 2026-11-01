/**
 * Web has no Crashlytics. Errors are sent as GA4 `exception` events (Analytics →
 * Events → exception), with a short description and no stack trace.
 */
import { toError } from './errors'
import { logWebEvent } from './web-sdk'

export { toError } from './errors'

/** Caps automatic reports so an error loop cannot flood Analytics. */
const MAX_REPORTS_PER_SESSION = 20
let reports = 0
let globalCaptureAttached = false

function report(error: unknown, fatal: boolean, context?: string) {
  if (reports >= MAX_REPORTS_PER_SESSION) return
  reports += 1
  const { name, message } = toError(error)
  const description = [context, `${name}: ${message}`].filter(Boolean).join(' | ').slice(0, 100)
  logWebEvent('exception', { description, fatal })
}

/** Records a non-fatal error as an `exception` event. `context` prefixes the description. */
export function recordError(error: unknown, context?: string): void {
  report(error, false, context)
}

/** Web: no breadcrumbs (no Crashlytics). Kept so product code is the same on every platform. */
export function crashLog(_message: string): void {}

/** Web: the Analytics user id (`useFirebaseUser`) already identifies the user. */
export async function setCrashUserId(_userId: string | null): Promise<void> {}

/** Uncaught errors and unhandled rejections become fatal `exception` events. */
export function captureGlobalErrors(): void {
  if (globalCaptureAttached || typeof window === 'undefined') return
  globalCaptureAttached = true
  window.addEventListener('error', (event) => report(event.error ?? event.message, true))
  window.addEventListener('unhandledrejection', (event) =>
    report(event.reason, true, 'unhandledrejection'),
  )
}
