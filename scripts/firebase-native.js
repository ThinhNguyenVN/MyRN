/* global __dirname */
/**
 * Single source for "is Firebase on for this env": `firebase/<env>/` must hold both
 * `google-services.json` and `GoogleService-Info.plist`. Used by `app.config.ts` (plugins) and
 * `react-native.config.js` (autolinking), so a template or product without a Firebase project
 * builds natively with no Firebase code at all. See `.docs/firebase-standard.md`.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

const RNFB_PACKAGES = [
  '@react-native-firebase/app',
  '@react-native-firebase/analytics',
  '@react-native-firebase/crashlytics',
  '@react-native-firebase/messaging',
  '@react-native-firebase/remote-config',
]

/** Same rule as `app.config.ts`: EXPO_PUBLIC_APP_ENV, else production build → production, else test. */
function resolveAppEnv() {
  const raw = process.env.EXPO_PUBLIC_APP_ENV
  if (raw === 'staging' || raw === 'production' || raw === 'test') return raw
  if (process.env.NODE_ENV === 'production') return 'production'
  return 'test'
}

function resolveFirebaseNative(appEnv = resolveAppEnv()) {
  const dir = `./firebase/${appEnv}`
  const files = {
    android: `${dir}/google-services.json`,
    ios: `${dir}/GoogleService-Info.plist`,
  }
  const exists = (relativePath) => fs.existsSync(path.resolve(ROOT, relativePath))
  const hasAndroid = exists(files.android)
  const hasIos = exists(files.ios)
  return { appEnv, dir, files, enabled: hasAndroid && hasIos, partial: hasAndroid !== hasIos }
}

module.exports = { RNFB_PACKAGES, resolveFirebaseNative }
