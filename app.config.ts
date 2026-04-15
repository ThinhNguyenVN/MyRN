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

const resolvedTemplateConfig = loadTemplateConfig()

const config: ExpoConfig = {
  ...baseConfig,
  name: resolvedTemplateConfig.appName,
  slug: resolvedTemplateConfig.slug,
  scheme: resolveScheme(resolvedTemplateConfig.slug),
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: resolvedTemplateConfig.bundleId,
  },
  android: {
    ...baseConfig.android,
    package: resolvedTemplateConfig.packageName,
  },
}

export default config
