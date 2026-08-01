/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@unimodules/.*|unimodules|@mswjs/.*|msw|until-async|@reduxjs/.*|redux|immer|reselect)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
}
