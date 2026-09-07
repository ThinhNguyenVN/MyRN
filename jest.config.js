/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  // Forces `react-native-worklets` (reanimated 4's native runtime) to resolve its non-`.native.ts`
  // module under Jest, since there's no real native module bridge in this test environment.
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/assets/.*$': '<rootDir>/src/test/file-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@expo/vector-icons$': '<rootDir>/src/test/expo-vector-icons-mock.js',
    '^expo-haptics$': '<rootDir>/src/test/expo-haptics-mock.js',
    '\\.(ttf|otf|woff|woff2|png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/src/test/file-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@unimodules/.*|unimodules|@mswjs/.*|msw|until-async|@reduxjs/.*|redux|react-redux|immer|reselect)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
}
