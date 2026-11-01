import { getWebAnalytics, setGaDisabled, warnWeb } from './web-sdk'

/** Web: Analytics collection (error reports are Analytics events, so they follow it). */
export async function applyCollectionEnabled(enabled: boolean): Promise<void> {
  try {
    setGaDisabled(!enabled)
    const analytics = await getWebAnalytics()
    if (!analytics) return
    const { setAnalyticsCollectionEnabled } = await import('firebase/analytics')
    setAnalyticsCollectionEnabled(analytics, enabled)
  } catch (error) {
    warnWeb('applyCollectionEnabled failed', error)
  }
}
