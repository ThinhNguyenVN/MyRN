const allowedTypes = new Set(['feat', 'fix', 'issue'])

const [, , typeArg, ...nameParts] = process.argv

if (!allowedTypes.has(typeArg)) {
  console.error('Branch type must be one of: feat, fix, issue.')
  process.exit(1)
}

const rawName = nameParts.join(' ').trim()

if (!rawName) {
  console.error('Branch description is required. Example: yarn branch:create feat login screen')
  process.exit(1)
}

const slug = rawName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

if (!slug) {
  console.error('Branch description must contain letters or numbers.')
  process.exit(1)
}

console.log(`${typeArg}/${slug}`)
