export type PushPermissionStatus =
  | 'granted'
  /** iOS quiet delivery: notifications go to Notification Center only. Pushes still arrive. */
  | 'provisional'
  | 'denied'
  | 'undetermined'
  /** Web, Expo Go, or a build without Firebase native code. */
  | 'unavailable'

/** Subset of expo-notifications `NotificationPermissionsStatus` the mapping needs. */
type PermissionResponseLike = {
  granted: boolean
  status: string
  ios?: { status: number } | null
}

/** expo-notifications `IosAuthorizationStatus.PROVISIONAL` / `.EPHEMERAL`. */
const IOS_PROVISIONAL = 3
const IOS_EPHEMERAL = 4

export function toPushPermissionStatus(response: PermissionResponseLike): PushPermissionStatus {
  const iosStatus = response.ios?.status
  if (iosStatus === IOS_PROVISIONAL || iosStatus === IOS_EPHEMERAL) return 'provisional'
  if (response.granted) return 'granted'
  if (response.status === 'denied') return 'denied'
  return 'undetermined'
}

/** Browser `Notification.permission` → kit status. */
export function toWebPushPermissionStatus(permission: string): PushPermissionStatus {
  if (permission === 'granted') return 'granted'
  if (permission === 'denied') return 'denied'
  return 'undetermined'
}

export function canReceivePush(status: PushPermissionStatus): boolean {
  return status === 'granted' || status === 'provisional'
}

/**
 * In-app route from a push payload: `data.url` must be an app path like `/orders/42?tab=items`.
 * Anything else (absolute URLs, `//host`, non-strings) is ignored so a payload cannot send the
 * user outside the app.
 */
export function resolveNotificationRoute(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const url = (data as Record<string, unknown>).url
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  return trimmed
}

/**
 * Web launch payload: the service worker puts a push's `data` (no `url`) in
 * `#notification_data=<json>`. Only string values of a plain object are kept; anything else
 * (bad JSON, arrays) → `null`.
 */
export function parseLaunchData(raw: string | null): Record<string, string> | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const data: Record<string, string> = {}
  Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value === 'string') data[key] = value
  })
  return data
}

/**
 * Key the open guard compares: the resolved route, or — for a push without `data.url` — the
 * `fields` of `data` that identify its target (e.g. `resource` + `postId`). Only those fields
 * are used: RNFirebase `message.data` and expo `content.data` for the same push usually differ.
 */
export function notificationOpenKey(
  route: string | null,
  data: Record<string, unknown>,
  fields: readonly string[],
): string {
  if (route) return route
  return fields
    .filter((field) => typeof data[field] === 'string')
    .map((field) => `${field}=${data[field] as string}`)
    .join('&')
}

/**
 * One tap can be reported by more than one source (RNFirebase and expo-notifications, launch
 * and listener). The guard lets each tap through once: same notification id, or the same key
 * (`notificationOpenKey`) within `windowMs`.
 */
export function createNotificationOpenGuard(windowMs = 2000, now: () => number = Date.now) {
  const seenIds = new Set<string>()
  let lastKey: string | null = null
  let lastAt = 0

  return (id: string | null | undefined, key: string): boolean => {
    if (id && seenIds.has(id)) return false
    const at = now()
    if (key === lastKey && at - lastAt < windowMs) return false
    if (id) seenIds.add(id)
    lastKey = key
    lastAt = at
    return true
  }
}
