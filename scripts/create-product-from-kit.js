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
 *
 * It does detach the workspace packages (`packages/*`, e.g. `@thinhnguyenvn/chat-core`): a product
 * installs their published version instead of carrying their source.
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const root = process.cwd()
const configPath = path.join(root, 'template.config.json')
const packagesDir = path.join(root, 'packages')
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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

/** Drops `packages/` and the workspace wiring; each package becomes a pinned npm dependency. */
function detachWorkspacePackages() {
  if (!fs.existsSync(packagesDir)) return []

  const detached = fs
    .readdirSync(packagesDir)
    .map((dir) => path.join(packagesDir, dir, 'package.json'))
    .filter((file) => fs.existsSync(file))
    .map((file) => readJson(file))
    .map(({ name, version }) => ({ name, version }))

  const rootPkgPath = path.join(root, 'package.json')
  const rootPkg = readJson(rootPkgPath)
  delete rootPkg.workspaces
  for (const { name, version } of detached) {
    rootPkg.dependencies[name] = version
    for (const [script, command] of Object.entries(rootPkg.scripts)) {
      rootPkg.scripts[script] = command.replace(`yarn workspace ${name} typecheck && `, '')
    }
  }
  for (const script of ['lint', 'fix']) {
    rootPkg.scripts[script] = rootPkg.scripts[script].replace('eslint src packages', 'eslint src')
  }
  writeJson(rootPkgPath, rootPkg)

  const tsconfigPath = path.join(root, 'tsconfig.json')
  const tsconfig = readJson(tsconfigPath)
  for (const { name } of detached) {
    delete tsconfig.compilerOptions.paths[name]
  }
  writeJson(tsconfigPath, tsconfig)

  fs.rmSync(packagesDir, { recursive: true, force: true })
  return detached
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
  const detach = fs.existsSync(packagesDir)
    ? /^y/i.test(await ask('Remove packages/ and use the published packages instead? (y/n)', 'y'))
    : false

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

  if (detach) {
    const detached = detachWorkspacePackages()
    console.log('\nRemoved packages/; now depending on the published versions:')
    for (const { name, version } of detached) {
      console.log(`  ${name}@${version}`)
    }
    console.log('Run `yarn install` (the versions must already be on npm).')
  }

  console.log(
    '\nNext steps:\n' +
      '  1. Edit src/configs/brand.config.ts to set your brand colors.\n' +
      '  2. If you use SEO (web): edit seo.config.json, then run `yarn seo:generate`.\n' +
      '  3. Remove the example `todo` feature if you don\'t need it — see\n' +
      '     src/features/todo/README.md for the exact checklist.\n' +
      '  4. Remove the `playground` demo routes: src/app/(public)/(tabs)/playground/,\n' +
      '     and its tab entry.\n' +
      '  5. Check .docs/shared-ui-catalog.md before building new screens — reuse kit\n' +
      '     components first.\n' +
      '  6. Firebase is wired but off: when you need it, create one Firebase project per\n' +
      '     env and put google-services.json + GoogleService-Info.plist in firebase/<env>/\n' +
      '     — see .docs/firebase-standard.md.\n',
  )
}

main()
