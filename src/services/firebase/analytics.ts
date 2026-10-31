import type { AnalyticsEventMap, AnalyticsEventName } from './analytics-events'
import { withFirebase, withFirebaseAsync } from './safe-call'

type EventArgs<K extends AnalyticsEventName> = AnalyticsEventMap[K] extends undefined
  ? []
  : [params: AnalyticsEventMap[K]]

/** Logs a typed custom event (see `analytics-events.ts` to add events). */
export function logEvent<K extends AnalyticsEventName>(name: K, ...args: EventArgs<K>): void {
  withFirebase('logEvent', undefined, ({ analytics }) => {
    const params = args[0] as Record<string, unknown> | undefined
    analytics.logEvent(analytics.getAnalytics(), name as string, params)
  })
}

/** Logs `screen_view`. Called by `useFirebaseScreenTracking`; call by hand only for non-route screens. */
export function logScreenView(screenName: string): void {
  withFirebase('logScreenView', undefined, ({ analytics }) => {
    void analytics.logScreenView(analytics.getAnalytics(), {
      screen_name: screenName,
      screen_class: screenName,
    })
  })
}

export function setAnalyticsUserId(userId: string | null): Promise<void> {
  return withFirebaseAsync('setAnalyticsUserId', undefined, ({ analytics }) =>
    analytics.setUserId(analytics.getAnalytics(), userId),
  )
}
