// `expo-file-system` pulls in `expo-modules-core` native code at import time, unavailable under
// Jest/jsdom (no native module bridge). Callers here only need the `File` class shape
// (`new File(uri)`, `.exists`, `.delete()`) used by `deletePickedImageIfTemp`.
class MockFile {
  constructor(uri) {
    this.uri = uri
  }

  get exists() {
    return false
  }

  delete() {}
}

module.exports = { File: MockFile }
