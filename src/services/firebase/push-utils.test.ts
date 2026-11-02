import {
  canReceivePush,
  createNotificationOpenGuard,
  notificationOpenKey,
  parseLaunchData,
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
    const route = (data: Record<string, unknown>) =>
      notificationOpenKey(resolveNotificationRoute(data), data, [])
    expect(shouldOpen('fcm-1', route({ url: '/orders/1', from: 'fcm' }))).toBe(true)
    time = 500
    expect(shouldOpen('expo-1', route({ url: '/orders/1' }))).toBe(false)
    expect(shouldOpen('expo-2', '/orders/2')).toBe(true)
    time = 5000
    expect(shouldOpen(null, '/orders/2')).toBe(true)
  })
})

describe('notificationOpenKey', () => {
  const FIELDS = ['resource', 'postId', 'commentId'] as const

  it('uses the route when there is one', () => {
    expect(notificationOpenKey('/orders/1', { postId: '2' }, FIELDS)).toBe('/orders/1')
  })

  it('builds the key from the listed string fields only', () => {
    expect(
      notificationOpenKey(
        null,
        { resource: 'post', postId: '225', type: 'comment_added', n: 1 },
        FIELDS,
      ),
    ).toBe('resource=post&postId=225')
  })
})

describe('createNotificationOpenGuard without data.url', () => {
  const FIELDS = ['resource', 'postId'] as const
  const key = (data: Record<string, unknown>) => notificationOpenKey(null, data, FIELDS)

  it('dedupes one tap reported twice by two sources', () => {
    let time = 0
    const shouldOpen = createNotificationOpenGuard(2000, () => time)
    expect(shouldOpen('fcm-1', key({ resource: 'post', postId: '1', from: 'fcm' }))).toBe(true)
    time = 300
    expect(shouldOpen('expo-1', key({ resource: 'post', postId: '1' }))).toBe(false)
  })

  it('lets taps on different targets through within the window', () => {
    let time = 0
    const shouldOpen = createNotificationOpenGuard(2000, () => time)
    expect(shouldOpen('fcm-1', key({ resource: 'post', postId: '1' }))).toBe(true)
    time = 300
    expect(shouldOpen('fcm-2', key({ resource: 'post', postId: '2' }))).toBe(true)
  })

  it('lets a web launch (no id) through once', () => {
    let time = 0
    const shouldOpen = createNotificationOpenGuard(2000, () => time)
    expect(shouldOpen(undefined, '')).toBe(true)
    time = 5000
    expect(shouldOpen(undefined, '')).toBe(true)
  })
})

describe('parseLaunchData', () => {
  it('keeps string fields of a JSON object', () => {
    expect(parseLaunchData('{"resource":"post","postId":"225","n":1}')).toEqual({
      resource: 'post',
      postId: '225',
    })
  })

  it('returns null for empty, bad JSON and non-objects', () => {
    expect(parseLaunchData(null)).toBeNull()
    expect(parseLaunchData('')).toBeNull()
    expect(parseLaunchData('{bad')).toBeNull()
    expect(parseLaunchData('[1]')).toBeNull()
    expect(parseLaunchData('"x"')).toBeNull()
  })
})

describe('toWebPushPermissionStatus', () => {
  it('maps Notification.permission', () => {
    expect(toWebPushPermissionStatus('granted')).toBe('granted')
    expect(toWebPushPermissionStatus('denied')).toBe('denied')
    expect(toWebPushPermissionStatus('default')).toBe('undetermined')
  })
})
