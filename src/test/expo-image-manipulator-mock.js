// `expo-image-manipulator` pulls in `expo-modules-core` native code at import time, unavailable
// under Jest/jsdom (no native module bridge). `resizeImageIfNeeded` only needs `manipulateAsync`
// (returns the same uri unchanged) and the `SaveFormat` enum.
module.exports = {
  manipulateAsync: async (uri) => ({ uri, width: 0, height: 0 }),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}
