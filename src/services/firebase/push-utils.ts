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
