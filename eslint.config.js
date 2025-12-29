// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Áp dụng cho toàn project
    files: ['*.{js,jsx,ts,tsx}', '**/*.{js,jsx,ts,tsx}'],

    rules: {
      'semi': ['error', 'never'],
      'no-extra-semi': 'error',
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1 }],
      'comma-dangle': ['warn', 'always-multiline'],
      'arrow-spacing': ['warn', { before: true, after: true }],

      'eqeqeq': ['warn', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'curly': ['warn', 'all'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },
])
