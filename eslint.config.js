// eslint.config.js 🔥 VERSION FLAT CONFIG FULL PRETTIER SUPPORT

const { defineConfig } = require('eslint/config')
const prettier = require('eslint-config-prettier') // turns off conflicting rules
const pluginPrettier = require('eslint-plugin-prettier') // integrates prettier as eslint rule
const pluginUnusedImports = require('eslint-plugin-unused-imports')
const pluginReactNative = require('eslint-plugin-react-native')

module.exports = defineConfig([
  // Expo base config
  require('eslint-config-expo/flat'),

  // Ignore routes
  { ignores: ['dist/*'] },

  // Main rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    plugins: {
      prettier: pluginPrettier,
      'unused-imports': pluginUnusedImports,
      'react-native': pluginReactNative,
    },

    rules: {
      // Không cho phép inline style
      'react-native/no-inline-styles': 'warn',
      // Không cho phép import và code không sử dụng
      'no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],

      // 🔥 Prettier become ESLint rule
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 100,
        },
      ],

      semi: ['error', 'never'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1 }],
      'comma-dangle': ['warn', 'always-multiline'],
      'arrow-spacing': ['warn', { before: true, after: true }],
      eqeqeq: ['warn', 'always'],
      'prefer-const': 'warn',
      curly: ['warn', 'all'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },

  // Disable ESLint rules conflicting with Prettier
  prettier,
])
