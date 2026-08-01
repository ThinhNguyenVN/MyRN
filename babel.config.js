module.exports = function (api) {
  api.cache(true)
  return {
    // Disable auto-injection so the Worklets plugin is applied exactly once, last.
    presets: [['babel-preset-expo', { worklets: false, reanimated: false }]],
    plugins: ['react-native-worklets/plugin'],
  }
}
