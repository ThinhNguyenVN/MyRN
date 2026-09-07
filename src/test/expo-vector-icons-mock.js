// `@expo/vector-icons` pulls in `expo-font` -> `expo-modules-core` native code at import time,
// which isn't available under Jest/jsdom (no native module bridge). Components only need an icon
// set to render *something*, so stub every icon set (Ionicons, AntDesign, ...) with a plain Text.
const React = require('react')
const { Text } = require('react-native')

function makeIconSet(setName) {
  function IconStub({ name, testID, ...rest }) {
    return React.createElement(Text, { ...rest, testID: testID ?? `icon-${setName}-${name}` }, name)
  }
  IconStub.displayName = `${setName}Stub`
  return IconStub
}

module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => makeIconSet(String(prop)),
  },
)
