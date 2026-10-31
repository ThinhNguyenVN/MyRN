import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

import type { ExpoConfig } from 'expo/config'

type TemplateConfig = {
  appName: string
  slug: string
  packageName: string
  bundleId: string
}

type AppEnv = 'test' | 'staging' | 'production'
const baseConfig = (require('./app.json') as { expo: ExpoConfig }).expo
const templateConfig = require('./template.config.json') as TemplateConfig
const ENV_FILE_MAP: Record<AppEnv, string> = {
  test: '.env.test',
  staging: '.env.staging',
  production: '.env.production',
}

function resolveAppEnv(): AppEnv {
  const raw = process.env.EXPO_PUBLIC_APP_ENV
  if (raw === 'staging' || raw === 'production' || raw === 'test') return raw
  if (process.env.NODE_ENV === 'production') return 'production'
  return 'test'
}

function hydrateEnvFromFile() {
  const appEnv = resolveAppEnv()
  const envFile = ENV_FILE_MAP[appEnv]
  const envPath = path.resolve(__dirname, envFile)
  process.env.EXPO_PUBLIC_APP_ENV = appEnv
  if (!fs.existsSync(envPath)) return

  const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'))
  Object.entries(parsed).forEach(([key, value]) => {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value
    }
  })
}

hydrateEnvFromFile()

function assertNonEmpty(value: string, fieldName: keyof TemplateConfig) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`template.config.json field "${fieldName}" must be a non-empty string.`)
  }
}

function validatePackageIdentifier(value: string, fieldName: 'packageName' | 'bundleId') {
  const identifierPattern = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/
  if (!identifierPattern.test(value)) {
    throw new Error(
      `template.config.json field "${fieldName}" must be a valid reverse-DNS identifier. Received "${value}".`,
    )
  }
}

function loadTemplateConfig(): TemplateConfig {
  assertNonEmpty(templateConfig.appName, 'appName')
  assertNonEmpty(templateConfig.slug, 'slug')
  assertNonEmpty(templateConfig.packageName, 'packageName')
  assertNonEmpty(templateConfig.bundleId, 'bundleId')
  validatePackageIdentifier(templateConfig.packageName, 'packageName')
  validatePackageIdentifier(templateConfig.bundleId, 'bundleId')

  return {
    appName: templateConfig.appName.trim(),
    slug: templateConfig.slug.trim(),
    packageName: templateConfig.packageName.trim(),
    bundleId: templateConfig.bundleId.trim(),
  }
}

function resolveScheme(slug: string) {
  const normalized = slug
    .toLowerCase()
    .replace(/[^a-z0-9+.-]/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'my-rn-template'
}

// eslint-disable-next-line @typescript-eslint/no-require-imports -- shared with react-native.config.js
const { resolveFirebaseNative } = require('./scripts/firebase-native') as {
  resolveFirebaseNative: (appEnv: AppEnv) => {
    dir: string
    files: { android: string; ios: string }
    enabled: boolean
    partial: boolean
  }
}

/**
 * Firebase turns on per env when `firebase/<env>/` has both `google-services.json` and
 * `GoogleService-Info.plist` (see `.docs/firebase-standard.md`). Without them the native build
 * has no Firebase plugins or pods (`react-native.config.js`) and `@/services/firebase` stays a
 * no-op, so the template and new products build before a Firebase project exists.
 */
function resolveFirebase() {
  const firebase = resolveFirebaseNative(resolveAppEnv())
  if (firebase.partial) {
    console.warn(
      `[firebase] ${firebase.dir} needs both google-services.json and GoogleService-Info.plist — Firebase stays off.`,
    )
  }
  return firebase
}

/** Native config Firebase needs; only applied when the env has config files. */
const FIREBASE_PLUGINS: ExpoConfig['plugins'] = [
  // disableSPM: Firebase via CocoaPods; SPM + static frameworks fails `pod install`.
  ['@react-native-firebase/app', { ios: { disableSPM: true } }],
  '@react-native-firebase/analytics',
  '@react-native-firebase/crashlytics',
  '@react-native-firebase/messaging',
  'expo-notifications',
  [
    'expo-build-properties',
    {
      ios: {
        useFrameworks: 'static',
        forceStaticLinking: [
          'RNFBApp',
          'RNFBAnalytics',
          'RNFBCrashlytics',
          'RNFBMessaging',
          'RNFBRemoteConfig',
        ],
      },
    },
  ],
]

const resolvedTemplateConfig = loadTemplateConfig()
const firebase = resolveFirebase()

const config: ExpoConfig = {
  ...baseConfig,
  name: resolvedTemplateConfig.appName,
  slug: resolvedTemplateConfig.slug,
  scheme: resolveScheme(resolvedTemplateConfig.slug),
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: resolvedTemplateConfig.bundleId,
    ...(firebase.enabled && {
      googleServicesFile: firebase.files.ios,
      infoPlist: {
        ...baseConfig.ios?.infoPlist,
        // Data pushes delivered while the app is in background.
        UIBackgroundModes: ['remote-notification'],
      },
    }),
  },
  android: {
    ...baseConfig.android,
    package: resolvedTemplateConfig.packageName,
    ...(firebase.enabled && { googleServicesFile: firebase.files.android }),
  },
  plugins: [...(baseConfig.plugins ?? []), ...(firebase.enabled ? FIREBASE_PLUGINS : [])],
}

export default config
