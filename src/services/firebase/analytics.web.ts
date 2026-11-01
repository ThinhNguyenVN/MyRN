import type { AnalyticsEventMap, AnalyticsEventName } from './analytics-events'
import { definedParams } from './event-params'
import { getWebAnalytics, logWebEvent, warnWeb } from './web-sdk'

type EventArgs<K extends AnalyticsEventName> = AnalyticsEventMap[K] extends undefined
  ? []
  : [params: AnalyticsEventMap[K]]

/** Logs a typed custom event (see `analytics-events.ts` to add events). */
export function logEvent<K extends AnalyticsEventName>(name: K, ...args: EventArgs<K>): void {
  logWebEvent(name as string, definedParams(args[0]))
}

/** Logs `screen_view`. Called by `useFirebaseScreenTracking`; call by hand only for non-route screens. */
export function logScreenView(screenName: string): void {
  logWebEvent('screen_view', { firebase_screen: screenName, firebase_screen_class: screenName })
}

export async function setAnalyticsUserId(userId: string | null): Promise<void> {
  try {
    const analytics = await getWebAnalytics()
    if (!analytics) return
    const { setUserId } = await import('firebase/analytics')
    setUserId(analytics, userId)
  } catch (error) {
    warnWeb('setAnalyticsUserId failed', error)
  }
}
