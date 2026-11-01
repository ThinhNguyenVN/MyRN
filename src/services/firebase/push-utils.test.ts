import {
  canReceivePush,
  createNotificationOpenGuard,
  resolveNotificationRoute,
  toPushPermissionStatus,
  toWebPushPermissionStatus,
} from './push-utils'

describe('toPushPermissionStatus', () => {
  it('maps granted / denied / undetermined', () => {
    expect(toPushPermissionStatus({ granted: true, status: 'granted' })).toBe('granted')
    expect(toPushPermissionStatus({ granted: false, status: 'denied' })).toBe('denied')
    expect(toPushPermissionStatus({ granted: false, status: 'undetermined' })).toBe('undetermined')
  })

  it('maps iOS provisional and ephemeral to provisional', () => {
    expect(toPushPermissionStatus({ granted: true, status: 'granted', ios: { status: 3 } })).toBe(
      'provisional',
    )
    expect(toPushPermissionStatus({ granted: true, status: 'granted', ios: { status: 4 } })).toBe(
      'provisional',
    )
  })

  it('only granted and provisional can receive pushes', () => {
    expect(canReceivePush('granted')).toBe(true)
    expect(canReceivePush('provisional')).toBe(true)
    expect(canReceivePush('denied')).toBe(false)
    expect(canReceivePush('unavailable')).toBe(false)
  })
})

describe('resolveNotificationRoute', () => {
  it('returns in-app paths', () => {
    expect(resolveNotificationRoute({ url: '/todo/42?tab=info' })).toBe('/todo/42?tab=info')
    expect(resolveNotificationRoute({ url: '  /playground ' })).toBe('/playground')
  })

  it('ignores missing, non-string and external urls', () => {
    expect(resolveNotificationRoute(undefined)).toBeNull()
    expect(resolveNotificationRoute({})).toBeNull()
    expect(resolveNotificationRoute({ url: 42 })).toBeNull()
    expect(resolveNotificationRoute({ url: 'https://evil.example/x' })).toBeNull()
    expect(resolveNotificationRoute({ url: '//evil.example/x' })).toBeNull()
    expect(resolveNotificationRoute({ url: 'myapp://todo' })).toBeNull()
  })
})

describe('createNotificationOpenGuard', () => {
  it('lets each notification id through once', () => {
    let time = 0
    const shouldOpen = createNotificationOpenGuard(2000, () => time)
    expect(shouldOpen('a', '/x')).toBe(true)
    time = 10_000
    expect(shouldOpen('a', '/x')).toBe(false)
    expect(shouldOpen('b', '/x')).toBe(true)
  })

  it('drops the same route reported by a second source right after', () => {
    let time = 0
    const shouldOpen = createNotificationOpenGuard(2000, () => time)
    // Same tap: FCM data and expo content.data differ, the resolved route does not.
    expect(shouldOpen('fcm-1', resolveNotificationRoute({ url: '/orders/1', from: 'fcm' }))).toBe(
      true,
    )
    time = 500
    expect(shouldOpen('expo-1', resolveNotificationRoute({ url: '/orders/1' }))).toBe(false)
    expect(shouldOpen('expo-2', '/orders/2')).toBe(true)
    time = 5000
    expect(shouldOpen(null, '/orders/2')).toBe(true)
  })
})

describe('toWebPushPermissionStatus', () => {
  it('maps Notification.permission', () => {
    expect(toWebPushPermissionStatus('granted')).toBe('granted')
    expect(toWebPushPermissionStatus('denied')).toBe('denied')
    expect(toWebPushPermissionStatus('default')).toBe('undetermined')
  })
})
