#!/usr/bin/env node

/**
 * Guards src/components/{elements,ui} against hardcoded color literals re-appearing —
 * this kit was already caught claiming "every color comes from theme.getColor(...)" while
 * shipping ~8 raw hex/rgba values (see .docs/platform-kit-sync.md). Run via `yarn lint:tokens`.
 *
 * A style block can opt out (e.g. photo-overlay chrome that must stay the same color in both
 * light and dark themes) by adding a comment containing the word `theme-exempt` directly above
 * it — above a single property to exempt just that line, or above a `key: { ... }` block to
 * exempt the whole block (and anything nested inside it).
 */

const fs = require('fs')
const path = require('path')

const ROOTS = ['src/components/elements', 'src/components/ui']
const EXT_PATTERN = /\.(ts|tsx)$/
const EXEMPT_MARKER = 'theme-exempt'
const COLOR_KEY_PATTERN = /(color|background|tint)\w*\s*:\s*['"`]/i
const COLOR_LITERAL_PATTERN = /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (EXT_PATTERN.test(entry.name)) files.push(full)
  }
  return files
}

function checkFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  const violations = []
  let depth = 0
  const exemptDepths = new Set()
  let markerActive = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const isComment = trimmed.startsWith('//')

    // Comments never contain flaggable code — and a multi-line comment shouldn't lose the
    // exemption partway through, so just track the marker and move on without touching depth.
    if (isComment) {
      if (trimmed.includes(EXEMPT_MARKER)) markerActive = true
      continue
    }

    const blockExempt = Array.from(exemptDepths).some((d) => depth >= d)
    const lineExempt = blockExempt || markerActive

    if (!lineExempt && COLOR_KEY_PATTERN.test(line) && COLOR_LITERAL_PATTERN.test(line)) {
      violations.push({ line: i + 1, text: trimmed })
    }

    const opens = (line.match(/{/g) || []).length
    const closes = (line.match(/}/g) || []).length

    if (markerActive && opens > 0) {
      exemptDepths.add(depth + 1)
    }
    markerActive = false

    for (let o = 0; o < opens; o++) depth += 1
    for (let c = 0; c < closes; c++) {
      exemptDepths.delete(depth)
      depth -= 1
    }
  }

  return violations
}

function main() {
  const root = process.cwd()
  const files = ROOTS.flatMap((r) => walk(path.join(root, r)))
  let violationCount = 0

  for (const file of files) {
    const violations = checkFile(file)
    if (violations.length === 0) continue
    violationCount += violations.length
    const rel = path.relative(root, file)
    for (const v of violations) {
      console.error(`${rel}:${v.line}  hardcoded color literal: ${v.text}`)
    }
  }

  if (violationCount > 0) {
    console.error(
      `\n${violationCount} hardcoded color literal(s) found in src/components/{elements,ui}.\n` +
        'Use a theme token (theme.getColor(...)) instead, or — if this is intentionally ' +
        'theme-independent chrome (e.g. photo-overlay UI) — add a comment containing ' +
        `"${EXEMPT_MARKER}" directly above the block.`,
    )
    process.exit(1)
  }

  console.log('check-hardcoded-colors: clean.')
}

main()
