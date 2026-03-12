const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

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
