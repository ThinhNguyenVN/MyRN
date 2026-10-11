const fs = require('fs')
const path = require('path')

// Workspace packages run from source here; a product made by `create-product` has no `packages/`.
const hasPackages = fs.existsSync(path.join(__dirname, 'packages'))

/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  roots: hasPackages ? ['<rootDir>/src', '<rootDir>/packages'] : ['<rootDir>/src'],
  // Forces `react-native-worklets` (reanimated 4's native runtime) to resolve its non-`.native.ts`
  // module under Jest, since there's no real native module bridge in this test environment.
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/assets/.*$': '<rootDir>/src/test/file-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    ...(hasPackages && {
      '^@thinhnguyenvn/chat-core$': '<rootDir>/packages/chat-core/src',
    }),
    '^@expo/vector-icons$': '<rootDir>/src/test/expo-vector-icons-mock.js',
    '^expo-haptics$': '<rootDir>/src/test/expo-haptics-mock.js',
    '^expo-file-system$': '<rootDir>/src/test/expo-file-system-mock.js',
    '^expo-image-manipulator$': '<rootDir>/src/test/expo-image-manipulator-mock.js',
    '\\.(ttf|otf|woff|woff2|png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/src/test/file-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@unimodules/.*|unimodules|@mswjs/.*|msw|until-async|@reduxjs/.*|redux|react-redux|immer|reselect)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
}
