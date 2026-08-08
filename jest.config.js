/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/assets/.*$': '<rootDir>/src/test/file-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(ttf|otf|woff|woff2|png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/src/test/file-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@unimodules/.*|unimodules|@mswjs/.*|msw|until-async|@reduxjs/.*|redux|react-redux|immer|reselect)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
}
