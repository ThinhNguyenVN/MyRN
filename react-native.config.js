const { RNFB_PACKAGES, resolveFirebaseNative } = require('./scripts/firebase-native')

// Without Firebase config files for this env, keep RNFirebase out of the native build entirely
// (its pods fail `pod install` without the Firebase-specific Podfile setup).
const firebaseEnabled = resolveFirebaseNative().enabled

module.exports = {
  dependencies: firebaseEnabled
    ? {}
    : Object.fromEntries(
        RNFB_PACKAGES.map((name) => [name, { platforms: { ios: null, android: null } }]),
      ),
}
