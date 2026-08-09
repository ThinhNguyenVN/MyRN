const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Required for react-native-worklets / Reanimated on Expo (SDK 56+).
// Expo disables inlineRequires by default, which breaks Worklets JSI init and can
// SIGSEGV in Hermes (JSIWorkletsModuleProxy::toOptimizedObject).
// See: https://github.com/software-mansion/react-native-reanimated/issues/9445
// Also keep JS versions aligned with Expo Go native (SDK 57 Go 57.0.6 →
// react-native-worklets@0.10.1 + react-native-reanimated@4.5.1). Mismatch SIGSEGVs
// in cloneString/toOptimizedObject — https://github.com/expo/expo/issues/48390
config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
})

// Trỏ react-native-linear-gradient → shim dùng expo-linear-gradient (cho react-native-reanimated-skeleton)
const shimPath = path.resolve(__dirname, 'src/shim-react-native-linear-gradient.ts')
const originalResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-linear-gradient') {
    return { type: 'sourceFile', filePath: shimPath }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
