import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

import type { ExpoConfig } from 'expo/config'

type AppEnv = 'test' | 'staging' | 'production'
const baseConfig = (require('./app.json') as { expo: ExpoConfig }).expo
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

export default baseConfig
