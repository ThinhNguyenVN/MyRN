import { withFirebaseAsync } from './safe-call'

/** Native: turns Analytics + Crashlytics collection on/off. */
export async function applyCollectionEnabled(enabled: boolean): Promise<void> {
  await withFirebaseAsync('applyCollectionEnabled', undefined, async (modules) => {
    await Promise.all([
      modules.analytics.setAnalyticsCollectionEnabled(modules.analytics.getAnalytics(), enabled),
      modules.crashlytics.setCrashlyticsCollectionEnabled(
        modules.crashlytics.getCrashlytics(),
        enabled,
      ),
    ])
  })
}
