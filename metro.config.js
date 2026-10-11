const fs = require('fs')
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Required for react-native-worklets / Reanimated on Expo (SDK 56+).
// Expo disables inlineRequires by default, which breaks Worklets JSI init and can
// SIGSEGV in Hermes (JSIWorkletsModuleProxy::toOptimizedObject).
// See: https://github.com/software-mansion/react-native-reanimated/issues/9445
// Keep JS on the Expo SDK 57 bundled pair: worklets@0.10.1 + reanimated@4.5.1.
// Expo Go must be iOS ≥ 57.0.6 / Android ≥ 57.0.3. Do not pin 0.10.0.
// See expo/expo#48390.
config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
})

// Trỏ react-native-linear-gradient → shim dùng expo-linear-gradient (cho react-native-reanimated-skeleton)
const shimPath = path.resolve(__dirname, 'src/shim-react-native-linear-gradient.ts')
// Workspace package: MyRN runs its source; a product without `packages/` uses the published `dist/`.
const chatCorePath = path.resolve(__dirname, 'packages/chat-core/src/index.ts')
const hasChatCoreSource = fs.existsSync(chatCorePath)
const originalResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-linear-gradient') {
    return { type: 'sourceFile', filePath: shimPath }
  }
  if (hasChatCoreSource && moduleName === '@thinhnguyenvn/chat-core') {
    return { type: 'sourceFile', filePath: chatCorePath }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
