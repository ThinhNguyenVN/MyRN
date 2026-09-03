#!/usr/bin/env node

/**
 * Scaffolds a new product from this kit: prompts for app identity and rewrites
 * `template.config.json` (the single file `app.config.ts` reads for `appName`/`slug`/
 * `packageName`/`bundleId` — see that file for how it's applied).
 *
 * Replaces the old `reset-project` script, which came from `create-expo-app` and wiped
 * `app`/`components`/`hooks`/`constants`/`scripts` back to a blank template — the wrong move
 * here, since this repo is meant to be forked *with* its structure and shared components
 * intact, not reset to nothing.
 *
 * What this script does NOT do — do these by hand, since they touch cross-cutting references
 * (routes, i18n keys, tabbar/drawer/home links) that a script can't safely rewrite everywhere:
 *   - remove the example `todo` feature (`src/features/todo/`, `src/app/(private)/todo/`)
 *   - remove the `playground` demo routes (`src/app/(public)/(tabs)/playground/`)
 * See `.docs/platform-kit-sync.md` for the kit's sync workflow.
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const root = process.cwd()
const configPath = path.join(root, 'template.config.json')
const IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/

function slugify(value) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'my-app'
}

function readCurrentConfig() {
  if (!fs.existsSync(configPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch {
    return {}
  }
}

async function main() {
  const current = readCurrentConfig()
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const ask = (question, fallback) =>
    new Promise((resolve) => {
      rl.question(`${question}${fallback ? ` (${fallback})` : ''}: `, (answer) => {
        resolve(answer.trim() || fallback || '')
      })
    })

  console.log('Create a new product from this kit — press Enter to keep the current value.\n')

  const appName = await ask('App name', current.appName || 'My App')
  const slug = await ask('Slug (URL-safe)', current.slug || slugify(appName))
  const packageName = await ask(
    'Android package name (reverse-DNS)',
    current.packageName || 'com.example.app',
  )
  const bundleId = await ask('iOS bundle id (reverse-DNS)', current.bundleId || packageName)

  rl.close()

  for (const [field, value] of [
    ['packageName', packageName],
    ['bundleId', bundleId],
  ]) {
    if (!IDENTIFIER_PATTERN.test(value)) {
      console.error(
        `\n"${field}" must be a valid reverse-DNS identifier (e.g. com.company.app). Got: "${value}"`,
      )
      process.exit(1)
    }
  }

  const next = { appName, slug, packageName, bundleId }
  fs.writeFileSync(configPath, `${JSON.stringify(next, null, 2)}\n`)

  console.log(`\nWrote ${path.relative(root, configPath)}:`)
  console.log(JSON.stringify(next, null, 2))

  console.log(
    '\nNext steps:\n' +
      '  1. Edit src/configs/brand.config.ts to set your brand colors.\n' +
      '  2. If you use SEO (web): edit seo.config.json, then run `yarn seo:generate`.\n' +
      '  3. Remove the example `todo` feature if you don\'t need it — see\n' +
      '     src/features/todo/README.md for the exact checklist.\n' +
      '  4. Remove the `playground` demo routes: src/app/(public)/(tabs)/playground/,\n' +
      '     and its tab entry.\n' +
      '  5. Check .docs/shared-ui-catalog.md before building new screens — reuse kit\n' +
      '     components first.\n',
  )
}

main()
