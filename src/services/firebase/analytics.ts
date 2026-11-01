import type { AnalyticsEventMap, AnalyticsEventName } from './analytics-events'
import { definedParams } from './event-params'
import { withFirebase, withFirebaseAsync } from './safe-call'

type EventArgs<K extends AnalyticsEventName> = AnalyticsEventMap[K] extends undefined
  ? []
  : [params: AnalyticsEventMap[K]]

/** Logs a typed custom event (see `analytics-events.ts` to add events). */
export function logEvent<K extends AnalyticsEventName>(name: K, ...args: EventArgs<K>): void {
  // Modular `logEvent` returns void (RNFirebase handles the native promise itself).
  withFirebase('logEvent', undefined, ({ analytics }) =>
    analytics.logEvent(analytics.getAnalytics(), name as string, definedParams(args[0])),
  )
}

/** Logs `screen_view`. Called by `useFirebaseScreenTracking`; call by hand only for non-route screens. */
export function logScreenView(screenName: string): void {
  void withFirebaseAsync('logScreenView', undefined, ({ analytics }) =>
    analytics.logScreenView(analytics.getAnalytics(), {
      screen_name: screenName,
      screen_class: screenName,
    }),
  )
}

export function setAnalyticsUserId(userId: string | null): Promise<void> {
  return withFirebaseAsync('setAnalyticsUserId', undefined, ({ analytics }) =>
    analytics.setUserId(analytics.getAnalytics(), userId),
  )
}
