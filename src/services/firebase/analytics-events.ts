/**
 * Typed analytics events: event name → params (`undefined` = no params).
 *
 * Products add their own events with declaration merging, without editing this kit file:
 *
 * ```ts
 * // src/features/<domain>/analytics-events.ts
 * declare module '@/services/firebase/analytics-events' {
 *   interface AnalyticsEventMap {
 *     order_placed: { order_id: string; value: number }
 *   }
 * }
 * export {}
 * ```
 *
 * Names: snake_case, ≤ 40 chars, not a reserved GA4 name (`screen_view`, `first_open`, ...).
 * Params: ≤ 25 per event, values string (≤ 100 chars) or number.
 */
export interface AnalyticsEventMap {
  /** User opened a push notification (logged by the kit). */
  notification_open: { url?: string }
  /** Result of `requestPushPermission()` (logged by the kit). */
  push_permission_result: { status: string }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>
