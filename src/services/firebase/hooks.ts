import { useEffect, useRef } from 'react'
import { useRouter, useSegments } from 'expo-router'

import { logScreenView, setAnalyticsUserId } from './analytics'
import { setCrashUserId } from './crashlytics'
import { subscribeNotificationOpens } from './messaging'
import { toScreenName } from './screen-name'

/** Logs `screen_view` whenever the route pattern changes. Mount once, inside the router. */
export function useFirebaseScreenTracking(): void {
  const segments = useSegments()
  const screenName = toScreenName(segments)
  const lastLogged = useRef<string | null>(null)

  useEffect(() => {
    if (lastLogged.current === screenName) return
    lastLogged.current = screenName
    logScreenView(screenName)
  }, [screenName])
}

/** Keeps the Analytics + Crashlytics user id in sync with the signed-in user (`null` = signed out). */
export function useFirebaseUser(userId: string | null): void {
  useEffect(() => {
    void setAnalyticsUserId(userId)
    void setCrashUserId(userId)
  }, [userId])
}

/** Opening a push with `data.url = '/some/path'` navigates there. Mount once, inside the router. */
export function usePushNotificationNavigation(): void {
  const router = useRouter()

  useEffect(
    () =>
      subscribeNotificationOpens((route) => {
        if (route) router.push(route as Parameters<typeof router.push>[0])
      }),
    [router],
  )
}
