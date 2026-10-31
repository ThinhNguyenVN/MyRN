/**
 * Remote Config keys the app reads, with the value used until (or unless) a fetch succeeds.
 * The type of each default decides how the remote value is parsed (boolean / number / string),
 * so add every key here before reading it with `useRemoteConfig(key)`.
 *
 * Products replace these sample keys with their own.
 */
export const remoteConfigDefaults = {
  /** Sample flag — safe to delete once a product has real keys. */
  sample_feature_enabled: false,
  /** Sample string — e.g. a forced-update gate compares against the installed version. */
  min_supported_app_version: '1.0.0',
}
