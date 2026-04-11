const { execSync } = require('node:child_process')

const allowedPattern = /^(feat|fix|issue)\/[a-z0-9._-]+$/

const candidate =
  process.env.BRANCH_NAME ||
  process.env.GITHUB_HEAD_REF ||
  process.env.GITHUB_REF_NAME ||
  process.env.CI_COMMIT_REF_NAME

let branchName = candidate || ''

if (!branchName) {
  branchName = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
}

if (!branchName) {
  console.error('Unable to determine branch name for validation.')
  process.exit(1)
}

if (branchName === 'main' || branchName === 'master') {
  console.log(`Branch "${branchName}" is allowed.`)
  process.exit(0)
}

if (allowedPattern.test(branchName)) {
  console.log(`Branch "${branchName}" is allowed.`)
  process.exit(0)
}

console.error(
  [
    `Invalid branch name: "${branchName}".`,
    'Use one of these prefixes: feat/, fix/, issue/.',
    'Example: feat/login-screen or fix/auth-token-refresh.',
  ].join(' '),
)
process.exit(1)
