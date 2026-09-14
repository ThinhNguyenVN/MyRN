#!/usr/bin/env node

/**
 * Enforces the "src/app is route shell only" rule from `.docs/folder-structure.md`:
 * route files must not call the API layer directly — that belongs in `src/features`
 * (or a hook/service it exposes). This is a fitness function, not a style rule: it
 * turns a convention that previously lived only in docs into something CI blocks on.
 *
 * A line can opt out (e.g. a documented, reviewed exception) by adding a comment
 * containing the word `architecture-exempt` directly above the import line.
 *
 * Run via `yarn check:boundaries`.
 */

const fs = require('fs')
const path = require('path')

const APP_ROOT = 'src/app'
const EXT_PATTERN = /\.(ts|tsx)$/
const EXEMPT_MARKER = 'architecture-exempt'

// Forbidden import sources for files under src/app. Keep this list narrow and
// unambiguous (see `.docs/folder-structure.md` § "Not allowed in src/app") rather
// than trying to catch every possible violation — false positives erode trust in
// the gate faster than a narrow gate misses real issues.
const FORBIDDEN_IMPORT_PATTERNS = [/^@\/api(\/|$)/]

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (EXT_PATTERN.test(entry.name)) files.push(full)
  }
  return files
}

function extractImportSource(line) {
  const match = line.match(/from\s+['"]([^'"]+)['"]/) || line.match(/require\(\s*['"]([^'"]+)['"]\s*\)/)
  return match ? match[1] : null
}

function checkFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  const violations = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const source = extractImportSource(line)
    if (!source) continue

    const isForbidden = FORBIDDEN_IMPORT_PATTERNS.some((pattern) => pattern.test(source))
    if (!isForbidden) continue

    const prevLine = i > 0 ? lines[i - 1] : ''
    if (prevLine.includes(EXEMPT_MARKER)) continue

    violations.push({ line: i + 1, source, text: line.trim() })
  }

  return violations
}

function main() {
  const files = walk(APP_ROOT)
  const allViolations = []

  for (const file of files) {
    const violations = checkFile(file)
    for (const v of violations) {
      allViolations.push({ file, ...v })
    }
  }

  if (allViolations.length === 0) {
    console.log(`check:boundaries — OK (${files.length} files under ${APP_ROOT} checked)`)
    process.exit(0)
  }

  console.error(`check:boundaries — ${allViolations.length} violation(s) found:\n`)
  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}`)
    console.error(`    ${v.text}`)
    console.error(
      `    "${v.source}" — ${APP_ROOT} is route shell only; API calls belong in src/features (see .docs/folder-structure.md).`,
    )
    console.error(`    If this is a reviewed exception, add a comment with "${EXEMPT_MARKER}" on the line above.\n`)
  }
  process.exit(1)
}

main()
