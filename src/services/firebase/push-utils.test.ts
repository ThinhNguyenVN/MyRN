import { canReceivePush, resolveNotificationRoute, toPushPermissionStatus } from './push-utils'

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
